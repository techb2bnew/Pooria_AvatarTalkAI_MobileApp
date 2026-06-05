import { Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

export const widthPercentageToDP = (percentage: number): number =>
  (width * percentage) / 100;

export const heightPercentageToDP = (percentage: number): number =>
  (height * percentage) / 100;

export const noop = () => {};
