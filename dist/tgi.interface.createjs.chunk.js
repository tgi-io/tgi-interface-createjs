/**---------------------------------------------------------------------------------------------------------------------
 * tgi-interface-createjs/lib/tgi-interface-createjs.lib.js
 */
TGI.INTERFACE = TGI.INTERFACE || {};
TGI.INTERFACE.CREATEJS = function () {
  return {
    version: '0.0.16',
    CreateJSInterface: CreateJSInterface
  };
};

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

/**---------------------------------------------------------------------------------------------------------------------
 * tgi-interface-createjs/lib/tgi-interface-createjs-stage.source.js
 */
CreateJSInterface.prototype.createStage = function (callback) {
  var createJSInterface = this;
  var createjs = CreateJSInterface._createjs;
  var top, left, height, width;

  /**
   * All the world is a stage
   */
  this.doc.stage = new createjs.Stage(this.vendor.canvasID);

  /**
   * Debug text (info default)
   */
  this.doc.debugText = new createjs.Text("this.doc.debugText", "32px Arial", "#ffff00"); // text
  height = this.doc.debugText.getMeasuredHeight() + 6;
  top = this.doc.stage.canvas.height - height;
  this.doc.debugPanel = new createjs.Shape(new createjs.Graphics().beginFill("#777").drawRect(0, top, this.doc.stage.canvas.width, height));
  this.doc.debugPanel.alpha = 0.5; // translucent rectangle in back of text
  this.doc.stage.addChild(this.doc.debugPanel);
  this.doc.debugText.x = 4;
  this.doc.debugText.y = top;
  this.doc.stage.addChild(this.doc.debugText);

  /**
   * FPS text
   */
  this.doc.fpsText = new createjs.Text(" FPS 00 / 00 ", "24px Arial", "#ffff00");
  height = this.doc.fpsText.getMeasuredHeight() + 6;
  width = this.doc.fpsText.getMeasuredWidth() + 6;
  this.doc.fpsPanel = new createjs.Shape(new createjs.Graphics().beginFill("#777").drawRect(this.doc.stage.canvas.width - width, 0, width, height));
  this.doc.fpsPanel.alpha = 0.5; // translucent rectangle in back of text
  this.doc.stage.addChild(this.doc.fpsPanel);
  this.doc.fpsText.textAlign = 'right';
  this.doc.fpsText.x = this.doc.stage.canvas.width;
  this.doc.fpsText.y = 0;
  this.doc.stage.addChild(this.doc.fpsText);

  /**
   * Keyboard handler
   */
  document.onkeydown = function (event) {
    var k = event ? event.which : window.event.keyCode;
    createJSInterface.info('You hit ' + k);
    // event.preventDefault(); cmd R hosed with this in chrome
  };

  /**
   * Ticker update method
   */
  var frameRate = this.vendor.fps;
  console.log('frameRate '+frameRate);
  createjs.Ticker.setFPS(frameRate);
  createjs.Ticker.framerate = frameRate;
  createjs.Ticker.addEventListener("tick", function (event) {
    createJSInterface.doc.fpsText.text = ' FPS ' + Math.floor(createjs.Ticker.getMeasuredFPS()) + ' / ' + frameRate + ' ';
    createJSInterface.doc.stage.update(event);
  });

  /**
   * Recursively walk thru resources & create a manifest
   */
  var manifest = [];
  var soundIDcounter = 1;
  getResourceItems(CreateJSInterface._resources, '');

  function getResourceItems(resources, path) {
    for (var resourceName in resources) {
      if (resources.hasOwnProperty(resourceName) && resourceName[0] != '_') {
        var resource = resources[resourceName];
        var filePath = (path ? path + '/' : '') + resourceName;
        if (resource._type == 'Folder') {
          getResourceItems(resource, filePath);
        } else {
          if (undefined === resource.firstFrame) {
            filePath += '.' + resource._type.toLowerCase();
            if (resource._type == 'MP3' || resource._type == 'WAV') {
              var soundID = 'snd' + soundIDcounter++;
              resource.ID = soundID;
              manifest.push({id: soundID, src: filePath, _tgiSource: resource});
            } else
              manifest.push({src: filePath, _tgiSource: resource});
          } else {
            resource.element = [];
            for (var i = resource.firstFrame; i <= resource.lastFrame; i++) {
              resource.element.push(undefined);
              var frame = '' + i;
              if (resource.zeroPad)
                frame = lpad(frame, resource.zeroPad, '0');
              var framePath = filePath + frame + '.' + resource._type.toLowerCase();
              manifest.push({src: framePath, _tgiSource: resource, _tgiFrame: i - resource.firstFrame});
            }
          }
        }
      }
    }
  }

  /**
   *  use preloadJS to load assets
   */
  var preload = new createjs.LoadQueue(true);
  var lastFile = 'loading assets...';
  var lastProgress = '0 %';
  createJSInterface.info(lastProgress + lastFile);
  preload.installPlugin(createjs.Sound);
  preload.on("fileload", function (event) {
    //console.log('event load ' + event);
    if (undefined !== event.item._tgiFrame)
      event.item._tgiSource.element[event.item._tgiFrame] = event.result;
    else
      event.item._tgiSource.element = event.result;
    lastFile = event.item.type + ': ' + event.item.src;
    createJSInterface.info(lastProgress + lastFile);
  });
  preload.on("progress", function (event) {
    lastProgress = (preload.progress * 100 | 0) + " % ";
    createJSInterface.info(lastProgress + lastFile);
  });
  preload.on("complete", function (event) {
    createJSInterface.info(lastProgress + ' Assets Loaded');
    callback();
  });
  preload.on("error", function (event, err) {
    console.error("Error loading", event.data.src);
  });
  preload.loadManifest(manifest, true, '');
};
/**---------------------------------------------------------------------------------------------------------------------
 * tgi-interface-createjs/lib/tgi-interface-createjs-navigation.source.js
 */


