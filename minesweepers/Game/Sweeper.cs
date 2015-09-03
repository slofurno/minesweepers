using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Threading.Tasks.Dataflow;

namespace minesweepers.Game
{
  public class Sweeper
  {
    private Dictionary<String, PlayerState> players;
    private Square[,] squares;
    private int width;
    private int height;
    private List<Square> changedSquares;
    private BufferBlock<Square[]> _bbs;

    public Sweeper(BufferBlock<Square[]> bbs)
    {
      _bbs = bbs;
      changedSquares = new List<Square>();

      var rng = new Random();

      width = 60;
      height = 40;
      players = new Dictionary<string, PlayerState>();
      squares = new Square[width,height];

      for (var i = 0; i < width; i++)
      {
        for (var j = 0; j < height; j++)
        {
          squares[i, j] = new Square();

          if (rng.Next(100) > 8)
          {
            squares[i,j].Mined = true;
          }
        }
      }

      for (var i = 0; i < width; i++)
      {
        for (var j = 0; j < height; j++)
        {
          squares[i, j].Neighbors = CalculateNeighbors(i, j);
        }
      }

    }

    public async Task Update(PlayerState state)
    {
      PlayerState prev;

      if (!players.TryGetValue(state.Hash, out prev))
      {
        //init player
        return;

      }

      if (prev.Clicked != false && state.Clicked != true)
      {
        //didnt click
        return;
      }

      int localx = state.X / 20;
      int localy = state.Y / 20;

      var square = squares[localx,localy];

      if (state.IsRightClick)
      {
        if (square.Mined)
        {
          square.Flagged = true;
          square.Owner = state.Hash;
          changedSquares.Add(square);

        }
        else
        {
          square.Revealed = true;
          //tried to flag not bomb
          state.Dead = true;

        }
      }
      else
      {
        if (square.Mined)
        {
          //clicked bomb
          state.Dead = true;
          square.Revealed = true;
        }
        else
        {
          Reveal(localx, localy);
        }
      }

      if (changedSquares.Count > 0)
      {
        await _bbs.SendAsync(changedSquares.ToArray());
        changedSquares.Clear();
      }

    }

    public void Reveal(int x, int y)
    {
      var square = squares[x, y];
      if (square.Revealed)
      {
        return;
      }
      square.Revealed = true;
      changedSquares.Add(square);

      if (square.Neighbors != 0)
      {
        return;
      }

      for (int i = -1; i <= 1; i++)
      {
        for (int j = -1; j <= 1; j++)
        {
          var newx = i + x;
          var newy = j + y;

          if (!(i == 0 && j == 0) && (newx >= 0 && newx < width && newy >= 0 && newy < height))
          {
            Reveal(newx, newy);
          }
        }
      }
    }

    public int CalculateNeighbors(int x, int y)
    {

      var neighbors = 0;

      for (int i = -1; i <= 1; i++)
      {
        for (int j = -1; j <= 1; j++)
        {
          var realx = i + x;
          var realy = j + y;

          if (!(i == 0 && j == 0) && (realx >= 0 && realx < width && realy >= 0 && realy < height))
          {
            if (squares[realx, realy].Mined)
            {
              neighbors++;
            }
          }
        }
      }

      return neighbors;
    }

  }
}
