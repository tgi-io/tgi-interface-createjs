/**---------------------------------------------------------------------------------------------------------------------
 * tgi-interface-createjs/lib/tgi-interface-createjs-stage.source.js
 */
CreateJSInterface.prototype.createStage = function (callback) {
  var createJSInterface = this;
  var createjs = CreateJSInterface._createjs;

  /**
   * All the world is a stage
   */
  this.doc.stage = new createjs.Stage(this.vendor.canvasID);

  /**
   * Debug text
   */
  this.doc.debugText = new createjs.Text("this.doc.debugText", "32px Arial", "#ffff00"); // text
  var height = this.doc.debugText.getMeasuredHeight() + 6;
  var top = this.doc.stage.canvas.height - height;
  this.doc.debugPanel = new createjs.Shape(new createjs.Graphics().beginFill("#777").drawRect(0, top, this.doc.stage.canvas.width, height));
  this.doc.debugPanel.alpha = 0.5; // translucent rectangle in back of text
  this.doc.stage.addChild(this.doc.debugPanel);

  this.doc.debugText.x = 4;
  this.doc.debugText.y = top;
  this.doc.stage.addChild(this.doc.debugText);
  //this._heightWas = text.getMeasuredHeight() + 28;

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
  createjs.Ticker.setFPS(60);
  createjs.Ticker.addEventListener("tick", function (event) {
    createJSInterface.doc.stage.update(event);
  });

  /**
   * Recursively walk thru resources & create a manifest
   */
  var manifest = [];
  getResourceItems(CreateJSInterface._resources, '');
  function getResourceItems(resources, path) {
    for (var resourceName in resources) {
      if (resources.hasOwnProperty(resourceName) && resourceName[0] != '_') {
        var resource = resources[resourceName];
        var filePath = (path ? path + '/' : '' ) + resourceName;
        if (resource._type == 'Folder') {
          getResourceItems(resource, filePath);
        } else {
          if (undefined === resource.firstFrame) {
            filePath += '.' + resource._type.toLowerCase();
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
    console.log("Finished Loading Assets");
    callback();
  });
  preload.on("error", function (event, err) {
    console.error("Error loading", event.data.src);
  });
  preload.loadManifest(manifest, true, '');
};