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
  var x = 4;
  var y = this.doc.stage.canvas.height - 28;

  this.doc.debugPanel = new createjs.Shape(new createjs.Graphics().beginFill("#777").drawRect(0, y, this.doc.stage.canvas.width, 28));
  this.doc.debugPanel.alpha = 0.5; // translucent rectangle in back of text
  this.doc.stage.addChild(this.doc.debugPanel);

  this.doc.debugText = new createjs.Text("this.doc.debugText", "24px Arial", "#ffff00"); // text
  this.doc.debugText.x = x;
  this.doc.debugText.y = y;
  this.doc.stage.addChild(this.doc.debugText);

  ///**
  // * Keyboard handler
  // */
  //document.getElementById(this.vendor.canvasID).onkeydown = function() {};

  /**
   * Ticker update method
   */
  createjs.Ticker.setFPS(60);
  createjs.Ticker.addEventListener("tick", function (event) {
    createJSInterface.doc.stage.update(event);
  });

  /**
   * Recursively walk thru resources & create a manifest for preloadJS
   */
  getResourceItems(CreateJSInterface._resources);
  function getResourceItems(resources) {
    for (var resourceName in resources) {
      if (resources.hasOwnProperty(resourceName) && resourceName[0] != '_') {
        var resource = resources[resourceName];
        console.log(resourceName + ' ' + resource._type);
        if (resource._type == 'Folder')
          getResourceItems(resource);
      }
    }
  }

  /*
   var manifest = [{
   src: "Plday_up.png",
   id: "Play_up"
   }, {
   src: "Play_down.png",
   id: "Play_down"
   }, {
   src: "M-GameBG.mp3",
   id: "M-GameBG"
   }];
   for (var i = 1; i <= 54; i++) {
   manifest.push({src: "Cards/face" + (i > 9 ? i : '0' + i) + ".png"})
   }
   var preload = new createjs.LoadQueue(true);
   preload.installPlugin(createjs.Sound);
   preload.on("fileload", function (event) {
   console.log("loaded " + event.item.type + ': ' + event.item.src);
   });
   preload.on("progress", function (event) {
   createJSInterface.info((preload.progress * 100 | 0) + " % Loaded");
   });
   preload.on("complete", function (event) {
   console.log("Finished Loading Assets");
   callback();
   });
   preload.on("error", function (event,err) {
   console.error("Error loading", event.data.src);
   });
   preload.loadManifest(manifest, true, 'assets/');

   */

};