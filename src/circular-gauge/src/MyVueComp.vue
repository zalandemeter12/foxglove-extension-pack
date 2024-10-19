<script>
import { defineComponent, ref, watch, onMounted, onBeforeUnmount } from "vue";
import { current, produce } from "immer";
import { set, merge } from "lodash";
import { reactive } from "vue";
import CircleProgress from "js-circle-progress";
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
    const renderDone = ref(null);
    const debugString = ref("");

    const state = ref(merge({}, defaultSettings, context.initialState));
    const currentTopic = ref("");
    const currentField = ref("");

    const circleValue = ref(undefined);
    const color = ref("#303030");
    const indeterminateText = ref("N/A");
    const textFormatFunc = ref((val) => {
      return isNaN(val) || val === undefined
        ? indeterminateText.value
        : parseFloat(val).toFixed(
            state.value.display.precision < 0 ? 0 : state.value.display.precision,
          ) + state.value.display.unit;
    });

    const handleRender = (renderState, done) => {
      renderDone.value = done;
      topics.value = renderState.topics || [];
      messages.value = renderState.currentFrame || [];

      if (currentField.value === undefined) {
        circleValue.value = 0;
        color.value = "#303030";
      } else if (messages.value.length > 0) {
        const value = common.parseValue(messages.value[0].message, currentField.value);

        if (value !== undefined) {
          circleValue.value = value;
          color.value = common.getColorFromProgress(
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
          const { firstPart, lastPart } = common.subscribeToTopic(context, value);
          currentTopic.value = firstPart;
          currentField.value = lastPart;
        }

        if (
          path[1] === "min" ||
          path[1] === "max" ||
          path[1] === "colormap" ||
          path[1] === "reverseColormap"
        ) {
          color.value = common.getColorFromProgress(
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

    // watch(currentField, (newValue) => {
    //   if (newValue == null) {
    //     circleValue.value = 0;
    //     color.value = "#303030";
    //   }
    // });

    watch([currentField, currentTopic], ([newField, newTopic]) => {
      circleValue.value = 0;
      color.value = "#303030";
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
    :value="isNaN(circleValue) || circleValue === undefined ? undefined : circleValue"
    :max="isNaN(state.data.max) ? 0 : state.data.max"
    :min="isNaN(state.data.min) ? 0 : state.data.min"
    :textFormat="textFormatFunc"
    :startAngle="isNaN(state.display.startAngle) ? 0 : state.display.startAngle"
    :anticlockwise="state.display.anticlockwise"
    :style="{
      '--font-size': state.display.fontSize === 'auto' ? '1.35rem' : state.display.fontSize,
      '--color': color,
    }"
    animationDuration="0"
    :indeterminateText="indeterminateText"
    :unconstrained="!state.data.clamp"
  ></circle-progress>
</template>

<style src="./style.css" scoped></style>
