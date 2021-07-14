//  Created by react-native-create-bridge

#import "AppInfo.h"

// import RCTBridge
#if __has_include(<React/RCTBridge.h>)
#import <React/RCTBridge.h>
#elif __has_include(“RCTBridge.h”)
#import “RCTBridge.h”
#else
#import “React/RCTBridge.h” // Required when used as a Pod in a Swift project
#endif

// import RCTEventDispatcher
#if __has_include(<React/RCTEventDispatcher.h>)
#import <React/RCTEventDispatcher.h>
#elif __has_include(“RCTEventDispatcher.h”)
#import “RCTEventDispatcher.h”
#else
#import “React/RCTEventDispatcher.h” // Required when used as a Pod in a Swift project
#endif

#import <AVFoundation/AVAsset.h>
#import <AVFoundation/AVAssetExportSession.h>
#import <AVFoundation/AVMediaFormat.h>
#import <MediaPlayer/MediaPlayer.h>
#import <MobileCoreServices/MobileCoreServices.h>
#import <AssetsLibrary/AssetsLibrary.h>

@implementation AppInfo
@synthesize bridge = _bridge;

// Export a native module
// https://facebook.github.io/react-native/docs/native-modules-ios.html
RCT_EXPORT_MODULE();

// Export constants
// https://facebook.github.io/react-native/releases/next/docs/native-modules-ios.html#exporting-constants
- (NSDictionary *)constantsToExport
{
  return @{
           @"target": [[NSBundle mainBundle] objectForInfoDictionaryKey:@"TargetName"]
         };
}

// Export methods to a native module
// https://facebook.github.io/react-native/docs/native-modules-ios.html
RCT_EXPORT_METHOD(exampleMethod)
{
  [self emitMessageToRN:@"EXAMPLE_EVENT" :nil];
}

RCT_EXPORT_METHOD(convertMovToMp4: (NSString*)filename
                 toPath:(NSString*)outputPath
                 resolver:(RCTPromiseResolveBlock)resolve
                 rejecter:(RCTPromiseRejectBlock)reject
                )
{
    NSURL *urlFile = [NSURL fileURLWithPath:filename];
    NSLog(@"urlFile");
    NSLog(@"%@",urlFile.absoluteString);
    AVURLAsset *avAsset = [AVURLAsset URLAssetWithURL:urlFile options:nil];
    NSLog(@"%@", avAsset);
    NSArray *compatiblePresets = [AVAssetExportSession exportPresetsCompatibleWithAsset:avAsset];

    AVAssetExportSession *exportSession = [[AVAssetExportSession alloc] initWithAsset:avAsset presetName:AVAssetExportPresetMediumQuality];

    NSString * resultPath = [NSHomeDirectory() stringByAppendingFormat:@"/Documents/%@.mp4", outputPath];
    NSLog(@"%@", resultPath);
    exportSession.outputURL = [NSURL fileURLWithPath:resultPath];

    //set the output file format if you want to make it in other file format (ex .3gp)
    exportSession.outputFileType = AVFileTypeMPEG4;
    exportSession.shouldOptimizeForNetworkUse = YES;

    [exportSession exportAsynchronouslyWithCompletionHandler:^{
        switch ([exportSession status])
        {
            case AVAssetExportSessionStatusFailed: {
                NSError* error = exportSession.error;
                NSString *codeWithDomain = [NSString stringWithFormat:@"E%@%zd", error.domain.uppercaseString, error.code];
                reject(codeWithDomain, error.localizedDescription, error);
                break;
            }
            case AVAssetExportSessionStatusCancelled:
                NSLog(@"Export canceled");
                break;
            case AVAssetExportSessionStatusCompleted:
            {
                //Video conversion finished
                //NSLog(@"Successful!");
                resolve(resultPath);
            }
                break;
            default:
                break;
        }
    }];
}

// List all your events here
// https://facebook.github.io/react-native/releases/next/docs/native-modules-ios.html#sending-events-to-javascript
- (NSArray<NSString *> *)supportedEvents
{
  return @[@"SampleEvent"];
}

#pragma mark - Private methods

// Implement methods that you want to export to the native module
- (void) emitMessageToRN: (NSString *)eventName :(NSDictionary *)params {
  // The bridge eventDispatcher is used to send events from native to JS env
  // No documentation yet on DeviceEventEmitter: https://github.com/facebook/react-native/issues/2819
  [self sendEventWithName: eventName body: params];
}

@end
