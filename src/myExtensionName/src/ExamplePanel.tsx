import { PanelExtensionContext } from "@foxglove/extension";
import { createApp, h } from "vue";
import MyVueComp from "./MyVueComp.vue";

export function initExamplePanel(context: PanelExtensionContext): () => void {
  const app = createApp({
    render: () => h(MyVueComp, { context }), // Correctly pass `context` as a prop
  });

  app.mount(context.panelElement);

  return () => {
    app.unmount();
  };
}
