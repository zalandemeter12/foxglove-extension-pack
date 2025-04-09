<script>
import { defineComponent, ref, watch, onMounted, onBeforeUnmount } from "vue";
import { current, produce } from "immer";
import { set, merge } from "lodash";
import { reactive } from "vue";
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

    const width = ref(0);
    const height = ref(0);

    const randomDivClass = common.generateRandomDivClass("value-display");

    const handleRender = (renderState, done) => {
      renderDone.value = done;
      topics.value = renderState.topics || [];
      messages.value = renderState.currentFrame || [];

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

        if (path[1] === "max" || path[1] === "colormap" || path[1] === "reverseColormap") {
          // TODO: UPDATE DISPLAY SIZE AND COLOR HERE
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
      // circleValue.value = 0;
      // color.value = "#303030";
      // TODO: Idk what to do here
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

    const clampMax = () => {
      return Math.max(1, state.value.data.max);
    };

    const getStrokeWidth = () => {
      return Math.min(height.value, width.value) / 500;
    };

    const px2rem = (px) => {
      return px / 16;
    };

    const getAvailableRadius = () => {
      return px2rem(Math.min(height.value, width.value) / 2) - 2 * getStrokeWidth();
    };

    const calculateRadius = (index) => {
      const availableRadius = getAvailableRadius();
      const numCircles = clampMax();

      // Calculate the radius increment to have roughly equal spacing
      const radiusIncrement = availableRadius / numCircles;

      return radiusIncrement * index;
    };

    const mapG2rem = (x, y) => {
      const availableRadius = getAvailableRadius();

      // clamp x, and y to be in range [-max, max]
      const clampedX = Math.max(-clampMax(), Math.min(clampMax(), x));
      const clampedY = Math.max(-clampMax(), Math.min(clampMax(), y));

      const normalizedX = (clampedX / clampMax()) * availableRadius;
      const normalizedY = -(clampedY / clampMax()) * availableRadius;

      const centerX = px2rem(width.value / 2);
      const centerY = px2rem(height.value / 2);

      const mappedX = centerX + normalizedX;
      const mappedY = centerY + normalizedY;

      return { mappedX, mappedY };
    };

    // Add this to your return statement
    return {
      debugString,
      state,
      currentTopic,
      currentField,
      randomDivClass,
      height,
      width,
      clampMax,
      getAvailableRadius,
      calculateRadius,
      getStrokeWidth,
      px2rem,
      mapG2rem,
      latG: 1.5,
      lonG: 2.5,
    };
  },
});
</script>

<template>
  <gg-diagram :class="randomDivClass + ' gg-diagram'">
    <svg :width="width" :height="height">
      <!-- Background circle -->
      <circle
        key="background"
        :cx="px2rem(width / 2) + 'rem'"
        :cy="px2rem(height / 2) + 'rem'"
        :r="calculateRadius(clampMax()) + 'rem'"
        fill="#303030"
      />

      <!-- Concentric circles -->
      <circle
        v-for="index in clampMax()"
        :key="index"
        :cx="px2rem(width / 2) + 'rem'"
        :cy="px2rem(height / 2) + 'rem'"
        :r="calculateRadius(index) + 'rem'"
        stroke="#636363"
        :stroke-width="getStrokeWidth() + 'rem'"
        fill="transparent"
      />

      <!-- Cross lines -->
      <line
        :x1="px2rem(width / 2) + 'rem'"
        :y1="px2rem(height / 2) - getAvailableRadius() + 'rem'"
        :x2="px2rem(width / 2) + 'rem'"
        :y2="px2rem(height / 2) + getAvailableRadius() + 'rem'"
        stroke="#636363"
        :stroke-width="getStrokeWidth() + 'rem'"
      />
      <line
        :x1="px2rem(width / 2) - getAvailableRadius() + 'rem'"
        :y1="px2rem(height / 2) + 'rem'"
        :x2="px2rem(width / 2) + getAvailableRadius() + 'rem'"
        :y2="px2rem(height / 2) + 'rem'"
        stroke="#636363"
        :stroke-width="getStrokeWidth() + 'rem'"
      />

      <!-- Direction labels -->
      <!-- <text
        :x="px2rem(width / 2) + 'rem'"
        :y="px2rem(height / 2 - getAvailableRadius() - 10) + 'rem'"
        fill="#FFFFFF"
        text-anchor="middle"
        dominant-baseline="baseline"
        font-size="1rem"
      >
        ACC
      </text>

      <text
        :x="px2rem(width / 2) + 'rem'"
        :y="px2rem(height / 2 + getAvailableRadius() + 20) + 'rem'"
        fill="#FFFFFF"
        text-anchor="middle"
        dominant-baseline="hanging"
        font-size="1rem"
      >
        DEC
      </text>

      <text
        :x="px2rem(width / 2 - getAvailableRadius() - 10) + 'rem'"
        :y="px2rem(height / 2) + 'rem'"
        fill="#FFFFFF"
        text-anchor="end"
        dominant-baseline="middle"
        font-size="1rem"
      >
        LEFT
      </text>

      <text
        :x="px2rem(width / 2 + getAvailableRadius() + 10) + 'rem'"
        :y="px2rem(height / 2) + 'rem'"
        fill="#FFFFFF"
        text-anchor="start"
        dominant-baseline="middle"
        font-size="1rem"
      >
        RIGHT
      </text> -->

      <!-- Red dot marker -->
      <circle
        :cx="mapG2rem(latG, lonG).mappedX + 'rem'"
        :cy="mapG2rem(latG, lonG).mappedY + 'rem'"
        :r="1.5 * getStrokeWidth() + 'rem'"
        fill="#FF0000"
      />
    </svg>
  </gg-diagram>
</template>

<style src="./style.css" scoped></style>
