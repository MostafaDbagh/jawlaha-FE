// Ported from model/settings/notification_model.dart
// interface + parseNotificationModel(json) (fromJson) + notificationModelToJson (toJson).

export interface NotificationModel {
  notifiableId?: string;
  notifiableType?: string;
  type?: string;
  message?: string;
  channel?: string;
  actionUrl?: string;
  read?: boolean;
  readAt?: string;
  companyId?: number;
  createdAt?: string;
}

export function parseNotificationModel(json: any): NotificationModel {
  return {
    notifiableId: json?.notifiable_id,
    notifiableType: json?.notifiable_type,
    type: json?.type,
    message: json?.message,
    channel: json?.channel,
    actionUrl: json?.action_url,
    read: json?.read,
    readAt: json?.read_at,
    companyId: json?.company_id,
    createdAt: json?.created_at,
  };
}

export function notificationModelToJson(n: NotificationModel): any {
  return {
    notifiable_id: n.notifiableId,
    notifiable_type: n.notifiableType,
    type: n.type,
    message: n.message,
    channel: n.channel,
    action_url: n.actionUrl,
    read: n.read,
    read_at: n.readAt,
    company_id: n.companyId,
    created_at: n.createdAt,
  };
}
