import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { QrCode, ClipboardList } from 'lucide-react-native';
import { useScannerStore } from '../store/useScannerStore';
import BouncerLoginScreen from '../screens/BouncerLoginScreen';
import QrScannerScreen from '../screens/QrScannerScreen';
import ScanHistoryScreen from '../screens/ScanHistoryScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function BouncerTabs() {
  const { scanLogs } = useScannerStore();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#0f172a',
          borderTopColor: '#1e293b',
          borderTopWidth: 1,
          height: 64,
          paddingBottom: 10,
          paddingTop: 8,
        },
        tabBarActiveTintColor: '#a78bfa',
        tabBarInactiveTintColor: '#64748b',
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '700',
        },
      }}
    >
      <Tab.Screen
        name="ScannerTab"
        component={QrScannerScreen}
        options={{
          title: 'Scanner QR',
          tabBarIcon: ({ color, size }) => <QrCode color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="HistoryTab"
        component={ScanHistoryScreen}
        options={{
          title: 'Pointage & Logs',
          tabBarBadge: scanLogs.length > 0 ? scanLogs.length : undefined,
          tabBarBadgeStyle: {
            backgroundColor: '#7c3aed',
            color: '#ffffff',
            fontSize: 10,
            fontWeight: '800',
          },
          tabBarIcon: ({ color, size }) => <ClipboardList color={color} size={size} />,
        }}
      />
    </Tab.Navigator>
  );
}

export default function ScannerNavigator() {
  const { isAuthenticated } = useScannerStore();

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!isAuthenticated ? (
          <Stack.Screen name="BouncerLogin" component={BouncerLoginScreen} />
        ) : (
          <Stack.Screen name="BouncerMain" component={BouncerTabs} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
