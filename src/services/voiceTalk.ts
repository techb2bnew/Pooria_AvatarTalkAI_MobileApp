import { EmitterSubscription, PermissionsAndroid, Platform } from 'react-native';
import Voice, {
  SpeechErrorEvent,
  SpeechResultsEvent,
} from '@react-native-voice/voice';
import Tts from 'react-native-tts';
import { AVATAR_TALK_MIC_DENIED } from '../constants/Constants';
import {
  PERSONALITY_TTS,
  PersonalityTtsProfile,
} from '../utils/personalityVoiceReply';
import { PersonalityId, isPersonalityId } from '../constants/personalityAvatar';

export type VoiceTalkPhase = 'idle' | 'listening' | 'processing' | 'speaking';

let ttsSubscriptions: EmitterSubscription[] = [];
let activeSpeakGeneration = 0;

const clearTtsListeners = () => {
  ttsSubscriptions.forEach((sub) => sub.remove());
  ttsSubscriptions = [];
};

export const requestMicPermission = async (): Promise<boolean> => {
  if (Platform.OS !== 'android') {
    return true;
  }
  const granted = await PermissionsAndroid.request(
    PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
    {
      title: 'Microphone',
      message: AVATAR_TALK_MIC_DENIED,
      buttonPositive: 'OK',
      buttonNegative: 'Cancel',
    },
  );
  return granted === PermissionsAndroid.RESULTS.GRANTED;
};

export const initVoiceTalk = async () => {
  try {
    await Tts.getInitStatus();
  } catch {
    if (Platform.OS === 'android') {
      Tts.requestInstallEngine();
    }
  }
  await Tts.setDefaultLanguage('en-US');
  await Tts.setIgnoreSilentSwitch('ignore');
};

const pickBestResult = (values?: string[]) => {
  if (!values?.length) {
    return '';
  }
  return values.reduce((a, b) => (b.length > a.length ? b : a), values[0]);
};

export const bindVoiceListeners = (handlers: {
  onPartial: (text: string) => void;
  onFinal: (text: string) => void;
  onListenEnd: () => void;
  onError: () => void;
  onSpeechStarted?: () => void;
}) => {
  Voice.removeAllListeners();
  Voice.onSpeechStart = () => handlers.onSpeechStarted?.();
  Voice.onSpeechPartialResults = (e: SpeechResultsEvent) => {
    const value = pickBestResult(e.value);
    if (value) {
      handlers.onPartial(value);
    }
  };
  Voice.onSpeechResults = (e: SpeechResultsEvent) => {
    const value = pickBestResult(e.value);
    if (value) {
      handlers.onFinal(value);
    }
  };
  Voice.onSpeechEnd = () => handlers.onListenEnd();
  Voice.onSpeechError = (_e: SpeechErrorEvent) => handlers.onError();
};

export const stopSpeaking = async (): Promise<void> => {
  activeSpeakGeneration += 1;
  clearTtsListeners();
  try {
    await Tts.stop(false);
  } catch {
    try {
      await Tts.stop();
    } catch {
      // no active utterance
    }
  }
};

export const stopListening = async () => {
  try {
    await Voice.cancel();
  } catch {
    // ignore
  }
  try {
    await Voice.stop();
  } catch {
    // ignore
  }
};

export const haltAllVoice = async () => {
  await stopSpeaking();
  await stopListening();
};

export const unbindVoiceTalk = async () => {
  await haltAllVoice();
  try {
    await Voice.destroy();
    Voice.removeAllListeners();
  } catch {
    // ignore
  }
};

export const startListening = async () => {
  await haltAllVoice();
  if (Platform.OS === 'android') {
    await Voice.start('en-US', {
      EXTRA_PARTIAL_RESULTS: true,
      EXTRA_MAX_RESULTS: 5,
    });
  } else {
    await Voice.start('en-US');
  }
};

const getTtsProfile = (personalityId: string): PersonalityTtsProfile => {
  if (isPersonalityId(personalityId)) {
    return PERSONALITY_TTS[personalityId as PersonalityId];
  }
  return PERSONALITY_TTS.normal;
};

export const speakReply = async (
  text: string,
  personalityId: string,
  onDone: () => void,
  onStart?: () => void,
): Promise<void> => {
  const speakId = activeSpeakGeneration + 1;
  activeSpeakGeneration = speakId;
  await stopSpeaking();
  if (speakId !== activeSpeakGeneration) {
    return;
  }

  const profile = getTtsProfile(personalityId);
  const finish = () => {
    if (speakId !== activeSpeakGeneration) {
      return;
    }
    activeSpeakGeneration += 1;
    clearTtsListeners();
    onDone();
  };

  const startSub = Tts.addEventListener('tts-start', () => {
    if (speakId === activeSpeakGeneration) {
      onStart?.();
    }
  });
  ttsSubscriptions = [
    startSub,
    Tts.addEventListener('tts-finish', finish),
    Tts.addEventListener('tts-cancel', finish),
    Tts.addEventListener('tts-error', finish),
  ];

  try {
    await Tts.setDefaultRate(profile.rate, true);
    await Tts.setDefaultPitch(profile.pitch);
  } catch {
    // continue
  }

  if (speakId !== activeSpeakGeneration) {
    clearTtsListeners();
    return;
  }

  if (Platform.OS === 'ios') {
    Tts.speak(text, { rate: profile.rate });
  } else {
    Tts.speak(text, {
      androidParams: {
        KEY_PARAM_PAN: 0,
        KEY_PARAM_VOLUME: 1,
        KEY_PARAM_STREAM: 'STREAM_MUSIC',
      },
    });
  }
};
