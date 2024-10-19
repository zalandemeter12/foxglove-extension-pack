import { get_cmap } from './js-colormaps.js';
import seedrandom from 'seedrandom';

const fontSizes = [
  'auto',
  '8px',
  '9px',
  '10px',
  '11px',
  '12px',
  '14px',
  '16px',
  '18px',
  '24px',
  '30px',
  '36px',
  '48px',
  '60px',
  '72px',
].map((key) => ({ value: key, label: key }));

const functions = [
  'none',
  'abs',
  'ceil',
  'floor',
  'round',
  'sqrt',
  'pow2',
  'exp',
  'log',
  'sin',
  'cos',
  'tan',
  '1/x',
].map((key) => ({ value: key, label: key }));

const splitTopic = (topic) => {
  const parts = topic.split('.');
  if (parts.length === 0) {
    return { firstPart: '', lastPart: '' };
  } else if (parts.length < 2 || parts[1] === '') {
    return { firstPart: parts[0], lastPart: '' };
  } else {
    return {
      firstPart: parts[0],
      lastPart: topic.substring(parts[0].length + 1),
    };
  }
};

const parseValue = (message, currentField) => {
  let value = message;
  if (currentField === '') {
    value = message;
  } else {
    for (const field of currentField.split('.')) {
      if (value && field && field !== '') {
        const index = field.match(/\[(\d+)\]/);
        if (index) {
          let temp = value[field.replace(index[0], '')];
          if (temp && index[1] !== undefined && index[1] != '') {
            value = temp[index[1]];
          } else {
            value = undefined;
          }
        } else {
          value = value[field];
        }
      } else {
        value = undefined;
      }
    }
  }
  return value;
};

const clamp = (value, min, max) => {
  if (
    isNaN(value) ||
    value === undefined ||
    value === null ||
    isNaN(min) ||
    isNaN(max)
  ) {
    return 0;
  }
  return Math.min(Math.max(value, min), max);
};

const applyFunction = (value, function_text) => {
  if (typeof value === 'number') {
    var fnc = (x) => x;
    switch (function_text) {
      case 'none':
        break;
      case 'abs':
        fnc = Math.abs;
        break;
      case 'ceil':
        fnc = Math.ceil;
        break;
      case 'floor':
        fnc = Math.floor;
        break;
      case 'round':
        fnc = Math.round;
        break;
      case 'sqrt':
        fnc = Math.sqrt;
        break;
      case 'pow2':
        fnc = (x) => Math.pow(x, 2);
        break;
      case 'exp':
        fnc = Math.exp;
        break;
      case 'log':
        fnc = Math.log;
        break;
      case 'sin':
        fnc = Math.sin;
        break;
      case 'cos':
        fnc = Math.cos;
        break;
      case 'tan':
        fnc = Math.tan;
        break;
      case '1/x':
        fnc = (x) => 1 / x;
        break;
    }
    return fnc(value);
  } else {
    return value;
  }
};

const getColorFromProgress = (x, min, max, colormap, reversed) => {
  if (isNaN(x) || x === undefined || x === null || isNaN(min) || isNaN(max)) {
    return '#303030';
  } else {
    const norm = clamp((x - min) / (max - min), 0, 1);
    if (norm === undefined) {
      return '#303030';
    }
    const cmap_name = reversed ? `${colormap}_r` : colormap;
    const cmap = get_cmap(cmap_name);
    const [r, g, b] = cmap(norm);
    return `rgb(${r}, ${g}, ${b})`;
  }
};

const subscribeToTopic = (context, value) => {
  context.unsubscribeAll();
  const { firstPart, lastPart } = splitTopic(value);
  if (firstPart) {
    context.subscribe([{ topic: firstPart }]);
    return { firstPart: firstPart, lastPart: lastPart };
  }
  return { firstPart: undefined, lastPart: undefined };
};

const generateRandomDivClass = (divType) => {
  seedrandom(new Date().getTime(), { global: true });
  return (
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15) +
    document.getElementsByClassName(divType).length
  );
};

const getWidthHeight = (width, height, elementName) => {
  const elements = document.getElementsByClassName(elementName);
  if (elements.length > 0) {
    const element = elements[0]; // Get the first element with the class name
    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        width.value = entry.contentRect.width;
        height.value = entry.contentRect.height;
      }
    });
    // Start observing the element for size changes
    resizeObserver.observe(element);
  }
};

export {
  fontSizes,
  functions,
  splitTopic,
  clamp,
  getColorFromProgress,
  parseValue,
  applyFunction,
  subscribeToTopic,
  generateRandomDivClass,
  getWidthHeight,
};
