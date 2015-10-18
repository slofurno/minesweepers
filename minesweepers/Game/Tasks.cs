using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Jil;
using System.Threading.Tasks.Dataflow;

namespace minesweepers.Game
{

  interface GameTask
  {
    Task Process(GamePointer gamePointer, List<PlayerState> players, BufferBlock<UpdatePacket> sendChannel);
  }

  //could use a visitor interface for commands rather then dynamic
  class UpdateTask : GameTask
  {
    private PlayerState _player;
    private dynamic _command;

    public UpdateTask(dynamic command, PlayerState player)
    {
      _player = player;
      _command = command;
    }

    public async Task Process(GamePointer gamePointer, List<PlayerState> players, BufferBlock<UpdatePacket> sendChannel)
    {
      if (_player.Dead)
      {
        return;
      }

      List<Square> changedSquares = gamePointer.Game.Update(_command, _player);
      if (changedSquares.Count > 0)
      {
        var json = JSON.Serialize<Square[]>(changedSquares.ToArray());
        var packet = new UpdatePacket()
        {
          Type = "square",
          Data = json
        };
        await sendChannel.SendAsync(packet);
      }

      var player = JSON.Serialize<PlayerState>(_player);
      var pp = new UpdatePacket()
      {
        Type = "player",
        Data = player
      };
      await sendChannel.SendAsync(pp);
    }
  }

  class InitTask : GameTask
  {
    private UserConnection _uc;
    private PlayerState _player;

    public InitTask(UserConnection uc, PlayerState player)
    {
      _uc = uc;
      _player = player;
    }

    public async Task Process(GamePointer gp, List<PlayerState> players, BufferBlock<UpdatePacket> sendChannel)
    {

      players.Add(_player);

      var squares = gp.Game.GetSquares().Select(x => new SquareDTO(x)).ToArray();

      //FIXME: right now the order is important here, lest we lack player color information when rendering flags
      var json2 = JSON.Serialize<PlayerState[]>(players.ToArray());
      var packet2 = new UpdatePacket()
      {
        Type = "player",
        Data = json2
      };
      var j2 = JSON.Serialize<UpdatePacket>(packet2);
      await _uc.SendAsync(j2);


      var json = JSON.Serialize<SquareDTO[]>(squares);
      var packet = new UpdatePacket()
      {
        Type = "square",
        Data = json
      };

      var j = JSON.Serialize<UpdatePacket>(packet);
      await _uc.SendAsync(j);



    }

  }
}
