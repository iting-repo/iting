const fs = require("fs");
const path = require("path");
const PptxGenJS = require("pptxgenjs");
const sharp = require("sharp");

const outDir = path.join(__dirname, "..", "outputs", "contractor-value-slide");
fs.mkdirSync(outDir, { recursive: true });

const pptxPath = path.join(outDir, "luong-hoa-gia-tri-nha-thau.pptx");
const previewSvgPath = path.join(outDir, "luong-hoa-gia-tri-nha-thau-preview.svg");
const previewPngPath = path.join(outDir, "luong-hoa-gia-tri-nha-thau-preview.png");

const C = {
  blue: "204295",
  blue2: "2B5AAD",
  blueLight: "EAF0FA",
  bluePale: "F5F8FD",
  ink: "17212B",
  muted: "5E6B78",
  line: "AEB8C5",
  white: "FFFFFF",
  soft: "F7F9FC",
};

const pptx = new PptxGenJS();
pptx.layout = "LAYOUT_WIDE";
pptx.author = "Codex";
pptx.subject = "Lượng hóa giá trị: lợi nhuận tức thì cho nhà thầu";
pptx.title = "Lượng hóa Giá trị: Lợi nhuận tức thì cho Nhà thầu";
pptx.company = "ITing";
pptx.lang = "vi-VN";
pptx.theme = {
  headFontFace: "Aptos Display",
  bodyFontFace: "Aptos",
  lang: "vi-VN",
};
pptx.defineLayout({ name: "CUSTOM_WIDE", width: 13.333, height: 7.5 });
pptx.layout = "CUSTOM_WIDE";

const slide = pptx.addSlide();
slide.background = { color: C.white };

function addText(text, x, y, w, h, opts = {}) {
  slide.addText(text, {
    x, y, w, h,
    margin: opts.margin ?? 0.04,
    fontFace: opts.fontFace ?? "Aptos",
    fontSize: opts.fontSize ?? 18,
    color: opts.color ?? C.ink,
    bold: opts.bold ?? false,
    italic: opts.italic ?? false,
    align: opts.align ?? "left",
    valign: opts.valign ?? "mid",
    breakLine: false,
    fit: "shrink",
    ...opts,
  });
}

function addRoundRect(x, y, w, h, fill, line = C.blue, radius = 0.12, opts = {}) {
  slide.addShape(pptx.ShapeType.roundRect, {
    x, y, w, h,
    rectRadius: radius,
    fill: { color: fill, transparency: opts.transparency ?? 0 },
    line: { color: line, width: opts.lineWidth ?? 1.1, transparency: opts.lineTransparency ?? 0 },
    shadow: opts.shadow ? { type: "outer", color: "D7DEE8", opacity: 0.35, blur: 2, angle: 45, distance: 1 } : undefined,
  });
}

function addLine(x1, y1, x2, y2, color = C.blue, width = 1.6) {
  slide.addShape(pptx.ShapeType.line, {
    x: x1, y: y1, w: x2 - x1, h: y2 - y1,
    line: { color, width, beginArrowType: "none", endArrowType: "none" },
  });
}

function addIconBox(x, y, label) {
  addRoundRect(x, y, 0.46, 0.46, C.blueLight, C.blue, 0.06, { lineWidth: 1 });
  addText(label, x, y + 0.01, 0.46, 0.42, {
    fontSize: 15,
    color: C.blue,
    bold: true,
    align: "center",
    valign: "mid",
    margin: 0,
  });
}

function addHeaderPanel(x, y, w, h, title, subtitle) {
  addRoundRect(x, y, w, h, C.bluePale, C.blue, 0.12, { shadow: true });
  slide.addShape(pptx.ShapeType.rect, {
    x, y, w, h: 0.78,
    fill: { color: C.blue },
    line: { color: C.blue, transparency: 100 },
  });
  addText(title + "\n" + subtitle, x + 0.22, y + 0.08, w - 0.44, 0.6, {
    fontSize: 17,
    bold: true,
    color: C.white,
    align: "center",
    valign: "mid",
    margin: 0.02,
    breakLine: true,
    fit: "shrink",
  });
}

function addFeatureRow(panelX, y, text, icon, accent = C.blue) {
  addIconBox(panelX + 0.28, y + 0.08, icon);
  addRoundRect(panelX + 0.82, y, 4.56, 0.66, C.white, accent, 0.07, { lineWidth: 1.25 });
  addText(text, panelX + 0.96, y + 0.06, 4.25, 0.54, {
    fontSize: 12.8,
    color: C.ink,
    margin: 0.02,
    breakLine: true,
    fit: "shrink",
  });
}

