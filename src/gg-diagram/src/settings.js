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
    max: 3,
    input: "g",
  },
  display: {
    label: "Display",
    fontSize: "auto",
    precision: 0,
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
          max: {
            label: "Max",
            input: "number",
            value: state.value.data.max,
          },
          input: {
            label: "Input",
            input: "toggle",
            options: [
              { value: "g", label: "g" },
              { value: "m/s2", label: "m/s2" },
            ],
            value: state.value.data.input,
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
          precision: {
            label: "Precision",
            input: "number",
            value: state.value.display.precision,
          },
        },
      },
    },
  });
};

export { defaultSettings, updateSettingsEditor };
