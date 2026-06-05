import { PersonalityId, getPersonalityConfig } from '../constants/personalityAvatar';

export type PersonalityTtsProfile = {
  rate: number;
  pitch: number;
};

export const PERSONALITY_TTS: Record<PersonalityId, PersonalityTtsProfile> = {
  friendly: { rate: 0.5, pitch: 1.08 },
  normal: { rate: 0.48, pitch: 1.0 },
  angry: { rate: 0.44, pitch: 0.72 },
  funny: { rate: 0.56, pitch: 1.38 },
  professional: { rate: 0.46, pitch: 0.95 },
  motivational: { rate: 0.52, pitch: 1.15 },
};

const normalize = (text: string) => text.trim().toLowerCase();

const isGreeting = (text: string) =>
  /\b(hi|hello|hey|hola|namaste|good morning|good evening)\b/.test(text);

const isHowAreYou = (text: string) =>
  /\b(how are you|how r u|kaise ho|what'?s up|sup)\b/.test(text);

const isNameQuestion = (text: string) =>
  /\b(who are you|your name|what'?s your name|tum kaun)\b/.test(text);

const isThanks = (text: string) =>
  /\b(thank|thanks|shukriya|dhanyavad)\b/.test(text);

const isBye = (text: string) =>
  /\b(bye|goodbye|see you|alvida)\b/.test(text);

export const buildPersonalityVoiceReply = (
  personalityId: string,
  userSpeech: string,
  avatarName: string,
): string => {
  const text = normalize(userSpeech);
  const id = getPersonalityConfig(personalityId).id;

  if (!text) {
    return replies[id].idle(avatarName);
  }

  if (isGreeting(text)) {
    return replies[id].greeting(avatarName);
  }
  if (isHowAreYou(text)) {
    return replies[id].howAreYou(avatarName);
  }
  if (isNameQuestion(text)) {
    return replies[id].whoAmI(avatarName);
  }
  if (isThanks(text)) {
    return replies[id].thanks(avatarName);
  }
  if (isBye(text)) {
    return replies[id].bye(avatarName);
  }

  return replies[id].general(userSpeech.trim(), avatarName);
};

type ReplySet = {
  idle: (name: string) => string;
  greeting: (name: string) => string;
  howAreYou: (name: string) => string;
  whoAmI: (name: string) => string;
  thanks: (name: string) => string;
  bye: (name: string) => string;
  general: (said: string, name: string) => string;
};

const replies: Record<PersonalityId, ReplySet> = {
  friendly: {
    idle: () => 'Tap the mic and say something. I am listening!',
    greeting: (name) =>
      `Hi! I am ${name}. So happy you said hello! How can I help?`,
    howAreYou: () =>
      'I am doing great, thank you! Hope you are having a wonderful day.',
    whoAmI: (name) =>
      `I am ${name}, your friendly AI avatar. Talk to me anytime!`,
    thanks: () => 'You are very welcome! Anytime.',
    bye: () => 'Goodbye! Come back soon, friend.',
    general: (said) =>
      `I heard you say "${said}". That sounds interesting! Tell me more.`,
  },
  normal: {
    idle: () => 'Say something when you are ready.',
    greeting: (name) => `Hello. I am ${name}. What would you like to talk about?`,
    howAreYou: () => 'I am fine. How can I assist you?',
    whoAmI: (name) => `I am ${name}, your AI avatar assistant.`,
    thanks: () => 'You are welcome.',
    bye: () => 'Goodbye. See you later.',
    general: (said) =>
      `You said "${said}". I understand. Please continue.`,
  },
  angry: {
    idle: () => 'Well? Say something already.',
    greeting: (name) =>
      `Yeah, hi. I am ${name}. What do you want? Make it quick.`,
    howAreYou: () => 'I am fine. Stop wasting time and say what you need.',
    whoAmI: (name) => `I am ${name}. Your angry-mode avatar. Got it?`,
    thanks: () => 'Hmph. Fine. You are welcome.',
    bye: () => 'Finally. Bye.',
    general: (said) =>
      `"${said}"? Seriously? Fine. What else do you want?`,
  },
  funny: {
    idle: () => 'Mic is on! Entertain me with your best line!',
    greeting: (name) =>
      `Hello hello! ${name} here! You said hi and made my day funnier!`,
    howAreYou: () =>
      'I am laughing already! Life is a joke and I love it!',
    whoAmI: (name) =>
      `I am ${name}, your comedian avatar! Warning: bad jokes ahead.`,
    thanks: () => 'Thanks? You just made my punchline better!',
    bye: () => 'Bye! Do not forget to laugh on the way out!',
    general: (said) =>
      `Haha! "${said}"? That is comedy gold! Say it again!`,
  },
  professional: {
    idle: () => 'Please proceed when ready to speak.',
    greeting: (name) =>
      `Good day. I am ${name}. How may I assist you professionally?`,
    howAreYou: () =>
      'I am operating at full capacity. Thank you for asking.',
    whoAmI: (name) =>
      `I am ${name}, your professional AI communication avatar.`,
    thanks: () => 'You are welcome. Glad I could assist.',
    bye: () => 'Goodbye. Have a productive day.',
    general: (said) =>
      `Understood: "${said}". Please elaborate if you require further support.`,
  },
  motivational: {
    idle: () => 'Let us go! Tap mic and speak your goals!',
    greeting: (name) =>
      `YES! Hi! I am ${name}! Today is YOUR day! Let us crush it!`,
    howAreYou: () =>
      'I am fired up and ready! You should feel unstoppable too!',
    whoAmI: (name) =>
      `I am ${name}, your motivational avatar! We do not quit!`,
    thanks: () => 'You earned that win! Keep pushing forward!',
    bye: () => 'Go get it! See you soon, champion!',
    general: (said) =>
      `You said "${said}" — I believe in you! Take action now!`,
  },
};
