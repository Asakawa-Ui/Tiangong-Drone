import React, { useState, useRef, useEffect } from 'react';
import { Mic, Video, Paperclip, ArrowUp, X, User, Bot, ShieldAlert, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';
import { DraggableObjectListItemDTO, AttachmentObjectType, ChatMessageDTO, MessageType, AttachmentStatus } from '../types/attachment';
import { useRole } from '../contexts/RoleContext';
import { useFirebase } from '../contexts/FirebaseContext';
import { db } from '../firebase';
import { collection, addDoc, onSnapshot, query, orderBy, serverTimestamp } from 'firebase/firestore';
import { handleFirestoreError, OperationType } from '../utils/firestoreErrorHandler';

export default function MapChatDock({ isFullscreen }: { isFullscreen?: boolean }) {
  const { currentRole } = useRole();
  const { user } = useFirebase();
  const [expanded, setExpanded] = useState(false);
  const [inputText, setInputText] = useState('');
  const inputRef = useRef<HTMLDivElement>(null);
  const [pendingAttachments, setPendingAttachments] = useState<DraggableObjectListItemDTO[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [recommendedTexts, setRecommendedTexts] = useState<string[]>([]);
  const [messages, setMessages] = useState<ChatMessageDTO[]>([]);
  const chatHistoryRef = useRef<HTMLDivElement>(null);
  const recommendationsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) {
      setMessages([]);
      return;
    }

    const q = query(collection(db, 'messages'), orderBy('createdAt', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs: ChatMessageDTO[] = [];
      snapshot.forEach((doc) => {
        msgs.push({ messageId: doc.id, ...doc.data() } as any);
      });
      setMessages(msgs);
      
      // Auto scroll to bottom on new messages
      setTimeout(() => {
        if (chatHistoryRef.current) {
          chatHistoryRef.current.scrollTop = chatHistoryRef.current.scrollHeight;
        }
      }, 100);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'messages');
    });

    return () => unsubscribe();
  }, [user]);

  const handleRecommendationsWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    if (recommendationsRef.current) {
      recommendationsRef.current.scrollLeft += e.deltaY;
    }
  };

  // T24, T25, T26, T29, T30: 生成推荐话语
  useEffect(() => {
    try {
      if (pendingAttachments.length === 0) {
        setRecommendedTexts([]);
        return;
      }

      // 优先根据第一个附件生成推荐语
      const firstAttachment = pendingAttachments[0];
      const type = firstAttachment.objectType;
      const name = firstAttachment.objectDisplayName || firstAttachment.objectName;
      
      let recommendations: string[] = [];
      switch (type) {
        case AttachmentObjectType.DANGER_ZONE:
          recommendations = [
            `请注意避让【${name}】`,
            `已确认【${name}】边界，请执行`,
            `请评估【${name}】对当前航线的影响`
          ];
          break;
        case AttachmentObjectType.POTENTIAL_ZONE:
          recommendations = [
            `请前往【${name}】进行侦察`,
            `已发现【${name}】，请确认`,
            `建议将【${name}】纳入作业范围`
          ];
          break;
        case AttachmentObjectType.PREFLIGHT_ROUTE_VERSION:
          recommendations = [
            `请执行【${name}】`,
            `【${name}】已更新，请查收`,
            `请确认【${name}】是否可行`
          ];
          break;
        case AttachmentObjectType.ZONE:
        case AttachmentObjectType.AIRSPACE:
          recommendations = [
            `请关注【${name}】`,
            `已划定【${name}】`
          ];
          break;
        default:
          recommendations = [`请查收附件【${name}】`];
      }
      setRecommendedTexts(recommendations);
    } catch (err) {
      console.error('Failed to generate recommended texts', err);
      setRecommendedTexts([]);
    }
  }, [pendingAttachments]);

  const handleInput = () => {
    if (inputRef.current) {
      setInputText(inputRef.current.textContent || '');
    }
  };

  // T28: 点击推荐语追加到输入框
  const handleRecommendationClick = (text: string) => {
    if (inputRef.current) {
      const currentText = inputRef.current.textContent || '';
      const newText = currentText ? `${currentText} ${text}` : text;
      inputRef.current.textContent = newText;
      setInputText(newText);
      
      // 将光标移到末尾
      const range = document.createRange();
      const sel = window.getSelection();
      range.selectNodeContents(inputRef.current);
      range.collapse(false);
      sel?.removeAllRanges();
      sel?.addRange(range);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
    e.dataTransfer.dropEffect = 'copy';
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDragOver(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    try {
      const data = e.dataTransfer.getData('application/json');
      if (data) {
        const item = JSON.parse(data) as DraggableObjectListItemDTO;
        
        setPendingAttachments(prev => {
          if (prev.find(a => a.objectId === item.objectId)) {
            toast.warning('该附件已加入待发送区');
            return prev;
          }
          if (prev.length >= 5) {
            toast.warning('已达最大附件数量上限');
            return prev;
          }
          return [...prev, item];
        });
      }
    } catch (err) {
      console.error('Failed to parse dropped item', err);
    }
  };

  const removeAttachment = (id: string) => {
    setPendingAttachments(prev => prev.filter(a => a.objectId !== id));
  };

  const handleSend = async () => {
    if (pendingAttachments.length === 0 && inputText.trim() === '') {
      return;
    }

    const now = new Date();
    const timeString = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    const conversationId = 'c1'; // Mock conversation ID

    try {
      // 1. 先发送附件消息
      for (const attachment of pendingAttachments) {
        let typeLabel = '未知附件';
        let actionButtons: any[] = [];
        
        switch (attachment.objectType) {
          case AttachmentObjectType.DANGER_ZONE:
            typeLabel = '危险区';
            actionButtons = [{ actionType: 'IMPORT', actionLabel: '录入', visible: true, enabled: true, loading: false }];
            break;
          case AttachmentObjectType.POTENTIAL_ZONE:
            typeLabel = '潜力区';
            actionButtons = [{ actionType: 'IMPORT', actionLabel: '录入', visible: true, enabled: true, loading: false }];
            break;
          case AttachmentObjectType.PREFLIGHT_ROUTE_VERSION:
            typeLabel = '预飞航线';
            actionButtons = [
              { actionType: 'IMPORT', actionLabel: '录入', visible: true, enabled: true, loading: false },
              { actionType: 'DOWNLOAD', actionLabel: '下载', visible: true, enabled: true, loading: false }
            ];
            break;
          case AttachmentObjectType.ZONE:
            typeLabel = '区域';
            break;
          case AttachmentObjectType.AIRSPACE:
            typeLabel = '空域';
            break;
        }

        await addDoc(collection(db, 'messages'), {
          conversationId,
          messageType: MessageType.ATTACHMENT,
          sentAt: timeString,
          senderId: currentRole.id,
          senderName: currentRole.name,
          attachmentId: `att_${Date.now()}`,
          objectSnapshotId: `snap_${Date.now()}`,
          objectId: attachment.objectId,
          objectType: attachment.objectType,
          attachmentTypeLabel: typeLabel,
          objectName: attachment.objectName,
          objectDisplayName: attachment.objectDisplayName || null,
          previewThumbnailUrl: attachment.previewThumbnailUrl || null,
          sortieId: attachment.sortieId || null,
          sortieName: attachment.sortieName || '',
          actionButtons,
          status: {
            statusCode: AttachmentStatus.SENT,
            statusLabel: '已发送'
          },
          createdAt: serverTimestamp()
        });
      }

      // 2. 再发送文本消息
      if (inputText.trim() !== '') {
        await addDoc(collection(db, 'messages'), {
          conversationId,
          messageType: MessageType.TEXT,
          sentAt: timeString,
          senderId: currentRole.id,
          senderName: currentRole.name,
          text: inputText.trim(),
          createdAt: serverTimestamp()
        });
      }

      setPendingAttachments([]);
      setInputText('');
      if (inputRef.current) {
        inputRef.current.textContent = '';
      }
      
      // 如果没有展开历史记录，则展开
      if (!expanded) {
        setExpanded(true);
      }

      // 滚动到底部
      setTimeout(() => {
        if (chatHistoryRef.current) {
          chatHistoryRef.current.scrollTop = chatHistoryRef.current.scrollHeight;
        }
      }, 100);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'messages');
      toast.error('发送失败');
    }
  };

  return (
    <div 
      className={`absolute bottom-6 left-1/2 -translate-x-1/2 ${isFullscreen ? 'w-1/3' : 'w-1/2'} rounded-[28px] p-[18px_18px_16px] transition-all duration-300 z-[9999] ${
        expanded ? 'uav-glass-active' : 'uav-glass'
      } ${isDragOver ? 'ring-2 ring-[#2E5ED7] bg-[#2E5ED7]/5' : ''}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* 推荐话语区域 (T27, T29) */}
      {recommendedTexts.length > 0 && (
        <div 
          ref={recommendationsRef}
          onWheel={handleRecommendationsWheel}
          className="absolute -top-14 left-0 w-full flex items-center gap-2 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
        >
          {recommendedTexts.map((text, index) => (
            <button
              key={index}
              className="shrink-0 bg-[#F0F4FA] hover:bg-[#E4E9F2] transition-colors h-10 px-4 rounded-full inline-flex items-center text-[#5B6575] text-[14px] font-medium cursor-pointer"
              onClick={() => handleRecommendationClick(text)}
            >
              {index + 1}. {text}
            </button>
          ))}
        </div>
      )}

      <div className="relative w-full">
        {/* 历史按钮 - 绝对定位到右上角 */}
        <button 
          className="absolute top-0 right-0 bg-[#F0F4FA] hover:bg-[#E4E9F2] h-10 px-4 rounded-full inline-flex items-center gap-2.5 text-[#2E5ED7] text-sm font-bold cursor-pointer transition-colors uav-inset z-10"
          style={{ backgroundColor: expanded ? 'rgba(46, 94, 215, 0.08)' : undefined }}
          onClick={() => setExpanded(!expanded)}
        >
          历史
        </button>

        {expanded && (
          <div className="mb-4 pt-12">
            <div className="max-h-[350px] overflow-y-auto pr-2 pb-4 flex flex-col gap-5 w-full custom-scrollbar" ref={chatHistoryRef}>
              {messages.map((msg) => {
                const isUser = (msg as any).senderId === currentRole.id;
                const isSystem = msg.messageType === MessageType.SYSTEM;
                const isAttachment = msg.messageType === MessageType.ATTACHMENT;
                
                return (
                  <div key={msg.messageId} className={`flex gap-3 w-full ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
                    {/* Avatar */}
                    <div className="shrink-0 flex flex-col items-center mt-1">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center shadow-sm ${
                        isUser ? 'bg-[#2E5ED7] text-white' : 
                        isSystem ? 'bg-[#2F7246] text-white' : 
                        'bg-[#A0AABF] text-white'
                      }`}>
                        {isUser ? <User size={18} /> : isSystem ? <Bot size={18} /> : <ShieldAlert size={18} />}
                      </div>
                    </div>
                    
                    {/* Message Body */}
                    <div className={`flex flex-col gap-1.5 max-w-[85%] ${isUser ? 'items-end' : 'items-start'}`}>
                      <div className={`flex items-baseline gap-2 px-1 ${isUser ? 'flex-row-reverse' : 'flex-row'} max-w-full`}>
                        <span className="text-[13px] font-bold text-[#5B6575] truncate max-w-[240px]" title={(msg as any).senderName || (isSystem ? '系统智能助手' : '')}>
                          {(msg as any).senderName || (isSystem ? '系统智能助手' : '')}
                        </span>
                        <span className="text-[11px] font-medium text-[#8D97A7] shrink-0">
                          {msg.sentAt}
                        </span>
                      </div>
                      
                      {isAttachment ? (
                        <div className="bg-white rounded-2xl p-4 shadow-sm border border-[#E4E9F2] w-[280px] flex flex-col gap-3">
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-lg bg-[#F0F4FA] flex items-center justify-center shrink-0">
                              {(msg as any).previewThumbnailUrl ? (
                                <img src={(msg as any).previewThumbnailUrl} alt="thumbnail" className="w-full h-full object-cover rounded-lg" referrerPolicy="no-referrer" />
                              ) : (
                                <ImageIcon size={20} className="text-[#8D97A7]" />
                              )}
                            </div>
                            <div className="flex flex-col overflow-hidden">
                              <span className="text-xs font-bold text-[#2E5ED7] mb-0.5">{(msg as any).attachmentTypeLabel}</span>
                              <span className="text-[15px] font-bold text-[#1F2430] break-all whitespace-normal" title={(msg as any).objectDisplayName || (msg as any).objectName}>
                                {(msg as any).objectDisplayName || (msg as any).objectName}
                              </span>
                              {(msg as any).sortieName && (
                                <span className="text-xs text-[#8D97A7] mt-0.5 break-all whitespace-normal">
                                  {(msg as any).sortieName}
                                </span>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex gap-2 mt-1">
                            {(msg as any).actionButtons?.map((btn: any, idx: number) => (
                              btn.visible && (
                                <button 
                                  key={idx}
                                  className={`flex-1 h-8 rounded-lg text-[13px] font-bold transition-colors ${
                                    btn.actionType === 'IMPORT' 
                                      ? 'bg-[#2E5ED7] text-white hover:bg-[#254CB3]' 
                                      : 'bg-[#F0F4FA] text-[#2E5ED7] hover:bg-[#E4E9F2]'
                                  }`}
                                  disabled={!btn.enabled || btn.loading}
                                >
                                  {btn.loading ? '处理中...' : btn.actionLabel}
                                </button>
                              )
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className={`w-full relative rounded-[22px] p-[14px_18px] text-[15px] leading-[1.5] font-medium break-words ${
                          isUser 
                            ? 'bg-[#2E5ED7] text-white rounded-tr-none' 
                            : isSystem
                              ? 'bg-[#F0F4FA] text-[#244933] rounded-tl-none'
                              : 'bg-[#F0F4FA] text-[#3F454F] rounded-tl-none'
                        }`}>
                          {isSystem && <strong className="text-[#2F7246] mr-1.5">SYSTEM:</strong>}
                          {(msg as any).text}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 附件区域 */}
        {pendingAttachments.length > 0 && (
          <div className="flex items-center gap-2.5 mb-3.5 flex-wrap pr-20">
            {pendingAttachments.map(attachment => {
              const nameToDisplay = attachment.objectDisplayName || attachment.objectName;
              const displayName = nameToDisplay.length > 20 
                ? `${nameToDisplay.slice(0, 20)}...` 
                : nameToDisplay;
                
              return (
                <button 
                  key={attachment.objectId} 
                  className="bg-[#F0F4FA] hover:bg-[#E4E9F2] transition-colors h-10 px-3 pl-2.5 rounded-full inline-flex items-center gap-2.5 text-[#5B6575] text-sm font-bold cursor-pointer uav-inset"
                  title={nameToDisplay}
                >
                  <div className="w-[26px] h-[26px] rounded-lg shrink-0 bg-white/60 shadow-sm overflow-hidden flex items-center justify-center">
                    {attachment.previewThumbnailUrl ? (
                      <img draggable={false} src={attachment.previewThumbnailUrl} alt="thumbnail" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    ) : (
                      <ImageIcon size={14} className="text-[#8D97A7]" />
                    )}
                  </div>
                  <span className="whitespace-nowrap">{displayName}</span>
                  <X 
                    size={14} 
                    className="text-[#2E5ED7] shrink-0 hover:text-red-500 transition-colors" 
                    strokeWidth={3} 
                    onClick={(e) => {
                      e.stopPropagation();
                      removeAttachment(attachment.objectId);
                    }}
                  />
                </button>
              );
            })}
          </div>
        )}

        <div className="flex flex-col gap-3.5 w-full">
          <div className={`relative w-full rounded-[20px] p-3 ${pendingAttachments.length === 0 ? 'pr-20' : ''}`}>
            <div 
              ref={inputRef}
              className="min-h-[48px] max-h-[116px] overflow-y-auto custom-scrollbar w-full max-w-full pt-1 px-1 bg-transparent border-none text-base leading-[1.45] text-[#1F2430] font-medium outline-none break-words"
              contentEditable
              onInput={handleInput}
              onBlur={handleInput}
            ></div>
            {inputText.trim() === '' && (
              <div className="absolute top-4 left-4 text-[#8D97A7] pointer-events-none text-base leading-[1.45] font-medium">
                输入需要创建、修改或下发的内容…
              </div>
            )}
          </div>
          <div className="flex items-center justify-between gap-3.5">
            <div className="flex items-center gap-2.5">
              <button className="bg-[#F0F4FA] hover:bg-[#E4E9F2] transition-colors w-10 h-10 rounded-xl inline-flex items-center justify-center text-[#465062] cursor-pointer uav-inset">
                <Mic size={19} />
              </button>
              <button className="bg-[#F0F4FA] hover:bg-[#E4E9F2] transition-colors w-10 h-10 rounded-xl inline-flex items-center justify-center text-[#465062] cursor-pointer uav-inset">
                <Video size={19} />
              </button>
              <button className="bg-[#F0F4FA] hover:bg-[#E4E9F2] transition-colors w-10 h-10 rounded-xl inline-flex items-center justify-center text-[#465062] cursor-pointer uav-inset">
                <Paperclip size={19} />
              </button>
            </div>
            <button 
              className="w-[52px] h-[52px] rounded-full inline-flex items-center justify-center text-white shadow-[0_14px_28px_rgba(47,105,232,0.24)] border-none cursor-pointer"
              style={{ background: 'linear-gradient(180deg, #4F84F0, #2F69E8)' }}
              onClick={handleSend}
            >
              <ArrowUp size={24} strokeWidth={3} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
