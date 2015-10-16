
function updateSquare(update) {

  update.forEach(function (square) {

    if (square.Owner != null) {
      sb.vm.addSquare(square);
    }

    var el = mines[square.Index];

    if (square.Flagged) {
      el.innerHTML = "⚐";
      el.style.color = Colors[square.Owner];
      console.log("color", Colors[square.Owner]);
    } else if (square.Mined && square.Revealed) {
      el.className += " pressed mined";
      el.innerHTML = "💣";
    } else if (square.Revealed) {

      el.className += " pressed";
      var neighbors = square.Neighbors;

      if (square.Neighbors > 0) {
        el.innerHTML = "" + neighbors;
        el.className += cnl[neighbors];
      }
    } else {
      el.className = "mine-square";
      el.innerHTML = "";
    }
  });
}
