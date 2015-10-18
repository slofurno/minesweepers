/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	var sb = __webpack_require__(1);
	var map = __webpack_require__(3);
	var m = __webpack_require__(4);
	//var Material = require('material-design-lite/material');
	//  <link rel="stylesheet" href="material.min.css">
	window.oncontextmenu = function (e) {
	  e.preventDefault();
	  //return false;
	};

	m.mount(document.body, {controller:sb.controller,view:sb.view});


/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	var DivParticleSystem = __webpack_require__(2);
	var Dictionary = __webpack_require__(3);
	var m = __webpack_require__(4);
	var sb = {};


	var parts = DivParticleSystem();

	function UpdateParts(){
	  parts.Update(25);
	  requestAnimationFrame(UpdateParts);
	}

	requestAnimationFrame(UpdateParts);


	sb.Player = function (player) {
	  this.Hash = m.prop(player.Hash);
	  this.Name = m.prop(player.Name);
	  this.Color = m.prop(player.Name);
	};

	sb.Square = function (square) {
	  this.Owner = m.prop(square.Owner);
	};

	sb.vm = (function () {
	  var vm = {};

	  vm.init = function () {
	    vm.players = Dictionary();
	    vm.squares = Dictionary();
	    vm.name = m.prop("player");
	    vm.color = m.prop("pick your color");
	    vm.showColors = m.prop(false);
	    vm.playerHash = "";
	    vm.colorLookup = ["", " one", " two", " three", " four", " five", " six", " seven", " eight"];
	    vm.CSS_COLOR_NAMES = ["AliceBlue", "AntiqueWhite", "Aqua", "Aquamarine", "Azure", "Beige", "Bisque", "Black", "BlanchedAlmond", "Blue", "BlueViolet", "Brown", "BurlyWood", "CadetBlue", "Chartreuse", "Chocolate", "Coral", "CornflowerBlue", "Cornsilk", "Crimson", "Cyan", "DarkBlue", "DarkCyan", "DarkGoldenRod", "DarkGray", "DarkGrey", "DarkGreen", "DarkKhaki", "DarkMagenta", "DarkOliveGreen", "Darkorange", "DarkOrchid", "DarkRed", "DarkSalmon", "DarkSeaGreen", "DarkSlateBlue", "DarkSlateGray", "DarkSlateGrey", "DarkTurquoise", "DarkViolet", "DeepPink", "DeepSkyBlue", "DimGray", "DimGrey", "DodgerBlue", "FireBrick", "FloralWhite", "ForestGreen", "Fuchsia", "Gainsboro", "GhostWhite", "Gold", "GoldenRod", "Gray", "Grey", "Green", "GreenYellow", "HoneyDew", "HotPink", "IndianRed", "Indigo", "Ivory", "Khaki", "Lavender", "LavenderBlush", "LawnGreen", "LemonChiffon", "LightBlue", "LightCoral", "LightCyan", "LightGoldenRodYellow", "LightGray", "LightGrey", "LightGreen", "LightPink", "LightSalmon", "LightSeaGreen", "LightSkyBlue", "LightSlateGray", "LightSlateGrey", "LightSteelBlue", "LightYellow", "Lime", "LimeGreen", "Linen", "Magenta", "Maroon", "MediumAquaMarine", "MediumBlue", "MediumOrchid", "MediumPurple", "MediumSeaGreen", "MediumSlateBlue", "MediumSpringGreen", "MediumTurquoise", "MediumVioletRed", "MidnightBlue", "MintCream", "MistyRose", "Moccasin", "NavajoWhite", "Navy", "OldLace", "Olive", "OliveDrab", "Orange", "OrangeRed", "Orchid", "PaleGoldenRod", "PaleGreen", "PaleTurquoise", "PaleVioletRed", "PapayaWhip", "PeachPuff", "Peru", "Pink", "Plum", "PowderBlue", "Purple", "Red", "RosyBrown", "RoyalBlue", "SaddleBrown", "Salmon", "SandyBrown", "SeaGreen", "SeaShell", "Sienna", "Silver", "SkyBlue", "SlateBlue", "SlateGray", "SlateGrey", "Snow", "SpringGreen", "SteelBlue", "Tan", "Teal", "Thistle", "Tomato", "Turquoise", "Violet", "Wheat", "White", "WhiteSmoke", "Yellow", "YellowGreen"];


	    vm.updatePlayer = function (update) {
	      var players = [].concat(update).forEach(function(player){

	        var old = vm.players.get(player.Hash);
	        vm.players.add(player.Hash, player);

	        if (old && old.Dead !== player.Dead){
	          console.log(player.Name, "JUST DIED!");
	          parts.Add(player.X, player.Y, 75, player.Color);
	        }

	      });
	    };

	    vm.addSquare2 = function (square) {
	      vm.squares.push(new sb.Square(square));
	      console.log("square added", square);
	    };

	    vm.updateSquares = function(update){
	      update.forEach(function (square) {
	        vm.squares.add(square.Index, square);
	      });
	    };

	  };

	  return vm;
	}());


	sb.controller = function () {
	  sb.vm.init();

	  var mouseCoords = {X:50, Y:50};
	  var lastTimeout = -1;
	  var isConnected = false;

	  var ws = new WebSocket("ws://"+window.location.hostname+":5678/ws");
	  ws.onopen = function (e) {
	    isConnected = true;
	  };
	  ws.onmessage = function (e) {

	    var update = JSON.parse(e.data);
	    var data = JSON.parse(update.Data);

	    m.startComputation();

	    if (update.Type == "player") {
	      sb.vm.updatePlayer(data);
	    } else if(update.Type=="square"){
	      sb.vm.updateSquares(data);
	    } else{
	      sb.vm.playerHash=data.Hash;
	    }

	    m.endComputation();

	  };

	  return{
	    clickMine:function(e){
	      e.preventDefault();
	      m.redraw.strategy("none");

	      var rawvalue = e.target.getAttribute("value");

	      if (!isConnected||rawvalue===null){
	        return;
	      }

	      var index = rawvalue|0;
	      var type = "flag";

	      if (e.buttons===1){
	        type = "reveal";
	      }

	      var ui = {Index:index};
	      var innerjson = JSON.stringify(ui);

	      var update = {Type:type,RawCommand:innerjson};
	      var json = JSON.stringify(update);
	      ws.send(json);
	    },
	    mouseMove:function(e){
	      e.preventDefault();
	      m.redraw.strategy("none");

	      mouseCoords = {
	        X:e.clientX+document.body.scrollLeft+document.documentElement.scrollLeft,
	        Y:e.clientY+document.body.scrollTop+document.documentElement.scrollTop
	      };

	      if (!isConnected){
	        return;
	      }

	      if (lastTimeout>=0){
	        return;
	      }

	      lastTimeout = setTimeout(function(){
	        var innerjson = JSON.stringify(mouseCoords);
	        var update = {Type:"move",RawCommand:innerjson};
	        var json = JSON.stringify(update);
	        ws.send(json);
	        lastTimeout=-1;
	      },50);

	    },
	    updateSettings:function(e){
	      var name = sb.vm.name();
	      var color = sb.vm.color();

	      if (sb.vm.CSS_COLOR_NAMES.indexOf(color)<0){
	        return;
	      }

	      var settings = {Name:name,Color:color};
	      var innerjson = JSON.stringify(settings);
	      var update = {Type:"settings",RawCommand:innerjson};
	      var json = JSON.stringify(update);
	      ws.send(json);

	      console.log(name,color);
	    },
	    toggleColors:function(e){
	      if (sb.vm.showColors()){
	        var color = e.target.getAttribute("value");
	        sb.vm.showColors(false);
	        if (color){
	          sb.vm.color(color);
	        }
	      }else{
	        sb.vm.showColors(true);
	      }
	    },
	    pickColor:function(e){
	      e.preventDefault();

	    }
	  };
	};

	sb.view = function (ctrl) {
	  return m("div",{class:"container"},
	  [
	    m("div",{class:"content"},
	    [

	      m("div", {
	        class: "minefield",
	        onmousedown:ctrl.clickMine,
	        onmousemove:ctrl.mouseMove
	      },
	      [
	        sb.vm.squares.getEnumerator().map(function(square){
	          var color = "";
	          var className = "mine-square";
	          var body = "";

	          if (square.Flagged) {
	            body = "\u2690";
	            color = sb.vm.players.get(square.Owner).Color;
	          } else if (square.Mined && square.Revealed) {
	            className += " pressed mined";
	            body = "\ud83d\udca3";
	          } else if (square.Revealed) {
	            className += " pressed";
	            var neighbors = square.Neighbors;
	            if (neighbors > 0) {
	              body = "" + neighbors;
	              className+= sb.vm.colorLookup[neighbors];
	            }
	          }

	          return m("div", {
	            class: className,
	            style: {color: color},
	            key:square.Index,
	            value:square.Index
	          }, body);
	        })
	      ]),

	      m("div",{class:"scoreboard"},
	      [
	        m("div",
	        [
	          m("div",{}, [
	            m("input", {
	              oninput: m.withAttr("value", sb.vm.name),
	              value: sb.vm.name(),
	              style:{
	                fontSize:"1.2em",
	                margin:"5px"
	              }
	            })
	          ]),
	          m("div",{
	            onclick:ctrl.toggleColors,
	            style:{
	              width:"100%",
	              border: sb.vm.showColors() ? "" : "1px solid black",
	              backgroundColor: sb.vm.showColors() ? "rgba(0,0,0,0.0)" : "white",
	              padding:"5px",
	              margin:"5px"

	            }
	          },[
	            sb.vm.showColors() ? (sb.vm.CSS_COLOR_NAMES.map(function(color){
	              return m("div",{
	                style:{
	                  backgroundColor:color,
	                  width:"20px",
	                  height:"20px",
	                  display:"inline-block",
	                  margin:"2px"
	                },
	                value:color
	              }," ");
	            })) : sb.vm.color() + "     \u25bc"
	          ]),
	          m("button[type=button]",{
	            onclick:ctrl.updateSettings,
	            style:{
	              margin:"5px",
	              padding:"5px"
	            }
	          },"update")


	        ]),
	        m("ul",
	        [ m("h3",{},"top scores"),
	          sb.vm.players.getEnumerator().sort(function(a,b){
	            return b.Points - a.Points;
	          }).map(function(player){
	            return m("li",{
	              key:player.Hash
	            }, player.Name + "  " + player.Points);
	          })
	        ])
	      ])

	    ]),

	    m("div",[
	      sb.vm.players.getEnumerator().filter(function(player){
	        return player.Hash != sb.vm.playerHash && player.Dead===false;
	      }).map(function (player) {
	        return m("div",{
	          class:"square",
	          style:{
	            left:player.X+"px",
	            top:player.Y+"px",
	            color:player.Color
	          }
	        },["\u261C "]);
	      })
	    ])

	  ]);
	};

	module.exports = sb;


