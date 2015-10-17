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
    /*
    public async Task Run(BufferBlock<PlayerState> playerInputs, BufferBlock<Square[]> squareChanges, BufferBlock<PlayerState> playerChanges)
    {

      var remainingSquares = width * height;

      while (remainingSquares > 0)
      {
        PlayerState input = await playerInputs.ReceiveAsync();
        Square[] changedSquares = await Update(input);

        if (changedSquares.Length > 0)
        {
          await squareChanges.SendAsync(changedSquares);
        }

        await playerChanges.SendAsync(input);
      }
    }
    */
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
        //clicked bomb
        player.Dead = true;
        square.Revealed = true;
        changed.Add(square);
      }
      else
      {
        //index = y * width + x
        int y = command.Index / width;
        int x = command.Index % width;
        var revealed = Reveal(x, y);
        changed.AddRange(revealed);
      }

      return changed;

    }
    /*
    public async Task<Square[]> Update(PlayerState update)
    {
      PlayerState state;
      List<Square> changedSquares = new List<Square>();

      Action annoymousClosure = () =>
      {

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

        var square = squares[localx, localy];

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
            LiveBombs -= 1;

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
            var revealed = Reveal(localx, localy);
            changedSquares.AddRange(revealed);
          }
        }

        update.Points = state.Points;

      };

      annoymousClosure();
      return changedSquares.ToArray();

      var cs = changedSquares.Count;

      if (cs > 0)
      {
        return changedSquares.ToArray();
      }

      return null;
   
    }

  **/

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
      //changedSquares.Add(square);

      if (square.Neighbors != 0)
      {
        yield break;
        //return;
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