CreateJSInterface.prototype.createNavigation = function () {
  var options = this.vendor.navigationOptions || {};
  var createJSInterface = this;
  this._navigationItems = [];
  var location = {x: 20, y: 20, dx: 10};
  var menuContents = createJSInterface.presentation.get('contents');
  for (var menuItem in menuContents) if (menuContents.hasOwnProperty(menuItem)) {
    /**
     * Provide closure for each command
     */
    (function (command, location) {
      var navButton = createJSInterface.doc.stage.addChild(new CreateJSInterface._makeButton(createJSInterface, command.name, "#111", undefined, function () {
        /**
         * Click!
         */
        createJSInterface.dispatch(new Request({type: 'Command', command: command}));
      }));
      navButton.visible = false;
      if (command.location) {
        navButton.x = command.location.x;
        navButton.y = command.location.y;
      } else {
        navButton.x = location.x;
        navButton.y = location.y;
        location.x += (navButton._widthWas + location.dx);
      }
      createJSInterface._navigationItems.push(navButton);
    })(menuContents[menuItem], location);
  }
  if (!options.hide)
    this.showNavigation();
};

CreateJSInterface.prototype.hideNavigation = function () {
  var items = this._navigationItems;
  for (var item in items) {
    if (items.hasOwnProperty(item)) {
      items[item].visible=false;
    }
  }
};
CreateJSInterface.prototype.showNavigation = function () {
  var items = this._navigationItems;
  for (var item in items) {
    if (items.hasOwnProperty(item)) {
      items[item].visible=true;
    }
  }
};
/**---------------------------------------------------------------------------------------------------------------------
 * tgi-interface-createjs/lib/tgi-interface-createjs-queries.source.js
 */

CreateJSInterface.prototype.info = function (text) {
  var createJSInterface = this;

  /**
   * see if captured
   */
  if (createJSInterface.activePanel && createJSInterface.activePanel.infoHandler) {
    createJSInterface.activePanel.infoHandler(text);
    return;
  }


  this.doc.debugPanel.visible = true;
  this.doc.debugText.visible = true;
  this.doc.debugText.text  = text;
  if (this.doc.infoTimeout)
    clearTimeout(this.doc.infoTimeout);
  this.doc.infoTimeout = setTimeout(function () {
    createJSInterface.doc.debugPanel.visible = false;
    createJSInterface.doc.debugText.visible = false;
    createJSInterface.doc.infoTimeout=undefined;
  },3000);
};

