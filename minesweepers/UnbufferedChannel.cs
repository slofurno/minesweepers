using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace minesweepers
{
  public class UnbufferedChannel
  {
    TaskCompletionSource<bool> writeTask;
    TaskCompletionSource<bool> readTask;

    public UnbufferedChannel()
    {
      writeTask = new TaskCompletionSource<bool>();
      readTask = new TaskCompletionSource<bool>();
    }

    public async Task PostAsync(bool b)
    {
      readTask.TrySetResult(b);
      await writeTask.Task;
    }

    public async Task<bool> ReceiveAsync()
    {

      var result = await readTask.Task;
      writeTask.TrySetResult(true);
      return result;

    }

  }

  public class CloseChannel
  {
    TaskCompletionSource<bool> closed;
    public CloseChannel()
    {
      closed = new TaskCompletionSource<bool>();
    }

    public void Close()
    {
      closed.TrySetResult(true);
    }

    public Task<bool> WaitCloseAsync()
    {
      return closed.Task;
    }
  }
}
