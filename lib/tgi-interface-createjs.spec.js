/**---------------------------------------------------------------------------------------------------------------------
 * tgi-interface-createjs/lib/tgi-interface-createjs.spec.js
 */

spec.testSection('Interfaces');
spec.test('tgi-core/lib/interfaces/tgi-core-interfaces-repl.spec.js', 'CreateJSInterface', 'CreateJS Interface', function (callback) {
  var coreTests = spec.mute(false);
  spec.heading('CreateJSInterface', function () {
    spec.paragraph('The CreateJSInterface uses  CreateJS (http://www.idangero.us/createjs) to create a IOS 7+ type of UI.');
    spec.paragraph('Core tests run: ' + JSON.stringify(coreTests));
    spec.paragraph('This doc may be outdated since tests run in browser.  See source code for more info.');
    spec.heading('CONSTRUCTOR', function () {
      spec.runnerInterfaceConstructor(CreateJSInterface);
      spec.example('must supply vendor in constructor', Error('Error initializing CreateJS'), function () {
        new CreateJSInterface().start(new Application(), new Presentation(), function () {
        });
      });
    });
    spec.runnerInterfaceMethods(CreateJSInterface);
    spec.heading('METHODS', function () {
      spec.paragraph('meh');
    });
    spec.heading('INTEGRATION', function () {
      spec.paragraph('blah');
    });
  });
});
