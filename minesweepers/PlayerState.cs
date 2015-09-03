﻿using System;
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

  }
}
