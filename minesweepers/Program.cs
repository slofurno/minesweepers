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

  class GamePointer
  {
    public Sweeper Game { get; set; }
  }

  class Program
  {

    static void Main(string[] args)
    {
      RunGame().Wait();
    }

    static async Task RunGame()
    {
      var connectionHub = new ConnectionHub();
      var gameTasks = new BufferBlock<GameTask>();
      var sendChannel = new BufferBlock<UpdatePacket>();
      var players = new List<PlayerState>();
      var gp = new GamePointer();
      gp.Game = new Sweeper();

      Task listen = Listen(connectionHub, gameTasks);
      Task hubworker = connectionHub.StartWorker();
      Task pushupdates = PushUpdates(sendChannel, connectionHub);

      while (true)
      {
        var task = await gameTasks.ReceiveAsync();
        await task.Process(gp, players, sendChannel);
      }
    }

    static async Task PushUpdates(BufferBlock<UpdatePacket> sendQueue, ConnectionHub connectionHub)
    {
      while (true)
      {
        var next = await sendQueue.ReceiveAsync();
        var json = JSON.Serialize<UpdatePacket>(next);
        await connectionHub.Broadcast(json);
      }
    }

    static async Task Listen(ConnectionHub connectionHub, BufferBlock<GameTask> gameTasks)
    {
      var listener = new TcpListener(IPAddress.Any, 5678);
      listener.Start();

      while (true)
      {
        var client = await listener.AcceptTcpClientAsync();
        ProcessRequest(client, connectionHub, gameTasks);
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
        case "settings":
          return JSON.Deserialize<SettingsCommand>(command.RawCommand);
        default:
          return null;
      }
    }

    static async Task ReadWebsocket(Websocket ws, BufferBlock<GameTask> gameTasks, UserConnection uc, PlayerState player)
    {
      string next;
      while ((next = await ws.ReadFrame()) != null)
      {
        var update = JSON.Deserialize<PlayerCommand>(next);

        if (player.Dead)
        {
          //this is now checked in two places, but at least dead players won't send move commands to the main work channel
          continue;
        }

        dynamic command = ParseCommand(update);

        if (command == null)
        {
          continue;
        }

        var updatetask = new UpdateTask(command, player);
        await gameTasks.SendAsync(updatetask);
      }

      uc.Closed = true;
      await uc.SendAsync(null);
    }

    static async Task ProcessWebSocket(Websocket ws, ConnectionHub connectionHub, BufferBlock<GameTask> gameTasks)
    {
      var uc = new UserConnection(ws);
      await connectionHub.Add(uc);

      var hash = Guid.NewGuid().ToString();
      var player = new PlayerState() { Name = "player", Color = "blue", Hash = hash };


      var first = new PlayerInit() { Hash = hash, Height = 0, Width = 0 };
      var json = JSON.Serialize(first);

      var initPacket = new UpdatePacket() { Type = "init", Data = json };
      var ip = JSON.Serialize(initPacket);
      await uc.SendAsync(ip);

      ReadWebsocket(ws, gameTasks, uc, player);

      var initTask = new InitTask(uc, player);
      await gameTasks.SendAsync(initTask);

      await uc.Worker();
      Console.WriteLine("disconnected");
      await connectionHub.Remove(uc);
    }

    static async Task ProcessRequest(TcpClient client, ConnectionHub connectionHub, BufferBlock<GameTask> gameTasks)
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
          await ProcessWebSocket(ws, connectionHub, gameTasks);
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


}
