import { NativeModules, Platform } from 'react-native';

type AudioSessionNative = {
  forceMainSpeaker: () => Promise<boolean>;
};

const native = NativeModules.AudioSessionModule as
  | AudioSessionNative
  | undefined;

export const forceMainSpeaker = async (): Promise<void> => {
  if (Platform.OS !== 'ios' || !native?.forceMainSpeaker) {
    return;
  }
  try {
    await native.forceMainSpeaker();
  } catch {
    // ignore
  }
};
