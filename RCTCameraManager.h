#import "RCTViewManager.h"
#import <AVFoundation/AVFoundation.h>

@class RCTCamera;

@interface RCTCameraManager : RCTViewManager

@property (nonatomic) AVCaptureSession *session;
@property (nonatomic) AVCaptureDeviceInput *captureDeviceInput;
@property (nonatomic) AVCaptureStillImageOutput *stillImageOutput;
@property (nonatomic) RCTCamera *currentCamera;

+ (id)sharedManager;
- (id)init;
- (void)setAspect:(NSString *) aspect;
- (void)setCamera:(NSInteger) camera;
- (void)setOrientation:(NSInteger) orientation;
- (AVCaptureDevice *)deviceWithMediaType:(NSString *)mediaType preferringPosition:(AVCaptureDevicePosition)position;

@end
