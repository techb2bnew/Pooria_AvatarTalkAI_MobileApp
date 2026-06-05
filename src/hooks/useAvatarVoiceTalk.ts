import { useCallback, useEffect, useRef, useState } from 'react';
import { Alert } from 'react-native';
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
  requestMicPermission,
  speakReply,
  startListening,
  stopListening,
  stopSpeaking,
  unbindVoiceTalk,
  VoiceTalkPhase,
} from '../services/voiceTalk';
import { buildPersonalityVoiceReply } from '../utils/personalityVoiceReply';

type UseAvatarVoiceTalkParams = {
  personalityId: string;
  avatarName: string;
};

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

  const setPhaseSafe = useCallback((next: VoiceTalkPhase) => {
    phaseRef.current = next;
    setPhase(next);
  }, []);

  const resetToIdle = useCallback(() => {
    setEmotion(defaultEmotion);
    setPhaseSafe('idle');
  }, [defaultEmotion, setPhaseSafe]);

  const updateTranscript = useCallback((text: string) => {
    transcriptRef.current = text;
    setLiveTranscript(text);
  }, []);

  const processTranscript = useCallback(
    async (raw: string) => {
      const text = raw.trim() || transcriptRef.current.trim();
      if (!text) {
        resetToIdle();
        setLiveTranscript('');
        Alert.alert('', AVATAR_TALK_NO_SPEECH);
        return;
      }

      setLiveTranscript(text);
      setPhaseSafe('processing');
      setEmotion('thinking');

      const reply = buildPersonalityVoiceReply(
        personalityId,
        text,
        avatarName,
      );
      setAvatarReplyText(reply);

      setPhaseSafe('speaking');
      setEmotion('talking');
      await speakReply(reply, personalityId, resetToIdle, () =>
        setEmotion('talking'),
      );
    },
    [avatarName, personalityId, resetToIdle, setPhaseSafe],
  );

  const processRef = useRef(processTranscript);
  processRef.current = processTranscript;

  useEffect(() => {
    setEmotion(defaultEmotion);
  }, [defaultEmotion]);

  useEffect(() => {
    initVoiceTalk();
    bindVoiceListeners({
      onPartial: updateTranscript,
      onFinal: updateTranscript,
      onSpeechStarted: () => {
        if (phaseRef.current === 'listening') {
          setLiveTranscript((prev) => prev || '');
        }
      },
      onListenEnd: () => {
        if (phaseRef.current === 'listening') {
          void processRef.current(transcriptRef.current);
        }
      },
      onError: () => {
        if (phaseRef.current === 'listening') {
          resetToIdle();
          setLiveTranscript('');
          Alert.alert('', AVATAR_TALK_VOICE_ERROR);
        }
      },
    });
    return () => {
      unbindVoiceTalk();
    };
  }, [resetToIdle, updateTranscript]);

  const startTalk = useCallback(async () => {
    if (phaseRef.current !== 'idle') {
      return;
    }
    if (!(await requestMicPermission())) {
      Alert.alert('', AVATAR_TALK_MIC_DENIED);
      return;
    }
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
  }, [resetToIdle, setPhaseSafe]);

  const stopTalk = useCallback(async () => {
    if (phaseRef.current !== 'listening') {
      return;
    }
    const captured = transcriptRef.current;
    setPhaseSafe('processing');
    setEmotion('thinking');
    try {
      await stopListening();
    } catch {
      // still process what we captured
    }
    await processRef.current(captured);
  }, [setPhaseSafe]);

  const interruptSpeaking = useCallback(async () => {
    if (phaseRef.current !== 'speaking') {
      return;
    }
    await stopSpeaking();
    resetToIdle();
  }, [resetToIdle]);

  const toggleMic = useCallback(() => {
    if (phaseRef.current === 'speaking') {
      interruptSpeaking();
    } else if (phaseRef.current === 'idle') {
      startTalk();
    } else if (phaseRef.current === 'listening') {
      stopTalk();
    }
  }, [interruptSpeaking, startTalk, stopTalk]);

  const endSession = useCallback(async () => {
    await haltAllVoice();
    transcriptRef.current = '';
    setLiveTranscript('');
    setAvatarReplyText('');
    resetToIdle();
  }, [resetToIdle]);

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
