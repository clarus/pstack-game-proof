const palette = {
  night: "#182a27",
  stone: "#34483c",
  line: "#20362f",
  moss: "#55704a",
  dark: "#11211f",
  gold: "#edc779",
  light: "#ffe3a0",
  robe: "#c9704c",
  cream: "#f1e6c7",
};
export function drawScene(
  canvas: HTMLCanvasElement,
  room: number,
  complete: boolean,
) {
  const c = canvas.getContext("2d")!;
  canvas.width = 640;
  canvas.height = 240;
  c.imageSmoothingEnabled = false;
  const rect = (x: number, y: number, w: number, h: number, color: string) => {
    c.fillStyle = color;
    c.fillRect(x, y, w, h);
  };
  rect(0, 0, 640, 240, palette.night);
  for (let y = 0; y < 196; y += 28)
    for (let x = -32; x < 640; x += 64) {
      const offset = ((y / 28) % 2) * 32;
      rect(
        x + offset + 1,
        y + 1,
        61,
        25,
        (x + y) % 3 === 0 ? "#3b4e40" : palette.stone,
      );
      rect(x + offset + 4, y + 23, 55, 3, palette.line);
    }
  for (let x = 0; x < 640; x += 32) {
    rect(x, 196, 30, 44, "#293f35");
    rect(x + 2, 199, 27, 2, "#455b44");
  }
  for (const x of [56, 548]) {
    rect(x, 14, 36, 180, "#4b5d47");
    rect(x - 5, 14, 46, 14, "#687454");
    rect(x - 5, 182, 46, 14, "#687454");
    rect(x + 5, 30, 7, 148, "#5a6c4d");
  }
  // A stepped arch and deliberately hard pixel edges.
  rect(265, 56, 112, 140, "#6e7652");
  rect(277, 40, 88, 156, "#6e7652");
  rect(289, 29, 64, 167, "#6e7652");
  rect(281, 62, 80, 134, complete ? "#a8bb73" : palette.dark);
  rect(293, 48, 56, 148, complete ? "#b9cf86" : palette.dark);
  if (complete) {
    for (let i = 0; i < 6; i++)
      rect(289 + i * 11, 80 + i * 13, 4, 4, palette.light);
  } else {
    for (let x = 289; x < 355; x += 17) rect(x, 67, 2, 129, "#34413a");
    rect(337, 129, 7, 7, palette.gold);
  }
  for (const x of [197, 421]) {
    rect(x, 91, 5, 28, "#8c6146");
    rect(x - 5, 76, 15, 18, "#d2854e");
    rect(x - 2, 71, 9, 17, palette.gold);
    rect(x, 76, 4, 9, palette.light);
    rect(x - 20, 66, 3, 3, "#a3834e");
  }
  // Pip, the small hooded keeper.
  rect(126, 146, 24, 35, palette.robe);
  rect(121, 155, 34, 25, palette.robe);
  rect(128, 137, 20, 20, palette.robe);
  rect(132, 144, 13, 10, palette.cream);
  rect(136, 147, 3, 3, palette.dark);
  rect(143, 147, 3, 3, palette.dark);
  rect(124, 181, 12, 7, palette.dark);
  rect(141, 181, 12, 7, palette.dark);
  rect(153, 156, 5, 32, "#a17c54");
  rect(151, 151, 9, 8, palette.gold);
  // Evidence chest and its unconsumed tokens.
  rect(463, 163, 42, 28, "#835b40");
  rect(460, 159, 48, 10, "#ac7e50");
  rect(480, 166, 7, 12, palette.gold);
  for (let i = 0; i < Math.min(room, 7); i++) {
    rect(18 + i * 9, 215, 5, 5, complete ? palette.gold : palette.moss);
  }
  for (const [x, y] of [
    [82, 188],
    [389, 190],
    [570, 189],
    [226, 194],
  ]) {
    rect(x, y, 12, 4, palette.moss);
    rect(x + 4, y - 5, 3, 8, palette.moss);
  }
}
