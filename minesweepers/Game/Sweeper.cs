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
    private BufferBlock<PlayerState> _bbp;

    public Sweeper(BufferBlock<Square[]> bbs,BufferBlock<PlayerState>bbp)
    {
      _bbs = bbs;
      _bbp = bbp;
      changedSquares = new List<Square>();

      var rng = new Random();

      width = 30;
      height = 20;
      players = new Dictionary<string, PlayerState>();
      squares = new Square[width,height];

      var index = 0;

      for (var j = 0; j < height; j++)
      {
        for (var i = 0; i < width; i++)
        {
          squares[i, j] = new Square();
          squares[i, j].Index = index;
          index++;

          if (rng.Next(100) > 85)
          {
            squares[i, j].Mined = true;
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

    public async Task Update(PlayerState update)
    {
      PlayerState state;

      if (!players.TryGetValue(update.Hash, out state))
      {
        players.Add(update.Hash, update);
        return;

      }

      update.Points = state.Points;

      if (state.Dead)
      {
        return;
      }


      if (state.Clicked == true || update.Clicked == false)
      {
        //didnt click
        return;
      }

      int localx = update.X / 26;
      int localy = update.Y / 26;

      if (!(localx >= 0 && localy >= 0 && localx < width && localy < height))
      {
        return;
      }

      var square = squares[localx,localy];

      if (square.Revealed || square.Flagged)
      {
        return;
      }

      if (update.IsRightClick)
      {
        if (square.Mined)
        {
          square.Flagged = true;
          square.Owner = update.Hash;
          changedSquares.Add(square);
          state.Points++;
          

        }
        else
        {
          //square.Revealed = true;
          //tried to flag not bomb
          state.Dead = true;
          update.Dead = true;

        }
      }
      else
      {
        if (square.Mined)
        {
          //clicked bomb
          state.Dead = true;
          update.Dead = true;
          square.Revealed = true;
          changedSquares.Add(square);
        }
        else
        {
          Reveal(localx, localy);
        }
      }

      update.Points = state.Points;

      if (changedSquares.Count > 0)
      {
        await _bbs.SendAsync(changedSquares.ToArray());
        changedSquares.Clear();
      }

    }

    public Square[] GetSquares()
    {

      var s = new List<Square>();

      for (int j = 0; j < height; j++)
      {
        for (int i = 0; i < width; i++)
        {
          s.Add(squares[i, j]);
        }
      }

      return s.ToArray();
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
