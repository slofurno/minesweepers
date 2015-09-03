using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace minesweepers.Game
{
  public class Sweeper
  {
    private Dictionary<String,Player> players;
    private Square[] squares;
    private int width;
    private int height;

    public Sweeper()
    {
      width = 60;
      height = 40;
      players = new Dictionary<string, Player>();
      squares = new Square[width * height];

    }

    public void Update(PlayerState state)
    {

    }



  }
}
