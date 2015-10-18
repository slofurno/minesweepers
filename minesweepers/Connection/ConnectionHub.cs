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
  class ConnectionHub
  {
    public List<UserConnection> Connections { get; set; }
    private SemaphoreSlim Lock;
    private BufferBlock<string> _channel;

    public ConnectionHub()
    {
      Connections = new List<UserConnection>();
      Lock = new SemaphoreSlim(1);
      _channel = new BufferBlock<string>();
    }

    public Task Broadcast(String update)
    {
      return _channel.SendAsync(update);
    }

    public async Task StartWorker()
    {
      while (true)
      {
        var update = await _channel.ReceiveAsync();
        await Lock.WaitAsync();
        try
        {
          foreach (var conn in Connections)
          {
            await conn.SendAsync(update);
          }
        }
        finally
        {
          Lock.Release();
        }
      }
    }

    public async Task Add(UserConnection conn)
    {
      await Lock.WaitAsync();
      try
      {
        Connections.Add(conn);
      }
      finally
      {
        Lock.Release();
      }
    }

    public async Task Remove(UserConnection conn)
    {
      await Lock.WaitAsync();
      try
      {
        Connections.Remove(conn);
      }
      finally
      {
        Lock.Release();
      }
    }

  }

}
