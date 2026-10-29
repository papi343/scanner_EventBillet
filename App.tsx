import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import ScannerNavigator from './src/navigation/ScannerNavigator';

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <ScannerNavigator />
    </SafeAreaProvider>
  );
}
