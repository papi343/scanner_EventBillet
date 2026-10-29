export interface OrganizerUser {
  id: number;
  name: string;
  email: string;
  role: 'Admin' | 'Organiser' | 'Participant';
}

export interface ScannedTicket {
  id: number;
  ticket_number: string;
  event_id: number;
  user_id: number;
  order_id: number;
  price: number;
  status: 'used' | 'unused';
  used_at: string | null;
  qr_data?: string | null;
  event?: {
    id: number;
    title: string;
    location: string;
    start_date: string;
  };
  user?: {
    id: number;
    name: string;
    email: string;
  };
}

export interface ScanLogItem {
  id: string;
  timestamp: string;
  success: boolean;
  message: string;
  code: string;
  ticket?: ScannedTicket;
}
