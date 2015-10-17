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
    Task Process(GamePointer gamepointer);
  }


  class UpdateTask : GameTask
  {
    private BufferBlock<UpdatePacket> _sendChannel;
    private PlayerState _player;
    private dynamic _command;

    public UpdateTask(dynamic command, PlayerState player, BufferBlock<UpdatePacket> sendChannel)
    {
      _sendChannel = sendChannel;
      _player = player;
      _command = command;
    }

    public async Task Process(GamePointer gp)
    {
      if (_player.Dead)
      {
        return;
      }

      List<Square> changedSquares = gp.Game.Update(_command, _player);
      if (changedSquares.Count > 0)
      {
        var json = JSON.Serialize<Square[]>(changedSquares.ToArray());
        var packet = new UpdatePacket()
        {
          Type = "square",
          Data = json
        };
        await _sendChannel.SendAsync(packet);
      }

      var player = JSON.Serialize<PlayerState>(_player);
      var pp = new UpdatePacket()
      {
        Type = "player",
        Data = player
      };
      await _sendChannel.SendAsync(pp);
    }
  }

  class InitTask : GameTask
  {
    private UserConnection _uc;
    private Dictionary<string, PlayerState> _players;
    private PlayerState _player;

    public InitTask(UserConnection uc, PlayerState player, Dictionary<string,PlayerState> players)
    {
      _uc = uc;
      _player = player;
      _players = players;
    }

    public async Task Process(GamePointer gp)
    {

      _players.Add(_player.Hash, _player);

      var squares = gp.Game.GetSquares().Select(x => new SquareDTO(x)).ToArray();

      var json = JSON.Serialize<SquareDTO[]>(squares);
      var packet = new UpdatePacket()
      {
        Type = "square",
        Data = json
      };

      var j = JSON.Serialize<UpdatePacket>(packet);
      await _uc.SendAsync(j);

      var players = _players.Values.ToArray();

      var json2 = JSON.Serialize<PlayerState[]>(players);
      var packet2 = new UpdatePacket()
      {
        Type = "player",
        Data = json2
      };

      var j2 = JSON.Serialize<UpdatePacket>(packet2);

      await _uc.SendAsync(j2);
    }

  }
}
