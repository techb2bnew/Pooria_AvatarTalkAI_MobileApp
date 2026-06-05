import { getReadyPlayerMeUrl } from '../config/rpmAvatarUrls';
import { PersonalityId, getPersonalityConfig } from './personalityAvatar';
import { AvatarGender } from '../utils/validation';

const KHRONOS =
  'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0';

const FALLBACK_HUMAN: Record<
  AvatarGender,
  { modelUrl: string; useAutoFrame: boolean }
> = {
  male: {
    modelUrl: `${KHRONOS}/CesiumMan/glTF-Binary/CesiumMan.glb`,
    useAutoFrame: true,
  },
  female: {
    modelUrl:
      'https://raw.githubusercontent.com/mrdoob/three.js/r128/examples/models/gltf/Michelle.glb',
    useAutoFrame: true,
  },
};

/** RPM demo models (often more reliable CDN) */
export const RPM_DEMO_GLB: Record<AvatarGender, string> = {
  male: 'https://readyplayerme.github.io/visage/male.glb',
  female:
    'https://readyplayerme.github.io/visage/female.glb',
};

const PERSONALITY_3D_TUNING: Record<
  PersonalityId,
  { tintStrength: number }
> = {
  friendly: { tintStrength: 0.08 },
  normal: { tintStrength: 0.04 },
  angry: { tintStrength: 0.14 },
  funny: { tintStrength: 0.1 },
  professional: { tintStrength: 0.08 },
  motivational: { tintStrength: 0.12 },
};

export type Avatar3DRenderConfig = {
  modelUrl: string;
  isRpm: boolean;
  tintHex: string;
  tintStrength: number;
  useAutoFrame: boolean;
};

export const normalizeAvatarGender = (value?: string | null): AvatarGender =>
  value?.toLowerCase() === 'female' ? 'female' : 'male';

export const getAvatar3DConfig = (
  avatarGender: string | undefined | null,
  personalityId: string,
): Avatar3DRenderConfig => {
  const gender = normalizeAvatarGender(avatarGender);
  const rpmUrl = getReadyPlayerMeUrl(gender);
  const fallback = FALLBACK_HUMAN[gender];
  const personality = getPersonalityConfig(personalityId);
  const tuning =
    personality.id in PERSONALITY_3D_TUNING
      ? PERSONALITY_3D_TUNING[personality.id]
      : PERSONALITY_3D_TUNING.normal;

  if (rpmUrl) {
    return {
      modelUrl: rpmUrl,
      isRpm: true,
      tintHex: personality.accentColor,
      tintStrength: tuning.tintStrength * 0.5,
      useAutoFrame: true,
    };
  }

  const demoUrl = RPM_DEMO_GLB[gender];

  return {
    modelUrl: demoUrl || fallback.modelUrl,
    isRpm: Boolean(demoUrl),
    tintHex: personality.accentColor,
    tintStrength: tuning.tintStrength,
    useAutoFrame: fallback.useAutoFrame,
  };
};
