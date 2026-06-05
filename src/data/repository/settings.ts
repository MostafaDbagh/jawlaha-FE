// Ported from data/http_helper.dart + data/repository.dart (settings / profile section).
// Mirrors the HttpHelper settings requests and their Repository wrappers.

import { apiClient, CustomResponse, PageEntity } from '@/lib/api';
import { GlobalTextModel, parseGlobalTextModel, ContentUsModel, parseContentUsModel } from '@/types/settings';
import { TicketModel, parseTicketModel } from '@/types/ticket';
import { NotificationModel, parseNotificationModel } from '@/types/notification';
import { CompanyModel, parseCompanyModel } from '@/types/authExtras';

// Pagination request — mirrors entities/base_entities/paginate_req_entity.dart.
interface PaginateReqLike {
  page: number;
  perPage: number;
}

//-------------------------------------------------------
//-------------------[settings Request]-------------------
//-------------------------------------------------------

export async function getAboutUs(): Promise<CustomResponse> {
  return await apiClient.getV2<GlobalTextModel>({
    subUrl: 'globalText/about_us',
    fromJson: parseGlobalTextModel,
  });
}

export async function getPrivacyPolicy(): Promise<CustomResponse> {
  return await apiClient.getV2<GlobalTextModel>({
    subUrl: 'globalText/privacy_policy',
    fromJson: parseGlobalTextModel,
  });
}

export async function getContactUs(): Promise<CustomResponse> {
  return await apiClient.getV2<ContentUsModel>({
    subUrl: 'globalText/contact_us',
    fromJson: parseContentUsModel,
  });
}

// myCompanies — mirrors http_helper.dart getMyCompanies (isListOfModel, needToken).
export async function getMyCompanies(): Promise<CustomResponse> {
  return await apiClient.getV2<CompanyModel>({
    subUrl: 'myCompanies',
    needToken: true,
    isListOfModel: true,
    fromJson: parseCompanyModel,
  });
}

// switchCompnay — mirrors http_helper.dart changeSelectedCompanyRQ.
export async function changeSelectedCompanyRQ({
  companyId,
}: {
  companyId: string;
}): Promise<CustomResponse> {
  const mapData = { company_id: companyId };
  return await apiClient.postV2({
    subUrl: 'switchCompnay',
    needToken: true,
    data: mapData,
  });
}

export async function getMyTickets({
  paginateReqEntity,
}: {
  paginateReqEntity: PaginateReqLike;
}): Promise<CustomResponse> {
  const queryMap = {
    page: `${paginateReqEntity.page}`,
    per_page: `${paginateReqEntity.perPage}`,
  };
  return await apiClient.getPagination<TicketModel>({
    subUrl: 'tickets/mine',
    needToken: true,
    query: queryMap,
    fromJson: parseTicketModel,
  });
}

export async function submitSupportReport({
  issueType,
  message,
}: {
  issueType: string;
  message: string;
}): Promise<CustomResponse> {
  const mapData = { issue_type: issueType, message: message };
  return await apiClient.postV2({
    subUrl: 'tickets',
    data: mapData,
    needToken: true,
  });
}

export async function getTicketDetails({ id }: { id: string }): Promise<CustomResponse> {
  return await apiClient.getV2<TicketModel>({
    subUrl: `tickets/mine/${id}`,
    needToken: true,
    fromJson: parseTicketModel,
  });
}

export async function replayToTicket({
  id,
  message,
  status,
}: {
  id: string;
  message: string;
  status: string;
}): Promise<CustomResponse> {
  const mapData = { message: message, status: status };
  return await apiClient.postV2({
    subUrl: `tickets/${id}/reply`,
    data: mapData,
    needToken: true,
  });
}

export async function getNotifications({
  paginateReqEntity,
}: {
  paginateReqEntity: PaginateReqLike;
}): Promise<CustomResponse> {
  const queryMap = {
    page: `${paginateReqEntity.page}`,
    per_page: `${paginateReqEntity.perPage}`,
  };
  return await apiClient.getPagination<NotificationModel>({
    subUrl: 'notifications',
    needToken: true,
    query: queryMap,
    fromJson: parseNotificationModel,
  });
}

export async function readNotifications({ ids }: { ids?: string[] } = {}): Promise<CustomResponse> {
  const mapData: Record<string, any> = {};
  if (ids != null) {
    mapData['ids'] = ids;
  }
  return await apiClient.postV2({
    subUrl: 'myProfile/notifications/read',
    needToken: true,
    data: mapData,
  });
}

//-------------------------------------------------------
//-------------------[Notifications Repository]----------
//-------------------------------------------------------

export async function getNotificationsNew({
  paginateReqEntity,
}: {
  paginateReqEntity: PaginateReqLike;
}): Promise<CustomResponse> {
  const queryMap = {
    page: `${paginateReqEntity.page}`,
    per_page: `${paginateReqEntity.perPage}`,
  };
  return await apiClient.getPagination<NotificationModel>({
    subUrl: 'notifications',
    needToken: true,
    query: queryMap,
    fromJson: parseNotificationModel,
  });
}

export async function getNotificationsByType({
  paginateReqEntity,
  type,
}: {
  paginateReqEntity: PaginateReqLike;
  type: string;
}): Promise<CustomResponse> {
  const queryMap = {
    page: `${paginateReqEntity.page}`,
    per_page: `${paginateReqEntity.perPage}`,
    type: type,
  };
  return await apiClient.getPagination<NotificationModel>({
    subUrl: 'notifications',
    needToken: true,
    query: queryMap,
    fromJson: parseNotificationModel,
  });
}

export async function markNotificationAsRead(id: string): Promise<CustomResponse> {
  return await apiClient.patch({
    subUrl: `notifications/${id}/mark-read`,
    needToken: true,
  });
}

export const settingsRepo = {
  getAboutUs,
  getPrivacyPolicy,
  getContactUs,
  getMyCompanies,
  changeSelectedCompanyRQ,
  getMyTickets,
  submitSupportReport,
  getTicketDetails,
  replayToTicket,
  getNotifications,
  readNotifications,
  getNotificationsNew,
  getNotificationsByType,
  markNotificationAsRead,
};

export type { PageEntity };
