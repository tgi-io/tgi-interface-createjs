/**---------------------------------------------------------------------------------------------------------------------
 * tgi-interface-createjs/play/nav-play.js
 */
var tgi = TGI.CORE();
var bs = new (TGI.INTERFACE.CREATEJS().CreateJSInterface)({
  vendor: {
    canvasID: 'navCanvas',
    createjs: createjs,
    resources: res
  }
});
var app = new tgi.Application({interface: bs});
var nav = new tgi.Presentation();
app.setInterface(bs);
app.set('brand', 'nav-play');
app.setPresentation(nav);

/**
 * Lynch
 */
var lynchPresentation = new tgi.Presentation();
lynchPresentation.set('contents', [
  new tgi.Attribute({name: 'background', type: 'object', value: {image: res.assets.lynch}})
]);
var lynchCommand = new tgi.Command({
  name: 'Lynch',
  type: 'Presentation',
  contents: lynchPresentation
});

/**
 * Wave
 */
var wavePresentation = new tgi.Presentation();
wavePresentation.set('contents', [
  new tgi.Attribute({name: 'background', type: 'object', value: {image: res.assets.wave}})
]);
var waveCommand = new tgi.Command({
  name: 'Wave',
  type: 'Presentation',
  contents: wavePresentation
});

/**
 * Navigation
 */
nav.set('contents', [
  lynchCommand,
  waveCommand
]);

/**
 * Start the app
 */
app.start(function (request) {
  app.info('' + request);
});
app.info('nav-play');