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

const functions = [
  "none",
  "abs",
  "ceil",
  "floor",
  "round",
  "sqrt",
  "pow2",
  "exp",
  "log",
  "sin",
  "cos",
  "tan",
  "1/x",
].map((key) => ({ value: key, label: key }));

const defaultSettings = {
  data: {
    label: "Data",
    topic: "",
  },
  display: {
    label: "Display",
    unit: "",
    fontSize: "auto",
    align: "center",
    bold: true,
    italic: false,
    fontColor: "#ffffff",
    backgroundColor: "#15151A",
  },
  numerical: {
    label: "Numerical",
    precision: 0,
    function: "none",
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
        },
      },
      display: {
        label: state.value.display.label,
        // renamable: true,
        // visible: state.value.display.visible,
        icon: "Cells",
        fields: {
          unit: {
            label: "Unit",
            input: "string",
            value: state.value.display.unit,
          },
          fontSize: {
            label: "Font Size",
            input: "select",
            options: fontSizes,
            value: state.value.display.fontSize,
          },
          align: {
            label: "Align",
            input: "toggle",
            options: [
              { value: "left", label: "Left" },
              { value: "center", label: "Center" },
              { value: "right", label: "Right" },
            ],
            value: state.value.display.align,
          },
          bold: {
            label: "Bold",
            input: "boolean",
            value: state.value.display.bold,
          },
          italic: {
            label: "Italic",
            input: "boolean",
            value: state.value.display.italic,
          },
          fontColor: {
            label: "Font Color",
            input: "rgb",
            value: state.value.display.fontColor,
          },
          backgroundColor: {
            label: "Background Color",
            input: "rgb",
            value: state.value.display.backgroundColor,
          },
        },
      },
      numerical: {
        label: state.value.numerical.label,
        // renamable: true,
        // visible: state.value.numerical.visible,
        icon: "PrecisionManufacturing",
        fields: {
          precision: {
            label: "Precision",
            input: "number",
            value: state.value.numerical.precision,
          },
          function: {
            label: "Function",
            input: "select",
            options: functions,
            value: state.value.numerical.function,
          },
        },
      },
    },
  });
};

export { defaultSettings, updateSettingsEditor };