/**---------------------------------------------------------------------------------------------------------------------
 * tgi-interface-bootstrap/lib/tgi-interface-bootstrap-panels.source.js
 */

/**
 * activatePanel will create if needed, make panel visible and render contents
 */
CreateJSInterface.prototype.activatePanel = function (command) {
  var createJSInterface = this;
  var presentation = command.contents;
  var name = presentation.get('name') || command.name;
  var contents = presentation.get('contents');
  var i;
  var canvasWidth = 1920; // todo 1920 hard coded
  var largestImageHeight = 0;
  var defaultLocation = {
    sx: 20, // starting
    sy: 120,
    x: 20,  // current
    y: 120,
    dx: 10, // delta (gaps)
    dy: 8
  };

  /**
   * createJSInterface.panels array of panels
   */
  if (typeof createJSInterface.panels == 'undefined')
    createJSInterface.panels = [];

  /**
   * See if command already has a panel
   */
  var panel;
  for (i = 0; (typeof panel == 'undefined') && i < createJSInterface.panels.length; i++) {
    if (name == createJSInterface.panels[i].name)
      panel = createJSInterface.panels[i];
  }

  /**
   * If we did not find panel create
   */
  if (typeof panel == 'undefined') {
    panel = {
      name: name,
      container: new createjs.Container(),
      listeners: [],
      infoHandler: undefined,
      presentation: presentation
    };
    panel.container.visible = false;
    createJSInterface.panels.push(panel);
    createJSInterface.doc.stage.addChildAt(panel.container, 0);

    /**
     * Each item
     */
    for (i = 0; i < contents.length; i++) {
      var item = contents[i];
      if (typeof item == 'string')
        renderText(item);
      else if (item instanceof Attribute)
        renderAttribute(item);
      else if (item instanceof Command || typeof item == 'function')
        renderCommand(item);
    }
    presentation._panel = panel;
    presentation._emitEvent('StateChange', 'PanelCreated'); // todo docs & tests
  }

  /**
   * Make this panel visible hide others
   */
  for (i = 0; i < createJSInterface.panels.length; i++) {
    if (name == createJSInterface.panels[i].name) {
      createJSInterface.activePanel = createJSInterface.panels[i];
      createJSInterface.panels[i].presentation._emitEvent('StateChange', 'PanelActive'); // todo docs & tests
      createJSInterface.panels[i].container.visible = true;
    }
  }
  for (i = 0; i < createJSInterface.panels.length; i++) {
    if (name != createJSInterface.panels[i].name) {
      if (createJSInterface.panels[i].container.visible)
        createJSInterface.panels[i].presentation._emitEvent('StateChange', 'PanelInactive'); // todo docs & tests
      createJSInterface.panels[i].container.visible = false;
    }
  }

  /*******************************************************************************************
   * Local functions
   *******************************************************************************************/
  function renderAttribute(attribute) {
    var sourceElement;
    if (attribute.type == 'Object') {
      if (attribute.value.image && attribute.value.image.element) {
        if (attribute.value.image.element instanceof Array) {
          var size = {
            height: attribute.value.image.element[0].naturalHeight,
            width: attribute.value.image.element[0].naturalWidth
          };
          if (!attribute.value.image.spriteSheet) {
            var data = {
              images: attribute.value.image.element,
              frames: {
                width: size.width,
                height: size.height
              }
            };
            attribute.value.image.spriteSheet = new createjs.SpriteSheet(data);
          }
          var frame = attribute.value.frame || 0;
          sourceElement = renderSprite(attribute.value.image.spriteSheet, attribute.value.location, size);
          sourceElement.gotoAndStop(frame);

        } else {
          sourceElement = renderImage(attribute.value.image.element, attribute.value.location);
        }
      } else if (attribute.value.text) {
        sourceElement = renderText(attribute.value.text, attribute.value.location, attribute.value.font, attribute.value.color, attribute.value.options);
      } else {
        sourceElement = renderText(JSON.stringify(attribute.value), undefined, '24px Courier');
      }
    } else {
      sourceElement = renderText(attribute.value);
    }
    attribute._sourceElement = sourceElement;
  }

  function renderCommand(commandParm) {
    var command = commandParm;
    if (typeof commandParm == 'function') {
      command = new Command({name: commandParm.name, type: 'Function', contents: commandParm});
    }

    var sourceElement;
    if (command.location) {
      sourceElement = renderButton(command, command.location);
    } else {
      sourceElement = renderButton(command);
      if (defaultLocation.x + sourceElement._widthWas + defaultLocation.dx > canvasWidth) {
        newLine();
      }
      sourceElement.x = defaultLocation.x;
      sourceElement.y = defaultLocation.y;
      if (largestImageHeight < sourceElement._heightWas)
        largestImageHeight = sourceElement._heightWas;
      defaultLocation.x += (sourceElement._widthWas + defaultLocation.dx);
    }
    command._sourceElement = sourceElement;
  }

  function renderButton(command, location) {
    try {
      var navButton = panel.container.addChild(new CreateJSInterface._makeButton(createJSInterface, command.name, "#111", command.images, function () {
        createJSInterface.dispatch(new Request({type: 'Command', command: command}));
      }));
      if (location) {
        navButton.x = location.x;
        navButton.y = location.y;
      }

    } catch (e) {
      console.log('error ' + e);
    }

    return navButton;
  }

  function newLine() {
    defaultLocation.x = defaultLocation.sx;
    if (largestImageHeight) {
      defaultLocation.y += (largestImageHeight + defaultLocation.dy);
      largestImageHeight = 0;
    }
  }

  function renderText(label, location, font, color, options) {
    var myFont = font || "48px Arial";
    var myColor = color || "#000";
    var text = new createjs.Text(label, myFont, myColor);
    var isLocked = false;
    if (location) {
      isLocked = location.locked;
      text.x = location.x;
      text.y = location.y;
    } else {
      newLine();
      text.x = defaultLocation.x;
      text.y = defaultLocation.y;
      defaultLocation.y += (text.getMeasuredHeight() + defaultLocation.dy);
    }
    if (options) {
      for (var option in options) {
        if (options.hasOwnProperty(option)) {
          text[option] = options[option];
        }
      }
    }
    panel.container.addChild(text);
    if (!isLocked) {
      text.on("pressmove", function (event) {
        if (event.nativeEvent.shiftKey) {
          event.currentTarget.x = event.stageX;
          event.currentTarget.y = event.stageY;
          createJSInterface.info('x: ' + this.x + ', y: ' + this.y);
        }
      });
    }
    return text;
  }

  function renderImage(image, location) {
    var bitmap = new createjs.Bitmap(image);
    var isLocked = false;
    if (location) {
      isLocked = location.locked;
      bitmap.x = location.x;
      bitmap.y = location.y;
      if (location.scaleX)
        bitmap.scaleX = location.scaleX;
      if (location.scaleY)
        bitmap.scaleY = location.scaleY;
    } else {
      if (defaultLocation.x + image.naturalWidth + defaultLocation.dx > canvasWidth) {
        newLine();
      }
      if (largestImageHeight < image.naturalHeight)
        largestImageHeight = image.naturalHeight;
      bitmap.x = defaultLocation.x;
      bitmap.y = defaultLocation.y;
      defaultLocation.x += (image.naturalWidth + defaultLocation.dx);
    }
    panel.container.addChild(bitmap);
    if (!isLocked) {
      bitmap.on("pressmove", function (event) {
        if (event.nativeEvent.shiftKey) {
          event.currentTarget.x = event.stageX;
          event.currentTarget.y = event.stageY;
          createJSInterface.info('x: ' + this.x + ', y: ' + this.y);
        }
      });
    }
    return bitmap;
  }

  function renderSprite(spriteSheet, location, size) {
    var sprite = new createjs.Sprite(spriteSheet);
    if (location) {
      sprite.x = location.x;
      sprite.y = location.y;
      if (location.scaleX)
        sprite.scaleX = location.scaleX;
      if (location.scaleY)
        sprite.scaleY = location.scaleY;
    } else {
      if (defaultLocation.x + size.width + defaultLocation.dx > canvasWidth) {
        newLine();
      }
      if (largestImageHeight < size.height)
        largestImageHeight = size.height;
      sprite.x = defaultLocation.x;
      sprite.y = defaultLocation.y;
      defaultLocation.x += (size.width + defaultLocation.dx);
    }
    panel.container.addChild(sprite);
    sprite.on("pressmove", function (event) {
      if (event.nativeEvent.shiftKey) {
        event.currentTarget.x = event.stageX;
        event.currentTarget.y = event.stageY;
        createJSInterface.info('x: ' + this.x + ', y: ' + this.y);
      }
    });
    return sprite;
  }
};

