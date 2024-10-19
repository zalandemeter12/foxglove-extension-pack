const fontSizes = [
  "auto",
  "8px",
  "9px",
  "10px",
  "11px",
  "12px",
  "14px",
  "16px",
  "18px",
  "24px",
  "30px",
  "36px",
  "48px",
  "60px",
  "72px",
].map((key) => ({ value: key, label: key }));

const colorMaps = [
  "turbo",
  "viridis",
  "hot",
  "jet",
  "hsv",
  "plasma",
  "rainbow",
  "Blues",
  "BrBG",
  "BuGn",
  "BuPu",
  "CMRmap",
  "GnBu",
  "Greens",
  "OrRd",
  "Oranges",
  "PRGn",
  "PiYG",
  "PuBu",
  "PuBuGn",
  "PuOr",
  "PuRd",
  "Purples",
  "RdBu",
  "RdPu",
  "RdYlBu",
  "RdYlGn",
  "Reds",
  "Spectral",
  "Wistia",
  "YlGn",
  "YlGnBu",
  "YlOrBr",
  "YlOrRd",
  "autumn",
  "brg",
  "bwr",
  "cool",
  "coolwarm",
  "gist_rainbow",
  "ocean",
  "seismic",
  "spring",
  "summer",
  "terrain",
  "winter",
]
  .sort((a, b) => a.localeCompare(b))
  .map((key) => ({ value: key, label: key }));

const defaultSettings = {
  data: {
    label: "Data",
    topic: "",
    min: 0,
    max: 100,
    clamp: false,
  },
  display: {
    label: "Display",
    fontSize: "auto",
    unit: "°C",
    precision: 0,
    startAngle: 0,
    anticlockwise: false,
    colormap: "turbo",
    reverseColormap: false,
  },
};

const updateSettingsEditor = (context, state, settingsActionHandler) => {
  context.updatePanelSettingsEditor({
    actionHandler: settingsActionHandler,
    nodes: {
      data: {
        label: state.value.data.label,
        // renamable: true,
        // visible: state.value.data.visible,
        icon: "Settings",
        fields: {
          topic: {
            label: "Topic",
            input: "messagepath",
            value: state.value.data.topic,
          },
          min: {
            label: "Min",
            input: "number",
            value: state.value.data.min,
          },
          max: {
            label: "Max",
            input: "number",
            value: state.value.data.max,
          },
          clamp: {
            label: "Clamp",
            input: "boolean",
            value: state.value.data.clamp,
          },
        },
      },
      display: {
        label: state.value.display.label,
        // renamable: true,
        // visible: state.value.display.visible,
        icon: "Cells",
        fields: {
          fontSize: {
            label: "Font Size",
            input: "select",
            options: fontSizes,
            value: state.value.display.fontSize,
          },
          unit: {
            label: "Unit",
            input: "string",
            value: state.value.display.unit,
          },
          precision: {
            label: "Precision",
            input: "number",
            value: state.value.display.precision,
          },
          startAngle: {
            label: "Start Angle",
            input: "number",
            value: state.value.display.startAngle,
          },
          anticlockwise: {
            label: "Anticlockwise",
            input: "boolean",
            value: state.value.display.anticlockwise,
          },
          colormap: {
            label: "Colormap",
            input: "select",
            options: colorMaps,
            value: state.value.display.colormap,
          },
          reverseColormap: {
            label: "Reverse Colormap",
            input: "boolean",
            value: state.value.display.reverseColormap,
          },
        },
      },
    },
  });
};

export { defaultSettings, updateSettingsEditor };
