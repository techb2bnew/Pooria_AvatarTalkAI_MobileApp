import {
  personalityAngryRed,
  personalityFriendlyGreen,
  personalityFunnyOrange,
  personalityMotivationalPurple,
  personalityNormalGrey,
  personalityProfessionalBlue,
} from './Color';

export type PersonalityId =
  | 'friendly'
  | 'normal'
  | 'angry'
  | 'funny'
  | 'professional'
  | 'motivational';

export type AvatarEmotionId =
  | 'idle'
  | 'happy'
  | 'thinking'
  | 'talking'
  | 'excited'
  | 'serious';

export type PersonalityAvatarConfig = {
  id: PersonalityId;
  accentColor: string;
  defaultEmotion: AvatarEmotionId;
};

export const PERSONALITY_AVATAR_CONFIG: Record<
  PersonalityId,
  PersonalityAvatarConfig
> = {
  friendly: {
    id: 'friendly',
    accentColor: personalityFriendlyGreen,
    defaultEmotion: 'happy',
  },
  normal: {
    id: 'normal',
    accentColor: personalityNormalGrey,
    defaultEmotion: 'idle',
  },
  angry: {
    id: 'angry',
    accentColor: personalityAngryRed,
    defaultEmotion: 'serious',
  },
  funny: {
    id: 'funny',
    accentColor: personalityFunnyOrange,
    defaultEmotion: 'excited',
  },
  professional: {
    id: 'professional',
    accentColor: personalityProfessionalBlue,
    defaultEmotion: 'serious',
  },
  motivational: {
    id: 'motivational',
    accentColor: personalityMotivationalPurple,
    defaultEmotion: 'excited',
  },
};

export const EMOTION_3D_CLIP: Record<AvatarEmotionId, string> = {
  idle: 'idle',
  happy: 'agree',
  thinking: 'headShake',
  talking: 'agree',
  excited: 'run',
  serious: 'idle',
};

export const isPersonalityId = (value: string): value is PersonalityId =>
  value in PERSONALITY_AVATAR_CONFIG;

export const getPersonalityConfig = (personalityId: string) => {
  if (isPersonalityId(personalityId)) {
    return PERSONALITY_AVATAR_CONFIG[personalityId];
  }
  return PERSONALITY_AVATAR_CONFIG.normal;
};
