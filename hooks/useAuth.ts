import { useCallback } from 'react';
import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';
import { useAppStore } from '../store/useAppStore';
import { hashPin, verifyPin } from '../utils/finance';

const PIN_KEY = 'finance_pin_hash';

export function useAuth() {
  const { user, isLocked, setLocked, updateUserSettings } = useAppStore();

  const hasBiometrics = useCallback(async (): Promise<boolean> => {
    const compatible = await LocalAuthentication.hasHardwareAsync();
    const enrolled = await LocalAuthentication.isEnrolledAsync();
    return compatible && enrolled;
  }, []);

  const authenticateBiometric = useCallback(async (): Promise<boolean> => {
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: 'Unlock FinanceApp',
      cancelLabel: 'Use PIN',
      fallbackLabel: 'Use PIN',
      disableDeviceFallback: false,
    });
    return result.success;
  }, []);

  const setupPin = useCallback(async (pin: string): Promise<void> => {
    const hash = hashPin(pin);
    await SecureStore.setItemAsync(PIN_KEY, hash);
    await updateUserSettings({ pinHash: hash });
  }, [updateUserSettings]);

  const verifyPinInput = useCallback(async (pin: string): Promise<boolean> => {
    const stored = await SecureStore.getItemAsync(PIN_KEY);
    if (!stored) return false;
    return verifyPin(pin, stored);
  }, []);

  const unlock = useCallback(async (): Promise<boolean> => {
    if (!user) return false;

    if (user.biometricsEnabled) {
      const ok = await authenticateBiometric();
      if (ok) {
        setLocked(false);
        return true;
      }
    }
    return false; // caller should fall back to PIN screen
  }, [user, authenticateBiometric, setLocked]);

  const unlockWithPin = useCallback(async (pin: string): Promise<boolean> => {
    const ok = await verifyPinInput(pin);
    if (ok) setLocked(false);
    return ok;
  }, [verifyPinInput, setLocked]);

  const enableBiometrics = useCallback(async (): Promise<boolean> => {
    const available = await hasBiometrics();
    if (!available) return false;
    const ok = await authenticateBiometric();
    if (ok) {
      await updateUserSettings({ biometricsEnabled: true });
    }
    return ok;
  }, [hasBiometrics, authenticateBiometric, updateUserSettings]);

  const disableBiometrics = useCallback(async (): Promise<void> => {
    await updateUserSettings({ biometricsEnabled: false });
  }, [updateUserSettings]);

  const removePin = useCallback(async (): Promise<void> => {
    await SecureStore.deleteItemAsync(PIN_KEY);
    await updateUserSettings({ pinHash: null, biometricsEnabled: false });
  }, [updateUserSettings]);

  return {
    isLocked,
    user,
    hasBiometrics,
    setupPin,
    verifyPinInput,
    unlock,
    unlockWithPin,
    enableBiometrics,
    disableBiometrics,
    removePin,
    setLocked,
  };
}
