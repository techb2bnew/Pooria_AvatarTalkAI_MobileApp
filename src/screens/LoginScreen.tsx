import React, { useCallback, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
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
  LOGIN_EMAIL_INVALID,
  LOGIN_EMAIL_LABEL,
  LOGIN_EMAIL_PLACEHOLDER,
  LOGIN_EMAIL_REQUIRED,
  LOGIN_FORGOT_PASSWORD,
  LOGIN_NO_ACCOUNT,
  LOGIN_PASSWORD_LABEL,
  LOGIN_PASSWORD_MIN_LENGTH,
  LOGIN_PASSWORD_PLACEHOLDER,
  LOGIN_PASSWORD_REQUIRED,
  LOGIN_SIGN_IN,
  LOGIN_SIGN_UP,
  LOGIN_WELCOME_SUBTITLE,
  LOGIN_WELCOME_TITLE,
} from '../constants/Constants';
import { spacings, style } from '../constants/Fonts';
import { AuthStackParamList } from '../navigation/types';
import { BaseStyle } from '../constants/Style';
import { signInAndNavigate } from '../navigation/authNavigation';
import {
  hasLoginFormErrors,
  LoginFormErrors,
  validateLoginForm,
} from '../utils/validation';

type LoginScreenProps = NativeStackScreenProps<AuthStackParamList, 'Login'>;

const validationMessages = {
  emailRequired: LOGIN_EMAIL_REQUIRED,
  emailInvalid: LOGIN_EMAIL_INVALID,
  passwordRequired: LOGIN_PASSWORD_REQUIRED,
  passwordMinLength: LOGIN_PASSWORD_MIN_LENGTH,
};

const LoginScreen = ({ navigation }: LoginScreenProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<LoginFormErrors>({});

  const clearFieldError = useCallback(
    (field: keyof LoginFormErrors) => {
      setErrors(prev => {
        if (!prev[field]) {
          return prev;
        }
        const next = { ...prev };
        delete next[field];
        return next;
      });
    },
    [],
  );

  const runValidation = useCallback(() => {
    const nextErrors = validateLoginForm(email, password, validationMessages);
    setErrors(nextErrors);
    return !hasLoginFormErrors(nextErrors);
  }, [email, password]);

  const handleSignIn = useCallback(async () => {
    if (!runValidation()) {
      return;
    }
    await signInAndNavigate(navigation);
  }, [runValidation, navigation]);

  const handleSignUp = useCallback(() => {
    navigation.navigate('Register');
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
            showsVerticalScrollIndicator={false}
            bounces={false}>
            <View style={styles.centerBox}>
              <AuthHeader
                title={LOGIN_WELCOME_TITLE}
                subtitle={LOGIN_WELCOME_SUBTITLE}
              />

              <View style={styles.form}>
                <AppTextInput
                  label={LOGIN_EMAIL_LABEL}
                  required
                  placeholder={LOGIN_EMAIL_PLACEHOLDER}
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
                  label={LOGIN_PASSWORD_LABEL}
                  required
                  placeholder={LOGIN_PASSWORD_PLACEHOLDER}
                  value={password}
                  onChangeText={value => {
                    setPassword(value);
                    clearFieldError('password');
                  }}
                  error={errors.password}
                  leftIconName="lock-outline"
                  secureTextEntry={!showPassword}
                  rightIconName={showPassword ? 'eye-off' : 'eye'}
                  rightIconFamily="feather"
                  onRightIconPress={() => setShowPassword(prev => !prev)}
                />

                <TouchableOpacity
                  style={styles.forgotPasswordWrap}
                  activeOpacity={0.7}>
                  <Text style={styles.forgotPassword}>
                    {LOGIN_FORGOT_PASSWORD}
                  </Text>
                </TouchableOpacity>

                <View style={styles.buttonContainer}>
                  <AppButton
                    title={LOGIN_SIGN_IN}
                    showArrow
                    onPress={handleSignIn}
                  />
                </View>
              </View>
            </View>
          </ScrollView>

          <View style={styles.footer}>
            <Text style={styles.footerText}>
              {LOGIN_NO_ACCOUNT}
              <Text style={styles.signUpLink} onPress={handleSignUp}>
                {LOGIN_SIGN_UP}
              </Text>
            </Text>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default LoginScreen;

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
    ...BaseStyle.justifyContentCenter,
    paddingHorizontal: spacings.xxLarge,
    paddingVertical: spacings.xLarge,
  },
  centerBox: {
    width: '100%',
  },
  form: {
    marginTop: spacings.normal,
  },
  forgotPasswordWrap: {
    ...BaseStyle.alignSelfEnd,
    marginTop: spacings.normal,
    marginBottom: spacings.large,
  },
  forgotPassword: {
    color: loginPrimaryPurple,
    fontSize: style.fontSizeNormal.fontSize,
    ...style.fontWeightMedium,
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
  buttonContainer: {
    marginTop: spacings.normal,
  },
  signUpLink: {
    color: loginPrimaryPurple,
    ...style.fontWeightMedium1x,
  },
});
