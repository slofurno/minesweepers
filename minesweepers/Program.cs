using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Sockets;
using System.Text;
using System.Threading.Tasks;
using cs_websocket;
using System.IO;
using System.Collections.Concurrent;
using System.Threading.Tasks.Dataflow;

using minesweepers.Game;
using Jil;
using System.Threading;

namespace minesweepers
{
  class Program
  {

    static BufferBlock<PlayerCommand> _playerInputs;
    static BufferBlock<Square[]> _changedSquares;
    static BufferBlock<UpdatePacket> _sendQueue;

    static BufferBlock<PlayerState> _changedPlayers;
    static BufferBlock<Func<GamePointer,Task>>_taskQueue;

    static ConnectionHub _connectionHub;
    static Dictionary<string, PlayerState> _players;
    

    static void Main(string[] args)
    {
      _sendQueue = new BufferBlock<UpdatePacket>();
      _changedSquares = new BufferBlock<Square[]>();
      _changedPlayers = new BufferBlock<PlayerState>();
      _playerInputs = new BufferBlock<PlayerCommand>();
      _connectionHub = new ConnectionHub();
      _taskQueue = new BufferBlock<Func<GamePointer, Task>>();
      _players = new Dictionary<string, PlayerState>();

      Init().Wait();

    }

    static async Task Init()
    {
      Task.Run(() => StartGame());
      await Listen();
    }

    static async Task RunGameTasks()
    {
      var gp = new GamePointer();
      gp.Game = new Sweeper();

      while (true)
      {
        var task = await _taskQueue.ReceiveAsync();
        await task(gp);
     
      }
    }

    static async Task SerializeChangedSquares(BufferBlock<Square[]> changedSquares, BufferBlock<UpdatePacket> sendQueue)
    {
      while (true)
      {
        Square[] changed = await changedSquares.ReceiveAsync();
        var json = JSON.Serialize<Square[]>(changed);
        var packet = new UpdatePacket()
        {
          Type = "square",
          Data = json
        };
        await sendQueue.SendAsync(packet);
      }
    }

    static async Task SerializeStateChanges(BufferBlock<PlayerState>changedPlayers,BufferBlock<UpdatePacket>sendQueue)
    {
      while (true)
      {
        var changed = await changedPlayers.ReceiveAsync();
        var json = JSON.Serialize<PlayerState>(changed);
        var packet = new UpdatePacket()
        {
          Type = "player",
          Data = json
        };
        await sendQueue.SendAsync(packet);
      }
    }

    static async Task PushUpdates(BufferBlock<UpdatePacket> sendQueue)
    {
      while (true)
      {
        var next = await sendQueue.ReceiveAsync();
        var json = JSON.Serialize<UpdatePacket>(next);

        await _connectionHub.Broadcast(json);
        /*
        await _connectionLock.WaitAsync();
        foreach (var conn in _connections)
        {
          await conn.WriteFrame(json);
        }
        _connectionLock.Release();
        */
      }
    }

    static dynamic ParseCommand(PlayerCommand command)
    {
      switch (command.Type)
      {
        case "flag":
          return JSON.Deserialize<FlagCommand>(command.RawCommand);
        case "reveal":
          return JSON.Deserialize<RevealCommand>(command.RawCommand);
        case "move":
          return JSON.Deserialize<MoveCommand>(command.RawCommand);
        default:
          return null;
      }
    }

    static async Task StartGame()
    {

      var task1 = Task.Run(()=>RunGameTasks());
      var task2 = Task.Run(()=>SerializeChangedSquares(_changedSquares,_sendQueue));
      var task3 = Task.Run(()=>SerializeStateChanges(_changedPlayers,_sendQueue));
      var task4 = Task.Run(()=>PushUpdates(_sendQueue));
      var task5 = Task.Run(async () =>
      {
        while (true)
        {
          var raw = await _playerInputs.ReceiveAsync();
          PlayerState player;
          if (!_players.TryGetValue(raw.Hash, out player) || player.Dead)
          {
            continue;
          }

          dynamic command = ParseCommand(raw);

          if (command == null)
          {
            continue;
          }

          await _taskQueue.SendAsync(async (gp) =>
          {
            List<Square> changedSquares = gp.Game.Update(command, player);
            if (changedSquares.Count > 0)
            {
              await _changedSquares.SendAsync(changedSquares.ToArray());
            }

            await _changedPlayers.SendAsync(player);

          });

          /*
          switch (raw.Type)
          {
            case "flag":
              var flagCommand = JSON.Deserialize<FlagCommand>(raw.RawCommand);

              break;
            case "reveal":
              var revealCommand = JSON.Deserialize<RevealCommand>(raw.RawCommand);

              break;
            case "move":
              var moveCommand = JSON.Deserialize<MoveCommand>(raw.RawCommand);

              break;
          }
          */


          /*
          dynamic command = ParseCommand(rawcommand);

          await _taskQueue.SendAsync(async (gp) =>
          {
            var changedSquares = await gp.Game.Update(playerInput);
            if (changedSquares.Length > 0)
            {
              await _changedSquares.SendAsync(changedSquares);
            }

            await _changedPlayers.SendAsync(playerInput);

          });
          */

        }

      });



    }
    

