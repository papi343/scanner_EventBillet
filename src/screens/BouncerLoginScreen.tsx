import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ShieldCheck, Lock, Mail, Server, QrCode, ChevronDown, ChevronUp } from 'lucide-react-native';
import { useScannerStore } from '../store/useScannerStore';

export default function BouncerLoginScreen() {
  const { login, isLoading, error, apiBaseUrl, updateServerUrl } = useScannerStore();
  const [email, setEmail] = useState('organiser@eventbillet.sn');
  const [password, setPassword] = useState('password123');
  const [showServerConfig, setShowServerConfig] = useState(false);
  const [serverInput, setServerInput] = useState(apiBaseUrl);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) return;
    await login(email.trim(), password);
  };

  const handleSaveServer = () => {
    updateServerUrl(serverInput);
    setShowServerConfig(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          {/* Header Badge */}
          <View style={styles.headerSection}>
            <View style={styles.logoCircle}>
              <QrCode color="#a78bfa" size={38} />
            </View>
            <View style={styles.securityPill}>
              <ShieldCheck color="#34d399" size={14} />
              <Text style={styles.securityPillText}>TERMINAL DE CONTRÔLE D'ACCÈS</Text>
            </View>
            <Text style={styles.title}>EventBillet Scanner</Text>
            <Text style={styles.subtitle}>
              Application réservée aux videurs et agents de sécurité pour la validation des billets QR.
            </Text>
          </View>

          {/* Login Card */}
          <View style={styles.card}>
            {error ? (
              <View style={styles.errorBanner}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            <Text style={styles.label}>Email Agent / Organisateur</Text>
            <View style={styles.inputWrapper}>
              <Mail color="#94a3b8" size={18} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="videur@eventbillet.sn"
                placeholderTextColor="#64748b"
                autoCapitalize="none"
                keyboardType="email-address"
              />
            </View>

            <Text style={styles.label}>Mot de passe</Text>
            <View style={styles.inputWrapper}>
              <Lock color="#94a3b8" size={18} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={password}
                onChangeText={setPassword}
                placeholder="••••••••"
                placeholderTextColor="#64748b"
                secureTextEntry
              />
            </View>

            <TouchableOpacity
              style={[styles.loginBtn, isLoading && styles.loginBtnDisabled]}
              onPress={handleLogin}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text style={styles.loginBtnText}>Activer le Scanner QR</Text>
              )}
            </TouchableOpacity>

            {/* Quick Fill Demo Button */}
            <View style={styles.demoSection}>
              <Text style={styles.demoTitle}>CONNEXION RAPIDE (DÉMO VIDEUR)</Text>
              <TouchableOpacity
                style={styles.demoChip}
                onPress={() => {
                  setEmail('organiser@eventbillet.sn');
                  setPassword('password123');
                }}
              >
                <ShieldCheck color="#a78bfa" size={16} />
                <Text style={styles.demoChipText}>Chef Sécurité (organiser@eventbillet.sn)</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Server API Config */}
          <View style={styles.serverCard}>
            <TouchableOpacity
              style={styles.serverToggle}
              onPress={() => setShowServerConfig(!showServerConfig)}
            >
              <View style={styles.serverToggleLeft}>
                <Server color="#94a3b8" size={16} />
                <Text style={styles.serverToggleText}>Serveur API Laravel : {apiBaseUrl}</Text>
              </View>
              {showServerConfig ? (
                <ChevronUp color="#94a3b8" size={18} />
              ) : (
                <ChevronDown color="#94a3b8" size={18} />
              )}
            </TouchableOpacity>

            {showServerConfig && (
              <View style={styles.serverBody}>
                <TextInput
                  style={styles.serverInput}
                  value={serverInput}
                  onChangeText={setServerInput}
                  placeholder="http://192.168.1.X:8000/api/v1"
                  placeholderTextColor="#64748b"
                  autoCapitalize="none"
                />
                <TouchableOpacity style={styles.serverSaveBtn} onPress={handleSaveServer}>
                  <Text style={styles.serverSaveText}>Enregistrer l'URL</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#090d16',
  },
  scrollContent: {
    padding: 24,
    justifyContent: 'center',
    minHeight: '100%',
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: 28,
  },
  logoCircle: {
    width: 76,
    height: 76,
    borderRadius: 24,
    backgroundColor: 'rgba(139, 92, 246, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  securityPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 999,
    marginBottom: 12,
    gap: 6,
  },
  securityPillText: {
    color: '#34d399',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  title: {
    color: '#f8fafc',
    fontSize: 28,
    fontWeight: '900',
    textAlign: 'center',
  },
  subtitle: {
    color: '#94a3b8',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
  card: {
    backgroundColor: '#131b2e',
    borderRadius: 24,
    padding: 22,
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  errorBanner: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderColor: 'rgba(239, 68, 68, 0.4)',
    borderWidth: 1,
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
  },
  errorText: {
    color: '#fca5a5',
    fontSize: 13,
    fontWeight: '600',
  },
  label: {
    color: '#cbd5e1',
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 8,
    marginTop: 10,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#090d16',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 50,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    color: '#f8fafc',
    fontSize: 15,
  },
  loginBtn: {
    backgroundColor: '#7c3aed',
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 22,
  },
  loginBtnDisabled: {
    opacity: 0.6,
  },
  loginBtnText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '800',
  },
  demoSection: {
    marginTop: 22,
    paddingTop: 18,
    borderTopWidth: 1,
    borderTopColor: '#1e293b',
  },
  demoTitle: {
    color: '#64748b',
    fontSize: 11,
    fontWeight: '800',
    marginBottom: 10,
    letterSpacing: 0.6,
  },
  demoChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0f172a',
    borderWidth: 1,
    borderColor: '#334155',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    gap: 8,
  },
  demoChipText: {
    color: '#e2e8f0',
    fontSize: 13,
    fontWeight: '600',
  },
  serverCard: {
    marginTop: 18,
    backgroundColor: '#131b2e',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  serverToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  serverToggleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  serverToggleText: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '600',
  },
  serverBody: {
    marginTop: 12,
    gap: 10,
  },
  serverInput: {
    backgroundColor: '#090d16',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 42,
    color: '#f8fafc',
    fontSize: 13,
  },
  serverSaveBtn: {
    backgroundColor: '#334155',
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  serverSaveText: {
    color: '#f8fafc',
    fontSize: 13,
    fontWeight: '700',
  },
});
