/**---------------------------------------------------------------------------------------------------------------------
 * tgi-interface-createjs/lib/tgi-interface-createjs-navigation.source.js
 */
(function () { // for closure
               //  var createjs = CreateJSInterface._createjs;

  var col = 20;

  CreateJSInterface.prototype.createNavigation = function () {
    var menuContents = this.presentation.get('contents');
    for (var menuItem in menuContents) if (menuContents.hasOwnProperty(menuItem)) {
      this.addNavButton(menuContents[menuItem]);
    }
  };

  CreateJSInterface.prototype.addNavButton = function (action) {
    var self = this;
    var navButton = this.doc.stage.addChild(new NavButton(self, action.name, "#777", function () {
      self.dispatch(new Request({type: 'Command', command: action}));
    }));
    if (action.location) {
      navButton.x = action.location.x;
      navButton.y = action.location.y;
    } else {
      navButton.x = col;
      navButton.y = 20;
      col += (navButton._widthWas + 4);
    }
  };

  /**
   * NavButton via createjs inheritance (createjs.promote below)
   */
  function NavButtonContainer(createJSInterface, label, color, callback) {

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
    var text = new createjs.Text(this.label, "24px Arial", "#111");
    text.textBaseline = "top";
    text.textAlign = "center";
    this._widthWas = text.getMeasuredWidth() + 30;    // Size container base
    this._heightWas = text.getMeasuredHeight() + 28;
    text.x = this._widthWas / 2; // Center
    text.y = 12;

    var background = new createjs.Shape();
    background.graphics.beginFill('#000').drawRoundRect(1, 1, this._widthWas, this._heightWas, 10);
    background.graphics.beginFill(this.color).drawRoundRect(0, 0, this._widthWas - 1, this._heightWas - 1, 10);
    this.addChild(background, text);
    this.mouseChildren = false;
    this.on("click", function (event) {
      this._tgiCallback();
    });
    this.on("mousedown", function (event) {
      this._pressed = false;
      this._shiftPressed = false;
      this._moved = false;
      if (event.nativeEvent.shiftKey) {
        this._shiftPressed = true;
        this._createJSInterface.info('x: ' + this.x  + ', y: ' + this.y);
      } else {
        this._pressed = true;
        this.alpha = 0.5;
      }
    });
    this.on("pressmove", function (event) {
      if (this._shiftPressed) {
        this._moved = true;
        event.currentTarget.x = event.stageX;
        event.currentTarget.y = event.stageY;
        this._createJSInterface.info('x: ' + this.x  + ', y: ' + this.y);
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