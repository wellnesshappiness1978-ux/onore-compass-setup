import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.agolmen.compass',
  appName: 'アゴルメンの羅針盤',
  webDir: 'dist',
  server: {
    url: 'https://agolmen-compass.com',
    cleartext: false
  }
};

export default config;