function addBrickIcon(cx, cy) {
  const x = cx - 0.78;
  const y = cy - 0.28;
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 4; c++) {
      if (r === 0 && c === 3) continue;
      slide.addShape(pptx.ShapeType.rect, {
        x: x + c * 0.34 + (r % 2) * 0.17,
        y: y + r * 0.22,
        w: 0.32,
        h: 0.2,
        fill: { color: C.white, transparency: 100 },
        line: { color: C.blue, width: 1.4 },
      });
    }
  }
  addLine(cx - 0.18, cy + 0.15, cx + 0.42, cy - 0.28, C.blue, 2.2);
  slide.addShape(pptx.ShapeType.line, {
    x: cx + 0.34, y: cy - 0.34, w: 0.28, h: -0.16,
    line: { color: C.blue, width: 4, beginArrowType: "none", endArrowType: "none" },
  });
}

function addPuzzleIcon(cx, cy) {
  const x = cx - 0.78;
  const y = cy - 0.48;
  for (let r = 0; r < 2; r++) {
    for (let c = 0; c < 3; c++) {
      slide.addShape(pptx.ShapeType.rect, {
        x: x + c * 0.52,
        y: y + r * 0.39,
        w: 0.5,
        h: 0.37,
        fill: { color: C.white, transparency: 100 },
        line: { color: C.blue, width: 1.7 },
      });
    }
  }
  slide.addShape(pptx.ShapeType.arc, {
    x: cx - 0.1, y: cy - 0.49, w: 0.22, h: 0.22,
    adjustPoint: 0.25,
    line: { color: C.blue, width: 1.7 },
  });
}

addText("Lượng hóa Giá trị: Lợi nhuận tức thì cho Nhà thầu", 0.5, 0.26, 12.35, 0.55, {
  fontSize: 25,
  bold: true,
  color: C.blue,
  fontFace: "Aptos Display",
  margin: 0,
});
slide.addShape(pptx.ShapeType.rect, {
  x: 0.5, y: 0.93, w: 2.18, h: 0.06,
  fill: { color: C.blue },
  line: { color: C.blue, transparency: 100 },
});

addHeaderPanel(0.62, 1.18, 5.95, 5.62, "Trạng thái Hiện tại", "(Gạch nung truyền thống)");
addHeaderPanel(6.77, 1.18, 5.95, 5.62, "Trạng thái Khả dĩ", "(Gạch không nung tự liên kết)");

addBrickIcon(3.6, 2.43);
addPuzzleIcon(9.75, 2.43);

addFeatureRow(0.62, 3.20, "• Tốc độ thi công: 45 phút / m² tường", "⏱");
addFeatureRow(0.62, 3.96, "• Yêu cầu nhân sự: Bắt buộc thợ xây lành nghề,\n  phụ thuộc tay nghề thợ để canh dây dọi.", "👷");
addFeatureRow(0.62, 4.72, "• Tỷ trọng vữa xây: Chiếm 18-22% tổng chi phí\n  vật liệu bức tường.", "◔");
addFeatureRow(0.62, 5.48, "• Hồ sơ Môi trường: Gây ô nhiễm,\n  không đạt tiêu chuẩn xanh.", "ESG");

addFeatureRow(6.77, 3.20, "• Tốc độ thi công: 15 phút / m² tường\n  (Tiết kiệm 30 phút/m²)", "⏱");
addFeatureRow(6.77, 3.96, "• Yêu cầu nhân sự: Thợ phổ thông có thể lắp ghép,\n  rãnh khóa tự động dẫn hướng.", "👥");
addFeatureRow(6.77, 4.72, "• Tỷ trọng vữa xây: 0%\n  (Loại bỏ hoàn toàn chi phí vữa).", "▱");
addFeatureRow(6.77, 5.48, "• Hồ sơ Môi trường: 100% tái chế,\n  dễ đạt tiêu chí LEED, LOTUS, ESG.", "♻");

slide.addShape(pptx.ShapeType.chevron, {
  x: 6.43, y: 3.19, w: 0.5, h: 0.72,
  rotate: 0,
  fill: { color: C.blue },
  line: { color: C.blue },
});
addText("VS", 6.47, 3.43, 0.42, 0.18, {
  fontSize: 10,
  bold: true,
  color: C.white,
  align: "center",
  margin: 0,
});

addRoundRect(1.95, 6.42, 9.45, 0.76, C.blue, C.blue, 0.1, { lineWidth: 0 });
addText("Kết quả cuối cùng: Tiết kiệm 15-25% tổng chi phí vật liệu và rút ngắn\n66% thời gian thi công thực tế tại công trường", 2.1, 6.51, 9.15, 0.56, {
  fontSize: 16,
  bold: true,
  color: C.white,
  align: "center",
  valign: "mid",
  margin: 0,
  breakLine: true,
});

