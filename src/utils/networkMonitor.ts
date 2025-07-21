// src/utils/networkMonitor.ts
import NetInfo from '@react-native-community/netinfo';
import { useState, useEffect } from 'react';

// Network status singleton
class NetworkMonitor {
  private static instance: NetworkMonitor;
  private isConnected: boolean = true;
  private listeners: Set<(isConnected: boolean) => void> = new Set();

  private constructor() {
    // Initialize network monitoring
    NetInfo.addEventListener(state => {
      const newConnectionStatus = !!state.isConnected;
      
      // Only notify if status changed
      if (this.isConnected !== newConnectionStatus) {
        this.isConnected = newConnectionStatus;
        this.notifyListeners();
      }
    });
  }

  public static getInstance(): NetworkMonitor {
    if (!NetworkMonitor.instance) {
      NetworkMonitor.instance = new NetworkMonitor();
    }
    return NetworkMonitor.instance;
  }

  public getConnectionStatus(): boolean {
    return this.isConnected;
  }

  public async checkConnection(): Promise<boolean> {
    const state = await NetInfo.fetch();
    this.isConnected = !!state.isConnected;
    return this.isConnected;
  }

  public addListener(listener: (isConnected: boolean) => void): () => void {
    this.listeners.add(listener);
    
    // Return unsubscribe function
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => {
      listener(this.isConnected);
    });
  }
}

// React hook for network status
export const useNetworkStatus = () => {
  const [isConnected, setIsConnected] = useState<boolean>(true);
  
  useEffect(() => {
    const networkMonitor = NetworkMonitor.getInstance();
    
    // Check initial status
    networkMonitor.checkConnection().then(status => {
      setIsConnected(status);
    });
    
    // Subscribe to changes
    const unsubscribe = networkMonitor.addListener((status) => {
      setIsConnected(status);
    });
    
    return unsubscribe;
  }, []);
  
  return isConnected;
};

export default NetworkMonitor.getInstance();
