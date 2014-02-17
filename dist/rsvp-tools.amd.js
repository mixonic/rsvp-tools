define("rsvp-tools",
  [],
  function() {
    "use strict";
    var globals = globals || window,
        RSVP = globals.RSVP || globals.Ember.RSVP,
        rsvpTools;

    if (!RSVP) {
      throw("RSVP is required for rsvp-tools");
    }

    var runloopify = function(fn, context){
      return function(){
        fn.apply(context, arguments);
      };
    };

    if (globals.Ember) {
      runloopify = function(fn, context){
        return function(){
          Ember.run.apply(
            Ember.run, [context, fn].concat(
              Array.prototype.slice.call(arguments)
            )
          );
        };
      };
    }

    function buildArguments(args, resolve, reject){
      var arrayOfArguments = Array.prototype.slice.call(args);
      return arrayOfArguments.concat([resolve, reject]);
    }

    function fireWithCallbacks(obj, target, args, resolve, reject){
      var fn;
      if (typeof target === 'string') {
        fn = obj[target];
      } else {
        fn = target;
      }
      args = buildArguments(args, resolve, reject);
      return fn.apply(obj, args);
    }

    function fire(obj, target, args) {
      return new RSVP.Promise(function(resolve, reject){
        fireWithCallbacks( obj, target, args,
                           runloopify(resolve),
                           runloopify(reject) );
      });
    }

    rsvpTools = {};

    // For callback-style async APIs
    //
    rsvpTools.callback = {

      // contextPassed expects the context of later calls to
      // be passed as the first arguement.
      //
      contextPassed: function(target) {
        return function(context){
          var restOfArgs = Array.prototype.slice.call(arguments, 1);
          return fire(context, target, restOfArgs);
        };
      },

      // build expects the context to be provided at creation time, and
      // will re-use that context for each time you call the function.
      //
      // Usage:
      //
      // var requestQuota = rsvpTools.callback.build(navigator.webkitPersistentStorage, 'requestQuota');
      // requestQuota(1024*1024)
      //   .then(success, failure);
      //
      // var facebookApi = rsvpTools.callback.build(FB, 'api');
      // facebookApi("/platform")
      //   .then(success, failure);
      //
      build: function(obj, target){
        if (!target) {
          target = obj;
          obj = window;
        }
        return function(){
          // TODO: fix deopt
          return fire(obj, target, arguments);
        };
      }
    };

    // For event-style APIs
    //
    rsvpTools.evented = {

      // contextPassed expects the context of later calls to
      // be passed as the first arguement. At creation time, you
      // can also specify alternative events to look to for
      // resolution or rejection of the promise.
      //
      // Basic usage:
      //
      // var open = rsvpTools.evented.contextPassed('open');
      // open(new XMLHTTPRequest(), "GET", "/api/foo.json")
      //   .then(success, failure);
      //
      // Usage with a custom event for success:
      //
      // var readAsDataUrl = rsvpTools.evented.contextPassed('readAsDataUrl', 'load');
      // readAsDataUrl(new FileReader(), new Blob([]))
      //   .then(success, failure)
      //
      // TODO ensure that the event listeners on `context` are removed when promise
      // is resolved or rejected
      contextPassed: function(target, resolveEvent, rejectEvent){
        return function(context){
          var args = Array.prototype.slice.call(arguments, 1);

          resolveEvent = resolveEvent || 'success';
          rejectEvent  = rejectEvent  || 'error';

          return new RSVP.Promise(function(resolve, reject){
            var eventListenerFunction,
                eventListenerFunctions = [
                  'addEventListener', 'attachEvent', 'on'
                ];
            resolve = runloopify(resolve);
            reject  = runloopify(reject);

            for (var i=0; i < eventListenerFunctions.length; i++){
              if ( context[ eventListenerFunctions[i] ] ) {
                eventListenerFunction = eventListenerFunctions[i];
                break;
              }
            }

            if (!eventListenerFunction) {
              reject( {err: "Context has no event (looked for " +
                            eventListenerFunctions.join(', ') + ")",
                       context: context} );
              return;
            }

            context[eventListenerFunction](resolveEvent, resolve);
            context[eventListenerFunction](rejectEvent,  reject);

            context[target].apply(context, args);
          });
        };
      }
    };



    return rsvpTools;
  });