/**---------------------------------------------------------------------------------------------------------------------
 * tgi-interface-createjs/lib/tgi-interface-createjs-buttons.source.js
 */
(function () { // for closure

  /**
   * SimpleButton via createjs inheritance (createjs.promote below)
   */
  function SimpleButtonContainer(createJSInterface, label, color, images, callback) {
    this.Container_constructor();
    this.color = color;
    this.label = label;
    this.name = label;
    this.images = images;
    this.setup();
    this._tgiCallback = callback;
    this._createJSInterface = createJSInterface;
  }

  var p = createjs.extend(SimpleButtonContainer, createjs.Container);
  p.setup = function () {

    var button = this;

    if (button.images) {
      if (button.images instanceof Array) {
        button._UpBitmap =  new createjs.Bitmap(button.images[0].element);
        button._widthWas = button.images[0].element.naturalWidth;
        button._heightWas = button.images[0].element.naturalHeight;
        button._DownBitmap =  new createjs.Bitmap(button.images[1].element);
        button.addChild(button._UpBitmap, button._DownBitmap);
        button._DownBitmap.alpha = 0;
      } else {
        button._UpBitmap =  new createjs.Bitmap(button.images.element);
        button._widthWas = button.images.element.naturalWidth;
        button._heightWas = button.images.element.naturalHeight;
        button.addChild(button._UpBitmap);
      }
    } else {
      /**
       * Button Text
       */
      var text = new createjs.Text(button.label, "48px Arial", "#DDD");
      text.textBaseline = "top";
      text.textAlign = "center";
      button._widthWas = text.getMeasuredWidth() + 30;    // Size container base
      button._heightWas = text.getMeasuredHeight() + 28;
      text.x = button._widthWas / 2; // Center
      text.y = 12;

      /**
       * Round Back background
       */
      var background = new createjs.Shape();
      background.graphics.beginFill(button.color).drawRoundRect(0, 0, button._widthWas, button._heightWas, 8);
      button.addChild(background, text);
    }

    button.mouseChildren = false;
    button.on("click", function (event) {
      if (button._disabled) return;
      try {
        button._tgiCallback();
      } catch (e) {
        button._createJSInterface.info(e);
      }
    });
    button.on("mousedown", function (event) {
      if (button._disabled) return;
      button._pressed = false;
      button._shiftPressed = false;
      button._moved = false;
      if (event.nativeEvent.shiftKey) {
        button._shiftPressed = true;
        button._createJSInterface.info('x: ' + button.x + ', y: ' + button.y);
      } else {
        button._pressed = true;
        if (button._DownBitmap) {
          button._DownBitmap.alpha = 1;
          button._UpBitmap.alpha = 0;
        } else {
          button.alpha = 0.8;
        }
      }
    });
    button.on("pressmove", function (event) {
      if (button._shiftPressed) {
        button._moved = true;
        event.currentTarget.x = event.stageX;
        event.currentTarget.y = event.stageY;
        button._createJSInterface.info('x: ' + button.x + ', y: ' + button.y);
      }
    });
    button.on("pressup", function (event) {
      if (button._pressed) {
        if (button._DownBitmap) {
          button._DownBitmap.alpha = 0;
          button._UpBitmap.alpha = 1;
        } else {
          button.alpha = 1;
        }
        button._pressed = false;
      }
    });
  };
  CreateJSInterface._makeButton = createjs.promote(SimpleButtonContainer, "Container");

}());