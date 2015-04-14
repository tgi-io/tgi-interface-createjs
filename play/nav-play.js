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
 * Navigation
 */
nav.set('contents', [
  new tgi.Command({
    name: 'Eenie', type: 'Function', contents: function () {
      app.info('Eenie ' + new Date());
    }
  }),
  new tgi.Command({
    name: 'Meenie', type: 'Function', contents: function () {
      app.info('Meenie ' + new Date());
    }
  }),
  new tgi.Command({
    name: 'Miney', type: 'Function', location: {x:350, y:200}, contents: function () {
      app.info('Miney ' + new Date());
    }
  }),
  new tgi.Command({
    name: 'Mo', type: 'Function', contents: function () {
      app.info('Mo ' + new Date());
    }
  })
]);

/**
 * Start the app
 */
app.start(function (request) {
  app.info('' + request);
});
app.info('nav-play');