import React, { useState } from 'react';
import { AVATAR_DISPLAY_MODE } from '../config/avatarDisplay';
import { AvatarEmotionId } from '../constants/personalityAvatar';
import HumanoidAvatar3D from './HumanoidAvatar3D';
import NativeHumanoidAvatar from './NativeHumanoidAvatar';

type HumanoidAvatarViewProps = {
  faceImageUri: string;
  avatarGender: string;
  personalityId: string;
  emotion: AvatarEmotionId;
  isListening?: boolean;
  isTalking?: boolean;
};

/**
 * Avatar entry point:
 * - mode '2d' → native (always works)
 * - mode '3d' → WebView GLB
 * - mode 'auto' → try 3D, else 2D
 */
const HumanoidAvatarView = (props: HumanoidAvatarViewProps) => {
  const [use2dFallback, setUse2dFallback] = useState(
    AVATAR_DISPLAY_MODE === '2d',
  );

  if (AVATAR_DISPLAY_MODE === '2d' || use2dFallback) {
    return <NativeHumanoidAvatar {...props} />;
  }

  return (
    <HumanoidAvatar3D
      {...props}
      onLoadFailed={() => {
        if (AVATAR_DISPLAY_MODE === 'auto') {
          setUse2dFallback(true);
        }
      }}
    />
  );
};

export default HumanoidAvatarView;
