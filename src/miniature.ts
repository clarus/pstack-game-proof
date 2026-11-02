import { environmentFor } from "./environments.ts";

// Portrait compositions keep Pip and each room's landmark legible in a card.
export function drawMiniature(
  canvas: HTMLCanvasElement,
  room: number,
  complete: boolean,
  lit: boolean[] = [],
) {
  canvas.width = 160;
  canvas.height = 160;
  const c = canvas.getContext("2d")!;
  c.imageSmoothingEnabled = false;
  const accent = environmentFor(`D0${room}`).accent;
  const rect = (x: number, y: number, w: number, h: number, color: string) => {
    c.fillStyle = color;
    c.fillRect(x, y, w, h);
  };
  const arch = (x: number, y: number, w: number, h: number, open: boolean) => {
    rect(x + 6, y, w - 12, h, "#8a8960");
    rect(x, y + 8, w, h - 8, "#8a8960");
    rect(x + 7, y + 12, w - 14, h - 12, open ? "#e9c77a" : "#14251f");
    if (!open)
      for (let dx = 12; dx < w - 8; dx += 10)
        rect(x + dx, y + 14, 3, h - 14, "#53634f");
  };
  const lantern = (x: number, y: number, on: boolean) => {
    if (on) rect(x - 5, y - 4, 22, 28, "#786a3e");
    rect(x + 3, y - 5, 6, 6, "#c3a56a");
    rect(x, y, 12, 18, "#bca26a");
    rect(x + 3, y + 3, 6, 12, on ? "#ffe5a0" : "#22362f");
  };
  rect(
    0,
    0,
    160,
    160,
    [
      "#2b4842",
      "#433b31",
      "#244652",
      "#4a4034",
      "#496b50",
      "#393b55",
      "#40514b",
    ][room - 1],
  );
  for (let y = 10; y < 122; y += 22)
    for (let x = y % 44 ? -15 : 6; x < 160; x += 38)
      rect(x, y, 32, 17, room === 6 ? "#4a4965" : "#53604d");
  rect(0, 125, 160, 35, "#344436");
  for (let x = 0; x < 160; x += 27) rect(x, 131, 22, 3, "#6e7858");

  if (room === 1) {
    arch(77, 37, 62, 88, complete);
    rect(12, 12, 9, 112, "#294333");
    rect(0, 18, 40, 18, "#35533b");
    rect(4, 49, 30, 14, "#35533b");
  } else if (room === 2) {
    for (const y of [35, 65]) {
      rect(13, y, 132, 6, "#a17c54");
      for (const x of [24, 49, 99, 124]) rect(x, y - 17, 13, 17, "#b7b48a");
    }
    rect(72, 100, 66, 25, "#9f704a");
    rect(68, complete ? 80 : 94, 74, 9, "#d3ad70");
    if (complete) {
      rect(80, 91, 16, 16, "#b8cea4");
      rect(110, 91, 16, 16, "#edc779");
    }
    rect(100, 105, 8, 14, "#edc779");
  } else if (room === 3) {
    rect(43, 94, 117, 66, "#163442");
    for (let y = 108; y < 160; y += 14) rect(60, y, 75, 3, "#467483");
    arch(105, 25, 42, 69, complete);
    for (let x = 43; x < (complete ? 145 : 69); x += 18)
      rect(x, 115 - Math.floor((x - 43) / 18) * 4, 16, 9, "#b3ab78");
  } else if (room === 4) {
    for (const [x, y] of [
      [79, 58],
      [119, 87],
    ]) {
      rect(x - 24, y - 8, 48, 16, "#b08c56");
      rect(x - 8, y - 24, 16, 48, "#b08c56");
      rect(x - 16, y - 16, 32, 32, complete ? "#eec182" : "#8d794c");
      rect(x - 5, y - 5, 10, 10, "#3c4335");
    }
    rect(63, 117, 82, 8, complete ? "#eec182" : "#66674d");
  } else if (room === 5) {
    rect(0, 0, 160, 25, "#8ca69a");
    arch(17, 46, 50, 79, false);
    arch(91, 46, 50, 79, complete);
    for (const x of [6, 58, 142]) rect(x, 21, 8, 85, "#759055");
  } else if (room === 6) {
    for (const x of [60, 110]) {
      rect(x, 37, 36, 86, "#aa98ba");
      rect(x + 5, 43, 26, 74, complete ? "#d5d5b9" : "#687490");
      rect(x + 12, 69, 12, 29, "#aaa1b5");
      rect(x + 8, 52, 4, 16, "#d8d8e2");
    }
  } else {
    arch(72, 44, 65, 81, complete);
    for (let i = 0; i < 7; i++) lantern(9 + i * 21, 16, Boolean(lit[i]));
    for (let i = 0; i < 4; i++)
      rect(63 - i * 7, 125 + i * 8, 80 + i * 12, 6, "#999d75");
  }
  if (room !== 7) lantern(43, 53, complete);
  // Pip holds a reusable seal; solving a room moves him toward its exit.
  const px = complete ? 55 : 23;
  rect(px + 4, 99, 20, 20, "#e5b681");
  rect(px, 96, 28, 9, "#b77947");
  rect(px + 3, 118, 24, 23, "#bc7049");
  rect(px + 6, 141, 7, 11, "#202e26");
  rect(px + 19, 141, 7, 11, "#202e26");
  rect(px + 18, 108, 3, 4, "#26362b");
  rect(px + 27, 123, 8, 8, accent);
}
