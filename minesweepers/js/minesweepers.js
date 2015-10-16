var DivParticleSystem = require('./divparticlesystem');
var sb = require('./view');
var map = require('./map');
var m = require('./mithril.min');

window.oncontextmenu = function (e) {
  e.preventDefault();
  //return false;
};

m.mount(document.body, {controller:sb.controller,view:sb.view});
