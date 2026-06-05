import { NavigationProp } from '@react-navigation/native';
import {
  BootDestination,
  completeSignIn,
} from '../services/sessionStorage';
import { AuthStackParamList } from './types';

export const resetNavigationAfterAuth = (
  navigation: NavigationProp<AuthStackParamList>,
  destination: BootDestination,
) => {
  if (destination.route === 'AvatarTalk') {
    navigation.reset({
      index: 0,
      routes: [
        {
          name: 'AvatarTalk',
          params: {
            avatarId: destination.params.avatarId,
            avatarName: destination.params.avatarName,
            avatarImageUri: destination.params.avatarImageUri,
            avatarGender: destination.params.avatarGender || 'male',
            personalityId: destination.params.personalityId,
            personalityTitle: destination.params.personalityTitle,
          },
        },
      ],
    });
    return;
  }

  navigation.reset({
    index: 0,
    routes: [{ name: destination.route }],
  });
};

export const signInAndNavigate = async (
  navigation: NavigationProp<AuthStackParamList>,
) => {
  const destination = await completeSignIn();
  resetNavigationAfterAuth(navigation, destination);
};
