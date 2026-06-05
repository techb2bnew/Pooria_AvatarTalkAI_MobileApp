declare module 'react-native-tts' {
  import { NativeEventEmitter } from 'react-native';

  export type TtsEvents =
    | 'tts-start'
    | 'tts-finish'
    | 'tts-cancel'
    | 'tts-error';

  export type SpeakOptions = {
    rate?: number;
    androidParams?: Record<string, string | number>;
  };

  const Tts: NativeEventEmitter & {
    getInitStatus: () => Promise<'success'>;
    requestInstallEngine: () => void;
    setDefaultLanguage: (language: string) => Promise<'success'>;
    setDefaultRate: (rate: number, skipTransform?: boolean) => Promise<'success'>;
    setDefaultPitch: (pitch: number) => Promise<'success'>;
    setIgnoreSilentSwitch: (mode: string) => Promise<boolean>;
    speak: (text: string, options?: SpeakOptions) => string | number;
    stop: (onWordBoundary?: boolean) => Promise<boolean>;
    addEventListener: (
      type: TtsEvents,
      handler: () => void,
    ) => { remove: () => void };
  };

  export default Tts;
}
