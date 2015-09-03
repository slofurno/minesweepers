using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace minesweepers.Game
{
  public class SquareState
  {
    public int X { get; set; }
    public int Y { get; set; }
    public bool Mined { get; set; }
    public bool Revealed { get; set; }
    public string Owner { get; set; }

  }
}
