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
      listeners: []
    };
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
      else if (item instanceof Command)
        renderCommand(item);
    }
  }
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
        sourceElement = renderText(attribute.value.text, attribute.value.location, attribute.value.font, attribute.value.color);
      } else {
        sourceElement = renderText(JSON.stringify(attribute.value),undefined,'24px Courier');
      }
    } else {
      sourceElement = renderText(attribute.value);
    }
    attribute._sourceElement = sourceElement;
  }
  function renderCommand(command) {
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
  function renderText(label, location, font, color) {
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
    } else {
      if (defaultLocation.x + size.width + defaultLocation.dx > canvasWidth) {
        defaultLocation.x = defaultLocation.sx;
        defaultLocation.y += (size.height + defaultLocation.dy);
      }
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
  /**
   * Make this panel visible hide others
   */
  for (i = 0; createJSInterface.panels.length; i++) {
    createJSInterface.panels[i].container.visible = name == createJSInterface.panels[i].name;
  }
};
