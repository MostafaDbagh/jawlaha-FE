// Complaints repository — talks to the /complaints endpoints on jawlahapp.
// A customer files a complaint about an order (attaching its reference number);
// admins handle them in the web portal. All routes require auth (Bearer token).
import { apiClient, CustomResponse } from '@/lib/api';

const identity = (x: any) => x;

export async function submitComplaint(args: {
  category: string;
  subject: string;
  message: string;
  order_id?: string | null;
  order_reference?: string | null;
}): Promise<CustomResponse> {
  return await apiClient.postV2({
    subUrl: 'complaints',
    data: args,
    needToken: true,
    fromJson: identity,
  });
}

export async function getMyComplaints(): Promise<CustomResponse> {
  return await apiClient.getV2({
    subUrl: 'complaints/mine',
    needToken: true,
    isListOfModel: true,
    fromJson: identity,
  });
}

export const complaintsRepo = {
  submitComplaint,
  getMyComplaints,
};
