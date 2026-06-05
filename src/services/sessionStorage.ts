import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@AvatarTalkAI/appSession';

export type StoredAvatar = {
  avatarId: string;
  avatarName: string;
  avatarImageUri: string;
  avatarGender: string;
};

export type StoredPersonality = {
  personalityId: string;
  personalityTitle: string;
};

export type AppSession = {
  isLoggedIn: boolean;
  avatar?: StoredAvatar;
  personality?: StoredPersonality;
};

const emptySession = (): AppSession => ({ isLoggedIn: false });

export const loadAppSession = async (): Promise<AppSession> => {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return emptySession();
    }
    const parsed = JSON.parse(raw) as AppSession;
    if (!parsed || typeof parsed.isLoggedIn !== 'boolean') {
      return emptySession();
    }
    return parsed;
  } catch {
    return emptySession();
  }
};

const saveAppSession = async (session: AppSession): Promise<void> => {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(session));
};

export const setLoggedIn = async (): Promise<void> => {
  const current = await loadAppSession();
  await saveAppSession({ ...current, isLoggedIn: true });
};

export const saveAvatarAndPersonality = async (
  avatar: StoredAvatar,
  personality: StoredPersonality,
): Promise<void> => {
  const current = await loadAppSession();
  await saveAppSession({
    ...current,
    isLoggedIn: current.isLoggedIn,
    avatar,
    personality,
  });
};

export const clearAppSession = async (): Promise<void> => {
  await AsyncStorage.removeItem(STORAGE_KEY);
};

export const hasCompleteAvatarSelection = (session: AppSession): boolean =>
  Boolean(
    session.avatar?.avatarId &&
      session.avatar?.avatarName &&
      session.avatar?.avatarImageUri &&
      session.personality?.personalityId &&
      session.personality?.personalityTitle,
  );

export type BootDestination =
  | { route: 'Login' }
  | { route: 'Home' }
  | {
      route: 'AvatarTalk';
      params: StoredAvatar & StoredPersonality;
    };

export const getBootDestination = (session: AppSession): BootDestination => {
  if (!session.isLoggedIn) {
    return { route: 'Login' };
  }
  if (hasCompleteAvatarSelection(session) && session.avatar && session.personality) {
    return {
      route: 'AvatarTalk',
      params: {
        ...session.avatar,
        avatarGender: session.avatar.avatarGender || 'male',
        ...session.personality,
      },
    };
  }
  return { route: 'Home' };
};

export const getPostLoginDestination = (
  session: AppSession,
): BootDestination => getBootDestination(session);

export const completeSignIn = async (): Promise<BootDestination> => {
  await setLoggedIn();
  const session = await loadAppSession();
  return getPostLoginDestination(session);
};
