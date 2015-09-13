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
}
