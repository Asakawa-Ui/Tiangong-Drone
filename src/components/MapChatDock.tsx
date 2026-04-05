import React, { useState, useRef } from 'react';
import { Mic, Video, Paperclip, ArrowUp, X, User, Bot, ShieldAlert, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';
import { DraggableObjectListItemDTO } from '../types/attachment';

const chatHistory = [
  { id: 1, time: '14:05', sender: 'operator', senderName: '西北区域人影指挥中心', text: '危险区边界坐标已确认，继续执行目标区域扫描。' },
  { id: 2, time: '14:12', sender: 'user', senderName: '前线侦察机组-01', text: '检测到新的异常区域，请求叠加红外图层后复核。' },
  { id: 3, time: '14:18', sender: 'system', senderName: '系统智能助手', text: '当前关联附件已完成解析，未发现异常格式问题。' },
  { id: 4, time: '14:26', sender: 'operator', senderName: '西北区域人影指挥中心', text: '已切换到备用飞行走廊，请确认是否同步调整危险区提示范围。' },
  { id: 5, time: '14:31', sender: 'user', senderName: '前线侦察机组-01', text: '建议将当前图层切换为雷达拼图叠加模式，再次检查边界重叠情况。' },
  { id: 6, time: '14:37', sender: 'system', senderName: '系统智能助手', text: '已检测到新上传附件，等待人工确认后写入当前会话。' },
  { id: 7, time: '14:42', sender: 'operator', senderName: '西北区域人影指挥中心', text: '请评估新的潜力区轮廓是否需要纳入本轮下发指令。' },
];

export default function MapChatDock({ isFullscreen }: { isFullscreen?: boolean }) {
  const [expanded, setExpanded] = useState(false);
  const [inputText, setInputText] = useState('');
  const inputRef = useRef<HTMLDivElement>(null);
  const [pendingAttachments, setPendingAttachments] = useState<DraggableObjectListItemDTO[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleInput = () => {
    if (inputRef.current) {
      setInputText(inputRef.current.textContent || '');
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

  return (
    <div 
      className={`absolute bottom-6 left-1/2 -translate-x-1/2 ${isFullscreen ? 'w-1/3' : 'w-1/2'} rounded-[28px] p-[18px_18px_16px] transition-all duration-300 z-[9999] ${
        expanded ? 'uav-glass-active' : 'uav-glass'
      } ${isDragOver ? 'ring-2 ring-[#2E5ED7] bg-[#2E5ED7]/5' : ''}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="flex items-center justify-between gap-3 mb-3.5 flex-wrap">
        <div className="flex items-center gap-2.5 min-w-0 flex-wrap">
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
        <button 
          className="bg-[#F0F4FA] hover:bg-[#E4E9F2] h-10 px-4 rounded-full inline-flex items-center gap-2.5 text-[#2E5ED7] text-sm font-bold cursor-pointer transition-colors uav-inset"
          style={{ backgroundColor: expanded ? 'rgba(46, 94, 215, 0.08)' : undefined }}
          onClick={() => setExpanded(!expanded)}
        >
          历史
        </button>
      </div>

      {expanded && (
        <div className="mb-4">
          <div className="max-h-[350px] overflow-y-auto pr-2 pb-4 flex flex-col gap-5 w-full custom-scrollbar">
            {chatHistory.map((msg) => {
              const isUser = msg.sender === 'user';
              const isSystem = msg.sender === 'system';
              
              return (
                <div key={msg.id} className={`flex gap-3 w-full ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
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
                      <span className="text-[13px] font-bold text-[#5B6575] truncate max-w-[240px]" title={msg.senderName}>
                        {msg.senderName}
                      </span>
                      <span className="text-[11px] font-medium text-[#8D97A7] shrink-0">
                        {msg.time}
                      </span>
                    </div>
                    <div className={`w-full relative rounded-[22px] p-[14px_18px] text-[15px] leading-[1.5] font-medium break-words ${
                      isUser 
                        ? 'bg-[#2E5ED7] text-white rounded-tr-none' 
                        : isSystem
                          ? 'bg-[#F0F4FA] text-[#244933] rounded-tl-none'
                          : 'bg-[#F0F4FA] text-[#3F454F] rounded-tl-none'
                    }`}>
                      {isSystem && <strong className="text-[#2F7246] mr-1.5">SYSTEM:</strong>}
                      {msg.text}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="flex flex-col gap-3.5 w-full">
        <div className="relative w-full rounded-[20px] p-3">
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
          <button className="w-[52px] h-[52px] rounded-full inline-flex items-center justify-center text-white shadow-[0_14px_28px_rgba(47,105,232,0.24)] border-none cursor-pointer"
            style={{ background: 'linear-gradient(180deg, #4F84F0, #2F69E8)' }}>
            <ArrowUp size={24} strokeWidth={3} />
          </button>
        </div>
      </div>
    </div>
  );
}
