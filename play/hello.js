/**---------------------------------------------------------------------------------------------------------------------
 * tgi-interface-createjs/play/hello.js
 */

function init() {

  /**
   * Stage and tick event to update
   */

  var stage = new createjs.Stage("demoCanvas");
  createjs.Ticker.setFPS(999);
  createjs.Ticker.addEventListener("tick", function (event) {
    // update the text:
    text.text =  new Date();
    // update the stage:
    stage.update(event);
  });

  /**
   * Static Text & text we update every tick
   */
  stage.addChild(new createjs.Text("http://www.createjs.com/Learn", "48px Arial", "#ffff00"));
  var text = new createjs.Text("Hello World", "48px Arial", "#ffff88");
  text.x = 200;
  text.y = 130;
  stage.addChild(text);


  /**
   * Circle
   */
  var circle = new createjs.Shape();
  circle.graphics.beginFill("DeepSkyBlue").drawCircle(0, 0, 25);
  circle.x = 100;
  circle.y = 100;
  stage.addChild(circle);

  /**
   * Move circle with tween
   */
  createjs.Tween.get(circle, { loop: true })
    .to({ x: 1200 }, 1000, createjs.Ease.getPowInOut(4))
    .to({ alpha: 0.5, y: 175 }, 500, createjs.Ease.getPowInOut(2))
    .to({ alpha: 0.75, y: 225 }, 100)
    .to({ alpha: 1, y: 200 }, 500, createjs.Ease.getPowInOut(2))
    .to({ x: 100 }, 800, createjs.Ease.getPowInOut(2))
    .to({ y: 100 }, 800, createjs.Ease.getPowInOut(2))
    .call(function () {
      createjs.Sound.stop(soundID); // sound repeating is annoying
    });

  /**
   * Load and play a sound
   */
  var soundID = "game";
  createjs.Sound.registerSound('assets/M-GameBG.mp3', soundID);
  createjs.Sound.on('fileload', function () {
    createjs.Sound.play(soundID);
  });


  /**
   * Load a Image
   */
  function loadImage() {
    var preload = new createjs.LoadQueue();
    preload.addEventListener("fileload", handleFileComplete);
    preload.loadFile("assets/createjs/PreloadJS/icon.png");
  }

  function handleFileComplete(event) {
    document.body.appendChild(event.result);
  }

  setTimeout(function () {
    loadImage();
  }, 1000);

}
