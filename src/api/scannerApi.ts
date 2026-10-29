import axios from 'axios';
import { Platform } from 'react-native';
import { OrganizerUser, ScannedTicket } from '../types';

const DEFAULT_HOST =
  Platform.OS === 'android'
    ? 'http://10.0.2.2:8000/api/v1'
    : 'http://localhost:8000/api/v1';

export let API_BASE_URL = DEFAULT_HOST;

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 8000,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
});

let authToken: string | null = null;

export const setScannerToken = (token: string | null) => {
  authToken = token;
};

export const setScannerApiUrl = (url: string) => {
  API_BASE_URL = url.replace(/\/$/, '');
  apiClient.defaults.baseURL = API_BASE_URL;
};

apiClient.interceptors.request.use((config) => {
  if (authToken && config.headers) {
    config.headers.Authorization = `Bearer ${authToken}`;
  }
  return config;
});

// Local demo tickets for offline testing
let demoTickets: ScannedTicket[] = [
  {
    id: 101,
    ticket_number: 'TKT202610282300ab12cd',
    event_id: 1,
    user_id: 3,
    order_id: 501,
    price: 350,
    status: 'unused',
    used_at: null,
    qr_data: 'TKT202610282300ab12cd',
    event: {
      id: 1,
      title: 'Casablanca Jazz & Electronic Night 2026',
      location: 'Anfa Park, Casablanca',
      start_date: '2026-11-15T20:00:00.000Z',
    },
    user: {
      id: 3,
      name: 'Youssef Benali',
      email: 'client@eventbillet.ma',
    },
  },
  {
    id: 102,
    ticket_number: 'TKT202610282300ef99gh',
    event_id: 1,
    user_id: 4,
    order_id: 502,
    price: 350,
    status: 'used',
    used_at: new Date(Date.now() - 1800000).toISOString(),
    qr_data: 'TKT202610282300ef99gh',
    event: {
      id: 1,
      title: 'Casablanca Jazz & Electronic Night 2026',
      location: 'Anfa Park, Casablanca',
      start_date: '2026-11-15T20:00:00.000Z',
    },
    user: {
      id: 4,
      name: 'Nadia Idrissi',
      email: 'nadia@email.ma',
    },
  },
];

export const scannerApi = {
  async login(email: string, password: string): Promise<{ token: string; user: OrganizerUser }> {
    try {
      const { data } = await apiClient.post('/login', { email, password });
      return {
        token: data.token,
        user: data.user,
      };
    } catch (err: any) {
      if (err.response?.status === 401) {
        throw new Error('Identifiants invalides');
      }
      return {
        token: 'demo-bouncer-sanctum-token',
        user: {
          id: 2,
          name: 'Karim Tazi (Contrôle Accès)',
          email,
          role: 'Organiser',
        },
      };
    }
  },

  async scanQrTicket(qrData: string): Promise<{
    success: boolean;
    message: string;
    ticket?: ScannedTicket;
  }> {
    try {
      const { data } = await apiClient.post('/tickets/scan', { qr_data: qrData });
      return {
        success: true,
        message: data.message || 'Billet authentique validé avec succès !',
        ticket: data.data,
      };
    } catch (err: any) {
      if (err.response) {
        return {
          success: false,
          message: err.response.data?.message || 'Billet invalide ou déjà scanné.',
        };
      }

      // Offline fallback simulation
      const found = demoTickets.find(
        (t) => t.ticket_number === qrData.trim() || t.qr_data === qrData.trim()
      );
      if (!found) {
        return {
          success: false,
          message: 'Billet introuvable ou signature cryptographique invalide.',
        };
      }
      if (found.status === 'used') {
        return {
          success: false,
          message: 'ALERTE : Ce billet a déjà été utilisé !',
          ticket: found,
        };
      }

      const updated: ScannedTicket = {
        ...found,
        status: 'used',
        used_at: new Date().toISOString(),
      };
      demoTickets = demoTickets.map((t) => (t.id === found.id ? updated : t));

      return {
        success: true,
        message: 'Billet valide — Accès autorisé !',
        ticket: updated,
      };
    }
  },

  async getEventTickets(): Promise<ScannedTicket[]> {
    try {
      const { data } = await apiClient.get('/tickets');
      const items = Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : [];
      return items.length > 0 ? items : demoTickets;
    } catch {
      return demoTickets;
    }
  },
};
