const clusters = [
  { name: "Червоний", rgb: [255, 0, 0], similarColors: [] },
  { name: "Помаранчевий", rgb: [255, 155, 0], similarColors: [] },
  { name: "Жовтий", rgb: [255, 235, 0], similarColors: [] },
  { name: "Зелений", rgb: [60, 255, 0], similarColors: [] },
  { name: "Блакитний", rgb: [0, 255, 230], similarColors: [] },
  { name: "Синій", rgb: [10, 0, 255], similarColors: [] },
  { name: "Фіолетовий", rgb: [175, 0, 255], similarColors: [] },
  { name: "Рожевий", hide: true, rgb: [255, 65, 155], similarColors: [] }
];

const arrayToChunks = (array, chunkSize) => {
  const result = [];
  for (let i = 0; i < array.length; i += chunkSize) {
    result.push(array.slice(i, i + chunkSize));
  }
  return result;
};

const hexToRgb = (hex) => {
  if (hex.startsWith("#")) hex = hex.substring(1);
  return arrayToChunks(hex, 2).map((chunk) => `0x${chunk}` | 0);
};

const colorDiff = (colorA, colorB) => {
  const diffs = colorA.map((el, i) => 255 - Math.abs(el - colorB[i]));
  const limitedDiffs = diffs.map((el) => el / 3);
  return limitedDiffs.reduce((acc, cur) => (acc += cur), 0);
};

const getColorLuminance = (rgb) => {
  const [r, g, b] = rgb;
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

const orderColors = () => {
  const colorNamesEntries = Object.entries(window.colorNames);
  const colors = colorNamesEntries.map(([name, hex]) => ({ name, hex }));
  for (const color of colors) {
    color.rgb = hexToRgb(color.hex);
    const mostSimilar = { index: -1, value: 0 };
    for (const [i, cluster] of Object.entries(clusters)) {
      const diff = colorDiff(cluster.rgb, color.rgb);
      if (mostSimilar.value > diff) continue;
      mostSimilar.value = diff;
      mostSimilar.index = i;
    }
    const cluster = clusters[mostSimilar.index];
    color.similarValue = mostSimilar.value;
    cluster.similarColors.push(color);
  }
};

const createHeadline = (color, container, name = "Заголовок") => {
  const headline = document.createElement("h1");
  headline.style.color = color.name ? color.name : color.hex;
  headline.innerHTML = name;
  container.appendChild(headline);
};

const createClusterBlock = (cluster) => {
  if (cluster.hide) return;

  const container = document.getElementById("container");
  const block = document.createElement("div");
  block.classList.add("cluster");

  const generalInfo = document.createElement("div");
  generalInfo.classList.add("general-info");
  block.appendChild(generalInfo);

  const colorPreview = document.createElement("div");
  colorPreview.classList.add("color-preview");
  colorPreview.style.backgroundColor = `rgb(${cluster.rgb.join(",")})`;
  generalInfo.appendChild(colorPreview);

  const title = document.createElement("h1");
  title.innerHTML = cluster.name;
  generalInfo.appendChild(title);

  const similarColors = document.createElement("div");
  similarColors.classList.add("similar-colors");
  block.appendChild(similarColors);

  const sortedColors = cluster.similarColors
    .sort((a, b) => b.value - a.value)
    .sort((a, b) => getColorLuminance(a.rgb) - getColorLuminance(b.rgb));
  for (const [i, color] of Object.entries(sortedColors)) {
    createHeadline(color, similarColors, `Заголовок ${+i + 1} (${color.name})`);
  }

  container.appendChild(block);
};

(() => {
  try {
    orderColors();
    for (const cluster of clusters) {
      createClusterBlock(cluster);
    }
  } catch (err) {
    console.error(err);
  }
})();
