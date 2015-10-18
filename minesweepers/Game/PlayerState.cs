using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace minesweepers
{
  public class PlayerState
  {
    public string Hash { get; set; }
    public string Color { get; set; }
    public int X { get; set; }
    public int Y { get; set; }
    public bool Clicked { get; set; }
    public bool IsRightClick { get; set; }
    public bool Dead { get; set; }
    public int Points { get; set; }
    public string Name { get; set; }
    public int Init { get; set; }

  }

  public class PlayerInit
  {
    public string Hash { get; set; }
    public int Width { get; set; }
    public int Height { get; set; }
  }

  public class PlayerCommand
  {
    public string Type { get; set; }
    public string RawCommand { get; set; }
  }

  public class RevealCommand
  {
    public int Index { get; set; }
  }

  public class FlagCommand
  {
    public int Index { get; set; }
  }

  public class MoveCommand
  {
    public int X { get; set; }
    public int Y { get; set; }
  }

  public class SettingsCommand
  {
    public string Name { get; set; }
    public string Color { get; set; }
  }

 


}
