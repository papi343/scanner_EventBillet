import { create } from 'zustand';
import { User, Ticket, ScanLog } from '../types';
import { scannerApi, setAuthToken, getApiBaseUrl, setApiBaseUrl } from '../api/scannerApi';

interface ScannerState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  tickets: Ticket[];
  scanLogs: ScanLog[];
  lastScanResult: ScanLog | null;
  apiBaseUrl: string;

  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  fetchTickets: () => Promise<void>;
  scanQrCode: (qrData: string) => Promise<ScanLog>;
  clearLastScan: () => void;
  updateServerUrl: (url: string) => void;
}

export const useScannerStore = create<ScannerState>((set, get) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  tickets: [],
  scanLogs: [],
  lastScanResult: null,
  apiBaseUrl: getApiBaseUrl(),

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const data = await scannerApi.login(email, password);
      setAuthToken(data.token);
      set({
        user: data.user,
        token: data.token,
        isAuthenticated: true,
        isLoading: false,
      });
      await get().fetchTickets();
      return true;
    } catch (err: any) {
      set({
        error: err.message || 'Identifiants invalides',
        isLoading: false,
      });
      return false;
    }
  },

  logout: async () => {
    await scannerApi.logout();
    setAuthToken(null);
    set({
      user: null,
      token: null,
      isAuthenticated: false,
      tickets: [],
      lastScanResult: null,
    });
  },

  fetchTickets: async () => {
    set({ isLoading: true });
    try {
      const tickets = await scannerApi.getTickets();
      set({ tickets, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  scanQrCode: async (qrData: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await scannerApi.scanTicket(qrData.trim());
      const log: ScanLog = {
        id: `scan-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString('fr-FR', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        }),
        qrInput: qrData.trim(),
        status: response.status,
        message: response.message,
        ticket: response.ticket,
      };

      set((state) => ({
        isLoading: false,
        lastScanResult: log,
        scanLogs: [log, ...state.scanLogs],
        tickets: response.ticket
          ? state.tickets.map((t) => (t.id === response.ticket!.id ? response.ticket! : t))
          : state.tickets,
      }));

      return log;
    } catch (err: any) {
      const log: ScanLog = {
        id: `scan-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString('fr-FR', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        }),
        qrInput: qrData.trim(),
        status: 'error',
        message: err.message || 'Erreur lors de la vérification du billet.',
      };

      set((state) => ({
        isLoading: false,
        lastScanResult: log,
        scanLogs: [log, ...state.scanLogs],
      }));

      return log;
    }
  },

  clearLastScan: () => set({ lastScanResult: null }),

  updateServerUrl: (url: string) => {
    setApiBaseUrl(url);
    set({ apiBaseUrl: getApiBaseUrl() });
  },
}));
