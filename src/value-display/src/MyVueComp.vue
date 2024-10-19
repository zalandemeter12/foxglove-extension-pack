<script>
import { defineComponent, ref, watch, onMounted, onBeforeUnmount } from "vue";
import { produce } from "immer";
import { set, merge } from "lodash";
import { reactive } from "vue";
import { defaultSettings, updateSettingsEditor } from "./settings.js";
import { splitTopic } from "./utils.js";
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
    const height = ref(0);

    // Seed the random number generator with timestamp
    seedrandom(new Date().getTime(), { global: true });
    //generate 32 random characters
    const randomString = ref(
      Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
    );

    randomString.value += document.getElementsByClassName("value-display").length;

    const handleRender = (renderState, done) => {
      renderDone.value = done;
      topics.value = renderState.topics || [];
      messages.value = renderState.currentFrame || [];

      if (messages.value.length > 0) {
        const deserializedMessage = messages.value[0].message;
        const value = deserializedMessage[currentField.value];
        if (value) {
          if (typeof value === "number") {
            var fnc = (x) => x;
            switch (state.value.numerical.function) {
              case "none":
                break;
              case "abs":
                fnc = Math.abs;
                break;
              case "ceil":
                fnc = Math.ceil;
                break;
              case "floor":
                fnc = Math.floor;
                break;
              case "round":
                fnc = Math.round;
                break;
              case "sqrt":
                fnc = Math.sqrt;
                break;
              case "pow2":
                fnc = (x) => Math.pow(x, 2);
                break;
              case "exp":
                fnc = Math.exp;
                break;
              case "log":
                fnc = Math.log;
                break;
              case "sin":
                fnc = Math.sin;
                break;
              case "cos":
                fnc = Math.cos;
                break;
              case "tan":
                fnc = Math.tan;
                break;
              case "1/x":
                fnc = (x) => 1 / x;
                break;
            }
            displayValue.value = fnc(value);
          } else {
            displayValue.value = value;
          }
        } else {
          displayValue.value = "N/A";
        }
      }

      const elements = document.getElementsByClassName(randomString.value);

      if (elements.length > 0) {
        const element = elements[0]; // Get the first element with the class name

        const resizeObserver = new ResizeObserver((entries) => {
          for (let entry of entries) {
            // const width = entry.contentRect.width;
            height.value = entry.contentRect.height;
          }
        });

        // Start observing the element for size changes
        resizeObserver.observe(element);
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
            displayValue.value = "N/A";
          }
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
      randomString,
      height,
    };
  },
});
</script>

<template>
  <value-display
    :class="randomString + ' value-display'"
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
