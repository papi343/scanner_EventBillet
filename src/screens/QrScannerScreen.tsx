import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Vibration,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CameraView, useCameraPermissions } from 'expo-camera';
import {
  Camera,
  CheckCircle2,
  XCircle,
  QrCode,
  Keyboard,
  Sparkles,
  User as UserIcon,
  Calendar,
  MapPin,
  RotateCcw,
} from 'lucide-react-native';
import { useScannerStore } from '../store/useScannerStore';

export default function QrScannerScreen() {
  const { scanQrCode, lastScanResult, clearLastScan, isLoading, tickets } = useScannerStore();
  const [permission, requestPermission] = useCameraPermissions();
  const [cameraActive, setCameraActive] = useState(true);
  const [manualCode, setManualCode] = useState('');
  const [scanLocked, setScanLocked] = useState(false);

  const handleBarcodeScanned = async ({ data }: { data: string }) => {
    if (scanLocked || isLoading || !data) return;
    setScanLocked(true);
    Vibration.vibrate(120);
    await scanQrCode(data);
  };

  const handleManualSubmit = async () => {
    if (!manualCode.trim() || isLoading) return;
    Vibration.vibrate(80);
    await scanQrCode(manualCode.trim());
    setManualCode('');
  };

  const handleResetScan = () => {
    clearLastScan();
    setScanLocked(false);
  };

  const validSampleTicket = tickets.find((t) => !t.is_used);
  const usedSampleTicket = tickets.find((t) => t.is_used);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        {/* Top Mode Switcher */}
        <View style={styles.topHeader}>
          <View>
            <Text style={styles.screenTitle}>Contrôle d'Entrée QR</Text>
            <Text style={styles.screenSubtitle}>
              Scannez le QR code du billet ou saisissez son code
            </Text>
          </View>
          <TouchableOpacity
            style={[styles.modeToggleBtn, !cameraActive && styles.modeToggleBtnInactive]}
            onPress={() => setCameraActive(!cameraActive)}
          >
            {cameraActive ? (
              <>
                <Keyboard color="#e2e8f0" size={16} />
                <Text style={styles.modeToggleText}>Saisie</Text>
              </>
            ) : (
              <>
                <Camera color="#e2e8f0" size={16} />
                <Text style={styles.modeToggleText}>Caméra</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Result Banner (Access Granted / Access Denied) */}
        {lastScanResult && (
          <View
            style={[
              styles.verdictCard,
              lastScanResult.status === 'success' ? styles.verdictSuccess : styles.verdictError,
            ]}
          >
            <View style={styles.verdictHeader}>
              {lastScanResult.status === 'success' ? (
                <CheckCircle2 color="#34d399" size={44} />
              ) : (
                <XCircle color="#f87171" size={44} />
              )}
              <View style={{ flex: 1 }}>
                <Text
                  style={[
                    styles.verdictBadge,
                    lastScanResult.status === 'success'
                      ? { color: '#6ee7b7' }
                      : { color: '#fca5a5' },
                  ]}
                >
                  {lastScanResult.status === 'success'
                    ? 'ACCÈS AUTORISÉ — BILLET VALIDE'
                    : 'ACCÈS REFUSÉ — ENTRÉE INTERDITE'}
                </Text>
                <Text style={styles.verdictMessage}>{lastScanResult.message}</Text>
              </View>
            </View>

            {lastScanResult.ticket && (
              <View style={styles.ticketInfoBox}>
                <View style={styles.ticketInfoRow}>
                  <QrCode color="#94a3b8" size={16} />
                  <Text style={styles.ticketNumberText}>
                    {lastScanResult.ticket.ticket_number}
                  </Text>
                </View>

                {lastScanResult.ticket.user && (
                  <View style={styles.ticketInfoRow}>
                    <UserIcon color="#94a3b8" size={16} />
                    <Text style={styles.ticketDetailText}>
                      Participant :{' '}
                      <Text style={{ fontWeight: '800', color: '#ffffff' }}>
                        {lastScanResult.ticket.user.name}
                      </Text>
                    </Text>
                  </View>
                )}

                {lastScanResult.ticket.event && (
                  <>
                    <View style={styles.ticketInfoRow}>
                      <Calendar color="#94a3b8" size={16} />
                      <Text style={styles.ticketDetailText}>
                        {lastScanResult.ticket.event.title}
                      </Text>
                    </View>
                    <View style={styles.ticketInfoRow}>
                      <MapPin color="#94a3b8" size={16} />
                      <Text style={styles.ticketDetailText}>
                        {lastScanResult.ticket.event.location}
                      </Text>
                    </View>
                  </>
                )}
              </View>
            )}

            <TouchableOpacity style={styles.nextScanBtn} onPress={handleResetScan}>
              <RotateCcw color="#090d16" size={18} />
              <Text style={styles.nextScanBtnText}>Scanner le billet suivant</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Camera Viewfinder */}
        {cameraActive && !lastScanResult && (
          <View style={styles.cameraContainer}>
            {!permission ? (
              <View style={styles.permissionBox}>
                <Text style={styles.permissionText}>Chargement de la caméra...</Text>
              </View>
            ) : !permission.granted ? (
              <View style={styles.permissionBox}>
                <Camera color="#a78bfa" size={42} />
                <Text style={styles.permissionTitle}>Autorisation Caméra Requise</Text>
                <Text style={styles.permissionText}>
                  Autorisez l'accès à la caméra pour scanner les QR codes des billets à l'entrée.
                </Text>
                <TouchableOpacity style={styles.permissionBtn} onPress={requestPermission}>
                  <Text style={styles.permissionBtnText}>Activer la Caméra</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.cameraWrapper}>
                <CameraView
                  style={styles.camera}
                  facing="back"
                  barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
                  onBarcodeScanned={scanLocked ? undefined : handleBarcodeScanned}
                />
                {/* Viewfinder Overlay */}
                <View style={styles.overlay}>
                  <View style={styles.scanFrame}>
                    <View style={[styles.corner, styles.cornerTL]} />
                    <View style={[styles.corner, styles.cornerTR]} />
                    <View style={[styles.corner, styles.cornerBL]} />
                    <View style={[styles.corner, styles.cornerBR]} />
                  </View>
                  <Text style={styles.overlayHint}>
                    Placez le QR Code du billet dans le cadre
                  </Text>
                </View>
              </View>
            )}
          </View>
        )}

        {/* Manual / Paste Verification Card */}
        <View style={styles.manualCard}>
          <Text style={styles.manualTitle}>
            Vérification Manuelle (Code QR chiffré ou N° Billet)
          </Text>
          <View style={styles.manualRow}>
            <TextInput
              style={styles.manualInput}
              value={manualCode}
              onChangeText={setManualCode}
              placeholder="Ex: TKT-2026-A89F12 ou payload QR..."
              placeholderTextColor="#64748b"
              autoCapitalize="none"
            />
            <TouchableOpacity
              style={[styles.verifyBtn, (!manualCode.trim() || isLoading) && { opacity: 0.5 }]}
              onPress={handleManualSubmit}
              disabled={!manualCode.trim() || isLoading}
            >
              <Text style={styles.verifyBtnText}>Vérifier</Text>
            </TouchableOpacity>
          </View>

          {/* Quick Simulation Buttons for Bouncer Testing */}
          <View style={styles.simSection}>
            <View style={styles.simHeader}>
              <Sparkles color="#a78bfa" size={14} />
              <Text style={styles.simTitle}>SIMULATION RAPIDE DE SCAN</Text>
            </View>
            <View style={styles.simButtonsRow}>
              {validSampleTicket && (
                <TouchableOpacity
                  style={styles.simValidBtn}
                  onPress={() =>
                    scanQrCode(validSampleTicket.qr_data || validSampleTicket.ticket_number)
                  }
                >
                  <Text style={styles.simValidText}>
                    Simuler Billet Valide ({validSampleTicket.ticket_number})
                  </Text>
                </TouchableOpacity>
              )}
              {usedSampleTicket && (
                <TouchableOpacity
                  style={styles.simUsedBtn}
                  onPress={() =>
                    scanQrCode(usedSampleTicket.qr_data || usedSampleTicket.ticket_number)
                  }
                >
                  <Text style={styles.simUsedText}>
                    Simuler Billet Déjà Scanné ({usedSampleTicket.ticket_number})
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#090d16',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  topHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
  },
  screenTitle: {
    color: '#f8fafc',
    fontSize: 22,
    fontWeight: '900',
  },
  screenSubtitle: {
    color: '#94a3b8',
    fontSize: 13,
    marginTop: 2,
  },
  modeToggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#1e293b',
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  modeToggleBtnInactive: {
    backgroundColor: '#7c3aed',
    borderColor: '#8b5cf6',
  },
  modeToggleText: {
    color: '#f8fafc',
    fontSize: 13,
    fontWeight: '700',
  },
  verdictCard: {
    borderRadius: 24,
    padding: 20,
    marginBottom: 20,
    borderWidth: 2,
  },
  verdictSuccess: {
    backgroundColor: 'rgba(6, 78, 59, 0.45)',
    borderColor: '#10b981',
  },
  verdictError: {
    backgroundColor: 'rgba(127, 29, 29, 0.45)',
    borderColor: '#ef4444',
  },
  verdictHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  verdictBadge: {
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  verdictMessage: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '800',
    marginTop: 4,
  },
  ticketInfoBox: {
    marginTop: 16,
    backgroundColor: 'rgba(9, 13, 22, 0.65)',
    borderRadius: 16,
    padding: 14,
    gap: 8,
  },
  ticketInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  ticketNumberText: {
    color: '#c4b5fd',
    fontSize: 15,
    fontWeight: '800',
    fontFamily: 'monospace',
  },
  ticketDetailText: {
    color: '#cbd5e1',
    fontSize: 14,
  },
  nextScanBtn: {
    marginTop: 16,
    backgroundColor: '#ffffff',
    height: 48,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  nextScanBtnText: {
    color: '#090d16',
    fontSize: 15,
    fontWeight: '900',
  },
  cameraContainer: {
    height: 320,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: '#131b2e',
    borderWidth: 1,
    borderColor: '#1e293b',
    marginBottom: 20,
  },
  permissionBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 12,
  },
  permissionTitle: {
    color: '#f8fafc',
    fontSize: 17,
    fontWeight: '800',
  },
  permissionText: {
    color: '#94a3b8',
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 19,
  },
  permissionBtn: {
    marginTop: 8,
    backgroundColor: '#7c3aed',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
  },
  permissionBtnText: {
    color: '#ffffff',
    fontWeight: '800',
    fontSize: 14,
  },
  cameraWrapper: {
    flex: 1,
    position: 'relative',
  },
  camera: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(9, 13, 22, 0.25)',
  },
  scanFrame: {
    width: 210,
    height: 210,
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 32,
    height: 32,
    borderColor: '#a78bfa',
  },
  cornerTL: {
    top: 0,
    left: 0,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderTopLeftRadius: 14,
  },
  cornerTR: {
    top: 0,
    right: 0,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderTopRightRadius: 14,
  },
  cornerBL: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderBottomLeftRadius: 14,
  },
  cornerBR: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderBottomRightRadius: 14,
  },
  overlayHint: {
    marginTop: 18,
    color: '#f8fafc',
    fontSize: 12,
    fontWeight: '700',
    backgroundColor: 'rgba(9, 13, 22, 0.75)',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 999,
  },
  manualCard: {
    backgroundColor: '#131b2e',
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  manualTitle: {
    color: '#cbd5e1',
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 10,
  },
  manualRow: {
    flexDirection: 'row',
    gap: 10,
  },
  manualInput: {
    flex: 1,
    backgroundColor: '#090d16',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 48,
    color: '#f8fafc',
    fontSize: 14,
  },
  verifyBtn: {
    backgroundColor: '#7c3aed',
    paddingHorizontal: 18,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  verifyBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '800',
  },
  simSection: {
    marginTop: 18,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: '#1e293b',
  },
  simHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
  },
  simTitle: {
    color: '#94a3b8',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  simButtonsRow: {
    gap: 8,
  },
  simValidBtn: {
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.35)',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
  },
  simValidText: {
    color: '#34d399',
    fontSize: 12,
    fontWeight: '700',
  },
  simUsedBtn: {
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.35)',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
  },
  simUsedText: {
    color: '#f87171',
    fontSize: 12,
    fontWeight: '700',
  },
});
