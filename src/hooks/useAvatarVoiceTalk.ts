import { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, Platform } from 'react-native';
import {
  AvatarEmotionId,
  getPersonalityConfig,
} from '../constants/personalityAvatar';
import {
  AVATAR_TALK_MIC_DENIED,
  AVATAR_TALK_NO_SPEECH,
  AVATAR_TALK_VOICE_ERROR,
} from '../constants/Constants';
import {
  bindVoiceListeners,
  haltAllVoice,
  initVoiceTalk,
  isBenignAndroidSpeechError,
  releaseMicForPlayback,
  requestMicPermission,
  startListening,
  unbindVoiceTalk,
  VoiceTalkPhase,
} from '../services/voiceTalk';
import { buildPersonalityVoiceReply } from '../utils/personalityVoiceReply';
import { speakLine, stopSpeakLine } from '../utils/ttsTest';

type UseAvatarVoiceTalkParams = {
  personalityId: string;
  avatarName: string;
};

/** iOS needs a beat for final transcript; Android is near-instant like before */
const REPLY_AFTER_SILENCE_MS = Platform.OS === 'ios' ? 900 : 300;

export const useAvatarVoiceTalk = ({
  personalityId,
  avatarName,
}: UseAvatarVoiceTalkParams) => {
  const config = getPersonalityConfig(personalityId);
  const defaultEmotion = config.defaultEmotion;

  const [phase, setPhase] = useState<VoiceTalkPhase>('idle');
  const [emotion, setEmotion] = useState<AvatarEmotionId>(defaultEmotion);
  const [liveTranscript, setLiveTranscript] = useState('');
  const [avatarReplyText, setAvatarReplyText] = useState('');

  const transcriptRef = useRef('');
  const phaseRef = useRef<VoiceTalkPhase>('idle');
  const processingRef = useRef(false);
  const replyDelayTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const setPhaseSafe = useCallback((next: VoiceTalkPhase) => {
    phaseRef.current = next;
    setPhase(next);
  }, []);

  const resetToIdle = useCallback(() => {
    setEmotion(defaultEmotion);
    setPhaseSafe('idle');
  }, [defaultEmotion, setPhaseSafe]);

  const cancelReplyDelay = useCallback(() => {
    if (replyDelayTimerRef.current) {
      clearTimeout(replyDelayTimerRef.current);
      replyDelayTimerRef.current = null;
    }
  }, []);

  const updateTranscript = useCallback((text: string) => {
    transcriptRef.current = text;
    setLiveTranscript(text);
  }, []);

  const processRef = useRef<(raw: string) => Promise<void>>(async () => {});

  const scheduleReplyAfterSilence = useCallback(() => {
    if (phaseRef.current !== 'listening') {
      return;
    }
    cancelReplyDelay();
    replyDelayTimerRef.current = setTimeout(() => {
      replyDelayTimerRef.current = null;
      if (phaseRef.current !== 'listening') {
        return;
      }
      if (!transcriptRef.current.trim()) {
        return;
      }
      void processRef.current(transcriptRef.current);
    }, REPLY_AFTER_SILENCE_MS);
  }, [cancelReplyDelay]);

  const processTranscript = useCallback(
    async (raw: string) => {
      if (processingRef.current) {
        return;
      }

      const text = raw.trim() || transcriptRef.current.trim();
      if (!text) {
        resetToIdle();
        setLiveTranscript('');
        Alert.alert('', AVATAR_TALK_NO_SPEECH);
        return;
      }

      cancelReplyDelay();
      processingRef.current = true;
      setLiveTranscript(text);
      setPhaseSafe('processing');
      setEmotion('thinking');

      const reply = buildPersonalityVoiceReply(
        personalityId,
        text,
        avatarName,
      );
      setAvatarReplyText(reply);

      await releaseMicForPlayback();

      setPhaseSafe('speaking');
      setEmotion('talking');
      await speakLine(reply, {
        onStart: () => setEmotion('talking'),
        onDone: () => {
          processingRef.current = false;
          resetToIdle();
        },
      });
    },
    [avatarName, cancelReplyDelay, personalityId, resetToIdle, setPhaseSafe],
  );

  processRef.current = processTranscript;

  useEffect(() => {
    setEmotion(defaultEmotion);
  }, [defaultEmotion]);

  useEffect(() => {
    initVoiceTalk();
    bindVoiceListeners({
      onPartial: updateTranscript,
      onFinal: (text) => {
        updateTranscript(text);
        if (text.trim()) {
          scheduleReplyAfterSilence();
        }
      },
      onSpeechStarted: () => {
        if (phaseRef.current === 'listening') {
          cancelReplyDelay();
          setLiveTranscript((prev) => prev || '');
        }
      },
      onListenEnd: () => {
        scheduleReplyAfterSilence();
      },
      onError: (event) => {
        if (phaseRef.current !== 'listening') {
          return;
        }
        if (isBenignAndroidSpeechError(event)) {
          return;
        }
        cancelReplyDelay();
        resetToIdle();
        setLiveTranscript('');
        Alert.alert('', AVATAR_TALK_VOICE_ERROR);
      },
    });
    return () => {
      cancelReplyDelay();
      unbindVoiceTalk();
    };
  }, [cancelReplyDelay, resetToIdle, scheduleReplyAfterSilence, updateTranscript]);

  const startTalk = useCallback(async () => {
    if (phaseRef.current !== 'idle') {
      return;
    }
    if (!(await requestMicPermission())) {
      Alert.alert('', AVATAR_TALK_MIC_DENIED);
      return;
    }
    cancelReplyDelay();
    transcriptRef.current = '';
    setLiveTranscript('');
    setAvatarReplyText('');
    setPhaseSafe('listening');
    setEmotion('happy');
    try {
      await startListening();
    } catch {
      resetToIdle();
      Alert.alert('', AVATAR_TALK_MIC_DENIED);
    }
  }, [cancelReplyDelay, resetToIdle, setPhaseSafe]);

  const interruptSpeaking = useCallback(async () => {
    if (phaseRef.current !== 'speaking') {
      return;
    }
    await stopSpeakLine();
    processingRef.current = false;
    resetToIdle();
  }, [resetToIdle]);

  const toggleMic = useCallback(() => {
    if (phaseRef.current === 'speaking') {
      interruptSpeaking();
    } else if (phaseRef.current === 'idle') {
      startTalk();
    }
    // listening: no second tap — reply auto like Android
  }, [interruptSpeaking, startTalk]);

  const endSession = useCallback(async () => {
    cancelReplyDelay();
    await haltAllVoice();
    transcriptRef.current = '';
    setLiveTranscript('');
    setAvatarReplyText('');
    resetToIdle();
  }, [cancelReplyDelay, resetToIdle]);

  const showTranscriptBox =
    phase === 'listening' || phase === 'processing' || phase === 'speaking';

  return {
    emotion,
    liveTranscript,
    avatarReplyText,
    showTranscriptBox,
    isListening: phase === 'listening',
    isTalking: phase === 'speaking',
    isProcessing: phase === 'processing',
    isBusy: phase !== 'idle',
    toggleMic,
    endSession,
  };
};
