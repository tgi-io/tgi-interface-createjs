/**---------------------------------------------------------------------------------------------------------------------
 * tgi-interface-createjs/play/nav-play.js
 */
var tgi = TGI.CORE();
var bs = new (TGI.INTERFACE.CREATEJS().CreateJSInterface)({
  vendor: {
    canvasID: 'navCanvas',
    createjs: createjs
  }
});
var app = new tgi.Application({interface: bs});
var nav = new tgi.Presentation();
app.setInterface(bs);
app.set('brand', 'TGI Play');
app.setPresentation(nav);

/**
 * Start the app
 */
app.start(function (request) {
  console.log(app.info('app got ' + JSON.stringify(request)));
});