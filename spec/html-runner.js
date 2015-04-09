/**---------------------------------------------------------------------------------------------------------------------
 * tgi-spec/spec/html-runner.js
 **/
var spec = new Spec({timeOut:1000});
testSpec(spec, TGI);
spec.runTests(function (msg) {
  /**
   * msg callback events msg.error, msg.log, msg.done
   */
  if (msg.error) {
    logError(msg.error);
  } else if (msg.done) {
    if (msg.testsFailed || msg.testsPending)
      logError(msg.testsCreated + ' Tests attempted with ' + msg.testsFailed + ' errors '  +
      msg.testsPending + ' tests pending');
    else
      logSuccess(msg.testsCreated + ' Tests completed with no errors');
  } else if (msg.log) {
    //log(msg.log);
  }
  /**
   * DOM rendering functions
   */
  function log(txt) {
    console.log(txt);
  }
  function logError(txt) {
    console.error(txt);
  }
  function logSuccess(txt) {
    console.log(txt + ' !!!');
  }
});
