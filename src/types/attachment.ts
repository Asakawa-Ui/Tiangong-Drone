// T01: 附件对象统一数据模型
export enum AttachmentObjectType {
  DANGER_ZONE = 'DANGER_ZONE',
  POTENTIAL_ZONE = 'POTENTIAL_ZONE',
  PREFLIGHT_ROUTE_VERSION = 'PREFLIGHT_ROUTE_VERSION',
}

export interface DraggableObjectListItemDTO {
  objectId: string;
  objectType: AttachmentObjectType;
  objectName: string;
  objectDisplayName: string;
  previewThumbnailUrl?: string;
  sortieId?: string;
  sortieName?: string;
  sourceModule?: string;
  draggable: boolean;
  dragDisabledReason?: string;
  isDeleted: boolean;
  isDraft: boolean;
  hasPermission: boolean;
  versionId?: string;
  versionNo?: string;
  versionName?: string;
  flightPlanId?: string;
  flightPlanName?: string;
}

// T03: 附件状态枚举
export enum AttachmentStatus {
  PENDING = 'PENDING', // 待发送
  SENT = 'SENT', // 已发送
  RECEIVED = 'RECEIVED', // 已接收
  IMPORTED = 'IMPORTED', // 已录入系统
  DOWNLOADED = 'DOWNLOADED', // 已下载
  SEND_FAILED = 'SEND_FAILED', // 发送失败
  IMPORT_FAILED = 'IMPORT_FAILED', // 录入失败
  DOWNLOAD_FAILED = 'DOWNLOAD_FAILED', // 下载失败
}

// T04: 聊天消息类型模型
export enum MessageType {
  TEXT = 'TEXT',
  ATTACHMENT = 'ATTACHMENT',
  SYSTEM = 'SYSTEM',
}

export interface BaseMessageDTO {
  messageId: string;
  conversationId: string;
  messageType: MessageType;
  sentAt: string;
}

export interface TextMessageDTO extends BaseMessageDTO {
  messageType: MessageType.TEXT;
  text: string;
  senderId: string;
  senderName: string;
}

export interface AttachmentMessageDTO extends BaseMessageDTO {
  messageType: MessageType.ATTACHMENT;
  attachmentId: string;
  objectSnapshotId: string; // T05: 附件快照模型
  objectId: string;
  objectType: AttachmentObjectType;
  attachmentTypeLabel: string;
  objectName: string;
  objectDisplayName: string;
  previewThumbnailUrl?: string;
  sortieId?: string;
  sortieName: string;
  actionButtons: ActionButtonConfig[];
  status: {
    statusCode: AttachmentStatus;
    statusLabel: string;
    importStatus?: string;
    downloadStatus?: string;
  };
}

export interface ActionButtonConfig {
  actionType: 'IMPORT' | 'DOWNLOAD';
  actionLabel: string;
  visible: boolean;
  enabled: boolean;
  loading: boolean;
  disabledReason?: string;
}

export enum SystemEventType {
  ATTACHMENT_SENT = 'ATTACHMENT_SENT',
  ATTACHMENT_IMPORTED = 'ATTACHMENT_IMPORTED',
  ATTACHMENT_DOWNLOADED = 'ATTACHMENT_DOWNLOADED',
  PEER_IMPORTED = 'PEER_IMPORTED',
  PEER_DOWNLOADED = 'PEER_DOWNLOADED',
}

export interface SystemMessageDTO extends BaseMessageDTO {
  messageType: MessageType.SYSTEM;
  systemEventType: SystemEventType;
  objectId?: string;
  objectType?: AttachmentObjectType;
  objectName?: string;
  objectDisplayName?: string;
  receiverName?: string;
  text: string;
}

export type ChatMessageDTO = TextMessageDTO | AttachmentMessageDTO | SystemMessageDTO;

// T05: 附件快照模型
export interface AttachmentSnapshot {
  snapshotId: string;
  originalObjectId: string;
  objectType: AttachmentObjectType;
  data: any; // 固化的对象数据
  createdAt: string;
}

// T06: 错误码与提示文案表
export const ErrorMessages = {
  INCOMPLETE_INFO: '对象信息不完整，无法加入附件',
  UNSUPPORTED_TYPE: '当前会话不支持该对象发送',
  MAX_ATTACHMENTS_REACHED: '已达最大附件数量上限',
  ALREADY_ADDED: '该附件已加入待发送区',
  ALREADY_IMPORTED: '该附件已录入系统',
  AUTO_CREATE_PLAN_FAILED: '飞行方案自动创建失败，暂无法录入该预飞航线，请稍后重试。',
};

// T07: 附件操作日志模型
export enum AttachmentLogAction {
  ADD_TO_PENDING = 'ADD_TO_PENDING',
  REMOVE_FROM_PENDING = 'REMOVE_FROM_PENDING',
  SEND_SUCCESS = 'SEND_SUCCESS',
  SEND_FAILED = 'SEND_FAILED',
  IMPORT_SUCCESS = 'IMPORT_SUCCESS',
  IMPORT_FAILED = 'IMPORT_FAILED',
  DOWNLOAD_SUCCESS = 'DOWNLOAD_SUCCESS',
  DOWNLOAD_FAILED = 'DOWNLOAD_FAILED',
}

export interface AttachmentLog {
  logId: string;
  action: AttachmentLogAction;
  attachmentId?: string;
  objectId?: string;
  timestamp: string;
  details?: string;
}

// 待发送附件 chips DTO
export interface PendingAttachmentChipDTO {
  pendingAttachmentId: string;
  objectId: string;
  objectType: AttachmentObjectType;
  objectName: string;
  objectDisplayName: string;
  objectShortDisplayName?: string;
  objectFullDisplayName?: string;
  previewThumbnailUrl?: string;
  sortieId?: string;
  sortieName?: string;
  removable: boolean;
  maxCount: number;
  currentCount: number;
}
