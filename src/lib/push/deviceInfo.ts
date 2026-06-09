// Build the device metadata payload for repository.saveFCMToken (POST /saveToken).
// All fields are best-effort — the backend ignores blanks — so this stays safe on
// simulators/web where some values are null.
import { Platform } from 'react-native';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { getCurrentLang } from '@/i18n';

function timeZone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone ?? '';
  } catch {
    return '';
  }
}

export interface FcmDeviceArgs {
  deviceType: string;
  deviceName: string;
  deviceId: string;
  deviceModel: string;
  deviceManufacturer: string;
  appVersion: string;
  buildNumber: string;
  appLanguage: string;
  platformVersion: string;
  timezone: string;
}

export function collectDeviceArgs(): FcmDeviceArgs {
  return {
    deviceType: Platform.OS,
    deviceName: Device.deviceName ?? '',
    deviceId: '',
    deviceModel: Device.modelName ?? '',
    deviceManufacturer:
      Device.manufacturer ?? (Platform.OS === 'ios' ? 'Apple' : ''),
    appVersion: Constants.expoConfig?.version ?? '',
    buildNumber: '',
    appLanguage: getCurrentLang(),
    platformVersion: Device.osVersion ?? String(Platform.Version),
    timezone: timeZone(),
  };
}
