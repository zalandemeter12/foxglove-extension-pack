<script>
import { defineComponent, ref, watch, onMounted, onBeforeUnmount } from "vue";
import { produce } from "immer";
import { set, merge } from "lodash";
import { reactive } from "vue";
import CircleProgress from "js-circle-progress";
import { defaultSettings, updateSettingsEditor } from "./settings.js";
import { splitTopic, clamp, getColorFromProgress } from "./utils.js";

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

    const circleValue = ref(0);
    const color = ref("#303030");
    const indeterminateText = ref("NaN");
    const textFormatFunc = ref((val) => {
      return parseFloat(val).toFixed(state.value.display.precision < 0 ? 0 : state.value.display.precision) + state.value.display.unit;
    });

    const handleRender = (renderState, done) => {
      renderDone.value = done;
      topics.value = renderState.topics || [];
      messages.value = renderState.currentFrame || [];

      if (messages.value.length > 0) {
        const deserializedMessage = messages.value[0].message;
        const value = deserializedMessage[currentField.value];
        if (!isNaN(value)) {
          circleValue.value = clamp(value, state.value.data.min, state.value.data.max);
          color.value = getColorFromProgress(
            circleValue.value,
            state.value.data.min,
            state.value.data.max,
            state.value.display.colormap,
            state.value.display.reverseColormap,
          );
        } else {
          circleValue.value = 0;
          color.value = "#303030";
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
            circleValue.value = 0;
            color.value = "#303030";
          }
        }

        if (path[1] === "max") {
          color.value = getColorFromProgress(
            circleValue.value,
            state.value.data.min,
            state.value.data.max,
            state.value.display.colormap,
            state.value.display.reverseColormap,
          );
        }

        if (path[1] === "min") {
          color.value = getColorFromProgress(
            circleValue.value,
            state.value.data.min,
            state.value.data.max,
            state.value.display.colormap,
            state.value.display.reverseColormap,
          );
        }

        if (path[1] === "colormap") {
          color.value = getColorFromProgress(
            circleValue.value,
            state.value.data.min,
            state.value.data.max,
            state.value.display.colormap,
            state.value.display.reverseColormap,
          );
        }

        if (path[1] === "reverseColormap") {
          color.value = getColorFromProgress(
            circleValue.value,
            state.value.data.min,
            state.value.data.max,
            state.value.display.colormap,
            state.value.display.reverseColormap,
          );
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
      circleValue,
      textFormatFunc,
      color,
      indeterminateText,
    };
  },
});
</script>

<template>
  <circle-progress
    class="progress"
    :value="circleValue"
    :max="state.data.max"
    :min="state.data.min"
    :textFormat="textFormatFunc"
    :startAngle="state.display.startAngle"
    :anticlockwise="state.display.anticlockwise"
    :style="{
      '--font-size': state.display.fontSize,
      '--color': color,
    }"
    animationDuration="250"
    :indeterminateText="indeterminateText"
  ></circle-progress>
</template>

<style src="./style.css" scoped></style>
