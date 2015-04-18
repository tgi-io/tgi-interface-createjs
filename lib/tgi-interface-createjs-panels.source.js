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
  var defaultLocation = {
    sx: 20,
    sy: 120,
    x: 20,
    y: 120,
    dx: 10,
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
    if (attribute.type == 'Object') {
      if (attribute.value.image && attribute.value.image.element) {
        if (attribute.value.image.element instanceof Array) {

          var size = {height: attribute.value.image.element[0].naturalHeight, width: attribute.value.image.element[0].naturalWidth};
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
          var sprite = renderSprite(attribute.value.image.spriteSheet, attribute.value.location, size);
          sprite.gotoAndStop(frame);

        } else {
          renderImage(attribute.value.image.element, attribute.value.location);
        }
      } else if (attribute.value.text) {
        renderText(attribute.value.text, attribute.value.location, attribute.value.font, attribute.value.color);
      } else {
        renderText(JSON.stringify(attribute.value));
      }
    } else {
      renderText(attribute.value);
    }
  }

  function renderCommand(command) {
    console.log('renderCommand ' + command);
  }

  function renderText(label, location, font, color) {
    var myFont = font || "48px Arial";
    var myColor = color || "#000";
    var text = new createjs.Text(label, myFont, myColor);
    if (location) {
      text.x = location.x;
      text.y = location.y;
    } else {
      defaultLocation.x = defaultLocation.sx;
      text.x = defaultLocation.x;
      text.y = defaultLocation.y;
      defaultLocation.y += (text.getMeasuredHeight() + defaultLocation.dy);
    }
    panel.container.addChild(text);
    return text;
  }

  function renderImage(image, location) {
    var bitmap = new createjs.Bitmap(image);
    if (location) {
      bitmap.x = location.x;
      bitmap.y = location.y;
    } else {
      bitmap.x = defaultLocation.x;
      bitmap.y = defaultLocation.y;
      defaultLocation.x += (image.naturalWidth + defaultLocation.dx);
    }
    panel.container.addChild(bitmap);
    return bitmap;
  }

  function renderSprite(spriteSheet, location, size) {
    var sprite = new createjs.Sprite(spriteSheet);
    if (location) {
      sprite.x = location.x;
      sprite.y = location.y;
    } else {
      if (defaultLocation.x + size.width + defaultLocation.dx > 1920) { //todo 1920 hard coded
        defaultLocation.x = defaultLocation.sx;
        defaultLocation.y += (size.height + defaultLocation.dy);
      }
      sprite.x = defaultLocation.x;
      sprite.y = defaultLocation.y;
      defaultLocation.x += (size.width + defaultLocation.dx);
    }
    panel.container.addChild(sprite);
    return sprite;
  }

  /**
   * Make this panel visible hide others
   */
  for (i = 0; createJSInterface.panels.length; i++) {
    createJSInterface.panels[i].container.visible = name == createJSInterface.panels[i].name;
  }

};
