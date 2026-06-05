import React, { useCallback, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppButton from '../components/AppButton';
import AppTextInput from '../components/AppTextInput';
import AuthHeader from '../components/AuthHeader';
import {
  loginPrimaryPurple,
  loginTextGrey,
  whiteColor,
} from '../constants/Color';
import {
  REGISTER_CONFIRM_PASSWORD_LABEL,
  REGISTER_CONFIRM_PASSWORD_PLACEHOLDER,
  REGISTER_CONFIRM_PASSWORD_REQUIRED,
  REGISTER_CREATE_ACCOUNT,
  REGISTER_EMAIL_INVALID,
  REGISTER_EMAIL_LABEL,
  REGISTER_EMAIL_PLACEHOLDER,
  REGISTER_EMAIL_REQUIRED,
  REGISTER_FULL_NAME_LABEL,
  REGISTER_FULL_NAME_MIN_LENGTH,
  REGISTER_FULL_NAME_PLACEHOLDER,
  REGISTER_FULL_NAME_REQUIRED,
  REGISTER_HAVE_ACCOUNT,
  REGISTER_PASSWORD_LABEL,
  REGISTER_PASSWORD_MIN_LENGTH,
  REGISTER_PASSWORD_MISMATCH,
  REGISTER_PASSWORD_PLACEHOLDER,
  REGISTER_PASSWORD_REQUIRED,
  REGISTER_SIGN_IN,
  REGISTER_SUBTITLE,
  REGISTER_TITLE,
} from '../constants/Constants';
import { spacings, style } from '../constants/Fonts';
import { signInAndNavigate } from '../navigation/authNavigation';
import { AuthStackParamList } from '../navigation/types';
import { BaseStyle } from '../constants/Style';
import {
  hasRegisterFormErrors,
  RegisterFormErrors,
  validateRegisterForm,
} from '../utils/validation';

type RegisterScreenProps = NativeStackScreenProps<
  AuthStackParamList,
  'Register'
>;

const validationMessages = {
  fullNameRequired: REGISTER_FULL_NAME_REQUIRED,
  fullNameMinLength: REGISTER_FULL_NAME_MIN_LENGTH,
  emailRequired: REGISTER_EMAIL_REQUIRED,
  emailInvalid: REGISTER_EMAIL_INVALID,
  passwordRequired: REGISTER_PASSWORD_REQUIRED,
  passwordMinLength: REGISTER_PASSWORD_MIN_LENGTH,
  confirmPasswordRequired: REGISTER_CONFIRM_PASSWORD_REQUIRED,
  passwordMismatch: REGISTER_PASSWORD_MISMATCH,
};

const RegisterScreen = ({ navigation }: RegisterScreenProps) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<RegisterFormErrors>({});

  const clearFieldError = useCallback((field: keyof RegisterFormErrors) => {
    setErrors(prev => {
      if (!prev[field]) {
        return prev;
      }
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }, []);

  const runValidation = useCallback(() => {
    const nextErrors = validateRegisterForm(
      fullName,
      email,
      password,
      confirmPassword,
      validationMessages,
    );
    setErrors(nextErrors);
    return !hasRegisterFormErrors(nextErrors);
  }, [fullName, email, password, confirmPassword]);

  const handleCreateAccount = useCallback(async () => {
    if (!runValidation()) {
      return;
    }
    await signInAndNavigate(navigation);
  }, [runValidation, navigation]);

  const handleSignIn = useCallback(() => {
    navigation.navigate('Login');
  }, [navigation]);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={BaseStyle.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.container}>
          <ScrollView
            style={BaseStyle.flex}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}>
            <View style={styles.content}>
              <AuthHeader title={REGISTER_TITLE} subtitle={REGISTER_SUBTITLE} />

              <View style={styles.form}>
                <AppTextInput
                  label={REGISTER_FULL_NAME_LABEL}
                  required
                  placeholder={REGISTER_FULL_NAME_PLACEHOLDER}
                  value={fullName}
                  onChangeText={value => {
                    setFullName(value);
                    clearFieldError('fullName');
                  }}
                  error={errors.fullName}
                  leftIconName="account-outline"
                  autoCapitalize="words"
                />

                <AppTextInput
                  label={REGISTER_EMAIL_LABEL}
                  required
                  placeholder={REGISTER_EMAIL_PLACEHOLDER}
                  value={email}
                  onChangeText={value => {
                    setEmail(value);
                    clearFieldError('email');
                  }}
                  error={errors.email}
                  leftIconName="email-outline"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />

                <AppTextInput
                  label={REGISTER_PASSWORD_LABEL}
                  required
                  placeholder={REGISTER_PASSWORD_PLACEHOLDER}
                  value={password}
                  onChangeText={value => {
                    setPassword(value);
                    clearFieldError('password');
                    if (errors.confirmPassword) {
                      clearFieldError('confirmPassword');
                    }
                  }}
                  error={errors.password}
                  leftIconName="lock-outline"
                  secureTextEntry={!showPassword}
                  rightIconName={showPassword ? 'eye-off' : 'eye'}
                  rightIconFamily="feather"
                  onRightIconPress={() => setShowPassword(prev => !prev)}
                />

                <AppTextInput
                  label={REGISTER_CONFIRM_PASSWORD_LABEL}
                  required
                  placeholder={REGISTER_CONFIRM_PASSWORD_PLACEHOLDER}
                  value={confirmPassword}
                  onChangeText={value => {
                    setConfirmPassword(value);
                    clearFieldError('confirmPassword');
                  }}
                  error={errors.confirmPassword}
                  leftIconName="lock-outline"
                  secureTextEntry={!showConfirmPassword}
                  rightIconName={showConfirmPassword ? 'eye-off' : 'eye'}
                  rightIconFamily="feather"
                  onRightIconPress={() =>
                    setShowConfirmPassword(prev => !prev)
                  }
                />

                <View style={styles.buttonContainer}>
                  <AppButton
                    title={REGISTER_CREATE_ACCOUNT}
                    showArrow
                    onPress={handleCreateAccount}
                  />
                </View>
              </View>
            </View>
          </ScrollView>

          <View style={styles.footer}>
            <Text style={styles.footerText}>
              {REGISTER_HAVE_ACCOUNT}
              <Text style={styles.signInLink} onPress={handleSignIn}>
                {REGISTER_SIGN_IN}
              </Text>
            </Text>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default RegisterScreen;

const styles = StyleSheet.create({
  safeArea: {
    ...BaseStyle.flex,
    backgroundColor: whiteColor,
  },
  container: {
    ...BaseStyle.flex,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacings.xxLarge,
    paddingTop: spacings.xLarge,
    paddingBottom: spacings.large,
  },
  content: {
    width: '100%',
  },
  form: {
    marginTop: spacings.small,
  },
  buttonContainer: {
    marginTop: spacings.normal,
  },
  footer: {
    ...BaseStyle.alignItemsCenter,
    paddingHorizontal: spacings.ExtraLarge2x,
    paddingTop: spacings.large,
    paddingBottom: spacings.xLarge,
  },
  footerText: {
    color: loginTextGrey,
    fontSize: style.fontSizeNormal1x.fontSize,
    ...style.fontWeightThin,
    textAlign: 'center',
  },
  signInLink: {
    color: loginPrimaryPurple,
    ...style.fontWeightMedium1x,
  },
});
