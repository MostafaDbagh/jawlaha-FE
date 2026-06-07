// Complaints — submit a customer complaint about an order (Cash on Delivery
// platform). Talks to POST /complaints; the order reference is resolved
// server-side against the user's own orders.
import { create } from 'zustand';
import { complaintsRepo } from '@/data/repository/complaints';
import { showSnack } from '@/lib/snack';

// Maps to the backend Complaint.COMPLAINT_CATEGORIES.
export const COMPLAINT_CATEGORIES = [
  'order',
  'delivery',
  'payment',
  'restaurant',
  'other',
] as const;

export type ComplaintCategory = (typeof COMPLAINT_CATEGORIES)[number];

interface ComplaintsState {
  submitting: boolean;
  submitComplaint: (args: {
    category: string;
    subject: string;
    message: string;
    orderId?: string | null;
    orderReference?: string | null;
  }) => Promise<boolean>;
}

export const useComplaintsStore = create<ComplaintsState>((set) => ({
  submitting: false,

  async submitComplaint({ category, subject, message, orderId, orderReference }) {
    try {
      set({ submitting: true });
      const res = await complaintsRepo.submitComplaint({
        category,
        subject,
        message,
        order_id: orderId ?? null,
        order_reference: orderReference ?? null,
      });
      if (!res.success) {
        showSnack(res.msg || 'Failed to submit complaint', 'error');
      }
      return res.success;
    } catch (e) {
      showSnack(String(e), 'error');
      return false;
    } finally {
      set({ submitting: false });
    }
  },
}));
