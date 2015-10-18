using cs_websocket;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Threading.Tasks.Dataflow;

namespace minesweepers
{
  class UserConnection
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
