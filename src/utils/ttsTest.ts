import { Platform } from 'react-native';
import Tts from 'react-native-tts';
import { forceMainSpeaker } from '../services/iosAudioSession';

/** Test button — change this text anytime */
export const TTS_TEST_LINE =
  'Hello! I am your avatar. Button test worked and I can speak.';

let ttsReady = false;
let isSpeaking = false;
let speakListeners: Array<{ remove: () => void }> = [];

const clearSpeakListeners = () => {
  speakListeners.forEach((sub) => sub.remove());
  speakListeners = [];
};

const ensureTtsReady = async () => {
  if (ttsReady) {
    return;
  }
  try {
    await Tts.getInitStatus();
  } catch {
    if (Platform.OS === 'android') {
      Tts.requestInstallEngine();
    }
  }
  await Tts.setDefaultLanguage('en-US');
  if (Platform.OS === 'ios') {
    await Tts.setIgnoreSilentSwitch('ignore');
  }
  ttsReady = true;
};

const bindSpeakListeners = (options?: SpeakLineOptions) => {
  clearSpeakListeners();

  let done = false;
  const finish = () => {
    if (done) {
      return;
    }
    done = true;
    isSpeaking = false;
    clearSpeakListeners();
    options?.onDone?.();
  };

  const events: Array<'tts-start' | 'tts-finish' | 'tts-cancel' | 'tts-error'> =
    Platform.OS === 'ios'
      ? ['tts-start', 'tts-finish']
      : ['tts-start', 'tts-finish', 'tts-cancel', 'tts-error'];

  speakListeners = events.map((type) =>
    Tts.addEventListener(type, () => {
      if (type === 'tts-start') {
        if (Platform.OS === 'ios') {
          void forceMainSpeaker();
        }
        options?.onStart?.();
      } else {
        finish();
      }
    }),
  );
};

type SpeakLineOptions = {
  onStart?: () => void;
  onDone?: () => void;
};

/** Same TTS used by Test button AND avatar reply */
export const speakLine = async (
  text: string,
  options?: SpeakLineOptions,
): Promise<void> => {
  const line = text.trim();
  if (!line) {
    options?.onDone?.();
    return;
  }

  await ensureTtsReady();

  if (Platform.OS === 'ios') {
    await forceMainSpeaker();
  }

  if (isSpeaking) {
    try {
      await Tts.stop();
    } catch {
      // ignore
    }
    isSpeaking = false;
    clearSpeakListeners();
  }

  bindSpeakListeners(options);
  isSpeaking = true;

  if (Platform.OS === 'ios') {
    await forceMainSpeaker();
  }
  Tts.speak(line);
};

export const stopSpeakLine = async (): Promise<void> => {
  isSpeaking = false;
  clearSpeakListeners();
  try {
    await Tts.stop();
  } catch {
    // ignore
  }
};

export const speakTestLine = async (): Promise<void> => {
  await speakLine(TTS_TEST_LINE);
};
