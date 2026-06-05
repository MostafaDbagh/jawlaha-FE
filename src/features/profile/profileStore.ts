// Ported from Flutter:
//   lib/screens/profile_screens/controllers/profile_controller.dart
//   lib/screens/profile_screens/controllers/profile_state.dart
// GetX ProfileController + ProfileState -> zustand store. Same fields, same names, same logic.
// Covers: profile companies, notifications, tickets/support, about/privacy/contact.

import { create } from 'zustand';
import { repository } from '@/data/repository';
import { showSnack } from '@/lib/snack';
import { createPaginateReqEntity } from '@/types/entities';
import type { GlobalTextModel, ContentUsModel } from '@/types/settings';
import type { TicketModel } from '@/types/ticket';
import type { NotificationModel } from '@/types/notification';
import type { CompanyModel } from '@/types/authExtras';

// Mirrors entities/base_entities/page_entity.dart (PageEntity<T>) — includes the
// loading / paginateLoading flags the controller toggles. Defaults match the Dart ctor.
export interface PageEntity<T> {
  totalPage: number;
  page: number;
  itemCount: number;
  loading: boolean;
  paginateLoading: boolean;
  data?: T[];
  unreadCount?: number;
  total?: number;
}

export function createPageEntity<T>(params?: Partial<PageEntity<T>>): PageEntity<T> {
  return {
    totalPage: params?.totalPage ?? 2,
    page: params?.page ?? 1,
    itemCount: params?.itemCount ?? 0,
    loading: params?.loading ?? false,
    paginateLoading: params?.paginateLoading ?? false,
    data: params?.data,
    unreadCount: params?.unreadCount,
    total: params?.total,
  };
}

interface ProfileStore {
  // ----- ProfileState fields (observables -> plain fields, same names/initials) -----
  settingLoading: boolean;
  ticketDetailsLoading: boolean;
  aboutUs: GlobalTextModel;
  privacyPolice: GlobalTextModel;
  contentUs: ContentUsModel;
  companies: CompanyModel[];
  selectedCompanyId: number;
  ticketsPage: PageEntity<TicketModel>;
  ticketDetails: TicketModel;
  notificationsPage: PageEntity<NotificationModel>;
  // Radio button state management
  selectedRadioValue: string;

  // ----- actions (controller methods) -----
  getAboutUs: () => Promise<void>;
  getPrivacyPolicy: () => Promise<void>;
  getContactUs: () => Promise<void>;
  getMyCompanies: () => Promise<void>;
  changeSelectedCompany: (companyId: number) => void;
  changeSelectedCompanyRQ: (companyId: number) => Promise<boolean>;
  getMyTickets: () => Promise<void>;
  _resetTicketState: () => void;
  clearTicketState: () => void;
  submitSupportReport: (args: { issueType: string; message: string }) => Promise<boolean>;
  pickFile: () => Promise<unknown | null>;
  getTicketDetails: (args: { id: string }) => Promise<void>;
  replayToTicket: (args: { id: string; message: string; status: string }) => Promise<boolean>;
  getNotifications: () => Promise<void>;
  getNotificationsByType: (type: string) => Promise<void>;
  _resetNotificationState: () => void;
  markNotificationAsRead: (id: string) => Promise<boolean>;
  readNotifications: (args?: { ids?: string[] }) => Promise<boolean>;
  updateSelectedRadioValue: (value: string) => void;
  resetRadioButtonState: () => void;
}

// Mirrors core/messages/show_errors_message.dart showServerMessages.
function showServerMessages(messages: string[]) {
  for (const m of messages) {
    showSnack(m, 'error');
  }
}

// TODO: file_picker (pickDocument) is a native dep — stubbed. Mirrors pickFile/pickDocument.
async function pickDocument(_opts: {
  allowedExtensions: string;
  dialogTitle: string;
  allowMultiple: boolean;
}): Promise<unknown | null> {
  return null;
}

