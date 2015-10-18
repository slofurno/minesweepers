var sb = require('./view');
var map = require('./map');
var m = require('./mithril.min');
//var Material = require('material-design-lite/material');
//  <link rel="stylesheet" href="material.min.css">
window.oncontextmenu = function (e) {
  e.preventDefault();
  //return false;
};

m.mount(document.body, {controller:sb.controller,view:sb.view});