    static async Task Listen()
    {
      var listener = new TcpListener(IPAddress.Any, 5678);
      listener.Start();

      while (true)
      {
        var client = await listener.AcceptTcpClientAsync();
        ProcessRequest(client);

      }

    }

    static async Task ProcessWebSocket(Websocket ws)
    {
      var uc = new UserConnection();
      await _connectionHub.Add(uc);
      bool closed = false;
      var hash = Guid.NewGuid().ToString();

      _players.Add(hash, new PlayerState());

      var initPacket = new UpdatePacket() { Type = "init", Data = hash };
      var ip = JSON.Serialize(initPacket);
      await uc.Queue.SendAsync(ip);

      Task.Run(async () =>
      {
        string next;
        while ((next = await ws.ReadFrame()) != null)
        {
          var update = JSON.Deserialize<PlayerCommand>(next);
          update.Hash = hash;
          await _playerInputs.SendAsync(update);
        }

        closed = true;
        await uc.Queue.SendAsync(null);
      });

      

      await _taskQueue.SendAsync(async (gp) =>
      {
        var squares = gp.Game.GetSquares().Select(x => new SquareDTO(x)).ToArray();

        var json = JSON.Serialize<SquareDTO[]>(squares);
        var packet = new UpdatePacket()
        {
          Type = "square",
          Data = json
        };

        var j = JSON.Serialize<UpdatePacket>(packet);
        await uc.Queue.SendAsync(j);

      });

      Func<Task> writeUntilClosed = async () =>
      {
        while (true)
        {
          var packet = await uc.Queue.ReceiveAsync();

          if (closed)
          {
            return;
          }

          await ws.WriteFrame(packet);
        }
      };

      await writeUntilClosed();
      Console.WriteLine("disconnected");
      await _connectionHub.Remove(uc);

    }

    static async Task ProcessRequest(TcpClient client)
    {
      var rw = client.GetStream();

      var reader = new StreamReader(rw);
      var writer = new StreamWriter(rw);
      writer.AutoFlush = true;

      string next;
      var headers = new Dictionary<string, string>();
      var queryStrings = new Dictionary<string, string>();
      string path = "";
      string extension = "";

      var lines = new List<string>();
      var count = 0;

      while ((next = await reader.ReadLineAsync()) != null && next != "")
      {
        if (count > 0)
        {
          var header = next.Split(':');
          headers[header[0]] = header[1].Trim();
        }
        else
        {
          Action parsePath = () =>
          {
            var triple = next.Split(' ');
            if (triple.Length != 3)
            {
              //quest not in method, path, http form
              return;
            }

            var fullPath = triple[1].Split('?');
            if (fullPath.Length >0 && fullPath[0].Length>0)
            {
              path = fullPath[0].Substring(1).ToLower();
            }

            if (path.IndexOf('.') >= -1)
            {
              extension = path.Split('.').Last();
            }

            if (fullPath.Length != 2)
            {
              //no query string
              return;
            }

            var kvps = fullPath[1].Split('&');
            foreach (var kvp in kvps)
            {
              var split = kvp.Split('=');
              if (split.Length == 2)
              {
                queryStrings[split[0]] = split[1];
              }
            }
          };

          parsePath();
        }
        count++;
      }

      var okextensions = new[] { "html", "js", "css" };
      string RESPONSE = "HTTP/1.1 200 OK\r\nContent-Length: {0}\r\nContent-Type: {1}; charset=UTF-8\r\nServer: Example\r\nDate: Wed, 17 Apr 2013 12:00:00 GMT\r\n\r\n{2}";

      switch (path)
      {
        case "ws":
          var ws = await Websocket.Upgrade(rw, headers);
          await ProcessWebSocket(ws);
          break;
        case "":
          
          var body = File.ReadAllText("content/"+"index.html");
          await writer.WriteAsync(string.Format(RESPONSE, body.Length, "text/html", body));
          break;
        default:
          path = "content/" + path;
          if (extension == "html")
          {
            var content = File.ReadAllText(path);
            
            await writer.WriteAsync(string.Format(RESPONSE, content.Length, "text/html", content));
          }
          else if (extension == "js")
          {
            var content = File.ReadAllText(path);
            var bytes = Encoding.UTF8.GetBytes(content);

            await writer.WriteAsync(string.Format(RESPONSE, bytes.Length, "text/javascript", content));
          }
          else if (extension == "css")
          {
            var content = File.ReadAllText(path);
            await writer.WriteAsync(string.Format(RESPONSE, content.Length, "text/css", content));
          }
          else if (extension == "ico")
          {
            var content = File.ReadAllText(path);
            await writer.WriteAsync(string.Format(RESPONSE, content.Length, "image/x-icon", content));
           
          }

          break;
      }

      rw.Close();




    }
  }

  public class GamePointer
  {
    public Sweeper Game { get; set; }
  }
}
