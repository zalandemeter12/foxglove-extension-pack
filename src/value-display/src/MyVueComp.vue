<script>
import { defineComponent, ref, watch, onMounted, onBeforeUnmount } from "vue";
import { produce } from "immer";
import { set, merge } from "lodash";
import { defaultSettings, updateSettingsEditor } from "./settings.js";
import * as common from "common";

export default defineComponent({
  props: {
    context: {
      type: Object,
      required: true,
    },
  },
  setup(props) {
    const { context } = props;
    const topics = ref([]);
    const messages = ref([]);
    const debugString = ref("");

    const state = ref(merge({}, defaultSettings, context.initialState || {}));
    const currentTopic = ref("");
    const currentField = ref("");

    const displayValue = ref("N/A");
    const width = ref(0);
    const height = ref(0);

    const randomDivClass = common.generateRandomDivClass("value-display");

    let sizeObserverInitialized = false;

    const updateSubscriptions = () => {
      const { firstPart, lastPart } = common.splitTopic(state.value.data.topic || "");
      const oldTopic = currentTopic.value;
      currentTopic.value = firstPart || "";
      currentField.value = lastPart || "";

      // Only update subscriptions if the topic actually changed
      if (oldTopic !== firstPart) {
        context.unsubscribeAll();
        if (firstPart) {
          context.subscribe([{ topic: firstPart }]);
        }
      }
    };

    const handleRender = (renderState, done) => {
      topics.value = renderState.topics || [];
      messages.value = renderState.currentFrame || [];

      if (!currentField.value) {
        displayValue.value = "N/A";
      } else if (messages.value.length > 0) {
        const value = common.parseValue(messages.value[0].message, currentField.value);
        if (value !== undefined) {
          displayValue.value = common.applyFunction(value, state.value.numerical.function);
        } else {
          displayValue.value = "N/A";
        }
      }

      if (!sizeObserverInitialized) {
        common.getWidthHeight(width, height, randomDivClass);
        sizeObserverInitialized = true;
      }

      // Call done() immediately to signal render completion
      done();
    };

    const settingsActionHandler = (action) => {
      if (action.action === "update") {
        const { path, value } = action.payload;
        state.value = produce(state.value, (draft) => set(draft, path, value));

        if (path[1] === "topic") {
          updateSubscriptions();
        }
      }
    };

    onMounted(() => {
      // Set up render callback first
      context.onRender = handleRender;
      context.watch("topics");
      context.watch("currentFrame");

      // Initialize settings editor
      updateSettingsEditor(context, state, settingsActionHandler);
      
      // Set up subscriptions only if we have a topic
      if (state.value.data.topic) {
        updateSubscriptions();
      }
      
      if (!sizeObserverInitialized) {
        common.getWidthHeight(width, height, randomDivClass);
        sizeObserverInitialized = true;
      }
    });

    watch([currentField, currentTopic], ([newField, newTopic]) => {
      displayValue.value = "N/A";
    });

    watch(
      [state, topics],
      () => {
        updateSettingsEditor(context, state, settingsActionHandler);
        context.saveState(state.value);
      },
      { deep: true },
    );

    onBeforeUnmount(() => {
      context.unsubscribeAll();
    });

    return {
      debugString,
      state,
      displayValue,
      randomDivClass,
      height,
    };
  },
});
</script>

<template>
  <value-display
    :class="randomDivClass + ' value-display'"
    :style="{
      '--font-size':
        state.display.fontSize === 'auto' ? (height / 50) * 1.5 + 'rem' : state.display.fontSize,
      '--font-weight': state.display.bold ? 'bold' : 'normal',
      '--font-style': state.display.italic ? 'italic' : 'normal',
      '--font-color': displayValue === 'N/A' ? '#303030' : state.display.fontColor,
      '--background-color': displayValue === 'N/A' ? '#121212' : state.display.backgroundColor,
      '--text-align': state.display.align,
    }"
  >
    {{
      typeof displayValue === "number"
        ? parseFloat(displayValue).toFixed(
            state.numerical.precision < 0 ? 0 : state.numerical.precision,
          )
        : displayValue
    }}{{ state.display.unit }}
  </value-display>
</template>

<style src="./style.css" scoped></style>
