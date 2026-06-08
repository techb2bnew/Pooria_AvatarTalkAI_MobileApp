#import "AudioSessionModule.h"
#import <AVFoundation/AVFoundation.h>

static void ConfigureMainSpeakerPlayback(NSError **outError)
{
  AVAudioSession *session = [AVAudioSession sharedInstance];
  NSError *error = nil;

  // Release mic / voice-recognition session (earpiece route)
  [session setActive:NO
         withOptions:AVAudioSessionSetActiveOptionNotifyOthersOnDeactivation
               error:&error];

  // Playback = bottom main speaker (same idea as Android STREAM_MUSIC)
  [session setCategory:AVAudioSessionCategoryPlayback
                  mode:AVAudioSessionModeSpokenAudio
               options:AVAudioSessionCategoryOptionInterruptSpokenAudioAndMixWithOthers
                 error:&error];

  // Clear any previous PlayAndRecord earpiece override
  [session overrideOutputAudioPort:AVAudioSessionPortOverrideNone error:&error];
  [session setActive:YES error:&error];

  if (outError != NULL) {
    *outError = error;
  }
}

@implementation AudioSessionModule

RCT_EXPORT_MODULE();

RCT_EXPORT_METHOD(forceMainSpeaker:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject)
{
  dispatch_async(dispatch_get_main_queue(), ^{
    NSError *error = nil;
    ConfigureMainSpeakerPlayback(&error);
    if (error != nil) {
      reject(@"audio_session", error.localizedDescription, error);
      return;
    }
    resolve(@(YES));
  });
}

@end