/***/ },
/* 2 */
/***/ function(module, exports) {

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


/***/ },
/* 3 */
/***/ function(module, exports) {

	
	"use strict";
	module.exports = function(getKey){
	  var store = {};

	  var getEnumerator = function(){
	    var keys = Object.keys(store);
	    return keys.map(function(key){
	      return store[key];
	    });
	  };

	  var add = function(key, element){
	    //var key = getKey(element);
	    store[key]=element;
	  };

	  var remove = function(key){
	    delete store[key];
	  };

	  var get = function(key){
	    return store[key];
	  };


	  return {getEnumerator:getEnumerator, add:add, remove:remove, get:get};

	};


/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_RESULT__;/* WEBPACK VAR INJECTION */(function(module) {/*
	Mithril v0.2.0
	http://github.com/lhorie/mithril.js
	(c) Leo Horie
	License: MIT
	*/
	var m=function a(b,c){function d(a){D=a.document,E=a.location,G=a.cancelAnimationFrame||a.clearTimeout,F=a.requestAnimationFrame||a.setTimeout}function e(){var a,b=[].slice.call(arguments),c=!(null==b[1]||L.call(b[1])!==H||"tag"in b[1]||"view"in b[1]||"subtree"in b[1]),d=c?b[1]:{},e="class"in d?"class":"className",f={tag:"div",attrs:{}},g=[];if(L.call(b[0])!=J)throw new Error("selector in m(selector, attrs, children) should be a string");for(;a=M.exec(b[0]);)if(""===a[1]&&a[2])f.tag=a[2];else if("#"===a[1])f.attrs.id=a[2];else if("."===a[1])g.push(a[2]);else if("["===a[3][0]){var h=N.exec(a[3]);f.attrs[h[1]]=h[3]||(h[2]?"":!0)}var i=b.slice(c?2:1);f.children=1===i.length&&L.call(i[0])===I?i[0]:i;for(var j in d)d.hasOwnProperty(j)&&(j===e&&null!=d[j]&&""!==d[j]?(g.push(d[j]),f.attrs[j]=""):f.attrs[j]=d[j]);return g.length>0&&(f.attrs[e]=g.join(" ")),f}function f(a,b,d,j,l,m,n,o,p,q,r){try{(null==l||null==l.toString())&&(l="")}catch(s){l=""}if("retain"===l.subtree)return m;var t=L.call(m),u=L.call(l);if(null==m||t!==u){if(null!=m)if(d&&d.nodes){var v=o-j,w=v+(u===I?l:m.nodes).length;i(d.nodes.slice(v,w),d.slice(v,w))}else m.nodes&&i(m.nodes,m);m=new l.constructor,m.tag&&(m={}),m.nodes=[]}if(u===I){for(var x=0,y=l.length;y>x;x++)L.call(l[x])===I&&(l=l.concat.apply([],l),x--,y=l.length);for(var z=[],A=m.length===l.length,B=0,C=1,E=2,F=3,G={},M=!1,x=0;x<m.length;x++)m[x]&&m[x].attrs&&null!=m[x].attrs.key&&(M=!0,G[m[x].attrs.key]={action:C,index:x});for(var N=0,x=0,y=l.length;y>x;x++)if(l[x]&&l[x].attrs&&null!=l[x].attrs.key){for(var Q=0,y=l.length;y>Q;Q++)l[Q]&&l[Q].attrs&&null==l[Q].attrs.key&&(l[Q].attrs.key="__mithril__"+N++);break}if(M){var R=!1;if(l.length!=m.length)R=!0;else for(var S,T,x=0;S=m[x],T=l[x];x++)if(S.attrs&&T.attrs&&S.attrs.key!=T.attrs.key){R=!0;break}if(R){for(var x=0,y=l.length;y>x;x++)if(l[x]&&l[x].attrs&&null!=l[x].attrs.key){var U=l[x].attrs.key;G[U]=G[U]?{action:F,index:x,from:G[U].index,element:m.nodes[G[U].index]||D.createElement("div")}:{action:E,index:x}}var V=[];for(var W in G)V.push(G[W]);var X=V.sort(g),Y=new Array(m.length);Y.nodes=m.nodes.slice();for(var Z,x=0;Z=X[x];x++){if(Z.action===C&&(i(m[Z.index].nodes,m[Z.index]),Y.splice(Z.index,1)),Z.action===E){var $=D.createElement("div");$.key=l[Z.index].attrs.key,a.insertBefore($,a.childNodes[Z.index]||null),Y.splice(Z.index,0,{attrs:{key:l[Z.index].attrs.key},nodes:[$]}),Y.nodes[Z.index]=$}Z.action===F&&(a.childNodes[Z.index]!==Z.element&&null!==Z.element&&a.insertBefore(Z.element,a.childNodes[Z.index]||null),Y[Z.index]=m[Z.from],Y.nodes[Z.index]=Z.element)}m=Y}}for(var x=0,_=0,y=l.length;y>x;x++){var bb=f(a,b,m,o,l[x],m[_],n,o+B||B,p,q,r);bb!==c&&(bb.nodes.intact||(A=!1),B+=bb.$trusted?(bb.match(/<[^\/]|\>\s*[^<]/g)||[0]).length:L.call(bb)===I?bb.length:1,m[_++]=bb)}if(!A){for(var x=0,y=l.length;y>x;x++)null!=m[x]&&z.push.apply(z,m[x].nodes);for(var cb,x=0;cb=m.nodes[x];x++)null!=cb.parentNode&&z.indexOf(cb)<0&&i([cb],[m[x]]);l.length<m.length&&(m.length=l.length),m.nodes=z}}else if(null!=l&&u===H){for(var eb=[],fb=[];l.view;){var gb=l.view.$original||l.view,hb="diff"==e.redraw.strategy()&&m.views?m.views.indexOf(gb):-1,ib=hb>-1?m.controllers[hb]:new(l.controller||P),U=l&&l.attrs&&l.attrs.key;if(l=0==db||m&&m.controllers&&m.controllers.indexOf(ib)>-1?l.view(ib):{tag:"placeholder"},"retain"===l.subtree)return m;U&&(l.attrs||(l.attrs={}),l.attrs.key=U),ib.onunload&&ab.push({controller:ib,handler:ib.onunload}),eb.push(gb),fb.push(ib)}if(!l.tag&&fb.length)throw new Error("Component template must return a virtual element, not an array, string, etc.");l.attrs||(l.attrs={}),m.attrs||(m.attrs={});var jb=Object.keys(l.attrs),kb=jb.length>("key"in l.attrs?1:0);if((l.tag!=m.tag||jb.sort().join()!=Object.keys(m.attrs).sort().join()||l.attrs.id!=m.attrs.id||l.attrs.key!=m.attrs.key||"all"==e.redraw.strategy()&&(!m.configContext||m.configContext.retain!==!0)||"diff"==e.redraw.strategy()&&m.configContext&&m.configContext.retain===!1)&&(m.nodes.length&&i(m.nodes),m.configContext&&typeof m.configContext.onunload===K&&m.configContext.onunload(),m.controllers))for(var ib,x=0;ib=m.controllers[x];x++)typeof ib.onunload===K&&ib.onunload({preventDefault:P});if(L.call(l.tag)!=J)return;var cb,lb=0===m.nodes.length;if(l.attrs.xmlns?q=l.attrs.xmlns:"svg"===l.tag?q="http://www.w3.org/2000/svg":"math"===l.tag&&(q="http://www.w3.org/1998/Math/MathML"),lb){if(cb=l.attrs.is?q===c?D.createElement(l.tag,l.attrs.is):D.createElementNS(q,l.tag,l.attrs.is):q===c?D.createElement(l.tag):D.createElementNS(q,l.tag),m={tag:l.tag,attrs:kb?h(cb,l.tag,l.attrs,{},q):l.attrs,children:null!=l.children&&l.children.length>0?f(cb,l.tag,c,c,l.children,m.children,!0,0,l.attrs.contenteditable?cb:p,q,r):l.children,nodes:[cb]},fb.length){m.views=eb,m.controllers=fb;for(var ib,x=0;ib=fb[x];x++)if(ib.onunload&&ib.onunload.$old&&(ib.onunload=ib.onunload.$old),db&&ib.onunload){var mb=ib.onunload;ib.onunload=P,ib.onunload.$old=mb}}m.children&&!m.children.nodes&&(m.children.nodes=[]),"select"===l.tag&&"value"in l.attrs&&h(cb,l.tag,{value:l.attrs.value},{},q),a.insertBefore(cb,a.childNodes[o]||null)}else cb=m.nodes[0],kb&&h(cb,l.tag,l.attrs,m.attrs,q),m.children=f(cb,l.tag,c,c,l.children,m.children,!1,0,l.attrs.contenteditable?cb:p,q,r),m.nodes.intact=!0,fb.length&&(m.views=eb,m.controllers=fb),n===!0&&null!=cb&&a.insertBefore(cb,a.childNodes[o]||null);if(typeof l.attrs.config===K){var nb=m.configContext=m.configContext||{},ob=function(a,b){return function(){return a.attrs.config.apply(a,b)}};r.push(ob(l,[cb,!lb,nb,m]))}}else if(typeof l!=K){var z;0===m.nodes.length?(l.$trusted?z=k(a,o,l):(z=[D.createTextNode(l)],a.nodeName.match(O)||a.insertBefore(z[0],a.childNodes[o]||null)),m="string number boolean".indexOf(typeof l)>-1?new l.constructor(l):l,m.nodes=z):m.valueOf()!==l.valueOf()||n===!0?(z=m.nodes,p&&p===D.activeElement||(l.$trusted?(i(z,m),z=k(a,o,l)):"textarea"===b?a.value=l:p?p.innerHTML=l:((1===z[0].nodeType||z.length>1)&&(i(m.nodes,m),z=[D.createTextNode(l)]),a.insertBefore(z[0],a.childNodes[o]||null),z[0].nodeValue=l)),m=new l.constructor(l),m.nodes=z):m.nodes.intact=!0}return m}function g(a,b){return a.action-b.action||a.index-b.index}function h(a,b,c,d,e){for(var f in c){var g=c[f],h=d[f];if(f in d&&h===g)"value"===f&&"input"===b&&a.value!=g&&(a.value=g);else{d[f]=g;try{if("config"===f||"key"==f)continue;if(typeof g===K&&0===f.indexOf("on"))a[f]=l(g,a);else if("style"===f&&null!=g&&L.call(g)===H){for(var i in g)(null==h||h[i]!==g[i])&&(a.style[i]=g[i]);for(var i in h)i in g||(a.style[i]="")}else null!=e?"href"===f?a.setAttributeNS("http://www.w3.org/1999/xlink","href",g):"className"===f?a.setAttribute("class",g):a.setAttribute(f,g):f in a&&"list"!==f&&"style"!==f&&"form"!==f&&"type"!==f&&"width"!==f&&"height"!==f?("input"!==b||a[f]!==g)&&(a[f]=g):a.setAttribute(f,g)}catch(j){if(j.message.indexOf("Invalid argument")<0)throw j}}}return d}function i(a,b){for(var c=a.length-1;c>-1;c--)if(a[c]&&a[c].parentNode){try{a[c].parentNode.removeChild(a[c])}catch(d){}b=[].concat(b),b[c]&&j(b[c])}0!=a.length&&(a.length=0)}function j(a){if(a.configContext&&typeof a.configContext.onunload===K&&(a.configContext.onunload(),a.configContext.onunload=null),a.controllers)for(var b,c=0;b=a.controllers[c];c++)typeof b.onunload===K&&b.onunload({preventDefault:P});if(a.children)if(L.call(a.children)===I)for(var d,c=0;d=a.children[c];c++)j(d);else a.children.tag&&j(a.children)}function k(a,b,c){var d=a.childNodes[b];if(d){var e=1!=d.nodeType,f=D.createElement("span");e?(a.insertBefore(f,d||null),f.insertAdjacentHTML("beforebegin",c),a.removeChild(f)):d.insertAdjacentHTML("beforebegin",c)}else a.insertAdjacentHTML("beforeend",c);for(var g=[];a.childNodes[b]!==d;)g.push(a.childNodes[b]),b++;return g}function l(a,b){return function(c){c=c||event,e.redraw.strategy("diff"),e.startComputation();try{return a.call(b,c)}finally{eb()}}}function m(a){var b=S.indexOf(a);return 0>b?S.push(a)-1:b}function n(a){var b=function(){return arguments.length&&(a=arguments[0]),a};return b.toJSON=function(){return a},b}function o(a,b){var c=function(){return(a.controller||P).apply(this,b)||this},d=function(c){return arguments.length>1&&(b=b.concat([].slice.call(arguments,1))),a.view.apply(a,b?[c].concat(b):[c])};d.$original=a.view;var e={controller:c,view:d};return b[0]&&null!=b[0].key&&(e.attrs={key:b[0].key}),e}function p(){$&&($(),$=null);for(var a,b=0;a=V[b];b++)if(X[b]){var c=W[b].controller&&W[b].controller.$$args?[X[b]].concat(W[b].controller.$$args):[X[b]];e.render(a,W[b].view?W[b].view(X[b],c):"")}_&&(_(),_=null),Y=null,Z=new Date,e.redraw.strategy("diff")}function q(a){return a.slice(hb[e.route.mode].length)}function r(a,b,c){fb={};var d=c.indexOf("?");-1!==d&&(fb=v(c.substr(d+1,c.length)),c=c.substr(0,d));var f=Object.keys(b),g=f.indexOf(c);if(-1!==g)return e.mount(a,b[f[g]]),!0;for(var h in b){if(h===c)return e.mount(a,b[h]),!0;var i=new RegExp("^"+h.replace(/:[^\/]+?\.{3}/g,"(.*?)").replace(/:[^\/]+/g,"([^\\/]+)")+"/?$");if(i.test(c))return c.replace(i,function(){for(var c=h.match(/:[^\/]+/g)||[],d=[].slice.call(arguments,1,-2),f=0,g=c.length;g>f;f++)fb[c[f].replace(/:|\./g,"")]=decodeURIComponent(d[f]);e.mount(a,b[h])}),!0}}function s(a){if(a=a||event,!a.ctrlKey&&!a.metaKey&&2!==a.which){a.preventDefault?a.preventDefault():a.returnValue=!1;for(var b=a.currentTarget||a.srcElement,c="pathname"===e.route.mode&&b.search?v(b.search.slice(1)):{};b&&"A"!=b.nodeName.toUpperCase();)b=b.parentNode;e.route(b[e.route.mode].slice(hb[e.route.mode].length),c)}}function t(){"hash"!=e.route.mode&&E.hash?E.hash=E.hash:b.scrollTo(0,0)}function u(a,b){var d={},e=[];for(var f in a){var g=b?b+"["+f+"]":f,h=a[f],i=L.call(h),j=null===h?encodeURIComponent(g):i===H?u(h,g):i===I?h.reduce(function(a,b){return d[g]||(d[g]={}),d[g][b]?a:(d[g][b]=!0,a.concat(encodeURIComponent(g)+"="+encodeURIComponent(b)))},[]).join("&"):encodeURIComponent(g)+"="+encodeURIComponent(h);h!==c&&e.push(j)}return e.join("&")}function v(a){"?"===a.charAt(0)&&(a=a.substring(1));for(var b=a.split("&"),c={},d=0,e=b.length;e>d;d++){var f=b[d].split("="),g=decodeURIComponent(f[0]),h=2==f.length?decodeURIComponent(f[1]):null;null!=c[g]?(L.call(c[g])!==I&&(c[g]=[c[g]]),c[g].push(h)):c[g]=h}return c}function w(a){var b=m(a);i(a.childNodes,T[b]),T[b]=c}function x(a,b){var c=e.prop(b);return a.then(c),c.then=function(c,d){return x(a.then(c,d),b)},c}function y(a,b){function c(a){l=a||j,n.map(function(a){l===i&&a.resolve(m)||a.reject(m)})}function d(a,b,c,d){if((null!=m&&L.call(m)===H||typeof m===K)&&typeof a===K)try{var f=0;a.call(m,function(a){f++||(m=a,b())},function(a){f++||(m=a,c())})}catch(g){e.deferred.onerror(g),m=g,c()}else d()}function f(){var j;try{j=m&&m.then}catch(n){return e.deferred.onerror(n),m=n,l=h,f()}d(j,function(){l=g,f()},function(){l=h,f()},function(){try{l===g&&typeof a===K?m=a(m):l===h&&"function"==typeof b&&(m=b(m),l=g)}catch(f){return e.deferred.onerror(f),m=f,c()}m===k?(m=TypeError(),c()):d(j,function(){c(i)},c,function(){c(l===g&&i)})})}var g=1,h=2,i=3,j=4,k=this,l=0,m=0,n=[];k.promise={},k.resolve=function(a){return l||(m=a,l=g,f()),this},k.reject=function(a){return l||(m=a,l=h,f()),this},k.promise.then=function(a,b){var c=new y(a,b);return l===i?c.resolve(m):l===j?c.reject(m):n.push(c),c.promise}}function z(a){return a}function A(a){if(!a.dataType||"jsonp"!==a.dataType.toLowerCase()){var d=new b.XMLHttpRequest;if(d.open(a.method,a.url,!0,a.user,a.password),d.onreadystatechange=function(){4===d.readyState&&(d.status>=200&&d.status<300?a.onload({type:"load",target:d}):a.onerror({type:"error",target:d}))},a.serialize===JSON.stringify&&a.data&&"GET"!==a.method&&d.setRequestHeader("Content-Type","application/json; charset=utf-8"),a.deserialize===JSON.parse&&d.setRequestHeader("Accept","application/json, text/*"),typeof a.config===K){var e=a.config(d,a);null!=e&&(d=e)}var f="GET"!==a.method&&a.data?a.data:"";if(f&&L.call(f)!=J&&f.constructor!=b.FormData)throw"Request data should be either be a string or FormData. Check the `serialize` option in `m.request`";return d.send(f),d}var g="mithril_callback_"+(new Date).getTime()+"_"+Math.round(1e16*Math.random()).toString(36),h=D.createElement("script");b[g]=function(d){h.parentNode.removeChild(h),a.onload({type:"load",target:{responseText:d}}),b[g]=c},h.onerror=function(){return h.parentNode.removeChild(h),a.onerror({type:"error",target:{status:500,responseText:JSON.stringify({error:"Error making jsonp request"})}}),b[g]=c,!1},h.onload=function(){return!1},h.src=a.url+(a.url.indexOf("?")>0?"&":"?")+(a.callbackKey?a.callbackKey:"callback")+"="+g+"&"+u(a.data||{}),D.body.appendChild(h)}function B(a,b,c){if("GET"===a.method&&"jsonp"!=a.dataType){var d=a.url.indexOf("?")<0?"?":"&",e=u(b);a.url=a.url+(e?d+e:"")}else a.data=c(b);return a}function C(a,b){var c=a.match(/:[a-z]\w+/gi);if(c&&b)for(var d=0;d<c.length;d++){var e=c[d].slice(1);a=a.replace(c[d],b[e]),delete b[e]}return a}var D,E,F,G,H="[object Object]",I="[object Array]",J="[object String]",K="function",L={}.toString,M=/(?:(^|#|\.)([^#\.\[\]]+))|(\[.+?\])/g,N=/\[(.+?)(?:=("|'|)(.*?)\2)?\]/,O=/^(AREA|BASE|BR|COL|COMMAND|EMBED|HR|IMG|INPUT|KEYGEN|LINK|META|PARAM|SOURCE|TRACK|WBR)$/,P=function(){};d(b);var Q,R={appendChild:function(a){Q===c&&(Q=D.createElement("html")),D.documentElement&&D.documentElement!==a?D.replaceChild(a,D.documentElement):D.appendChild(a),this.childNodes=D.childNodes},insertBefore:function(a){this.appendChild(a)},childNodes:[]},S=[],T={};e.render=function(a,b,d){var e=[];if(!a)throw new Error("Ensure the DOM element being passed to m.route/m.mount/m.render is not undefined.");var g=m(a),h=a===D,j=h||a===D.documentElement?R:a;h&&"html"!=b.tag&&(b={tag:"html",attrs:{},children:b}),T[g]===c&&i(j.childNodes),d===!0&&w(a),T[g]=f(j,null,c,c,b,T[g],!1,0,null,c,e);for(var k=0,l=e.length;l>k;k++)e[k]()},e.trust=function(a){return a=new String(a),a.$trusted=!0,a},e.prop=function(a){return(null!=a&&L.call(a)===H||typeof a===K)&&typeof a.then===K?x(a):n(a)};var U,V=[],W=[],X=[],Y=null,Z=0,$=null,_=null,ab=[],bb=16;e.component=function(a){return o(a,[].slice.call(arguments,1))},e.mount=e.module=function(a,b){if(!a)throw new Error("Please ensure the DOM element exists before rendering a template into it.");var c=V.indexOf(a);0>c&&(c=V.length);for(var d,f=!1,g={preventDefault:function(){f=!0,$=_=null}},h=0;d=ab[h];h++)d.handler.call(d.controller,g),d.controller.onunload=null;if(f)for(var d,h=0;d=ab[h];h++)d.controller.onunload=d.handler;else ab=[];if(X[c]&&typeof X[c].onunload===K&&X[c].onunload(g),!f){e.redraw.strategy("all"),e.startComputation(),V[c]=a,arguments.length>2&&(b=subcomponent(b,[].slice.call(arguments,2)));var i=U=b=b||{controller:function(){}},j=b.controller||P,k=new j;return i===U&&(X[c]=k,W[c]=b),eb(),X[c]}};var cb=!1;e.redraw=function(a){cb||(cb=!0,Y&&a!==!0?(F===b.requestAnimationFrame||new Date-Z>bb)&&(Y>0&&G(Y),Y=F(p,bb)):(p(),Y=F(function(){Y=null},bb)),cb=!1)},e.redraw.strategy=e.prop();var db=0;e.startComputation=function(){db++},e.endComputation=function(){db=Math.max(db-1,0),0===db&&e.redraw()};var eb=function(){"none"==e.redraw.strategy()?(db--,e.redraw.strategy("diff")):e.endComputation()};e.withAttr=function(a,b){return function(c){c=c||event;var d=c.currentTarget||this;b(a in d?d[a]:d.getAttribute(a))}};var fb,gb,hb={pathname:"",hash:"#",search:"?"},ib=P,jb=!1;return e.route=function(){if(0===arguments.length)return gb;if(3===arguments.length&&L.call(arguments[1])===J){var a=arguments[0],c=arguments[1],d=arguments[2];ib=function(b){var f=gb=q(b);if(!r(a,d,f)){if(jb)throw new Error("Ensure the default route matches one of the routes defined in m.route");jb=!0,e.route(c,!0),jb=!1}};var f="hash"===e.route.mode?"onhashchange":"onpopstate";b[f]=function(){var a=E[e.route.mode];"pathname"===e.route.mode&&(a+=E.search),gb!=q(a)&&ib(a)},$=t,b[f]()}else if(arguments[0].addEventListener||arguments[0].attachEvent){var g=arguments[0],h=(arguments[1],arguments[2],arguments[3]);g.href=("pathname"!==e.route.mode?E.pathname:"")+hb[e.route.mode]+h.attrs.href,g.addEventListener?(g.removeEventListener("click",s),g.addEventListener("click",s)):(g.detachEvent("onclick",s),g.attachEvent("onclick",s))}else if(L.call(arguments[0])===J){var i=gb;gb=arguments[0];var j=arguments[1]||{},k=gb.indexOf("?"),l=k>-1?v(gb.slice(k+1)):{};for(var m in j)l[m]=j[m];var n=u(l),o=k>-1?gb.slice(0,k):gb;n&&(gb=o+(-1===o.indexOf("?")?"?":"&")+n);var p=(3===arguments.length?arguments[2]:arguments[1])===!0||i===arguments[0];b.history.pushState?($=t,_=function(){b.history[p?"replaceState":"pushState"](null,D.title,hb[e.route.mode]+gb)},ib(hb[e.route.mode]+gb)):(E[e.route.mode]=gb,ib(hb[e.route.mode]+gb))}},e.route.param=function(a){if(!fb)throw new Error("You must call m.route(element, defaultRoute, routes) before calling m.route.param()");return fb[a]},e.route.mode="search",e.route.buildQueryString=u,e.route.parseQueryString=v,e.deferred=function(){var a=new y;return a.promise=x(a.promise),a},e.deferred.onerror=function(a){if("[object Error]"===L.call(a)&&!a.constructor.toString().match(/ Error/))throw a},e.sync=function(a){function b(a,b){return function(e){return g[a]=e,b||(c="reject"),0===--f&&(d.promise(g),d[c](g)),e}}var c="resolve",d=e.deferred(),f=a.length,g=new Array(f);if(a.length>0)for(var h=0;h<a.length;h++)a[h].then(b(h,!0),b(h,!1));else d.resolve([]);return d.promise},e.request=function(a){a.background!==!0&&e.startComputation();var b=new y,c=a.dataType&&"jsonp"===a.dataType.toLowerCase(),d=a.serialize=c?z:a.serialize||JSON.stringify,f=a.deserialize=c?z:a.deserialize||JSON.parse,g=c?function(a){return a.responseText}:a.extract||function(a){return 0===a.responseText.length&&f===JSON.parse?null:a.responseText};return a.method=(a.method||"GET").toUpperCase(),a.url=C(a.url,a.data),a=B(a,a.data,d),a.onload=a.onerror=function(c){try{c=c||event;var d=("load"===c.type?a.unwrapSuccess:a.unwrapError)||z,h=d(f(g(c.target,a)),c.target);if("load"===c.type)if(L.call(h)===I&&a.type)for(var i=0;i<h.length;i++)h[i]=new a.type(h[i]);else a.type&&(h=new a.type(h));b["load"===c.type?"resolve":"reject"](h)}catch(c){e.deferred.onerror(c),b.reject(c)}a.background!==!0&&e.endComputation()},A(a),b.promise=x(b.promise,a.initialValue),b.promise},e.deps=function(a){return d(b=a||b),b},e.deps.factory=a,e}("undefined"!=typeof window?window:{});"undefined"!=typeof module&&null!==module&&module.exports?module.exports=m:"function"=="function"&&__webpack_require__(6)&&!(__WEBPACK_AMD_DEFINE_RESULT__ = function(){return m}.call(exports, __webpack_require__, exports, module), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
	//# sourceMappingURL=mithril.min.js.map
	module.exports = m;

	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(5)(module)))

/***/ },
/* 5 */
/***/ function(module, exports) {

	module.exports = function(module) {
		if(!module.webpackPolyfill) {
			module.deprecate = function() {};
			module.paths = [];
			// module.parent = undefined by default
			module.children = [];
			module.webpackPolyfill = 1;
		}
		return module;
	}


/***/ },
/* 6 */
/***/ function(module, exports) {

	/* WEBPACK VAR INJECTION */(function(__webpack_amd_options__) {module.exports = __webpack_amd_options__;

	/* WEBPACK VAR INJECTION */}.call(exports, {}))

/***/ }
/******/ ]);