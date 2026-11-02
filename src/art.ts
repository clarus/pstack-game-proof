// Original, integer-coordinate scenery. Proof state never depends on drawing.
export function drawScene(
  canvas: HTMLCanvasElement,
  room: number,
  complete: boolean,
  lit: boolean[] = [],
) {
  const c = canvas.getContext("2d")!;
  canvas.width = 640;
  canvas.height = 240;
  c.imageSmoothingEnabled = false;
  const rect = (x: number, y: number, w: number, h: number, color: string) => {
    c.fillStyle = color;
    c.fillRect(x, y, w, h);
  };
  const line = (points: number[][], color: string, width = 3) => {
    c.strokeStyle = color;
    c.lineWidth = width;
    c.beginPath();
    points.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y)));
    c.stroke();
  };
  const wall = (stone: string, seam: string) => {
    rect(0, 0, 640, 240, seam);
    for (let y = 0; y < 200; y += 28)
      for (let x = -32; x < 640; x += 64) {
        const offset = ((y / 28) % 2) * 32;
        rect(x + offset + 1, y + 1, 61, 25, stone);
        rect(x + offset + 5, y + 22, 52, 3, seam);
      }
  };
  const floor = (color = "#293f35") => {
    rect(0, 198, 640, 42, color);
    for (let x = 0; x < 640; x += 36) rect(x, 201, 32, 2, "#63705a");
  };
  const arch = (
    x: number,
    y: number,
    w: number,
    h: number,
    stone: string,
    inside: string,
  ) => {
    rect(x + 12, y, w - 24, h, stone);
    rect(x, y + 18, w, h - 18, stone);
    rect(x + 12, y + 30, w - 24, h - 30, inside);
    rect(x + 24, y + 13, w - 48, h - 13, inside);
  };
  const lantern = (x: number, y: number, on: boolean) => {
    rect(x + 6, y - 8, 4, 8, "#a89974");
    rect(x, y, 16, 22, "#a89974");
    rect(x + 3, y + 3, 10, 16, on ? "#ffdc82" : "#233a36");
    if (on) {
      rect(x + 6, y + 5, 4, 11, "#fff1c0");
      rect(x - 6, y + 7, 3, 3, "#c9a66c");
      rect(x + 20, y + 7, 3, 3, "#c9a66c");
    }
  };
  const pip = (x: number, y: number, mirror = false) => {
    const robe = mirror ? "#9582ab" : "#c9704c";
    rect(x + 5, y + 10, 24, 35, robe);
    rect(x, y + 19, 34, 25, robe);
    rect(x + 7, y, 20, 20, robe);
    rect(x + 11, y + 7, 13, 10, "#f1e6c7");
    rect(x + 15, y + 10, 3, 3, "#182a27");
    rect(x + 22, y + 10, 3, 3, "#182a27");
    rect(x + 3, y + 44, 12, 7, "#11211f");
    rect(x + 20, y + 44, 12, 7, "#11211f");
    rect(x + 32, y + 19, 4, 32, "#a17c54");
    rect(x + 30, y + 14, 9, 8, "#edc779");
  };
  const chest = (x: number, y: number, open: boolean) => {
    rect(x, y + 18, 72, 36, "#77513c");
    rect(x + 7, y + 26, 58, 20, "#9f704a");
    rect(x - 4, y + (open ? 0 : 14), 80, 12, "#c49760");
    rect(x + 32, y + 24, 9, 16, "#edc779");
    if (open) {
      rect(x + 9, y + 8, 22, 20, "#b8cea4");
      rect(x + 42, y + 8, 22, 20, "#edc779");
    }
  };
  const stars = () => {
    for (const [x, y] of [
      [30, 34],
      [91, 64],
      [180, 24],
      [365, 47],
      [520, 31],
      [601, 78],
    ])
      rect(x, y, 3, 3, "#b8c8b7");
  };
  if (room === 1) {
    rect(0, 0, 640, 240, "#203a39");
    stars();
    for (const [x, h] of [
      [18, 110],
      [87, 137],
      [163, 96],
    ]) {
      rect(x, 190 - h, 11, h, "#3c5947");
      for (let j = 0; j < 3; j++)
        rect(x - 26 + j * 5, 58 + j * 28, 65 - j * 10, 16, "#304d40");
    }
    rect(255, 46, 340, 153, "#465447");
    for (let y = 54; y < 196; y += 25)
      for (let x = 263; x < 590; x += 52) rect(x, y, 46, 20, "#53634f");
    arch(390, 43, 120, 155, "#8a8960", complete ? "#d4cc8b" : "#132a29");
    if (!complete) {
      for (let x = 414; x < 486; x += 14) rect(x, 80, 4, 118, "#4c5c47");
      rect(451, 128, 12, 12, "#edc779");
    }
    floor();
    for (let i = 0; i < 4; i++)
      rect(350 - i * 18, 198 + i * 9, 180 + i * 36, 8, "#71765a");
    rect(230, 165, 37, 34, "#778267");
    rect(222, 157, 53, 10, "#9b9b74");
    rect(244, 143, 10, 14, "#edc779");
    pip(133, 147);
    lantern(346, 100, complete);
  } else if (room === 2) {
    wall("#4b4035", "#302e29");
    floor("#483d31");
    for (const x of [35, 215]) {
      rect(x, 38, 130, 150, "#292c26");
      for (let y = 72; y <= 172; y += 50) {
        rect(x - 5, y, 140, 8, "#a37a50");
        for (let i = 0; i < 3; i++) {
          rect(x + 12 + i * 38, y - 27, 27, 25, i % 2 ? "#8b6945" : "#6e7b56");
          rect(x + 22 + i * 38, y - 21, 6, 9, "#c4aa73");
        }
      }
    }
    chest(298, 141, complete);
    arch(490, 64, 90, 134, "#927e58", complete ? "#b2bd83" : "#202922");
    for (let i = 0; i < 4; i++) {
      rect(391 + i * 18, 64, 4, 65, "#a3a58a");
      rect(386 + i * 18, 69, 14, 8, "#d1bd87");
    }
    pip(154, 147);
    lantern(449, 111, complete);
  } else if (room === 3) {
    wall("#304a50", "#193439");
    rect(0, 118, 640, 122, "#142d39");
    for (let y = 140; y < 239; y += 19)
      for (let x = 8; x < 640; x += 73)
        rect(x + (y % 3) * 7, y, 34, 2, "#3a6670");
    for (const x of [31, 540]) arch(x, 12, 68, 125, "#4b6b6d", "#172e37");
    rect(0, 188, 182, 52, "#536365");
    rect(458, 188, 182, 52, "#536365");
    line(
      [
        [142, 66],
        [207, 106],
        [256, 120],
      ],
      "#9a9b7a",
      4,
    );
    line(
      [
        [499, 66],
        [435, 106],
        [384, 120],
      ],
      "#9a9b7a",
      4,
    );
    for (const x of [162, 454]) {
      rect(x, 157, 24, 34, "#7a8d7e");
      rect(x + 7, 165, 10, 12, complete ? "#e9d591" : "#374d50");
    }
    if (complete) {
      for (let x = 182; x < 458; x += 24) rect(x, 184, 22, 12, "#b3a27a");
      line(
        [
          [181, 169],
          [459, 169],
        ],
        "#9fa88b",
        3,
      );
    } else {
      for (const x of [182, 410]) rect(x, 184, 48, 12, "#827a61");
    }
    pip(102, 138);
    lantern(493, 143, complete);
  } else if (room === 4) {
    wall("#4b4538", "#2c322b");
    floor("#454738");
    const gear = (x: number, y: number, r: number, color: string) => {
      for (let i = 0; i < 12; i++) {
        const a = ((i + (complete ? 0.5 : 0)) * Math.PI) / 6;
        rect(
          Math.round(x + Math.cos(a) * r) - 7,
          Math.round(y + Math.sin(a) * r) - 7,
          14,
          14,
          color,
        );
      }
      c.fillStyle = color;
      c.beginPath();
      c.arc(x, y, r - 2, 0, Math.PI * 2);
      c.fill();
      rect(x - 12, y - 12, 24, 24, "#303c32");
      rect(x - 4, y - 4, 8, 8, "#d2bf88");
    };
    line(
      [
        [50, 45],
        [50, 125],
        [230, 125],
        [230, 61],
        [440, 61],
        [440, 184],
      ],
      "#81917a",
      12,
    );
    gear(228, 114, 48, "#b39764");
    gear(311, 146, 35, "#8b9d79");
    gear(379, 105, 43, "#c4ab76");
    rect(448, 143, 90, 54, "#59694b");
    for (let i = 0; i < 3; i++)
      rect(461 + i * 23, 155, 12, 24, complete ? "#d5d59a" : "#283a30");
    rect(43, 169, 86, 29, "#7d6850");
    pip(140, 147);
    lantern(564, 116, complete);
  } else if (room === 5) {
    rect(0, 0, 640, 240, "#63867b");
    rect(0, 0, 640, 65, "#8ca69a");
    rect(462, 25, 34, 34, "#d7ce9c");
    rect(0, 85, 640, 115, "#46604b");
    for (let x = 0; x < 640; x += 47) rect(x, 85, 35, 18, "#728264");
    arch(218, 57, 112, 143, "#9b9c71", "#263e38");
    arch(402, 57, 112, 143, "#9b9c71", complete ? "#d0d39a" : "#263e38");
    for (const x of [15, 190, 350, 547, 609])
      for (let y = 65; y < 207; y += 17) {
        rect(x + (y % 2) * 7, y, 7, 17, "#7c9b59");
        rect(x - 8, y + 4, 15, 5, "#abc17a");
      }
    floor("#5c7250");
    for (let i = 0; i < 6; i++)
      rect(251 + i * 29, 218 - i * 3, 26, 5, "#9eaa7a");
    rect(315, 166, 65, 26, "#76815b");
    rect(332, 155, 30, 11, "#adb186");
    pip(114, 147);
    lantern(365, 111, complete);
  } else if (room === 6) {
    wall("#464358", "#282b3c");
    floor("#45475c");
    for (const x of [168, 384]) {
      arch(x, 32, 112, 166, "#9e96b2", complete ? "#b5c6b7" : "#69788d");
      line(
        [
          [x + 24, 67],
          [x + 77, 171],
        ],
        "#c3c7d2",
        3,
      );
      line(
        [
          [x + 36, 60],
          [x + 84, 148],
        ],
        "#8f9eaf",
        2,
      );
      pip(x + 35, 135, true);
      rect(x + 12, 187, 88, 9, "#77708d");
    }
    for (let x = 10; x < 640; x += 64)
      line(
        [
          [x, 234],
          [x + 33, 204],
          [x + 65, 234],
        ],
        "#677085",
        2,
      );
    rect(310, 68, 27, 109, "#5f5c77");
    rect(316, 81, 15, 78, complete ? "#e6d8aa" : "#b2a4cb");
    pip(64, 147);
    lantern(559, 100, complete);
  } else if (room === 7) {
    const allLit = complete && lit.length === 7 && lit.every(Boolean);
    rect(0, 0, 640, 240, allLit ? "#b6b794" : "#3c5050");
    rect(228, 18, 184, 183, allLit ? "#d8c996" : "#718477");
    if (complete) {
      rect(244, 50, 150, 135, allLit ? "#f6dfaa" : "#b3ba91");
      rect(293, 63, 42, 42, "#f3db9c");
      for (const x of [257, 342]) {
        rect(x, 127, 38, 50, "#8b9274");
        rect(x + 9, 111, 20, 16, "#8b9274");
        rect(x + 13, 139, 10, 15, "#e4d1a0");
      }
    } else {
      rect(243, 49, 154, 153, "#283f39");
      for (let x = 255; x < 392; x += 20) rect(x, 54, 5, 146, "#78876d");
      rect(310, 128, 18, 18, "#d6bd7c");
    }
    for (const x of [177, 414]) {
      rect(x, 29, 48, 181, "#89906e");
      rect(x - 8, 23, 64, 16, "#b0ac7e");
    }
    for (let i = 0; i < 7; i++) lantern(127 + i * 62, 15, Boolean(lit[i]));
    for (let i = 0; i < 5; i++)
      rect(
        200 - i * 25,
        197 + i * 9,
        240 + i * 50,
        8,
        i % 2 ? "#a3a180" : "#8a9477",
      );
    pip(74, 147);
  } else {
    throw new Error("Unknown dungeon scene");
  }
}
