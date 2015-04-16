/**---------------------------------------------------------------------------------------------------------------------
 * tgi-interface-createjs/lib/tgi-interface-createjs-navigation.source.js
 */
(function () { // for closure
  // todo (node fix) delayed load until interface started (otherwise CreateJSInterface._createjs undefined)
  //  var createjs = CreateJSInterface._createjs;

  var col = 20;

  CreateJSInterface.prototype.createNavigation = function () {
    var menuContents = this.presentation.get('contents');
    for (var menuItem in menuContents) if (menuContents.hasOwnProperty(menuItem)) {
      this.addNavButton(menuContents[menuItem]);
    }
  };

  CreateJSInterface.prototype.addNavButton = function (action) {
    var createJSInterface = this;
    var navButton = this.doc.stage.addChild(new NavButton(createJSInterface, action.name, "#111", undefined, function () {
      createJSInterface.dispatch(new Request({type: 'Command', command: action}));
    }));
    if (action.location) {
      navButton.x = action.location.x;
      navButton.y = action.location.y;
    } else {
      navButton.x = col;
      navButton.y = 20;
      col += (navButton._widthWas + 8);
    }
  };

  /**
   * NavButton via createjs inheritance (createjs.promote below)
   */
  function NavButtonContainer(createJSInterface, label, color, image, callback) {
    this.Container_constructor();
    this.color = color;
    this.label = label;
    this.name = label;
    this.setup();
    this._tgiCallback = callback;
    this._createJSInterface = createJSInterface;
  }

  var p = createjs.extend(NavButtonContainer, createjs.Container);
  p.setup = function () {
    /**
     * Button Text
     */
    var text = new createjs.Text(this.label, "48px Arial", "#DDD");
    text.textBaseline = "top";
    text.textAlign = "center";
    this._widthWas = text.getMeasuredWidth() + 30;    // Size container base
    this._heightWas = text.getMeasuredHeight() + 28;
    text.x = this._widthWas / 2; // Center
    text.y = 12;

    var background = new createjs.Shape();
    background.graphics.beginFill(this.color).drawRoundRect(0, 0, this._widthWas, this._heightWas, 8);
    this.addChild(background, text);
    this.mouseChildren = false;
    this.on("click", function (event) {
      try {
        this._tgiCallback();
      } catch (e) {
        this._createJSInterface.info(e);
      }

    });
    this.on("mousedown", function (event) {
      this._pressed = false;
      this._shiftPressed = false;
      this._moved = false;
      if (event.nativeEvent.shiftKey) {
        this._shiftPressed = true;
        this._createJSInterface.info('x: ' + this.x + ', y: ' + this.y);
      } else {
        this._pressed = true;
        this.alpha = 0.8;
      }
    });
    this.on("pressmove", function (event) {
      if (this._shiftPressed) {
        this._moved = true;
        event.currentTarget.x = event.stageX;
        event.currentTarget.y = event.stageY;
        this._createJSInterface.info('x: ' + this.x + ', y: ' + this.y);
      }
    });
    this.on("pressup", function (event) {
      if (this._pressed) {
        this.alpha = 1;
        this._pressed = false;
      }
    });
  };
  var NavButton = createjs.promote(NavButtonContainer, "Container");

}());