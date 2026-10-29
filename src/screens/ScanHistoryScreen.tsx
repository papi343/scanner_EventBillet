import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  CheckCircle2,
  XCircle,
  Clock,
  LogOut,
  Users,
  Ticket as TicketIcon,
  History,
} from 'lucide-react-native';
import { useScannerStore } from '../store/useScannerStore';

export default function ScanHistoryScreen() {
  const { user, tickets, scanLogs, fetchTickets, isLoading, logout } = useScannerStore();
  const [activeTab, setActiveTab] = useState<'logs' | 'tickets'>('logs');

  const checkedInCount = tickets.filter((t) => t.is_used).length;
  const remainingCount = tickets.filter((t) => !t.is_used).length;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Registre & Pointage</Text>
          <Text style={styles.subtitle}>Agent : {user?.name || 'Sécurité'}</Text>
        </View>
        <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
          <LogOut color="#f87171" size={18} />
          <Text style={styles.logoutText}>Quitter</Text>
        </TouchableOpacity>
      </View>

      {/* KPI Row */}
      <View style={styles.kpiRow}>
        <View style={styles.kpiCard}>
          <TicketIcon color="#a78bfa" size={20} />
          <Text style={styles.kpiValue}>{tickets.length}</Text>
          <Text style={styles.kpiLabel}>Total Billets</Text>
        </View>
        <View style={styles.kpiCard}>
          <CheckCircle2 color="#34d399" size={20} />
          <Text style={[styles.kpiValue, { color: '#34d399' }]}>{checkedInCount}</Text>
          <Text style={styles.kpiLabel}>Entrées Validées</Text>
        </View>
        <View style={styles.kpiCard}>
          <Users color="#fbbf24" size={20} />
          <Text style={[styles.kpiValue, { color: '#fbbf24' }]}>{remainingCount}</Text>
          <Text style={styles.kpiLabel}>En Attente</Text>
        </View>
      </View>

      {/* Sub-tabs */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'logs' && styles.tabBtnActive]}
          onPress={() => setActiveTab('logs')}
        >
          <History color={activeTab === 'logs' ? '#ffffff' : '#94a3b8'} size={16} />
          <Text style={[styles.tabBtnText, activeTab === 'logs' && styles.tabBtnTextActive]}>
            Journal des Scans ({scanLogs.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'tickets' && styles.tabBtnActive]}
          onPress={() => setActiveTab('tickets')}
        >
          <TicketIcon color={activeTab === 'tickets' ? '#ffffff' : '#94a3b8'} size={16} />
          <Text style={[styles.tabBtnText, activeTab === 'tickets' && styles.tabBtnTextActive]}>
            Liste Billets ({tickets.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* List Content */}
      {activeTab === 'logs' ? (
        <FlatList
          data={scanLogs}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyBox}>
              <Clock color="#64748b" size={36} />
              <Text style={styles.emptyTitle}>Aucun scan effectué durant cette session</Text>
              <Text style={styles.emptySubtitle}>
                Les billets scannés à l'entrée apparaîtront ici en temps réel.
              </Text>
            </View>
          }
          renderItem={({ item }) => (
            <View
              style={[
                styles.logCard,
                item.status === 'success' ? styles.logCardSuccess : styles.logCardError,
              ]}
            >
              <View style={styles.logHeader}>
                <View style={styles.logTitleRow}>
                  {item.status === 'success' ? (
                    <CheckCircle2 color="#34d399" size={20} />
                  ) : (
                    <XCircle color="#f87171" size={20} />
                  )}
                  <Text style={styles.logMessage}>{item.message}</Text>
                </View>
                <Text style={styles.logTime}>{item.timestamp}</Text>
              </View>
              {item.ticket ? (
                <Text style={styles.logDetails}>
                  {item.ticket.ticket_number} • {item.ticket.user?.name || 'Participant'} •{' '}
                  {item.ticket.event?.title}
                </Text>
              ) : (
                <Text style={styles.logDetails}>Code scanné : {item.qrInput}</Text>
              )}
            </View>
          )}
        />
      ) : (
        <FlatList
          data={tickets}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={isLoading}
              onRefresh={fetchTickets}
              tintColor="#a78bfa"
            />
          }
          renderItem={({ item }) => (
            <View style={styles.ticketRowCard}>
              <View style={{ flex: 1 }}>
                <Text style={styles.ticketCode}>{item.ticket_number}</Text>
                <Text style={styles.ticketUser}>{item.user?.name || 'Participant'}</Text>
                <Text style={styles.ticketEvent}>{item.event?.title}</Text>
              </View>
              <View
                style={[
                  styles.statusBadge,
                  item.is_used ? styles.statusUsed : styles.statusValid,
                ]}
              >
                <Text
                  style={[
                    styles.statusText,
                    item.is_used ? { color: '#94a3b8' } : { color: '#34d399' },
                  ]}
                >
                  {item.is_used ? 'DÉJÀ ENTRÉ' : 'VALIDE'}
                </Text>
              </View>
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#090d16',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
  },
  title: {
    color: '#f8fafc',
    fontSize: 22,
    fontWeight: '900',
  },
  subtitle: {
    color: '#94a3b8',
    fontSize: 13,
    marginTop: 2,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  logoutText: {
    color: '#f87171',
    fontSize: 13,
    fontWeight: '700',
  },
  kpiRow: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  kpiCard: {
    flex: 1,
    backgroundColor: '#131b2e',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: '#1e293b',
    alignItems: 'center',
    gap: 4,
  },
  kpiValue: {
    color: '#f8fafc',
    fontSize: 22,
    fontWeight: '900',
  },
  kpiLabel: {
    color: '#94a3b8',
    fontSize: 11,
    fontWeight: '700',
    textAlign: 'center',
  },
  tabBar: {
    flexDirection: 'row',
    marginHorizontal: 20,
    backgroundColor: '#131b2e',
    borderRadius: 14,
    padding: 4,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  tabBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 10,
  },
  tabBtnActive: {
    backgroundColor: '#7c3aed',
  },
  tabBtnText: {
    color: '#94a3b8',
    fontSize: 13,
    fontWeight: '700',
  },
  tabBtnTextActive: {
    color: '#ffffff',
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 30,
    gap: 10,
  },
  emptyBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 50,
    gap: 10,
  },
  emptyTitle: {
    color: '#cbd5e1',
    fontSize: 15,
    fontWeight: '800',
  },
  emptySubtitle: {
    color: '#64748b',
    fontSize: 13,
    textAlign: 'center',
  },
  logCard: {
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
  },
  logCardSuccess: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderColor: 'rgba(16, 185, 129, 0.35)',
  },
  logCardError: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderColor: 'rgba(239, 68, 68, 0.35)',
  },
  logHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  logMessage: {
    color: '#f8fafc',
    fontSize: 14,
    fontWeight: '800',
  },
  logTime: {
    color: '#94a3b8',
    fontSize: 12,
    fontFamily: 'monospace',
  },
  logDetails: {
    color: '#cbd5e1',
    fontSize: 12,
    marginTop: 6,
  },
  ticketRowCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#131b2e',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  ticketCode: {
    color: '#c4b5fd',
    fontSize: 14,
    fontWeight: '800',
    fontFamily: 'monospace',
  },
  ticketUser: {
    color: '#f8fafc',
    fontSize: 14,
    fontWeight: '700',
    marginTop: 2,
  },
  ticketEvent: {
    color: '#94a3b8',
    fontSize: 12,
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    borderWidth: 1,
  },
  statusValid: {
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    borderColor: 'rgba(16, 185, 129, 0.35)',
  },
  statusUsed: {
    backgroundColor: '#1e293b',
    borderColor: '#334155',
  },
  statusText: {
    fontSize: 11,
    fontWeight: '800',
  },
});
