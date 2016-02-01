var React = require('react-native');
var { StyleSheet, requireNativeComponent, PropTypes, NativeModules, DeviceEventEmitter } = React;

var CAMERA_REF = 'camera';

var constants = {
  Aspect: NativeModules.CameraManager.Aspect,
  BarCodeType: NativeModules.CameraManager.BarCodeType,
  Type: NativeModules.CameraManager.Type,
  CaptureMode: NativeModules.CameraManager.CaptureMode,
  CaptureTarget: NativeModules.CameraManager.CaptureTarget,
  Orientation: NativeModules.CameraManager.Orientation,
  FlashMode: NativeModules.CameraManager.FlashMode,
  TorchMode: NativeModules.CameraManager.TorchMode
};

var Camera = React.createClass({
  propTypes: {
    aspect: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.number
    ]),
    captureAudio: PropTypes.bool,
    captureMode: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.number
    ]),
    captureTarget: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.number
    ]),
    type: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.number
    ]),
    orientation: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.number
    ]),
    flashMode: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.number
    ]),
    torchMode: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.number
    ]),
    defaultOnFocusComponent: PropTypes.bool,
    onFocusChanged: PropTypes.func,
    onZoomChanged: PropTypes.func
  },

  setNativeProps(props) {
    this.refs[CAMERA_REF].setNativeProps(props);
  },

  getDefaultProps() {
    return {
      aspect: constants.Aspect.fill,
      type: constants.Type.back,
      orientation: constants.Orientation.auto,
      captureAudio: true,
      captureMode: constants.CaptureMode.still,
      captureTarget: constants.CaptureTarget.cameraRoll,
      flashMode: constants.FlashMode.off,
      torchMode: constants.TorchMode.off
    };
  },

  getInitialState() {
    return {
      isAuthorized: false,
      isRecording: false
    };
  },

  componentWillMount() {
    NativeModules.CameraManager.checkDeviceAuthorizationStatus().then(
      isAuthorized => this.setState({ isAuthorized })
    );

    this.cameraBarCodeReadListener = DeviceEventEmitter.addListener('CameraBarCodeRead', this._onBarCodeRead);
  },

  componentWillUnmount() {
    this.cameraBarCodeReadListener.remove();

    if (this.state.isRecording) {
      this.stopCapture();
    }
  },

  render() {
    var style = [styles.base, this.props.style];

    var aspect = this.props.aspect,
        type = this.props.type,
        orientation = this.props.orientation,
        flashMode = this.props.flashMode,
        torchMode = this.props.torchMode;

    var legacyProps = {
      aspect: {
        Fill: 'fill',
        Fit: 'fit',
        Stretch: 'stretch'
      },
      orientation: {
        LandscapeLeft: 'landscapeLeft',
        LandscapeRight: 'landscapeRight',
        Portrait: 'portrait',
        PortraitUpsideDown: 'portraitUpsideDown'
      },
      type: {
        Front: 'front',
        Back: 'back'
      }
    };

    if (typeof aspect === 'string') {
      aspect = constants.Aspect[aspect];
    }

    if (typeof flashMode === 'string') {
      flashMode = constants.FlashMode[flashMode];
    }

    if (typeof orientation === 'string') {
      orientation = constants.Orientation[orientation];
    }

    if (typeof torchMode === 'string') {
      torchMode = constants.TorchMode[torchMode];
    }

    if (typeof type === 'string') {
      type = constants.Type[type];
    }

    var nativeProps = Object.assign({}, this.props, {
      style,
      aspect: aspect,
      type: type,
      orientation: orientation,
      flashMode: flashMode,
      torchMode: torchMode
    });

    return <RCTCamera ref={CAMERA_REF} {... nativeProps} />;
  },

  _onBarCodeRead(e) {
    this.props.onBarCodeRead && this.props.onBarCodeRead(e);
  },

  capture(options) {
    options = Object.assign({}, {
      audio: this.props.captureAudio,
      mode: this.props.captureMode,
      target: this.props.captureTarget
    }, options);

    if (typeof options.mode === 'string') {
      options.mode = constants.CaptureMode[options.mode];
    }

    if (options.mode === constants.CaptureMode.video) {
      options.totalSeconds = (options.totalSeconds > -1 ? options.totalSeconds : -1);
      options.preferredTimeScale = options.preferredTimeScale || 30;
      this.setState({ isRecording: true });
    }

    if (typeof options.target === 'string') {
      options.target = constants.CaptureTarget[options.target];
    }

    return NativeModules.CameraManager.capture(options);
  },

  stopCapture() {
    if (this.state.isRecording) {
      NativeModules.CameraManager.stopCapture();
      this.setState({ isRecording: false });
    }
  },

  hasFlash(callback) {
      NativeModules.CameraManager.hasFlash(callback);
  }

});

var RCTCamera = requireNativeComponent('RCTCamera', Camera);

var styles = StyleSheet.create({
  base: { },
});

Camera.constants = constants;
Camera.checkDeviceAuthorizationStatus = NativeModules.CameraManager.checkDeviceAuthorizationStatus

module.exports = Camera;
