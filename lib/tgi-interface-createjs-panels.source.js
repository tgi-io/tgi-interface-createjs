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

  /**
   * this.panels array of panels
   */
  if (typeof this.panels == 'undefined')
    this.panels = [];

  /**
   * See if command already has a panel
   */
  var panel;
  for (var i = 0; (typeof panel == 'undefined') && i < this.panels.length; i++) {
    if (name == this.panels[i].name)
      panel = this.panels[i];
  }

  /**
   * If we did not find panel create
   */
  if (typeof panel == 'undefined') {
    panel = {
      name: name,
      listeners: []
    };
    this.panels.push(panel);

    var shizzle = res.assets.wave.element;
    var image = new createjs.Bitmap(res.assets.wave.element);
    image.alpha = 0.5;
    createJSInterface.doc.stage.addChildAt(image,0);



  }

  /**
   * Render panel body based on presentation mode
   */
  switch (command.presentationMode) {
    case 'View':
      createJSInterface.info(JSON.stringify(contents));
      break;
    default:
      createJSInterface.info('unknown command.presentationMode: ' + command.presentationMode);
  }
};
