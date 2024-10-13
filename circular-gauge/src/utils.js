import { evaluate_cmap, interpolated, qualitative, get_cmap } from "./js-colormaps.js";

const splitTopic = (topic) => {
  const parts = topic.split(".");
  if (parts.length !== 2) {
    return { first: "", last: "" };
  } else if (parts[1]) {
    return {
      firstPart: parts[0],
      lastPart: parts[1],
    };
  }
};

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const getColorFromProgress = (x, min, max, colormap, reversed) => {
  if (!isNaN(x)) {
    const norm = clamp((x - min) / (max - min), 0, 1);
    const cmap_name = reversed ? `${colormap}_r` : colormap;
    const cmap = get_cmap(cmap_name);
    const [r, g, b] = cmap(norm);
    return `rgb(${r}, ${g}, ${b})`;
  } else {
    return "hsl(0, 0%, 19%)";
  }
};

export { splitTopic, clamp, getColorFromProgress };
