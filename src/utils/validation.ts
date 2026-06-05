export type LoginFormErrors = {
  email?: string;
  password?: string;
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const validateLoginForm = (
  email: string,
  password: string,
  messages: {
    emailRequired: string;
    emailInvalid: string;
    passwordRequired: string;
    passwordMinLength: string;
  },
): LoginFormErrors => {
  const errors: LoginFormErrors = {};
  const trimmedEmail = email.trim();

  if (!trimmedEmail) {
    errors.email = messages.emailRequired;
  } else if (!EMAIL_REGEX.test(trimmedEmail)) {
    errors.email = messages.emailInvalid;
  }

  if (!password.trim()) {
    errors.password = messages.passwordRequired;
  } else if (password.length < 6) {
    errors.password = messages.passwordMinLength;
  }

  return errors;
};

export const hasLoginFormErrors = (errors: LoginFormErrors): boolean =>
  Boolean(errors.email || errors.password);

export type RegisterFormErrors = {
  fullName?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
};

export const validateRegisterForm = (
  fullName: string,
  email: string,
  password: string,
  confirmPassword: string,
  messages: {
    fullNameRequired: string;
    fullNameMinLength: string;
    emailRequired: string;
    emailInvalid: string;
    passwordRequired: string;
    passwordMinLength: string;
    confirmPasswordRequired: string;
    passwordMismatch: string;
  },
): RegisterFormErrors => {
  const errors: RegisterFormErrors = {};
  const trimmedName = fullName.trim();
  const trimmedEmail = email.trim();

  if (!trimmedName) {
    errors.fullName = messages.fullNameRequired;
  } else if (trimmedName.length < 2) {
    errors.fullName = messages.fullNameMinLength;
  }

  if (!trimmedEmail) {
    errors.email = messages.emailRequired;
  } else if (!EMAIL_REGEX.test(trimmedEmail)) {
    errors.email = messages.emailInvalid;
  }

  if (!password.trim()) {
    errors.password = messages.passwordRequired;
  } else if (password.length < 6) {
    errors.password = messages.passwordMinLength;
  }

  if (!confirmPassword.trim()) {
    errors.confirmPassword = messages.confirmPasswordRequired;
  } else if (password !== confirmPassword) {
    errors.confirmPassword = messages.passwordMismatch;
  }

  return errors;
};

export const hasRegisterFormErrors = (errors: RegisterFormErrors): boolean =>
  Boolean(
    errors.fullName ||
      errors.email ||
      errors.password ||
      errors.confirmPassword,
  );

export type AvatarGender = 'male' | 'female';
export type AvatarVoiceType = 'natural' | 'professional' | 'friendly';

export type CreateAvatarFormErrors = {
  avatarName?: string;
  gender?: string;
  voiceType?: string;
};

export const isCreateAvatarFormComplete = (
  avatarName: string,
  gender: AvatarGender | null,
  voiceType: AvatarVoiceType | null,
): boolean =>
  avatarName.trim().length >= 2 && gender !== null && voiceType !== null;

export const validateCreateAvatarForm = (
  avatarName: string,
  gender: AvatarGender | null,
  voiceType: AvatarVoiceType | null,
  messages: {
    nameRequired: string;
    nameMinLength: string;
    genderRequired: string;
    voiceRequired: string;
  },
): CreateAvatarFormErrors => {
  const errors: CreateAvatarFormErrors = {};
  const trimmedName = avatarName.trim();

  if (!trimmedName) {
    errors.avatarName = messages.nameRequired;
  } else if (trimmedName.length < 2) {
    errors.avatarName = messages.nameMinLength;
  }

  if (!gender) {
    errors.gender = messages.genderRequired;
  }

  if (!voiceType) {
    errors.voiceType = messages.voiceRequired;
  }

  return errors;
};

export const hasCreateAvatarFormErrors = (
  errors: CreateAvatarFormErrors,
): boolean => Boolean(errors.avatarName || errors.gender || errors.voiceType);

export type EditProfileFormErrors = {
  fullName?: string;
  email?: string;
  phone?: string;
};

const PHONE_REGEX = /^[+]?[\d\s()-]{7,15}$/;

export const validateEditProfileForm = (
  fullName: string,
  email: string,
  phone: string,
  messages: {
    fullNameRequired: string;
    fullNameMinLength: string;
    emailRequired: string;
    emailInvalid: string;
    phoneInvalid: string;
  },
  options?: { phoneRequired?: boolean },
): EditProfileFormErrors => {
  const errors: EditProfileFormErrors = {};
  const trimmedName = fullName.trim();
  const trimmedEmail = email.trim();
  const trimmedPhone = phone.trim();

  if (!trimmedName) {
    errors.fullName = messages.fullNameRequired;
  } else if (trimmedName.length < 2) {
    errors.fullName = messages.fullNameMinLength;
  }

  if (!trimmedEmail) {
    errors.email = messages.emailRequired;
  } else if (!EMAIL_REGEX.test(trimmedEmail)) {
    errors.email = messages.emailInvalid;
  }

  if (options?.phoneRequired && !trimmedPhone) {
    errors.phone = messages.phoneInvalid;
  } else if (trimmedPhone && !PHONE_REGEX.test(trimmedPhone)) {
    errors.phone = messages.phoneInvalid;
  }

  return errors;
};

export const hasEditProfileFormErrors = (
  errors: EditProfileFormErrors,
): boolean => Boolean(errors.fullName || errors.email || errors.phone);

export const isEditProfileFormComplete = (
  fullName: string,
  email: string,
): boolean => fullName.trim().length >= 2 && EMAIL_REGEX.test(email.trim());
