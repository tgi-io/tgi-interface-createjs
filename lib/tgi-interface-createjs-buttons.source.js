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