export const useProfileStore = create<ProfileStore>((set, get) => ({
  settingLoading: false,
  ticketDetailsLoading: false,
  aboutUs: {},
  privacyPolice: {},
  contentUs: {},
  companies: [],
  selectedCompanyId: 0,
  ticketsPage: createPageEntity<TicketModel>(),
  ticketDetails: {},
  notificationsPage: createPageEntity<NotificationModel>(),
  selectedRadioValue: 'resolved',

  getAboutUs: async () => {
    try {
      set({ settingLoading: true });
      const res = await repository.getAboutUs();
      if (res.success) {
        const data: GlobalTextModel = res.object;
        set({ aboutUs: data });
      } else {
        showServerMessages([res.msg]);
      }
    } catch (e) {
      showServerMessages([String(e)]);
    } finally {
      set({ settingLoading: false });
    }
  },

  getPrivacyPolicy: async () => {
    try {
      set({ settingLoading: true });
      const res = await repository.getPrivacyPolicy();
      if (res.success) {
        const data: GlobalTextModel = res.object;
        set({ privacyPolice: data });
      } else {
        showServerMessages([res.msg]);
      }
    } catch (e) {
      showServerMessages([String(e)]);
    } finally {
      set({ settingLoading: false });
    }
  },

  getContactUs: async () => {
    try {
      set({ settingLoading: true });
      const res = await repository.getContactUs();
      if (res.success) {
        const data: ContentUsModel = res.object;
        set({ contentUs: data });
      } else {
        showServerMessages([res.msg]);
      }
    } catch (e) {
      showServerMessages([String(e)]);
    } finally {
      set({ settingLoading: false });
    }
  },

  getMyCompanies: async () => {
    try {
      set({ settingLoading: true });
      const res = await repository.getMyCompanies();
      if (res.success) {
        const data: CompanyModel[] = res.object;
        set({ companies: data });
      } else {
        showServerMessages([res.msg]);
      }
    } catch (e) {
      showServerMessages([String(e)]);
    } finally {
      set({ settingLoading: false });
    }
  },

  changeSelectedCompany: (companyId: number) => {
    set({ selectedCompanyId: companyId });
  },

  changeSelectedCompanyRQ: async (companyId: number): Promise<boolean> => {
    try {
      set({ settingLoading: true });
      const res = await repository.changeSelectedCompanyRQ({
        companyId: companyId.toString(),
      });
      if (res.success) {
        return true;
      } else {
        showServerMessages([res.msg]);
        return false;
      }
    } catch (e) {
      showServerMessages([String(e)]);
      return false;
    } finally {
      set({ settingLoading: false });
    }
  },

  getMyTickets: async () => {
    const page = get().ticketsPage;

    // Early return if loading or reached end
    if (page.paginateLoading || (page.page > page.totalPage && page.totalPage > 0)) {
      return;
    }

    try {
      // Set loading state
      if (page.page === 1) {
        set({ ticketsPage: createPageEntity<TicketModel>({ loading: true }) });
      } else {
        set({
          ticketsPage: {
            ...get().ticketsPage,
            paginateLoading: true,
            itemCount: get().ticketsPage.itemCount + 1,
          },
        });
      }

      const res = await repository.getMyTickets({
        paginateReqEntity: createPaginateReqEntity({ page: page.page }),
      });

      if (res.success) {
        const response = res.object;

        // Update data
        let mergedData: TicketModel[] | undefined;
        if (page.page === 1) {
          mergedData = response.data;
        } else {
          mergedData = [...(get().ticketsPage.data ?? []), ...(response.data ?? [])];
        }

        // Update pagination
        set({
          ticketsPage: createPageEntity<TicketModel>({
            data: mergedData,
            itemCount: mergedData?.length ?? 0,
            page: page.page + 1,
            total: response.total,
            totalPage: response.totalPage,
          }),
        });
      } else {
        get()._resetTicketState();
        showServerMessages([res.msg]);
      }
    } catch (e) {
      get()._resetTicketState();
      showServerMessages(['An unexpected error occurred while fetching tickets']);
    }
  },

  // private — mirrors _resetTicketState
  _resetTicketState: () => {
    const page = get().ticketsPage;
    set({
      ticketsPage: createPageEntity<TicketModel>({
        data: page.data,
        total: page.total,
        totalPage: page.totalPage,
        itemCount: page.data?.length ?? 0,
      }),
    });
  },

  clearTicketState: () => {
    set({ ticketsPage: createPageEntity<TicketModel>() });
  },

  submitSupportReport: async ({
    issueType,
    message,
  }: {
    issueType: string;
    message: string;
  }): Promise<boolean> => {
    try {
      set({ settingLoading: true });
      const res = await repository.submitSupportReport({ issueType, message });
      if (!res.success) {
        showServerMessages([res.msg]);
      }
      return res.success;
    } catch (e) {
      showServerMessages([String(e)]);
      return false;
    } finally {
      set({ settingLoading: false });
    }
  },

  pickFile: async (): Promise<unknown | null> => {
    // No permission needed for document operations using intents
    // The system handles access through the document picker
    try {
      // Use the new pickDocument function for better compatibility
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const result = await pickDocument({
        allowedExtensions: 'jpg,jpeg,png,pdf,doc,docx,txt',
        dialogTitle: 'Select File',
        allowMultiple: false,
      });

      return null;
    } catch (e) {
      showSnack(`Error picking file: ${e}`, 'error');
      return null;
    }
  },

  getTicketDetails: async ({ id }: { id: string }) => {
    try {
      set({ ticketDetailsLoading: true });
      const res = await repository.getTicketDetails({ id });
      if (res.success) {
        set({ ticketDetails: res.object });
      } else {
        showServerMessages([res.msg]);
      }
    } catch (e) {
      showServerMessages([String(e)]);
    } finally {
      set({ ticketDetailsLoading: false });
    }
  },

  replayToTicket: async ({
    id,
    message,
    status,
  }: {
    id: string;
    message: string;
    status: string;
  }): Promise<boolean> => {
    try {
      set({ settingLoading: true });
      const res = await repository.replayToTicket({ id, message, status });
      if (!res.success) {
        showServerMessages([res.msg]);
      }
      return res.success;
    } catch (e) {
      showServerMessages([String(e)]);
      return false;
    } finally {
      set({ settingLoading: false });
    }
  },

  getNotifications: async () => {
    const page = get().notificationsPage;

    if (page.paginateLoading || (page.page > page.totalPage && page.totalPage > 0)) {
      return;
    }

    try {
      if (page.page === 1) {
        set({ notificationsPage: createPageEntity<NotificationModel>({ loading: true }) });
      } else {
        set({
          notificationsPage: {
            ...get().notificationsPage,
            paginateLoading: true,
            itemCount: get().notificationsPage.itemCount + 1,
          },
        });
      }

      const res = await repository.getNotificationsNew({
        paginateReqEntity: createPaginateReqEntity({ page: page.page }),
      });
      if (res.success) {
        const response = res.object;
        let mergedData: NotificationModel[] | undefined;
        if (page.page === 1) {
          mergedData = response.data;
        } else {
          mergedData = [...(get().notificationsPage.data ?? []), ...(response.data ?? [])];
        }
        set({
          notificationsPage: createPageEntity<NotificationModel>({
            data: mergedData,
            itemCount: mergedData?.length ?? 0,
            page: page.page + 1,
            total: response.total,
            totalPage: response.totalPage,
          }),
        });
      } else {
        get()._resetNotificationState();
        showServerMessages([res.msg]);
      }
    } catch (e) {
      get()._resetNotificationState();
      showServerMessages(['An unexpected error occurred while fetching notifications']);
    } finally {
      set({
        notificationsPage: { ...get().notificationsPage, paginateLoading: false },
      });
    }
  },

  getNotificationsByType: async (type: string) => {
    try {
      // Reset page for filter change if needed, or handle pagination with type
      // This is a simplified implementation assuming new filter resets list
      set({ notificationsPage: createPageEntity<NotificationModel>({ loading: true }) });

      const res = await repository.getNotificationsByType({
        paginateReqEntity: createPaginateReqEntity({ page: 1 }),
        type: type,
      });
      if (res.success) {
        const response = res.object;
        set({
          notificationsPage: createPageEntity<NotificationModel>({
            data: response.data,
            itemCount: response.data?.length ?? 0,
            page: 2,
            total: response.total,
            totalPage: response.totalPage,
          }),
        });
      } else {
        showServerMessages([res.msg]);
      }
    } catch (e) {
      showServerMessages([String(e)]);
    } finally {
      set({ notificationsPage: { ...get().notificationsPage, loading: false } });
    }
  },

  // private — mirrors _resetNotificationState
  _resetNotificationState: () => {
    const current = get().notificationsPage;
    set({
      notificationsPage: createPageEntity<NotificationModel>({
        data: current.data,
        total: current.total,
        totalPage: current.totalPage,
        itemCount: current.data?.length ?? 0,
      }),
    });
  },

  markNotificationAsRead: async (id: string): Promise<boolean> => {
    try {
      const res = await repository.markNotificationAsRead(id);
      if (!res.success) {
        showServerMessages([res.msg]);
      } else {
        // Optimistically update UI
        const page = get().notificationsPage;
        const index =
          page.data?.findIndex((element) => element.notifiableId === id) ?? -1;
        if (index !== -1) {
          // Assuming NotificationModel has a read property, we'd update it here.
          // But NotificationModel is immutable or we need copyWith.
          // page.data![index] = page.data![index].copyWith(read: true);
          // update();
        }
      }
      return res.success;
    } catch (e) {
      showServerMessages([String(e)]);
      return false;
    }
  },

  readNotifications: async ({ ids }: { ids?: string[] } = {}): Promise<boolean> => {
    try {
      const res = await repository.readNotifications({ ids });
      if (!res.success) {
        showServerMessages([res.msg]);
      }
      return res.success;
    } catch (e) {
      showServerMessages([String(e)]);
      return false;
    }
  },

  updateSelectedRadioValue: (value: string) => {
    set({ selectedRadioValue: value });
  },

  resetRadioButtonState: () => {
    set({ selectedRadioValue: 'resolved' });
  },
}));
