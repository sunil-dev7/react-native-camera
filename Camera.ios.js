var React = require('React');
var NativeModules = require('NativeModules');
var ReactIOSViewAttributes = require('ReactIOSViewAttributes');
var StyleSheet = require('StyleSheet');
var createReactIOSNativeComponentClass = require('createReactIOSNativeComponentClass');
var PropTypes = require('ReactPropTypes');
var StyleSheetPropType = require('StyleSheetPropType');
var NativeMethodsMixin = require('NativeMethodsMixin');
var flattenStyle = require('flattenStyle');
var merge = require('merge');

var Camera = React.createClass({
  propTypes: {
    aspect: PropTypes.string,
    camera: PropTypes.string,
    orientation: PropTypes.string,
  },

  mixins: [NativeMethodsMixin],

  viewConfig: {
    uiViewClassName: 'UIView',
    validAttributes: ReactIOSViewAttributes.UIView
  },

  getInitialState: function() {
    return {
      isAuthorized: false,
      aspect: this.props.aspect || 'Fill',
      camera: this.props.camera || 'Back',
      orientation: this.props.orientation || 'Portrait'
    };
  },

  componentWillMount: function() {
    NativeModules.CameraManager.checkDeviceAuthorizationStatus((function(err, isAuthorized) {
      this.state.isAuthorized = isAuthorized;
      this.setState(this.state);
    }).bind(this));
  },

  render: function() {
    var style = flattenStyle([styles.base, this.props.style]);

    aspect = NativeModules.CameraManager.aspects[this.state.aspect];
    camera = NativeModules.CameraManager.cameras[this.state.camera];
    orientation = NativeModules.CameraManager.orientations[this.state.orientation];

    var nativeProps = merge(this.props, {
      style,
      aspect: aspect,
      camera: camera,
      orientation: orientation,
    });

    return <RCTCamera {... nativeProps} />
  },

  switch: function() {
    this.state.camera = this.state.camera == 'Back' ? 'Front' : 'Back';
    this.setState(this.state);
  },

  takePicture: function(cb) {
    NativeModules.CameraManager.takePicture(cb);
  }
});

var RCTCamera = createReactIOSNativeComponentClass({
  validAttributes: merge(ReactIOSViewAttributes.UIView, {
    aspect: true,
    camera: true,
    orientation: true
  }),
  uiViewClassName: 'RCTCamera',
});

var styles = StyleSheet.create({
  base: {
    overflow: 'hidden'
  },
});

module.exports = Camera;
