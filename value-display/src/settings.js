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

const defaultSettings = {
  data: {
    label: "Data",
    topic: "",
  },
  display: {
    label: "Display",
    fontSize: "auto",
    unit: "",
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
        icon: "Cube",
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
        icon: "Display",
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
        },
      },
    },
  });
};

export { defaultSettings, updateSettingsEditor };
