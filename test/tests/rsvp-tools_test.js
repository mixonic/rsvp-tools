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

module("rsvpTools callback style");

module("rsvpTools evented style");

