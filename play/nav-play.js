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
  new tgi.Attribute({name: 'background', type: 'Object', value: {image: res.assets.lynch, location: {x: 0, y: 0}}}),
  'Mr Lynch',
  'blah'
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
  new tgi.Attribute({name: 'background', type: 'Object', value: {image: res.assets.wave, location: {x: 0, y: 0}}}),
  new tgi.Attribute({
    name: 'background',
    type: 'Object',
    value: {text: 'Surfs up!!!', font: "72px Arial", color: '#FF0', location: {x: 1425, y: 400}}
  }),
  new tgi.Attribute({name: 'background', type: 'Object', value: {image: res.assets.Play_up}}),
  new tgi.Attribute({name: 'background', type: 'Object', value: {image: res.assets.Play_down}}),
  lynchCommand
]);
var waveCommand = new tgi.Command({
  name: 'Wave',
  type: 'Presentation',
  contents: wavePresentation
});

/**
 * Card
 */
var cardPresentation = new tgi.Presentation();
var deck = [];
for (var i = 0; i < 52; i++)
  deck.push(new tgi.Attribute({name: 'background', type: 'Object', value: {image: res.assets.Cards.face, frame: i}}));

cardPresentation.set('contents', deck);
var cardCommand = new tgi.Command({
  name: 'Card',
  type: 'Presentation',
  contents: cardPresentation
});


/**
 * Navigation
 */
nav.set('contents', [
  lynchCommand,
  waveCommand,
  cardCommand
]);

/**
 * Start the app
 */
app.start(function (request) {
  app.info('' + request);
});
app.info('nav-play');