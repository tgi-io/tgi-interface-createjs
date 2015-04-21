/**---------------------------------------------------------------------------------------------------------------------
 * tgi-interface-createjs/lib/tgi-interface-createjs-navigation.source.js
 */


CreateJSInterface.prototype.createNavigation = function () {
  var createJSInterface = this;
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
      if (command.location) {
        navButton.x = command.location.x;
        navButton.y = command.location.y;
      } else {
        navButton.x = location.x;
        navButton.y = location.y;
        location.x += (navButton._widthWas + location.dx);
      }
    })(menuContents[menuItem], location);
  }
};

