var Dictionary = require('./map');
var m = require('./mithril.min');
var sb = {};

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
    vm.color = m.prop("blue");
    vm.showColors = m.prop(false);
    vm.playerHash = "";
    vm.colorLookup = ["", " one", " two", " three", " four", " five", " six", " seven", " eight"];
    vm.CSS_COLOR_NAMES = ["AliceBlue", "AntiqueWhite", "Aqua", "Aquamarine", "Azure", "Beige", "Bisque", "Black", "BlanchedAlmond", "Blue", "BlueViolet", "Brown", "BurlyWood", "CadetBlue", "Chartreuse", "Chocolate", "Coral", "CornflowerBlue", "Cornsilk", "Crimson", "Cyan", "DarkBlue", "DarkCyan", "DarkGoldenRod", "DarkGray", "DarkGrey", "DarkGreen", "DarkKhaki", "DarkMagenta", "DarkOliveGreen", "Darkorange", "DarkOrchid", "DarkRed", "DarkSalmon", "DarkSeaGreen", "DarkSlateBlue", "DarkSlateGray", "DarkSlateGrey", "DarkTurquoise", "DarkViolet", "DeepPink", "DeepSkyBlue", "DimGray", "DimGrey", "DodgerBlue", "FireBrick", "FloralWhite", "ForestGreen", "Fuchsia", "Gainsboro", "GhostWhite", "Gold", "GoldenRod", "Gray", "Grey", "Green", "GreenYellow", "HoneyDew", "HotPink", "IndianRed", "Indigo", "Ivory", "Khaki", "Lavender", "LavenderBlush", "LawnGreen", "LemonChiffon", "LightBlue", "LightCoral", "LightCyan", "LightGoldenRodYellow", "LightGray", "LightGrey", "LightGreen", "LightPink", "LightSalmon", "LightSeaGreen", "LightSkyBlue", "LightSlateGray", "LightSlateGrey", "LightSteelBlue", "LightYellow", "Lime", "LimeGreen", "Linen", "Magenta", "Maroon", "MediumAquaMarine", "MediumBlue", "MediumOrchid", "MediumPurple", "MediumSeaGreen", "MediumSlateBlue", "MediumSpringGreen", "MediumTurquoise", "MediumVioletRed", "MidnightBlue", "MintCream", "MistyRose", "Moccasin", "NavajoWhite", "Navy", "OldLace", "Olive", "OliveDrab", "Orange", "OrangeRed", "Orchid", "PaleGoldenRod", "PaleGreen", "PaleTurquoise", "PaleVioletRed", "PapayaWhip", "PeachPuff", "Peru", "Pink", "Plum", "PowderBlue", "Purple", "Red", "RosyBrown", "RoyalBlue", "SaddleBrown", "Salmon", "SandyBrown", "SeaGreen", "SeaShell", "Sienna", "Silver", "SkyBlue", "SlateBlue", "SlateGray", "SlateGrey", "Snow", "SpringGreen", "SteelBlue", "Tan", "Teal", "Thistle", "Tomato", "Turquoise", "Violet", "Wheat", "White", "WhiteSmoke", "Yellow", "YellowGreen"];


    vm.updatePlayer = function (update) {
      var players = [].concat(update).forEach(function(player){
        vm.players.add(player.Hash, player);
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

      if (!isConnected){
        return;
      }

      var index = e.target.getAttribute("value")|0;
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
                fontSize:"1.2em"
              }
            }),
            m("label",{class:"mdl-textfield__label"},"name")
          ]),
          m("div",{
            onclick:ctrl.toggleColors,
            style:{
              width:"100%",
              border: sb.vm.showColors() ? "" : "1px solid black",
              backgroundColor: sb.vm.showColors() ? "rgba(0,0,0,0.0)" : "white",
              padding:"5px"

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
            })) : "Pick your color  \u25bc"
          ]),
          m("select", {
            onchange: m.withAttr("value", sb.vm.color),
            value: sb.vm.color()
          }, sb.vm.CSS_COLOR_NAMES.map(function(color) {
              return m('option', { 'value': color }, color);
          })),
          m("button[type=button]",{
            onclick:ctrl.updateSettings,
            class:"mdl-button mdl-js-button mdl-button--raised mdl-js-ripple-effect mdl-button--accent"
          },"update")


        ]),
        m("ul",
        [
          sb.vm.players.getEnumerator().map(function(player){
            return m("li", player.Name + "  " + player.Points);
          })
        ])
      ])

    ]),

    m("div",[
      sb.vm.players.getEnumerator().filter(function(player){
        return player.Hash != sb.vm.playerHash;
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
