using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using minesweepers.Game;
using System.Threading;
using System.Threading.Tasks.Dataflow;
using cs_websocket;

namespace minesweepers
{
  public class ConnectionHub
  {
    public List<UserConnection> Connections { get; set; }
    private SemaphoreSlim Lock;

    public ConnectionHub()
    {
      Connections = new List<UserConnection>();
      Lock = new SemaphoreSlim(1);
    }

    public async Task Broadcast(String update)
    {
      await Lock.WaitAsync();

      try
      {
        foreach (var conn in Connections)
        {
          await conn.SendAsync(update);
        }
        /*
        for (var i = Connections.Count-1; i >= 0; i--)
        {
          var conn = Connections[i];
          if (conn.Alive)
          {
            await conn.Queue.SendAsync(update);
          }
          else
          {
            Connections.RemoveAt(i);
          }
        }
         * */
      }
      finally
      {
        Lock.Release();
      }
    }

    public async Task Add(UserConnection conn)
    {
      try
      {
        await Lock.WaitAsync();
        Connections.Add(conn);
      }
      finally
      {
        Lock.Release();
      }
    }

    public async Task Remove(UserConnection conn)
    {
      try
      {
        await Lock.WaitAsync();
        Connections.Remove(conn);
      }
      finally
      {
        Lock.Release();
      }
    }

  }

  public class UserConnection
  {
    private Websocket _ws;
    private BufferBlock<String> _queue;
    public bool Closed { get; set; }

    public UserConnection(Websocket websocket)
    {
      _ws = websocket;
      _queue = new BufferBlock<String>();
    }

    public Task<bool> SendAsync(string str)
    {
      return _queue.SendAsync(str);
    }

    public async Task Worker()
    {
      while (true)
      {
        var packet = await _queue.ReceiveAsync();
        if (Closed)
        {
          return;
        }
        await _ws.WriteFrame(packet);
      }
    }

  }

}
