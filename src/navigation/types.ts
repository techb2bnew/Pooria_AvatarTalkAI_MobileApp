export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  Home: undefined;
  ChoosePersonality: {
    avatarId: string;
    avatarName: string;
    avatarImageUri: string;
    avatarGender: string;
  };
  AvatarTalk: {
    avatarId: string;
    avatarName: string;
    avatarImageUri: string;
    avatarGender: string;
    personalityId: string;
    personalityTitle: string;
  };
  CreateAvatar: undefined;
  Profile: { fullName?: string; email?: string; phone?: string } | undefined;
  EditProfile: {
    fullName: string;
    email: string;
    phone?: string;
  };
};
