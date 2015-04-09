/**---------------------------------------------------------------------------------------------------------------------
 * tgi-interface-createjs/lib/tgi-interface-createjs.source.js
 */
/**
 * Constructor
 */
var CreateJSInterface = function (args) {
  console.log('CreateJSInterface!!!');
  if (false === (this instanceof Interface)) throw new Error('new operator required');
  args = args || {};
  args.name = args.name || '(unnamed)';
  args.description = args.description || 'a CreateJSInterface';
  args.vendor = args.vendor || null;
  var i;
  var unusedProperties = getInvalidProperties(args, ['name', 'description', 'vendor']);
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
  console.log('CreateJSInterface start');
  if (!(application instanceof Application)) throw new Error('Application required');
  if (!(presentation instanceof Presentation)) throw new Error('presentation required');
  if (typeof callBack != 'function') throw new Error('callBack required');
  this.application = application;
  this.presentation = presentation;
  this.startCallback = callBack;
  if (!this.vendor) throw new Error('Error initializing CreateJS');
  try {
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
  this.doc.stage = new createjs.Stage(this.vendor.canvasID);

  this.doc.debugText = new createjs.Text("this.doc.debugText", "24px Arial", "#ffff00");
  this.doc.debugText.x = 4;
  this.doc.debugText.y = this.doc.stage.canvas.height-28;
  this.doc.stage.addChild(this.doc.debugText);
  this.doc.stage.update();



  //if (this.presentation.get('contents').length)
  //  this.htmlNavigation();
  //this.htmlViews();

};
/**
 * DOM helper
 */
CreateJSInterface.addEle = function (parent, tagName, className, attributes) {
  var ele = document.createElement(tagName);
  if (className && className.length)
    ele.className = className;
  if (attributes)
    for (var i in attributes)
      if (attributes.hasOwnProperty(i)) ele.setAttribute(i, attributes[i]);
  parent.appendChild(ele);
  return ele;
};
