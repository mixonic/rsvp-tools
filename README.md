rsvp-tools is a set of utility functions for wrapping event or
callback based JavaScript APIs in RSVP promises. Both the browser
and Node.js environments are supported.

A simple example to get started. Here is a simple API call on the
Facebook JavaScript SDK:

```javascript
FB.api('/platform', function(response){
  alert(response.company_overview);
}, function(error){
  alert("Failed to fetch the platform summary");
});
```

With rsvp-tools:

```javascript
// Wrap the `api` function in promises
var api = rsvpTools.callback.build(FB, 'api');

api('/platform')
  .then(function(response){
    alert(response.company_overview);
  }, function(){
    alert("Failed to fetch the platform summary");
  });
```

A simple example doesn't leverage promises very much- in this more
complicated example we will find out which is more popular, my hometown
or my current town.

```javascript
var errorHandler = function(){
  alert('Woops!');
}
FB.api('/me', function(response){
  var placesToCheck = 2,
      hometown,
      location;
      displayMorePopularItem = function(){
        var mostPopular = places.sort(function(a,b){ return b.likes <=> a.likes })[0];
        alert('Your most popular town is: '+mostPopular.name);
      };
  FB.api('/'+response.hometown.id, function(response){
    hometown = response;
    placesToCheck--;
    if (placesToCheck == 0) displayMorePopularItem();
  }, errorHandler);
  FB.api('/'+response.location.id, function(response){
    location = response;
    placesToCheck--;
    if (placesToCheck == 0) displayMorePopularItem();
  }, errorHandler);
}, errorHandler);
```

This amount of indirection can make following source code difficult.
rsvp-tools can help you clean it up:

```javascript
var api = rsvpTools.callback.build(FB, 'api');

api('/me')
  .then(function(response){
    return RSVP.all([
      api('/'+response.hometown.id),
      api('/'+response.location.id)
    ])
  }).then(function(places){
    return places.sort(function(a,b){ return b.likes <=> a.likes })[0];
  }).then(function(mostPopular){
    alert('Your most popular town is: '+mostPopular.name);
  }).fail(function(error){
    alert('Woops!');
  });
```

Usage
===

```javascript
// callback.build
//
// Wrap async expecting a success and error callback after other
// arguments. Use this wrapper for dealing with a context that will
// never change.
//
var facebookApi = rsvpTools.callback.build(FB, 'api');

// Always calling `api` on the `FB` context
facebookApi("/platform").then(success, failure);
```

```javascript
// callback.contextPassed
//
// Wrap async expecting a success and error callback after other
// arguments. Use this wrapper for dealing with a context that will
// be decided at call-time.
//
var facebookApi = rsvpTools.callback.contextPassed('api');

// Apply the promise-wrapped `api` method to the passed FB object.
facebookApi(FB, "/platform").then(success, failure);
```

```javascript
// eventd.contextPassed
//
// Wrap async emitting success/failure events. This wrapper expects
// the context to be provided at call-time.
//
var open = rsvpTools.evented.contextPassed('open');

// Apply `open` to the XMLHTTPRequest instance.
open(new XMLHTTPRequest(), "GET", "/api/foo.json").then(success, failure);

// evented.contextPassed will try to attach handlers using several
// standard functions:
//
//   addEventListener, attachEvent, on
//
// And will listen for the events "success" and "error". These can
// be changed at setup-time.
var readAsDataUrl = rsvpTools.evented.contextPassed('readAsDataUrl', 'load');

// Promise resolves on the `load` event
readAsDataUrl(new FileReader(), new Blob([])).then(success, failure)
```

Building
===

```
npm install
bower install
```

To build:

```
grunt
```

And to run tests start the server with:

```
grunt server
```

And visit http://localhost:8000/test/

rsvp-tools is available under the MIT license. Cory Forsyth and Matthew Beale 2013
