var DivParticleSystem = function() {
  "use strict";

  var _head = null;

  var createParticle = function (x,y, color) {

    var next = null;
    var prev = null;

    var el = document.createElement('div');
    el.style.position = "absolute";
    el.style.backgroundColor = "RGBA(1,1,1,0)";
    el.innerHTML = "\u25cf";
    el.style.color = color;

    var t = 1000;
    var vx = Math.random() * 2 - 1;
    var vy = Math.random() * 2 - 1;
    var _v = Math.random()*60+80
    var d = Math.sqrt(vx * vx + vy * vy);
    vx /= d;
    vy /= d;

    document.body.appendChild(el);

    var update = function (dt) {

      x += _v * vx * (dt / 1000);
      y += _v * vy * (dt / 1000);

      t -= dt;
      _v -= 2;

      el.style.left = x + "px";
      el.style.top = y + "px";
    };

    var remaining = function () {
      return t;
    };

    var dispose = function () {
      document.body.removeChild(el);
    };

    return { update: update, remaining: remaining, dispose: dispose, next: next, prev: prev };

  };

  var _add = function (node) {
    var old = _head;

    _head = node;
    node.next = old;

    if (old !== null) {
      old.prev = node;
    }

  };

  var _remove = function (node) {

    if (node.next !== null) {
      node.next.prev = node.prev;
    }

    if (node.prev === null) {
      _head = node.next;
    } else {
      node.prev.next = node.next;
    }

    node.prev = null;
    node.next = null;

  };

  var Add = function (x, y, count, color) {
    color = color || "red";
    for (var i = 0; i < count; i++) {
      var node = createParticle(x, y, color);
      _add(node);
    }
  };

  var Update = function (dt) {
    var current = _head;

    while (current !== null) {
      var node = current;
      current = current.next;

      if (node.remaining() < 0) {
        node.dispose();
        _remove(node);
      } else {
        node.update(dt);
      }
    }
  }

  return { Update: Update, Add: Add };

};

module.exports=DivParticleSystem;
