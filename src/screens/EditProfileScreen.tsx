import React, { useCallback, useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppButton from '../components/AppButton';
import AppTextInput from '../components/AppTextInput';
import {
  createAvatarHeaderBackBg,
  createAvatarPhotoIconBlue,
  homeHeaderPurple,
  homeScreenBg,
  loginPrimaryPurple,
  whiteColor,
} from '../constants/Color';
import {
  EDIT_PROFILE_PHONE_INVALID,
  EDIT_PROFILE_PHONE_LABEL,
  EDIT_PROFILE_PHONE_PLACEHOLDER,
  EDIT_PROFILE_SAVE,
  EDIT_PROFILE_SUBTITLE,
  EDIT_PROFILE_TITLE,
  PROFILE_EMAIL,
  PROFILE_FULL_NAME,
  REGISTER_EMAIL_INVALID,
  REGISTER_EMAIL_PLACEHOLDER,
  REGISTER_EMAIL_REQUIRED,
  REGISTER_FULL_NAME_MIN_LENGTH,
  REGISTER_FULL_NAME_PLACEHOLDER,
  REGISTER_FULL_NAME_REQUIRED,
} from '../constants/Constants';
import { spacings, style } from '../constants/Fonts';
import { BaseStyle } from '../constants/Style';
import { AuthStackParamList } from '../navigation/types';
import {
  EditProfileFormErrors,
  hasEditProfileFormErrors,
  isEditProfileFormComplete,
  validateEditProfileForm,
} from '../utils/validation';

type EditProfileScreenProps = NativeStackScreenProps<
  AuthStackParamList,
  'EditProfile'
>;

const validationMessages = {
  fullNameRequired: REGISTER_FULL_NAME_REQUIRED,
  fullNameMinLength: REGISTER_FULL_NAME_MIN_LENGTH,
  emailRequired: REGISTER_EMAIL_REQUIRED,
  emailInvalid: REGISTER_EMAIL_INVALID,
  phoneInvalid: EDIT_PROFILE_PHONE_INVALID,
};

const EditProfileScreen = ({ navigation, route }: EditProfileScreenProps) => {
  const [fullName, setFullName] = useState(route.params.fullName);
  const [email, setEmail] = useState(route.params.email);
  const [phone, setPhone] = useState(route.params.phone ?? '');
  const [errors, setErrors] = useState<EditProfileFormErrors>({});
  const [saving, setSaving] = useState(false);

  const isFormComplete = useMemo(
    () => isEditProfileFormComplete(fullName, email),
    [fullName, email],
  );

  const initials = fullName
    .trim()
    .split(' ')
    .filter(Boolean)
    .map(part => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const handleGoBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const clearFieldError = useCallback((field: keyof EditProfileFormErrors) => {
    setErrors(prev => {
      if (!prev[field]) {
        return prev;
      }
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }, []);

  const handleSave = useCallback(() => {
    const nextErrors = validateEditProfileForm(
      fullName,
      email,
      phone,
      validationMessages,
    );
    setErrors(nextErrors);
    if (hasEditProfileFormErrors(nextErrors)) {
      return;
    }

    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      navigation.navigate({
        name: 'Profile',
        params: {
          fullName: fullName.trim(),
          email: email.trim(),
          phone: phone.trim() || undefined,
        },
        merge: true,
      });
    }, 400);
  }, [fullName, email, phone, navigation]);

  return (
    <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
      <View style={styles.root}>
        <View style={styles.header}>

          <View style={styles.headerTop}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={handleGoBack}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel="Go back">
              <MaterialCommunityIcons
                name="arrow-left"
                size={22}
                color={whiteColor}
              />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>{EDIT_PROFILE_TITLE}</Text>
          </View>

          <View style={styles.photoSection}>
            <View style={styles.photoWrapper}>
              <View style={styles.photoCircle}>
                <Text style={styles.initials}>{initials || '?'}</Text>
              </View>
              <TouchableOpacity
                style={styles.cameraButton}
                activeOpacity={0.8}
                accessibilityRole="button"
                accessibilityLabel="Change profile photo">
                <MaterialCommunityIcons
                  name="camera"
                  size={18}
                  color={createAvatarPhotoIconBlue}
                />
              </TouchableOpacity>
            </View>
            <Text style={styles.headerSubtitle}>{EDIT_PROFILE_SUBTITLE}</Text>
          </View>

        </View>

        <KeyboardAvoidingView
          style={BaseStyle.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <ScrollView
            style={styles.formScroll}
            contentContainerStyle={styles.formContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            bounces={false}>
            <AppTextInput
              label={PROFILE_FULL_NAME}
              required
              value={fullName}
              onChangeText={text => {
                setFullName(text);
                clearFieldError('fullName');
              }}
              placeholder={REGISTER_FULL_NAME_PLACEHOLDER}
              error={errors.fullName}
              leftIconName="account-outline"
              autoCapitalize="words"
            />

            <AppTextInput
              label={PROFILE_EMAIL}
              required
              value={email}
              onChangeText={text => {
                setEmail(text);
                clearFieldError('email');
              }}
              placeholder={REGISTER_EMAIL_PLACEHOLDER}
              error={errors.email}
              leftIconName="email-outline"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />

            <AppTextInput
              label={EDIT_PROFILE_PHONE_LABEL}
              value={phone}
              onChangeText={text => {
                setPhone(text);
                clearFieldError('phone');
              }}
              placeholder={EDIT_PROFILE_PHONE_PLACEHOLDER}
              error={errors.phone}
              leftIconName="phone-outline"
              keyboardType="phone-pad"
            />

            <AppButton
              title={EDIT_PROFILE_SAVE}
              onPress={handleSave}
              disabled={!isFormComplete}
              mutedWhenDisabled
              loading={saving}
              style={styles.submitButton}
            />
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </SafeAreaView>
  );
};

export default EditProfileScreen;

const styles = StyleSheet.create({
  root: {
    ...BaseStyle.flex,
    backgroundColor: homeScreenBg,
  },
  header: {
    backgroundColor: homeHeaderPurple,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    paddingHorizontal: spacings.large,
    paddingBottom: spacings.ExtraLarge2x,
  },
  headerTop: {
    ...BaseStyle.flexDirectionRow,
    ...BaseStyle.alignItemsCenter,
    paddingTop: spacings.large,
    gap: spacings.large,
    marginBottom: spacings.ExtraLarge,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: createAvatarHeaderBackBg,
    ...BaseStyle.alignJustifyCenter,
  },
  headerTitle: {
    flex: 1,
    color: whiteColor,
    fontSize: style.fontSizeLargeX.fontSize,
    ...style.fontWeightMedium1x,
  },
  photoSection: {
    ...BaseStyle.alignItemsCenter,
    paddingBottom: spacings.small2x,
  },
  photoWrapper: {
    width: 120,
    height: 120,
    marginBottom: spacings.large,
  },
  photoCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: whiteColor,
    ...BaseStyle.alignJustifyCenter,
  },
  initials: {
    color: createAvatarPhotoIconBlue,
    fontSize: style.fontSizeLarge2x.fontSize,
    ...style.fontWeightMedium1x,
  },
  cameraButton: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: whiteColor,
    ...BaseStyle.alignJustifyCenter,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 4,
  },
  headerSubtitle: {
    color: whiteColor,
    fontSize: style.fontSizeNormal2x.fontSize,
    ...style.fontWeightThin,
    opacity: 0.9,
    textAlign: 'center',
  },
  formScroll: {
    ...BaseStyle.flex,
    backgroundColor: homeScreenBg,
  },
  formContent: {
    paddingHorizontal: spacings.large,
    paddingTop: spacings.ExtraLarge,
    paddingBottom: spacings.ExtraLarge3x,
  },
  submitButton: {
    marginTop: spacings.normal,
  },
});
