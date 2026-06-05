import { AvatarGender } from '../utils/validation';

/**
 * Ready Player Me — realistic human avatars
 * 1. https://readyplayer.me → Create avatar (Male / Female)
 * 2. Copy .glb link OR paste avatar ID only below
 *
 * Example:
 *   male: '6577d86e7b6ad9591775e840'
 *   female: '64f7e5c8b84edbb50ed0fa31'
 *
 * Leave empty '' to use built-in human fallback (CesiumMan / Michelle).
 */
export const RPM_AVATAR_ID: Record<AvatarGender, string> = {
  male: '',
  female: '',
};

const RPM_QUERY =
  'morphTargets=ARKit,Oculus%20Visemes&textureAtlas=1024&lod=1';

export const buildReadyPlayerMeGlbUrl = (idOrUrl: string): string => {
  const raw = idOrUrl.trim();
  if (!raw) {
    return '';
  }
  if (raw.startsWith('http')) {
    return raw.includes('?') ? raw : `${raw}?${RPM_QUERY}`;
  }
  return `https://models.readyplayer.me/${raw}.glb?${RPM_QUERY}`;
};

export const getReadyPlayerMeUrl = (gender: AvatarGender): string =>
  buildReadyPlayerMeGlbUrl(RPM_AVATAR_ID[gender]);
