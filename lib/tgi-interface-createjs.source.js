/**---------------------------------------------------------------------------------------------------------------------
 * tgi-interface-createjs/lib/tgi-interface-createjs.source.js
 */
/**
 * Constructor
 */
var CreateJSInterface = function (args) {
  if (false === (this instanceof Interface)) throw new Error('new operator required');
  args = args || {};
  args.name = args.name || '(unnamed)';
  args.description = args.description || 'a CreateJSInterface';
  args.vendor = args.vendor || null;
  args.fps = args.fps || 30;
  var i;
  var unusedProperties = getInvalidProperties(args, ['name', 'description', 'vendor', 'fps']);
  var errorList = [];
  for (i = 0; i < unusedProperties.length; i++) errorList.push('invalid property: ' + unusedProperties[i]);
  if (errorList.length > 1)
    throw new Error('error creating Interface: multiple errors');
  if (errorList.length) throw new Error('error creating Interface: ' + errorList[0]);
  // default state
  this.startCallback = null;
  this.stopCallback = null;
  this.mocks = [];
  this.mockPending = false;
  // args ok, now copy to object
  for (i in args) this[i] = args[i];
};
CreateJSInterface.prototype = Object.create(Interface.prototype);
/**
 * Methods
 */
CreateJSInterface.prototype.canMock = function () {
  // return this.vendor ? true : false;
  return false;
};
CreateJSInterface.prototype.start = function (application, presentation, callBack) {
  var self = this;
  if (!(application instanceof Application)) throw new Error('Application required');
  if (!(presentation instanceof Presentation)) throw new Error('presentation required');
  if (typeof callBack != 'function') throw new Error('callBack required');
  this.application = application;
  this.presentation = presentation;
  this.startCallback = callBack;
  if (!this.vendor) throw new Error('Error initializing CreateJS');
  try {
    if (!CreateJSInterface._resources) {
      CreateJSInterface._resources = this.vendor.resources;
    }
    if (!CreateJSInterface._createjs) {
      CreateJSInterface._createjs = this.vendor.createjs;
    }
  } catch (e) {
    throw new Error('Error initializing CreateJS: ' + e);
  }
  if (undefined === CreateJSInterface._createjs)
    throw new Error('CreateJSInterface._createjs undefined');
  /**
   * Add needed html to DOM
   */
  this.doc = {}; // Keep DOM element IDs here
  this.createStage(function () { // callback after resources loaded
    if (self.presentation.get('contents').length)
      self.createNavigation();
    //this.htmlViews();
    callBack(new Message('Connected',true));
  });
};
CreateJSInterface.prototype.dispatch = function (request, response) {
  if (false === (request instanceof Request)) throw new Error('Request required');
  if (response && typeof response != 'function') throw new Error('response callback is not a function');
  var requestHandled = false;
  try {
    if (this.application) {
      if (request.type == 'Command' && request.command.type == 'Presentation') {
        this.activatePanel(request.command);
        requestHandled = true;
      } else {
        requestHandled = !this.application.dispatch(request);
      }
    }
    if (!requestHandled && this.startcallback) {
      this.startcallback(request);
    }
  } catch (e) {
    if (this.startcallback) {
      this.startcallback(e);
    }
  }
};
