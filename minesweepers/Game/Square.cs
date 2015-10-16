using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace minesweepers.Game
{
  public class Square
  {
    public bool Mined { get; set; }
    public bool Revealed { get; set; }
    public bool Flagged { get; set; }
    public string Owner { get; set; }
    public int Neighbors { get; set; }
    public int Index { get; set; }

  }

  public class SquareDTO
  {
    public bool Mined { get; set; }
    public bool Revealed { get; set; }
    public bool Flagged { get; set; }
    public string Owner { get; set; }
    public int Neighbors { get; set; }
    public int Index { get; set; }

    public SquareDTO()
    {

    }

    public SquareDTO(Square square)
    {
      Index = square.Index;
      Revealed = square.Revealed;
      if (Revealed)
      {
        Owner = square.Owner;
        Mined = square.Mined;
        Flagged = square.Flagged;
        Neighbors = square.Neighbors;
      }

    }
  }

}
