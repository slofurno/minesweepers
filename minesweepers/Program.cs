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

namespace minesweepers
{
  class Program
  {

    static BufferBlock<PlayerState> inputs;
    static BufferBlock<Square[]> changedSquares;
    static BufferBlock<string> sendQueue;
    static List<Websocket> connections;
    

    static void Main(string[] args)
    {
      connections = new List<Websocket>();
      sendQueue = new BufferBlock<string>();
      changedSquares = new BufferBlock<Square[]>();
      inputs = new BufferBlock<PlayerState>();


      Init().Wait();

    }

    static async Task Init()
    {
      Task.Run(() => StartGame());
      await Listen();
    }

    static async Task StartGame()
    {

      var game = new Sweeper(changedSquares);

      Task.Run(async () =>
       {
         while (true)
         {
           PlayerState next = await inputs.ReceiveAsync();
           await game.Update(next);
         }
       });

      Task.Run(async () =>
      {
        while (true)
        {
          Square[] changed = await changedSquares.ReceiveAsync();
          var json = JSON.Serialize<Square[]>(changed);
          await sendQueue.SendAsync(json);
        }
      });

      Task.Run(async () =>
      {
        while (true)
        {
          var next = await sendQueue.ReceiveAsync();

          foreach (var conn in connections)
          {
            await conn.WriteFrame(next);
          }

        }
      });


    }
    

    static async Task Listen()
    {
      var listener = new TcpListener(IPAddress.Parse("127.0.0.1"), 5678);
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
      connections.Add(ws);

      var player = new Player();
      string next;

      while ((next = await ws.ReadFrame()) != null)
      {
        if (string.IsNullOrEmpty(next))
        {
          var what = "sdgfsd";
        }
        else
        {
          var update = JSON.Deserialize<PlayerState>(next);
          await sendQueue.SendAsync(next);
        }

  
      }


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
      string path;

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

      var ws = await Upgrader.Upgrade(rw, headers);
      ProcessWebSocket(ws);


    }
  }
}
