// Ported from model/settings/ticket_model.dart
// interface + parseX(json) (fromJson) + xToJson (toJson).

export interface TicketHistoryUser {
  id?: number;
  accountType?: string;
  name?: string;
  email?: string;
  phone?: string;
  image?: string;
}

export function parseTicketHistoryUser(json: any): TicketHistoryUser {
  return {
    id: json?.id,
    accountType: json?.account_type,
    name: json?.name,
    email: json?.email,
    phone: json?.phone,
    image: json?.image,
  };
}

export function ticketHistoryUserToJson(u: TicketHistoryUser): any {
  return {
    id: u.id,
    account_type: u.accountType,
    name: u.name,
    email: u.email,
    phone: u.phone,
    image: u.image,
  };
}

export interface TicketHistory {
  timestamp?: string;
  by?: TicketHistoryUser | null;
  message?: string;
  status?: string;
}

export function parseTicketHistory(json: any): TicketHistory {
  return {
    timestamp: json?.timestamp,
    by: json?.by != null ? parseTicketHistoryUser(json.by) : null,
    message: json?.message,
    status: json?.status,
  };
}

export function ticketHistoryToJson(h: TicketHistory): any {
  const map: any = {};
  map.timestamp = h.timestamp;
  if (h.by != null) {
    map.by = ticketHistoryUserToJson(h.by);
  }
  map.message = h.message;
  map.status = h.status;
  return map;
}

export interface TicketModel {
  id?: number;
  userId?: number;
  issueType?: string;
  description?: string;
  supportReply?: string;
  status?: string;
  history?: TicketHistory[];
  createdAt?: string;
  updatedAt?: string;
}

export function parseTicketModel(json: any): TicketModel {
  return {
    id: json?.id,
    userId: json?.user_id,
    issueType: json?.issue_type,
    description: json?.description,
    supportReply: json?.support_reply,
    status: json?.status,
    history: json?.history != null
      ? (json.history as any[]).map(parseTicketHistory)
      : undefined,
    createdAt: json?.created_at,
    updatedAt: json?.updated_at,
  };
}

export function ticketModelToJson(t: TicketModel): any {
  const map: any = {};
  map.id = t.id;
  map.user_id = t.userId;
  map.issue_type = t.issueType;
  map.description = t.description;
  map.support_reply = t.supportReply;
  map.status = t.status;
  if (t.history != null) {
    map.history = t.history.map(ticketHistoryToJson);
  }
  map.created_at = t.createdAt;
  map.updated_at = t.updatedAt;
  return map;
}
