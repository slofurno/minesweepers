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
    private Square[] _squares;
    private int width;
    private int height;
    private int _remainingSquares;
    public int LiveBombs { get; set; }

    public Sweeper()
    {
      var rng = new Random();

      width = 30;
      height = 20;
      _squares = new Square[width * height];
      _remainingSquares = width * height;
      LiveBombs = 0;

      for (int i = 0; i < width*height; i++)
      {
        _squares[i] = new Square() { Index = i };
        if (rng.Next(100) > 85)
        {
          LiveBombs += 1;
          _squares[i].Mined = true;
        }
      }


      for (var i = 0; i < width; i++)
      {
        for (var j = 0; j < height; j++)
        {
          var index = j * width + i;
          _squares[index].Neighbors = CalculateNeighbors(i, j);
        }
      }

    }
   
    public List<Square> Update(FlagCommand command, PlayerState player)
    {
      var square = _squares[command.Index];
      var changed = new List<Square>();

      if (square.Revealed || square.Flagged)
      {

      }
      else if (square.Mined)
      {
        square.Flagged = true;
        square.Revealed = true;
        square.Owner = player.Hash;
        changed.Add(square);
        player.Points++;
        LiveBombs--;
      }
      else
      {
        player.Dead = true;
      }

      return changed;
    }

    public List<Square> Update(SettingsCommand command, PlayerState player)
    {
      player.Color = command.Color;
      player.Name = command.Name;
      return new List<Square>();
    }

    public List<Square> Update(MoveCommand command, PlayerState player)
    {
      player.X = command.X;
      player.Y = command.Y;

      return new List<Square>();
    }

    public List<Square> Update(RevealCommand command, PlayerState player)
    {
      var square = _squares[command.Index];
      var changed = new List<Square>();


      if (square.Revealed || square.Flagged)
      {
        
      }
      else if (square.Mined)
      {
        player.Dead = true;
        square.Revealed = true;
        changed.Add(square);
      }
      else
      {
        int y = command.Index / width;
        int x = command.Index % width;
        var revealed = Reveal(x, y);
        changed.AddRange(revealed);
      }

      return changed;
    }

    public Square[] GetSquares()
    {
      return _squares.ToArray();
    }

    public IEnumerable<Square> Reveal(int x, int y)
    {
      var index = y * width + x;
      var square = _squares[index];
      if (square.Revealed)
      {
        yield break;
      }
      square.Revealed = true;
      yield return square;

      if (square.Neighbors != 0)
      {
        yield break;
      }

      for (int i = -1; i <= 1; i++)
      {
        for (int j = -1; j <= 1; j++)
        {
          var newx = i + x;
          var newy = j + y;

          if (!(i == 0 && j == 0) && (newx >= 0 && newx < width && newy >= 0 && newy < height))
          {

            var revealed = Reveal(newx, newy);

            foreach (var sqr in revealed)
            {
              yield return sqr;
            }
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
            var index = realy * width + realx;

            if (_squares[index].Mined)
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
