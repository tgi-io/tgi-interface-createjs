/**---------------------------------------------------------------------------------------------------------------------
 * tgi-interface-createjs/play/nav-play.js
 */
var tgi = TGI.CORE();
var ui = new (TGI.INTERFACE.CREATEJS().CreateJSInterface)({
  vendor: {
    canvasID: 'navCanvas',
    createjs: createjs,
    navigationOptions: {hide: false},
    resources: res
  }
});
var app = new tgi.Application({interface: ui});
var nav = new tgi.Presentation();
app.setInterface(ui);
app.set('brand', 'nav-play');
app.setPresentation(nav);

/**
 * Helpers for createjs
 */
function makeDisplayObject(name, object) {
  return new tgi.Attribute({
    name: name,
    type: 'Object',
    value: object
  });
}
function makeText(text, font, color, location, options) {
  font = font || '48px Arial';
  color = color || '#000';
  return makeDisplayObject('TextObject', {text: text, font: font, color: color, location: location, options: options});
}
function makeImage(resource, location) {
  return makeDisplayObject('ImageObject', {image: resource, location: location});
}

/**
 * Text
 */
var lynchPresentation = new tgi.Presentation();
lynchPresentation.set('contents', [
  makeImage(res.assets.lynch, {x: 0, y: 0, locked: true}),
  'Strings are rendered as text by default',
  'they are limited to default format and position',
  makeText('you can change stuff', '32px Comic Sans MS', '#00F'),
  '',
  '',
  '',
  makeText('you can use google fonts', '48px Lobster', '#040'),
  '',
  makeText('Text can be aligned left', undefined, '#707', undefined, {x: 1920 / 2, textAlign: 'left'}),
  makeText('Text can be aligned center', undefined, '#077', undefined, {x: 1920 / 2, textAlign: 'center'}),
  makeText('Text can be aligned right', undefined, '#770', undefined, {x: 1920 / 2, textAlign: 'right'}),
  '',
  makeText('THINK', '72px Lobster', '#404', {x: 1406, y: 295}),
  makeText('THINK', '72px Lobster', '#84A', {x: 1404, y: 293})
]);
var textCommand = new tgi.Command({
  name: 'Text',
  type: 'Presentation',
  contents: lynchPresentation
});

/**
 * Images
 */
var imagePresentation = new tgi.Presentation();
imagePresentation.set('contents', [
  makeImage(res.assets.wave, {x: 0, y: 0, locked: true}),
  'Images are stacked horizontally',
  '',
  makeImage(res.assets.CuteFace),
  makeImage(res.assets.CuteFace),
  makeImage(res.assets.CuteFace),
  makeImage(res.assets.CuteFace),
  makeImage(res.assets.CuteFace),
  makeImage(res.assets.CuteFace),
  makeImage(res.assets.CuteFace),
  makeImage(res.assets.FemaleSwim),
  makeImage(res.assets.MaleSwim),
  makeImage(res.assets.GuitarMan),
  makeImage(res.assets.BeachBall),
  makeImage(res.assets['surfer-girl-cow'], {x: 975, y: 582, scaleX: 2, scaleY: 2}),
  makeImage(res.assets.CuteFace, {x: 1013, y: 764, scaleX: .2, scaleY: .2}),
  makeImage(res.assets.CuteFace, {x: 1401, y: 939, scaleX: .2, scaleY: .2}),
  '',
  '',
  '                                 Unless location is specified'
]);
var imageCommand = new tgi.Command({
  name: 'Image',
  type: 'Presentation',
  contents: imagePresentation
});

/**
 * Button
 */
var buttonPresentation = new tgi.Presentation();
var moveText = makeText('Location can be used of course as follows: ');
var supText = makeText("That's what's up");
buttonPresentation.set('contents', [
  'Buttons can be simple text buttons',
  new tgi.Command({
    name: 'yo', type: 'Function', contents: function () {
      app.info('sup');
    }
  }),
  new tgi.Command({
    name: 'YO!!!', type: 'Function', contents: function () {
      alert('WHAT IS UP???');
    }
  }),
  moveText,
  new tgi.Command({
    name: 'move me', type: 'Function', location: {x: 927, y: 251}, contents: function () {
      this._sourceElement.x += 32;
      moveText._sourceElement.x += 32;
    }
  }),
  '',
  'And you can have graphic buttons click em for more info',
  new tgi.Command({
    images: res.assets.PressMe, type: 'Function', contents: function () {
      supText._sourceElement.text = 'This button has one image';
    }
  }),
  new tgi.Command({
    images: [res.assets.Play_up, res.assets.Play_down], type: 'Function', contents: function () {
      supText._sourceElement.text = 'This button has TWO images';
    }
  }),
  supText
]);
var buttonCommand = new tgi.Command({
  name: 'Button',
  type: 'Presentation',
  contents: buttonPresentation
});

