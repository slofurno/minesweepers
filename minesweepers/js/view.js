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
    vm.colorLookup = ["", " one", " two", " three", " four", " five", " six", " seven", " eight"];

    vm.updatePlayer = function (player) {
      vm.players.add(player.Hash, player);
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



  //  vm.updatePlayer({ Name: "steve", Hash: "asdf" });


  };

  return vm;
}());


sb.controller = function () {
  sb.vm.init();

  var ws = new WebSocket("ws://"+window.location.hostname+":5678/ws");
  ws.onopen = function (e) {
    //isConnected = true;
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
      myHash=data;
    }

    m.endComputation();

  };

  return{
    clickMine:function(e){
      m.redraw.strategy("none");
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


      console.log(index, type);
      e.preventDefault();
    },
    mouseMove:function(e){
      var coord = {X:e.clientX, Y:e.clientY};
      var innerjson = JSON.stringify(coord);

      var update = {Type:"move",RawCommand:innerjson};
      var json = JSON.stringify(update);
      m.redraw.strategy("none");

      ws.send(json);
      console.log(e);
    }
  };


};

sb.view = function (ctrl) {
  return m("div", [

      m("div", {
        class: "minefield",
        onmousedown:ctrl.clickMine,
        onmousemove:ctrl.mouseMove
      }, [
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
          if (square.Neighbors > 0) {
            body = "" + neighbors;
            color = sb.vm.colorLookup[neighbors];
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

      m("div",{class:"options-menu"},[
        m("table", [

        sb.vm.players.getEnumerator().map(function (player) {
            return m("tr", [
            m("td", player.Name),
            m("td", sb.vm.squares.getEnumerator().filter(function (square) {
              return square.Owner == player.Hash;
            }).length)
          ]);
        })

      ])
    ]),

    m("div",[
      sb.vm.players.getEnumerator().map(function (player) {
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