function esc(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function svgText(text, x, y, size, color, weight = 400, anchor = "start") {
  const lines = String(text).split("\n");
  return lines.map((line, i) =>
    `<text x="${x}" y="${y + i * size * 1.22}" font-family="Arial, sans-serif" font-size="${size}" font-weight="${weight}" fill="#${color}" text-anchor="${anchor}">${esc(line)}</text>`
  ).join("");
}

function svgRow(x, y, icon, text, accent = C.blue) {
  const lines = String(text).split("\n");
  return `
    <rect x="${x + 30}" y="${y + 12}" width="44" height="44" rx="7" fill="#${C.blueLight}" stroke="#${C.blue}" stroke-width="1.5"/>
    ${svgText(icon, x + 52, y + 42, icon.length > 2 ? 13 : 18, C.blue, 700, "middle")}
    <rect x="${x + 82}" y="${y}" width="438" height="64" rx="8" fill="#fff" stroke="#${accent}" stroke-width="2"/>
    ${lines.map((line, i) => svgText(line, x + 96, y + 25 + i * 20, 15.2, C.ink, line.includes(":") ? 700 : 400)).join("")}
  `;
}

const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="900" viewBox="0 0 1600 900">
  <rect width="1600" height="900" fill="#fff"/>
  ${svgText("Lượng hóa Giá trị: Lợi nhuận tức thì cho Nhà thầu", 60, 75, 42, C.blue, 700)}
  <rect x="60" y="112" width="260" height="8" fill="#${C.blue}"/>
  <rect x="74" y="142" width="714" height="674" rx="16" fill="#${C.bluePale}" stroke="#${C.blue}" stroke-width="2"/>
  <rect x="812" y="142" width="714" height="674" rx="16" fill="#${C.bluePale}" stroke="#${C.blue}" stroke-width="2"/>
  <rect x="74" y="142" width="714" height="94" fill="#${C.blue}"/>
  <rect x="812" y="142" width="714" height="94" fill="#${C.blue}"/>
  ${svgText("Trạng thái Hiện tại", 431, 178, 26, C.white, 700, "middle")}
  ${svgText("(Gạch nung truyền thống)", 431, 212, 25, C.white, 700, "middle")}
  ${svgText("Trạng thái Khả dĩ", 1169, 178, 26, C.white, 700, "middle")}
  ${svgText("(Gạch không nung tự liên kết)", 1169, 212, 25, C.white, 700, "middle")}
  ${svgText("▦", 431, 327, 84, C.blue, 700, "middle")}
  ${svgText("▣", 1169, 327, 84, C.blue, 700, "middle")}
  ${svgRow(74, 384, "⏱", "• Tốc độ thi công: 45 phút / m² tường")}
  ${svgRow(74, 475, "👷", "• Yêu cầu nhân sự: Bắt buộc thợ xây lành nghề,\nphụ thuộc tay nghề thợ để canh dây dọi.")}
  ${svgRow(74, 566, "◔", "• Tỷ trọng vữa xây: Chiếm 18-22% tổng chi phí\nvật liệu bức tường.")}
  ${svgRow(74, 657, "ESG", "• Hồ sơ Môi trường: Gây ô nhiễm,\nkhông đạt tiêu chuẩn xanh.")}
  ${svgRow(812, 384, "⏱", "• Tốc độ thi công: 15 phút / m² tường\n(Tiết kiệm 30 phút/m²)")}
  ${svgRow(812, 475, "👥", "• Yêu cầu nhân sự: Thợ phổ thông có thể lắp ghép,\nrãnh khóa tự động dẫn hướng.")}
  ${svgRow(812, 566, "▱", "• Tỷ trọng vữa xây: 0%\n(Loại bỏ hoàn toàn chi phí vữa).")}
  ${svgRow(812, 657, "♻", "• Hồ sơ Môi trường: 100% tái chế,\ndễ đạt tiêu chí LEED, LOTUS, ESG.")}
  <path d="M773 390 L827 450 L773 510 Z" fill="#${C.blue}"/>
  ${svgText("VS", 796, 458, 17, C.white, 700, "middle")}
  <rect x="234" y="768" width="1134" height="86" rx="13" fill="#${C.blue}"/>
  ${svgText("Kết quả cuối cùng: Tiết kiệm 15-25% tổng chi phí vật liệu và rút ngắn", 801, 810, 26, C.white, 700, "middle")}
  ${svgText("66% thời gian thi công thực tế tại công trường", 801, 842, 26, C.white, 700, "middle")}
</svg>`;

fs.writeFileSync(previewSvgPath, svg);

(async () => {
  await pptx.writeFile({ fileName: pptxPath });
  await sharp(Buffer.from(svg)).png().toFile(previewPngPath);
  console.log(JSON.stringify({ pptxPath, previewSvgPath, previewPngPath }, null, 2));
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
