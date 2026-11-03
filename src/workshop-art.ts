import { environmentFor } from "./environments.ts";

export function drawWorkshop(
  canvas: HTMLCanvasElement,
  station: number,
  complete: boolean,
  restored: boolean[],
  compact = false,
) {
  const room = environmentFor(`W0${station}`);
  const w = compact ? 160 : 640,
    h = compact ? 160 : 240;
  canvas.width = w;
  canvas.height = h;
  const c = canvas.getContext("2d")!;
  c.imageSmoothingEnabled = false;
  const rect = (
    x: number,
    y: number,
    width: number,
    height: number,
    color: string,
  ) => {
    c.fillStyle = color;
    c.fillRect(x, y, width, height);
  };
  const wood = "#9c704b",
    brass = "#d3ac6c",
    paper = "#f1dfae",
    ink = "#344a44";
  const palettes = [
    "#596455",
    "#64705a",
    "#64584d",
    "#486369",
    "#5f6252",
    "#625f76",
  ];
  rect(0, 0, w, h, palettes[station - 1]);
  const floor = compact ? 128 : 198;
  for (let x = 0; x < w; x += 54) rect(x, 0, 4, floor, "#78806a");
  for (let x = compact ? 12 : 36; x < w - 50; x += compact ? 170 : 170) {
    rect(x, 12, compact ? 35 : 64, compact ? 50 : 76, wood);
    rect(x + 5, 17, compact ? 25 : 54, compact ? 40 : 66, "#b9d3bb");
    rect(x + (compact ? 16 : 30), 15, 4, compact ? 44 : 68, brass);
    rect(x + 4, compact ? 36 : 48, compact ? 27 : 56, 4, brass);
  }
  rect(0, floor, w, h - floor, "#65513c");
  for (let x = 0; x < w; x += 34) rect(x, floor + 5, 29, 3, wood);
  if (!compact) {
    for (let x = 40; x < 230; x += 55) {
      rect(x, 144, 39, 45, wood);
      rect(x + 6, 150, 27, 3, brass);
    }
    rect(32, 132, 215, 12, brass);
    for (let i = 0; i < 6; i++)
      rect(280 + i * 27, 14, 18, 10, restored[i] ? room.accent : "#384a43");
  }
  c.save();
  c.translate(compact ? 65 : 350, compact ? 47 : 40);
  c.scale(compact ? 1 : 2, compact ? 1 : 2);
  if (station === 1) {
    rect(5, 0, 10, 75, wood);
    rect(61, 0, 10, 75, wood);
    rect(5, 0, 66, 10, brass);
    rect(32, 8, 10, complete ? 36 : 20, ink);
    rect(22, complete ? 40 : 24, 30, 9, brass);
    rect(14, 63, 50, 10, wood);
    rect(20, 55, 40, 8, paper);
    if (complete) {
      rect(37, 56, 5, 4, "#4b7958");
      rect(42, 53, 4, 6, "#4b7958");
    }
  } else if (station === 2) {
    rect(0, 64, 76, 10, brass);
    rect(7, 74, 9, 10, wood);
    rect(60, 74, 9, 10, wood);
    rect(17, 35, 43, 27, wood);
    rect(15, complete ? 32 : 18, 47, 7, brass);
    rect(33, 31, 9, 31, complete ? room.accent : "#c39771");
    if (!complete) {
      rect(20, 26, 14, 12, paper);
      rect(43, 26, 14, 12, paper);
    } else {
      rect(30, 39, 16, 12, paper);
      rect(36, 43, 5, 5, "#4b7958");
    }
  } else if (station === 3) {
    rect(4, 2, 68, 80, wood);
    rect(10, 8, 56, 68, ink);
    for (let y = 20; y < 74; y += 24) {
      rect(12, y, 52, 4, brass);
      rect(16, y - 12, 16, 12, paper);
      rect(44, y - 12, 16, 12, paper);
    }
    if (!complete) {
      rect(7, 6, 30, 72, "#b18a5e");
      rect(39, 6, 30, 72, "#b18a5e");
      rect(34, 39, 10, 12, brass);
    } else {
      rect(0, 10, 7, 65, brass);
      rect(70, 10, 7, 65, brass);
    }
  } else if (station === 4) {
    rect(13, 19, 50, 48, ink);
    rect(8, 67, 62, 13, brass);
    for (const x of [4, 61]) {
      rect(x, 32, 13, 22, wood);
      rect(x + 4, 24, 5, 38, brass);
    }
    rect(23, 27, 30, 27, complete ? "#b9d3bb" : "#6c8584");
    rect(31, 31, 14, 19, complete ? "#e9c779" : "#344a44");
    for (let i = 0; i < 3; i++)
      rect(22 + i * 13, 59, 7, 4, complete ? room.accent : wood);
  } else if (station === 5) {
    rect(7, 0, 63, 80, brass);
    rect(15, 9, 47, 71, complete ? "#b9d3bb" : ink);
    if (!complete) {
      for (let x = 20; x < 61; x += 10) rect(x, 11, 3, 69, wood);
      rect(43, 42, 10, 13, brass);
    } else {
      rect(15, 12, 8, 68, wood);
      rect(25, 69, 37, 5, paper);
    }
    rect(-8, 48, 15, 20, wood);
    rect(-5, 51, 10, 14, paper);
  } else {
    rect(0, 53, 78, 12, brass);
    rect(6, 65, 9, 19, wood);
    rect(64, 65, 9, 19, wood);
    for (const x of [7, 31, 55]) {
      rect(x, complete ? 24 : 35, 18, complete ? 29 : 18, paper);
      rect(x + 4, complete ? 30 : 40, 10, 3, complete ? "#558665" : wood);
    }
    rect(28, 1, 25, 12, complete ? room.accent : ink);
    rect(37, 13, 7, 11, brass);
  }
  c.restore();
  const px = compact ? (complete ? 38 : 19) : complete ? 284 : 250,
    py = compact ? 102 : 149;
  rect(px + 4, py, 20, 21, "#e5b681");
  rect(px, py - 3, 28, 8, "#b77947");
  rect(px + 3, py + 20, 24, 23, "#bc7049");
  rect(px + 6, py + 43, 7, 10, ink);
  rect(px + 19, py + 43, 7, 10, ink);
  rect(px + 18, py + 9, 3, 4, ink);
  rect(px + 27, py + 24, 9, 12, complete ? paper : room.accent);
  if (compact)
    for (let i = 0; i < 6; i++)
      rect(8 + i * 25, 4, 18, 5, restored[i] ? room.accent : ink);
}