/**
 * Sprite
 */
var spritePresentation = new tgi.Presentation();
var reel = new tgi.Attribute({name: 'sprite', type: 'Object', value: {image: res.assets.Motion.Frame, frame: 0}});
var spriteContents = [
  'Sprite animations',
  new tgi.Command({
    name: 'play', type: 'Function', contents: function () {
      reel._sourceElement.gotoAndPlay();
    }
  }),
  new tgi.Command({
    name: 'stop', type: 'Function', contents: function () {
      reel._sourceElement.stop();
    }
  }),
  reel
];
for (var i = 0; i < res.assets.Cards.face.lastFrame - 1; i++)
  spriteContents.push(new tgi.Attribute({
    name: 'sprite',
    type: 'Object',
    value: {image: res.assets.Cards.face, frame: i, location: {x: (i % 13) * 100, y: 333 + 130 * Math.floor(i / 13)}}
  }));
spritePresentation.set('contents', spriteContents);
spritePresentation.onEvent('*', function (event, meta) {
  //console.log('Event: ' + event + ' Meta: ' + meta);
  if (meta == 'PanelCreated') {
    spritePresentation._panel.infoHandler = function (text) {
      //console.log('infoHandler: ' + text);
    };
    reel._sourceElement.on('animationend', function (payload) {
      reel._sourceElement.stop();
    });
  }
});

var spriteCommand = new tgi.Command({
  name: 'Sprite',
  type: 'Presentation',
  contents: spritePresentation
});

/**
 * Sound
 */
var soundGame, soundLoop1, soundLoop2;
var soundPresentation = new tgi.Presentation();
var capabilities = makeText("That's what's up");
soundPresentation.set('contents', [
  'createjs.Sound.getCapabilities() yields:',
  capabilities,
  '',
  function Play() {
    soundGame.play();
  },
  function Stop() {
    soundGame.stop();
  },
  function VolUp() {
    var vol = soundGame.getVolume() + .1;
    if (vol > 1) vol = 1;
    soundGame.setVolume(vol);
  },
  function VolDn() {
    var vol = soundGame.getVolume() - .1;
    if (vol < 0) vol = 0;
    soundGame.setVolume(vol);
  },
  function Pause() {
    soundGame.paused = !soundGame.paused;
  },
  '',
  'Looping Sounds',
  function Loop1() {
    soundLoop1.paused = !soundLoop1.paused;
  },
  function Loop2() {
    soundLoop2.paused = !soundLoop2.paused;
  }

]);
soundPresentation.onEvent('*', function (event, meta) {
  if (meta == 'PanelActive') {
    var txt = '';
    var caps = createjs.Sound.getCapabilities();
    for (var cap in caps) {
      if (caps.hasOwnProperty(cap)) {
        if (typeof caps[cap] == 'boolean') {
          if (caps[cap])
            txt += cap + ' ';
        } else {
          txt += cap + '(' + caps[cap] + ') ';
        }
      }
    }
    capabilities._sourceElement.text = txt;
    // supText._sourceElement.text = 'This button has one image';
    if (!soundGame) {
      try {
        soundGame = createjs.Sound.createInstance(res.assets['M-GameBG'].ID);
        soundLoop1 = createjs.Sound.createInstance(res.assets.loop1.ID);
        soundLoop1.loop = -1;
        soundLoop1.play();
        soundLoop1.paused = true;
        soundLoop2 = createjs.Sound.createInstance(res.assets.loop2.ID);
        soundLoop2.play();
        soundLoop2.paused = true;
        soundLoop2.loop = -1;
      } catch (e) {
        console.log('wtf ' + e);
      }
    }
    //mySoundInstance.play();
  }
  if (meta == 'PanelInactive') {
    //mySoundInstance.stop();
  }
});
var soundCommand = new tgi.Command({
  name: 'Sound',
  type: 'Presentation',
  contents: soundPresentation
});

/**
 * Navigation
 */
nav.set('contents', [
  textCommand,
  imageCommand,
  buttonCommand,
  spriteCommand,
  soundCommand
]);

/**
 * Start the app
 */
app.start(function (request) {
  if (request instanceof tgi.Message) {
    if (request.type == 'Connected') { // todo Connected wtf - need better design on this flow
      ui.dispatch(new tgi.Request({type: 'Command', command: textCommand}));
      return;
    }
  }
  app.info('' + request);
});
