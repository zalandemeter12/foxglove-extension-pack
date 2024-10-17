<script>
import { defineComponent, ref, watch, onMounted, onBeforeUnmount } from "vue";
import { produce } from "immer";
import { set, merge } from "lodash";
import { reactive } from "vue";
import { defaultSettings, updateSettingsEditor } from "./settings.js";
import { splitTopic } from "./utils.js";

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

    const displayValue = ref("N/A" + " " + state.value.display.unit);

    const handleRender = (renderState, done) => {
      renderDone.value = done;
      topics.value = renderState.topics || [];
      messages.value = renderState.currentFrame || [];

      if (messages.value.length > 0) {
        const deserializedMessage = messages.value[0].message;
        const value = deserializedMessage[currentField.value];
        if (value) {
          if(typeof value === "number") {
            displayValue.value = parseFloat(value).toFixed(state.value.display.precision) + state.value.display.unit;
          } else {
            displayValue.value = value + state.value.display.unit;
          }
        } else {
          displayValue.value = "N/A";
        }
      }
    };

    const settingsActionHandler = (action) => {
      if (action.action === "update") {
        const { path, value } = action.payload;
        state.value = produce(state.value, (draft) => set(draft, path, value));

        if (path[1] === "topic") {
          context.unsubscribeAll();
          const { firstPart, lastPart } = splitTopic(value);
          if (firstPart) {
            currentTopic.value = firstPart;
            currentField.value = lastPart;
            context.subscribe([{ topic: firstPart }]);
          } else {
            //handle case when no data
          }
        }

        // if (path[1] === "max") {
          
        // }

        // if (path[1] === "min") {
          
        // }
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
      const { firstPart, lastPart } = splitTopic(state.value.data.topic);
      if (firstPart) {
        currentTopic.value = firstPart;
        currentField.value = lastPart;
        context.subscribe([{ topic: firstPart }]);
      }
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
    };
  },
});
</script>

<template>
  <value-display
    :style="{
      '--font-size': state.display.fontSize,
    }"
  >
    {{ displayValue }}
  </value-display>
</template>

<style src="./style.css" scoped></style>
