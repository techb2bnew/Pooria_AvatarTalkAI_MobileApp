import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AvatarTalkScreen from '../screens/AvatarTalkScreen';
import ChoosePersonalityScreen from '../screens/ChoosePersonalityScreen';
import CreateAvatarScreen from '../screens/CreateAvatarScreen';
import HomeScreen from '../screens/HomeScreen';
import EditProfileScreen from '../screens/EditProfileScreen';
import ProfileScreen from '../screens/ProfileScreen';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import { loginPrimaryPurple, whiteColor } from '../constants/Color';
import {
  BootDestination,
  getBootDestination,
  loadAppSession,
} from '../services/sessionStorage';
import { AuthStackParamList } from './types';

const Stack = createNativeStackNavigator<AuthStackParamList>();

const AppNavigator = () => {
  const [bootDestination, setBootDestination] = useState<BootDestination | null>(
    null,
  );

  useEffect(() => {
    let mounted = true;
    const loadBootState = async () => {
      const session = await loadAppSession();
      if (mounted) {
        setBootDestination(getBootDestination(session));
      }
    };
    loadBootState();
    return () => {
      mounted = false;
    };
  }, []);

  if (!bootDestination) {
    return (
      <View style={styles.bootLoader}>
        <ActivityIndicator size="large" color={loginPrimaryPurple} />
      </View>
    );
  }

  const avatarTalkInitialParams =
    bootDestination.route === 'AvatarTalk' ? bootDestination.params : undefined;

  return (
    <Stack.Navigator
      initialRouteName={bootDestination.route}
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen
        name="ChoosePersonality"
        component={ChoosePersonalityScreen}
      />
      <Stack.Screen
        name="AvatarTalk"
        component={AvatarTalkScreen}
        initialParams={avatarTalkInitialParams}
      />
      <Stack.Screen name="CreateAvatar" component={CreateAvatarScreen} />
      <Stack.Screen name="Profile" component={ProfileScreen} />
      <Stack.Screen name="EditProfile" component={EditProfileScreen} />
    </Stack.Navigator>
  );
};

export default AppNavigator;

const styles = StyleSheet.create({
  bootLoader: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: whiteColor,
  },
});
