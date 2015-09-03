using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace minesweepers.Game
{
  public class Player
  {
    public string name { get; set; }
    public string color { get; set; }
    public int x { get; set; }
    public int y { get; set; }
    public bool clicked { get; set; }

  }
}
