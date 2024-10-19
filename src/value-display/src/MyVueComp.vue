<script>
import { defineComponent, ref, watch, onMounted, onBeforeUnmount } from "vue";
import { produce } from "immer";
import { set, merge } from "lodash";
import { reactive } from "vue";
import { defaultSettings, updateSettingsEditor } from "./settings.js";
import * as common from "common";
import seedrandom from "seedrandom";

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
    const renderDone = ref(null);
    const debugString = ref("");

    const state = ref(merge({}, defaultSettings, context.initialState));
    const currentTopic = ref("");
    const currentField = ref("");

    const displayValue = ref("N/A");
    const width = ref(0);
    const height = ref(0);

    const randomDivClass = common.generateRandomDivClass("value-display");

    const handleRender = (renderState, done) => {
      renderDone.value = done;
      topics.value = renderState.topics || [];
      messages.value = renderState.currentFrame || [];

      if (currentField.value === undefined) {
        displayValue.value = "N/A";
      } else if (messages.value.length > 0) {
        const value = common.parseValue(messages.value[0].message, currentField.value);
        if (value !== undefined) {
          displayValue.value = common.applyFunction(value, state.value.numerical.function);
        } else {
          displayValue.value = "N/A";
        }
      }

      common.getWidthHeight(width, height, randomDivClass);
    };

    const settingsActionHandler = (action) => {
      if (action.action === "update") {
        const { path, value } = action.payload;
        state.value = produce(state.value, (draft) => set(draft, path, value));

        if (path[1] === "topic") {
          const { firstPart, lastPart } = common.subscribeToTopic(context, value);
          currentTopic.value = firstPart;
          currentField.value = lastPart;
        }
      }
    };

    onMounted(() => {
      context.onRender = handleRender;
      context.watch("topics");
      context.watch("currentFrame");
      context.watch("messages");

      // Initialize settings editor
      updateSettingsEditor(context, state, settingsActionHandler);

      // Initialize subscriptions
      const { firstPart, lastPart } = common.subscribeToTopic(context, state.value.data.topic);
      currentTopic.value = firstPart;
      currentField.value = lastPart;
    });

    watch(
      () => renderDone.value,
      (done) => {
        if (done) {
          done();
          renderDone.value = null;
        }
      },
    );

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
      const { context } = props;
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
      '--background-color': displayValue === 'N/A' ? '#15151A' : state.display.backgroundColor,
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
