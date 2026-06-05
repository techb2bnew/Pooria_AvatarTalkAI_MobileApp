import React, { useCallback, useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppButton from '../components/AppButton';
import {
  blackColor,
  createAvatarChipSelectedBg,
  createAvatarChipSelectedBorder,
  createAvatarChipSelectedText,
  createAvatarChipText,
  createAvatarHeaderBackBg,
  createAvatarPhotoIconBlue,
  homeHeaderPurple,
  homeScreenBg,
  loginInputBg,
  loginInputBorder,
  loginPlaceholder,
  loginTextDark,
  redColor,
  whiteColor,
} from '../constants/Color';
import {
  CREATE_AVATAR_GENDER_FEMALE,
  CREATE_AVATAR_GENDER_LABEL,
  CREATE_AVATAR_GENDER_MALE,
  CREATE_AVATAR_NAME_LABEL,
  CREATE_AVATAR_NAME_PLACEHOLDER,
  CREATE_AVATAR_NAME_MIN_LENGTH,
  CREATE_AVATAR_NAME_REQUIRED,
  CREATE_AVATAR_GENDER_REQUIRED,
  CREATE_AVATAR_SUBMIT,
  CREATE_AVATAR_TITLE,
  CREATE_AVATAR_VOICE_FRIENDLY,
  CREATE_AVATAR_VOICE_LABEL,
  CREATE_AVATAR_VOICE_NATURAL,
  CREATE_AVATAR_VOICE_PROFESSIONAL,
  CREATE_AVATAR_VOICE_REQUIRED,
} from '../constants/Constants';
import { spacings, style } from '../constants/Fonts';
import { BaseStyle } from '../constants/Style';
import { AuthStackParamList } from '../navigation/types';
import { heightPercentageToDP } from '../utils';
import {
  AvatarGender,
  AvatarVoiceType,
  CreateAvatarFormErrors,
  hasCreateAvatarFormErrors,
  isCreateAvatarFormComplete,
  validateCreateAvatarForm,
} from '../utils/validation';

type CreateAvatarScreenProps = NativeStackScreenProps<
  AuthStackParamList,
  'CreateAvatar'
>;

type ChipOption<T extends string> = { id: T; label: string };

const GENDER_OPTIONS: ChipOption<AvatarGender>[] = [
  { id: 'male', label: CREATE_AVATAR_GENDER_MALE },
  { id: 'female', label: CREATE_AVATAR_GENDER_FEMALE },
];

const VOICE_OPTIONS: ChipOption<AvatarVoiceType>[] = [
  { id: 'natural', label: CREATE_AVATAR_VOICE_NATURAL },
  { id: 'professional', label: CREATE_AVATAR_VOICE_PROFESSIONAL },
  { id: 'friendly', label: CREATE_AVATAR_VOICE_FRIENDLY },
];

type FieldLabelProps = {
  label: string;
  required?: boolean;
};

const FieldLabel = ({ label, required = false }: FieldLabelProps) => (
  <View style={styles.labelRow}>
    <Text style={styles.fieldLabel}>{label}</Text>
    {required ? <Text style={styles.requiredStar}>*</Text> : null}
  </View>
);

const CreateAvatarScreen = ({ navigation }: CreateAvatarScreenProps) => {
  const [avatarName, setAvatarName] = useState('');
  const [gender, setGender] = useState<AvatarGender | null>(null);
  const [voiceType, setVoiceType] = useState<AvatarVoiceType | null>(null);
  const [errors, setErrors] = useState<CreateAvatarFormErrors>({});
  const [submitting, setSubmitting] = useState(false);

  const isFormComplete = useMemo(
    () => isCreateAvatarFormComplete(avatarName, gender, voiceType),
    [avatarName, gender, voiceType],
  );

  const handleGoBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const handleNameChange = useCallback((text: string) => {
    setAvatarName(text);
    setErrors(prev => ({ ...prev, avatarName: undefined }));
  }, []);

  const handleGenderSelect = useCallback((value: AvatarGender) => {
    setGender(value);
    setErrors(prev => ({ ...prev, gender: undefined }));
  }, []);

  const handleVoiceSelect = useCallback((value: AvatarVoiceType) => {
    setVoiceType(value);
    setErrors(prev => ({ ...prev, voiceType: undefined }));
  }, []);

  const handleCreate = useCallback(() => {
    const nextErrors = validateCreateAvatarForm(avatarName, gender, voiceType, {
      nameRequired: CREATE_AVATAR_NAME_REQUIRED,
      nameMinLength: CREATE_AVATAR_NAME_MIN_LENGTH,
      genderRequired: CREATE_AVATAR_GENDER_REQUIRED,
      voiceRequired: CREATE_AVATAR_VOICE_REQUIRED,
    });

    setErrors(nextErrors);
    if (hasCreateAvatarFormErrors(nextErrors)) {
      return;
    }

    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      navigation.goBack();
    }, 400);
  }, [avatarName, gender, voiceType, navigation]);

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
            <Text style={styles.headerTitle}>{CREATE_AVATAR_TITLE}</Text>
          </View>

          <View style={styles.photoSection}>
            <View style={styles.photoWrapper}>
              <View style={styles.photoCircle}>
                <MaterialCommunityIcons
                  name="account-outline"
                  size={56}
                  color={createAvatarPhotoIconBlue}
                />
              </View>
              <TouchableOpacity
                style={styles.cameraButton}
                activeOpacity={0.8}
                accessibilityRole="button"
                accessibilityLabel="Upload avatar photo">
                <MaterialCommunityIcons
                  name="camera"
                  size={18}
                  color={createAvatarPhotoIconBlue}
                />
              </TouchableOpacity>
            </View>
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
            <View style={styles.field}>
              <FieldLabel label={CREATE_AVATAR_NAME_LABEL} required />
              <TextInput
                value={avatarName}
                onChangeText={handleNameChange}
                placeholder={CREATE_AVATAR_NAME_PLACEHOLDER}
                placeholderTextColor={loginPlaceholder}
                style={[styles.nameInput, errors.avatarName && styles.inputError]}
                autoCapitalize="words"
                returnKeyType="done"
              />
              {errors.avatarName ? (
                <Text style={styles.errorText}>{errors.avatarName}</Text>
              ) : null}
            </View>

            <View style={styles.field}>
              <FieldLabel label={CREATE_AVATAR_GENDER_LABEL} required />
              <View style={styles.chipRow}>
                {GENDER_OPTIONS.map(option => (
                  <TouchableOpacity
                    key={option.id}
                    style={[
                      styles.chip,
                      styles.chipHalf,
                      gender === option.id && styles.chipSelected,
                    ]}
                    onPress={() => handleGenderSelect(option.id)}
                    activeOpacity={0.8}>
                    <Text
                      style={[
                        styles.chipText,
                        gender === option.id && styles.chipTextSelected,
                      ]}>
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              {errors.gender ? (
                <Text style={styles.errorText}>{errors.gender}</Text>
              ) : null}
            </View>

            <View style={styles.field}>
              <FieldLabel label={CREATE_AVATAR_VOICE_LABEL} required />
              <View style={styles.chipRow}>
                {VOICE_OPTIONS.map(option => (
                  <TouchableOpacity
                    key={option.id}
                    style={[
                      styles.chip,
                      styles.chipThird,
                      voiceType === option.id && styles.chipSelected,
                    ]}
                    onPress={() => handleVoiceSelect(option.id)}
                    activeOpacity={0.8}>
                    <Text
                      style={[
                        styles.chipText,
                        styles.chipTextSmall,
                        voiceType === option.id && styles.chipTextSelected,
                      ]}>
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              {errors.voiceType ? (
                <Text style={styles.errorText}>{errors.voiceType}</Text>
              ) : null}
            </View>

            <AppButton
              title={CREATE_AVATAR_SUBMIT}
              onPress={handleCreate}
              disabled={!isFormComplete}
              mutedWhenDisabled
              loading={submitting}
              style={styles.submitButton}
            />
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </SafeAreaView>
  );
};

export default CreateAvatarScreen;

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
    paddingBottom: spacings.large,
  },
  photoWrapper: {
    width: 120,
    height: 120,
  },
  photoCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: whiteColor,
    ...BaseStyle.alignJustifyCenter,
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
  formScroll: {
    ...BaseStyle.flex,
    backgroundColor: homeScreenBg,
  },
  formContent: {
    paddingHorizontal: spacings.large,
    paddingTop: spacings.ExtraLarge,
    paddingBottom: spacings.ExtraLarge3x,
  },
  field: {
    marginBottom: spacings.ExtraLarge,
  },
  labelRow: {
    ...BaseStyle.flexDirectionRow,
    ...BaseStyle.alignItemsCenter,
    marginBottom: spacings.large,
  },
  fieldLabel: {
    color: loginTextDark,
    fontSize: style.fontSizeNormal2x.fontSize,
    ...style.fontWeightMedium1x,
  },
  requiredStar: {
    color: blackColor,
    fontSize: style.fontSizeNormal2x.fontSize,
    ...style.fontWeightMedium1x,
    marginLeft: spacings.xsmall,
  },
  nameInput: {
    backgroundColor: loginInputBg,
    borderWidth: 1,
    borderColor: loginInputBorder,
    borderRadius: 10,
    paddingHorizontal: spacings.xLarge,
    paddingVertical: spacings.large,
    color: loginTextDark,
    fontSize: style.fontSizeNormal2x.fontSize,
    ...style.fontWeightThin,
    minHeight: heightPercentageToDP(5.8),
  },
  inputError: {
    borderColor: redColor,
  },
  errorText: {
    color: redColor,
    fontSize: style.fontSizeSmall1x.fontSize,
    ...style.fontWeightThin,
    marginTop: spacings.small2x,
  },
  chipRow: {
    ...BaseStyle.flexDirectionRow,
    gap: spacings.large,
  },
  chip: {
    ...BaseStyle.alignJustifyCenter,
    borderWidth: 1,
    borderColor: loginInputBorder,
    borderRadius: 14,
    backgroundColor: loginInputBg,
    paddingVertical: spacings.large,
    paddingHorizontal: spacings.medium,
  },
  chipHalf: {
    flex: 1,
  },
  chipThird: {
    flex: 1,
  },
  chipSelected: {
    backgroundColor: createAvatarChipSelectedBg,
    borderColor: createAvatarChipSelectedBorder,
  },
  chipText: {
    color: createAvatarChipText,
    fontSize: style.fontSizeNormal2x.fontSize,
    ...style.fontWeightThin,
  },
  chipTextSmall: {
    fontSize: style.fontSizeSmall2x.fontSize,
  },
  chipTextSelected: {
    color: createAvatarChipSelectedText,
    ...style.fontWeightMedium,
  },
  submitButton: {
    marginTop: spacings.large,
  },
});
