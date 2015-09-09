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

    static BufferBlock<PlayerState> _playerInputs;
    static BufferBlock<Square[]> _changedSquares;
    static BufferBlock<UpdatePacket> _sendQueue;
    static List<Websocket> _connections;
    static SemaphoreSlim _connectionLock;
    static BufferBlock<PlayerState> _changedPlayers;
    static Sweeper _game;
    

    static void Main(string[] args)
    {
      _connections = new List<Websocket>();
      _sendQueue = new BufferBlock<UpdatePacket>();
      _changedSquares = new BufferBlock<Square[]>();
      _changedPlayers = new BufferBlock<PlayerState>();
      _playerInputs = new BufferBlock<PlayerState>();
      _connectionLock = new SemaphoreSlim(1);
      

      Init().Wait();

    }

    static async Task Init()
    {
      Task.Run(() => StartGame());
      await Listen();
    }

    static async Task RunGame(BufferBlock<PlayerState> playerInputs, BufferBlock<Square[]> changedSquares, BufferBlock<PlayerState> changedPlayers)
    {
      while (true)
      {
        _game = new Sweeper();
        await _game.Run(playerInputs, changedSquares, changedPlayers);
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

    static async Task StartGame()
    {

      Task.Run(()=>RunGame(_playerInputs,_changedSquares,_changedPlayers));

      Task.Run(()=>SerializeChangedSquares(_changedSquares,_sendQueue));

      Task.Run(()=>SerializeStateChanges(_changedPlayers,_sendQueue));

      Task.Run(async () =>
      {
        while (true)
        {
          var next = await _sendQueue.ReceiveAsync();
          var json = JSON.Serialize<UpdatePacket>(next);

          await _connectionLock.WaitAsync();
          foreach (var conn in _connections)
          {
            await conn.WriteFrame(json);
          }
          _connectionLock.Release();

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
        //context.Request.InputStream

      }

    }

    static async Task ProcessWebSocket(Websocket ws)
    {
      await _connectionLock.WaitAsync();
      _connections.Add(ws);
      _connectionLock.Release();

      string next;
      var squares = _game.GetSquares();

      var json = JSON.Serialize<Square[]>(squares);
      var packet = new UpdatePacket()
      {
        Type = "square",
        Data = json
      };

      var j = JSON.Serialize<UpdatePacket>(packet);
      await ws.WriteFrame(j);

      while ((next = await ws.ReadFrame()) != null)
      {
        if (string.IsNullOrEmpty(next))
        {
          var what = "sdgfsd";
        }
        else
        {
          var update = JSON.Deserialize<PlayerState>(next);
          await _playerInputs.SendAsync(update);
          /*
          var packet = new UpdatePacket()
          {
            Type = "player",
            Data = next
          };
          await sendQueue.SendAsync(packet);
           * */
        }

  
      }

      await _connectionLock.WaitAsync();
      _connections.Remove(ws);
      _connectionLock.Release();

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
          Action asdf = () =>
          {
            var triple = next.Split(' ');
            if (triple.Length != 3)
            {
              //quest not in method, path, http form
              return;
            }

            var qs = triple[1].Split('?');
            if (qs.Length >0 && qs[0].Length>0)
            {
              path = qs[0].Substring(1).ToLower();
            }
            if (qs.Length != 2)
            {
              //no query string
              return;
            }

            var kvps = qs[1].Split('&');
            foreach (var kvp in kvps)
            {
              var split = kvp.Split('=');
              if (split.Length == 2)
              {
                queryStrings[split[0]] = split[1];
              }
            }
          };

          asdf();
        }
        count++;
      }

      switch (path)
      {
        case "ws":
          var ws = await Upgrader.Upgrade(rw, headers);
          await ProcessWebSocket(ws);
          break;
        case "":
          string RESPONSE = "HTTP/1.1 200 OK\r\nContent-Length: {0}\r\nContent-Type: {1}; charset=UTF-8\r\nServer: Example\r\nDate: Wed, 17 Apr 2013 12:00:00 GMT\r\n\r\n{2}";
          var body = File.ReadAllText("index.html");
          await writer.WriteAsync(string.Format(RESPONSE, body.Length, "text/html", body));
          break;
        default:
          break;
      }

      rw.Close();




    }
  }
}
