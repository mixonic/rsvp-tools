// rsvpTools is on the window.
//

test("RSVP exists", function(){
  ok(RSVP);
});

test("rsvpTools callback style exists", function(){
  ok(rsvpTools.callback);
});

test("rsvpTools evented style exists", function(){
  ok(rsvpTools.evented);
});

module("rsvpTools callback style with build");

var callbackApi = {
  asyncFunction: function(successCallback, failureCallback) {
    this.successCallback = successCallback;
    this.failureCallback = failureCallback;
  },

  asyncWithArguments: function() {
    this.passedArguments = Array.prototype.slice.call(arguments);
  },

  triggerSuccess: function(){
    this.successCallback();
  },

  triggerFailure: function(){
    this.failureCallback();
  }
};

var Callbackable = function() {};
Callbackable.prototype = callbackApi;

var testFailed = function(){
  ok(false, "Promise reject called when not expected");
  start();
};

asyncTest("promise is fulfilled when success callback is invoked", function(){
  expect(1);

  var promise,
      thennable,
      callbackable = new Callbackable();

  thennable =
    rsvpTools.callback.build( callbackable, 'asyncFunction' );
  promise = thennable();
  promise.then( function(){
    ok(true);
    start();
  }).fail(testFailed);

  setTimeout( function(){
    callbackable.triggerSuccess();
  }, 0);
});

asyncTest("promise is fulfilled when failure callback is invoked", function(){
  expect(1);

  var promise,
      thennable,
      callbackable = new Callbackable();

  thennable =
    rsvpTools.callback.build( callbackable, 'asyncFunction' );
  promise = thennable();
  promise.then( testFailed, function(){
    ok(true);
    start();
  });

  setTimeout( function(){
    callbackable.triggerFailure();
  }, 0);
});

test("additional arguments are passed through to original function", function(){
  var thennable,
      callbackable = new Callbackable();

  thennable = rsvpTools.callback.build( callbackable, 'asyncWithArguments' );
  thennable(1,2,3);
  deepEqual(callbackable.passedArguments.slice(0,3), [1,2,3],
            "Passed arguments should equal [1,2,3]");
});

module("rsvpTools callback style with context");

test("additional arguments are passed to the original function", function(){
  var thennable,
      callbackable = new Callbackable();

  thennable = rsvpTools.callback.contextPassed( 'asyncWithArguments' );
  thennable( callbackable, 1,2,3 );
  deepEqual( callbackable.passedArguments.slice(0,3), [1,2,3] );
});
