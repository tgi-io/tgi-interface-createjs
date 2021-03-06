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
