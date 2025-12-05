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

    const currentLonTopic = ref("");
    const currentLonField = ref("");
    const currentLatTopic = ref("");
    const currentLatField = ref("");

    const width = ref(0);
    const height = ref(0);

    const randomDivClass = common.generateRandomDivClass("value-display");

    const latG = ref(0);
    const lonG = ref(0);

    // For frequency calculation
    const lastLatTimestamp = ref(null);
    const lastLonTimestamp = ref(null);
    const latFrequencies = ref([]);
    const lonFrequencies = ref([]);
    const frequencyWindowSize = 10; // Number of samples to calculate average frequency

    // Add position history for the trail effect
    // Store the original G values, not the screen coordinates
    const positionHistory = ref([]);
    let historyTimer = null;
    let sizeObserverInitialized = false;

    // Function to calculate the current signal frequency
    const updateFrequency = (isLat, timestamp) => {
      const frequencies = isLat ? latFrequencies : lonFrequencies;
      const lastTimestamp = isLat ? lastLatTimestamp : lastLonTimestamp;

      if (lastTimestamp.value !== null) {
        const timeDiff = timestamp - lastTimestamp.value;
        if (timeDiff > 0) {
          const frequency = 1000 / timeDiff; // frequency in Hz
          frequencies.value.push(frequency);

          // Keep only the most recent measurements
          if (frequencies.value.length > frequencyWindowSize) {
            frequencies.value.shift();
          }
        }
      }

      // Update the last timestamp
      if (isLat) {
        lastLatTimestamp.value = timestamp;
      } else {
        lastLonTimestamp.value = timestamp;
      }
    };

    // Function to get the average frequency
    const getAverageFrequency = (frequencies) => {
      if (frequencies.length === 0) return 0; // Default to 20Hz if no data yet
      return frequencies.reduce((sum, freq) => sum + freq, 0) / frequencies.length;
    };

    // Function to calculate the required number of history points
    const calculateRequiredHistoryPoints = () => {
      const latFreq = getAverageFrequency(latFrequencies.value);
      const lonFreq = getAverageFrequency(lonFrequencies.value);
      const highestFreq = Math.max(latFreq, lonFreq);

      // Calculate points needed for the history duration
      // Add 10% buffer to ensure smooth visualization
      return Math.ceil(((highestFreq * state.value.display.historySec * 1000) / 1000) * 1.1);
    };

    const updateSubscriptions = () => {
      const subscriptions = [];
      const { firstPart: lonTopic, lastPart: lonField } = common.splitTopic(
        state.value.data.lonTopic || "",
      );
      const oldLonTopic = currentLonTopic.value;
      currentLonTopic.value = lonTopic || "";
      currentLonField.value = lonField || "";
      if (lonTopic) {
        subscriptions.push({ topic: lonTopic });
      }

      const { firstPart: latTopic, lastPart: latField } = common.splitTopic(
        state.value.data.latTopic || "",
      );
      const oldLatTopic = currentLatTopic.value;
      currentLatTopic.value = latTopic || "";
      currentLatField.value = latField || "";
      if (latTopic) {
        subscriptions.push({ topic: latTopic });
      }

      // Only update subscriptions if topics actually changed
      if (oldLonTopic !== lonTopic || oldLatTopic !== latTopic) {
        context.unsubscribeAll();
        if (subscriptions.length > 0) {
          context.subscribe(subscriptions);
        }
      }
    };

    const handleRender = (renderState, done) => {
      topics.value = renderState.topics || [];
      messages.value = renderState.currentFrame || [];

      const currentTimestamp = Date.now();

      if (!currentLonField.value) {
        lonG.value = 0;
      } else if (messages.value.length > 0) {
        const value = common.parseValue(messages.value[0].message, currentLonField.value);
        if (value !== undefined) {
          const sign = state.value.data.invertLon ? -1 : 1;
          if (state.value.data.input == "g") {
            lonG.value = sign * value;
          } else if (state.value.data.input == "m/s2") {
            lonG.value = (sign * value) / 9.81; // Convert to g
          }
          updateFrequency(false, currentTimestamp);
        } else {
          lonG.value = 0;
        }
      }

      if (!currentLatField.value) {
        latG.value = 0;
      } else if (messages.value.length > 0) {
        const value = common.parseValue(messages.value[0].message, currentLatField.value);
        if (value !== undefined) {
          const sign = state.value.data.invertLat ? -1 : 1;
          if (state.value.data.input == "g") {
            latG.value = sign * value;
          } else if (state.value.data.input == "m/s2") {
            latG.value = (sign * value) / 9.81; // Convert to g
          }
          updateFrequency(true, currentTimestamp);
        } else {
          latG.value = 0;
        }
      }

      if (!sizeObserverInitialized) {
        common.getWidthHeight(width, height, randomDivClass);
        sizeObserverInitialized = true;
      }

      // Call done() immediately to signal render completion
      done();
    };

    // Function to capture the current position for the trail
    const capturePosition = () => {
      // Add to history with full opacity - store G values instead of screen coordinates
      positionHistory.value.push({
        latG: latG.value,
        lonG: lonG.value,
        opacity: 1.0,
        timestamp: Date.now(),
      });

      // Update opacity of all points based on age
      const now = Date.now();

      positionHistory.value = positionHistory.value
        .map((point) => {
          const age = now - point.timestamp;
          const opacity = Math.max(0.5, 1 - age / (state.value.display.historySec * 1000));
          return { ...point, opacity };
        })
        // Filter out points that are fully transparent
        .filter((point) => point.opacity > 0);

      // Calculate required history points based on current signal frequency
      const requiredPoints = calculateRequiredHistoryPoints();

      // Limit the number of history points based on calculated frequency
      // in a for loop remove the oldest points until the length is equal to requiredPoints
      while (positionHistory.value.length > requiredPoints) {
        positionHistory.value.shift();
      }

      debugString.value = `Required Points: ${requiredPoints}, Current Points: ${positionHistory.value.length}`;
    };

    const settingsActionHandler = (action) => {
      if (action.action === "update") {
        const { path, value } = action.payload;
        state.value = produce(state.value, (draft) => set(draft, path, value));

        if (path[1] === "lonTopic" || path[1] === "latTopic") {
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
      
      // Set up subscriptions only if we have topics
      if (state.value.data.lonTopic || state.value.data.latTopic) {
        updateSubscriptions();
      }

      if (!sizeObserverInitialized) {
        common.getWidthHeight(width, height, randomDivClass);
        sizeObserverInitialized = true;
      }

      historyTimer = setInterval(capturePosition, 50); // Capture position every 50ms
    });

    watch([currentLonField, currentLonTopic], ([newField, newTopic]) => {
      lonG.value = 0;
      // Reset frequency calculations when topic changes
      lonFrequencies.value = [];
      lastLonTimestamp.value = null;
    });

    watch([currentLatField, currentLatTopic], ([newField, newTopic]) => {
      latG.value = 0;
      // Reset frequency calculations when topic changes
      latFrequencies.value = [];
      lastLatTimestamp.value = null;
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

      if (historyTimer) {
        clearInterval(historyTimer);
        historyTimer = null;
      }
    });

    const clampMax = () => {
      return Math.max(1, state.value.data.max);
    };

    const getStrokeWidth = () => {
      return (Math.min(height.value, width.value) / 500) * (1 - state.value.data.max / 25);
    };

    const px2rem = (px) => {
      return px / 16;
    };

    const getFontSizeRem = () => {
      if (state.value.display.fontSize === "auto") {
        return px2rem(Math.min(height.value, width.value)) * 0.075;
      }
      // remove the px from the fontSize string
      const fontSize = parseFloat(state.value.display.fontSize.replace("px", ""));
      return px2rem(fontSize);
    };

    const getValueFontSizeRem = () => {
      if (state.value.display.valueLabels) {
        return getFontSizeRem();
      }
      return 0;
    };

    const getAvailableRadius = () => {
      return (
        px2rem(Math.min(height.value, width.value) / 2) -
        2 * getStrokeWidth() -
        getValueFontSizeRem()
      );
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
      currentLonTopic,
      currentLonField,
      randomDivClass,
      height,
      width,
      clampMax,
      getFontSizeRem,
      getValueFontSizeRem,
      getAvailableRadius,
      calculateRadius,
      getStrokeWidth,
      px2rem,
      mapG2rem,
      latG,
      lonG,
      positionHistory,
    };
  },
});
</script>

<template>
  <gg-display :class="randomDivClass + ' gg-display'">
    <svg :width="width" :height="height">
      <!-- Background circle -->
      <circle
        key="background"
        :cx="px2rem(width / 2) + 'rem'"
        :cy="px2rem(height / 2) - getValueFontSizeRem() + 'rem'"
        :r="calculateRadius(clampMax()) + getStrokeWidth() / 2 + 'rem'"
        fill="#303030"
      />

      <!-- Trail dots (history) - Now mapping G values on-the-fly -->
      <circle
        v-for="(point, index) in positionHistory"
        :key="'trail-' + index"
        :cx="mapG2rem(point.latG, point.lonG).mappedX + 'rem'"
        :cy="mapG2rem(point.latG, point.lonG).mappedY - getValueFontSizeRem() + 'rem'"
        :r="getStrokeWidth() + 'rem'"
        :fill="state.display.historyColor"
        :fill-opacity="point.opacity"
      />

      <!-- Concentric circles -->
      <circle
        v-for="index in clampMax()"
        :key="index"
        :cx="px2rem(width / 2) + 'rem'"
        :cy="px2rem(height / 2) - getValueFontSizeRem() + 'rem'"
        :r="calculateRadius(index) + 'rem'"
        stroke="#636363"
        :stroke-width="getStrokeWidth() + 'rem'"
        fill="transparent"
        stroke-opacity="0.8"
      />

      <!-- Cross lines -->
      <line
        :x1="px2rem(width / 2) + 'rem'"
        :y1="
          px2rem(height / 2) -
          getValueFontSizeRem() -
          getAvailableRadius() -
          getStrokeWidth() / 2 +
          'rem'
        "
        :x2="px2rem(width / 2) + 'rem'"
        :y2="
          px2rem(height / 2) -
          getValueFontSizeRem() +
          getAvailableRadius() +
          getStrokeWidth() / 2 +
          'rem'
        "
        stroke="#636363"
        :stroke-width="getStrokeWidth() + 'rem'"
        stroke-opacity="0.8"
      />
      <line
        :x1="px2rem(width / 2) - getAvailableRadius() - getStrokeWidth() / 2 + 'rem'"
        :y1="px2rem(height / 2) - getValueFontSizeRem() + 'rem'"
        :x2="px2rem(width / 2) + getAvailableRadius() + getStrokeWidth() / 2 + 'rem'"
        :y2="px2rem(height / 2) - getValueFontSizeRem() + 'rem'"
        stroke="#636363"
        :stroke-width="getStrokeWidth() + 'rem'"
        stroke-opacity="0.8"
      />

      <!-- Text for 0x-y -->
      <text
        v-for="index in clampMax() * state.display.axisLabels"
        :key="'0x-y' + index"
        :x="px2rem(width / 2) + 'rem'"
        :y="
          px2rem(height / 2) -
          getValueFontSizeRem() +
          calculateRadius(index) +
          0.5 * getStrokeWidth() +
          'rem'
        "
        text-anchor="middle"
        :font-size="0.75 * getFontSizeRem() + 'rem'"
        fill="#CCCCCC"
        font-family="Arial, sans-serif"
        font-weight="bold"
      >
        -{{ index }}
      </text>

      <!-- Text for 0x+y -->
      <text
        v-for="index in clampMax() * state.display.axisLabels"
        :key="'0x+y' + index"
        :x="px2rem(width / 2) + 'rem'"
        :y="
          px2rem(height / 2) -
          getValueFontSizeRem() -
          calculateRadius(index) +
          0.5 * getStrokeWidth() +
          'rem'
        "
        text-anchor="middle"
        :font-size="0.75 * getFontSizeRem() + 'rem'"
        fill="#CCCCCC"
        font-family="Arial, sans-serif"
        font-weight="bold"
      >
        {{ index }}
      </text>

      <!-- Text for -x0y -->
      <text
        v-for="index in clampMax() * state.display.axisLabels"
        :key="'-x0y' + index"
        :x="px2rem(width / 2) - calculateRadius(index) + 'rem'"
        :y="px2rem(height / 2) - getValueFontSizeRem() + 0.5 * getStrokeWidth() + 'rem'"
        text-anchor="middle"
        :font-size="0.75 * getFontSizeRem() + 'rem'"
        fill="#CCCCCC"
        font-family="Arial, sans-serif"
        font-weight="bold"
      >
        -{{ index }}
      </text>

      <!-- Text for +x0y -->
      <text
        v-for="index in clampMax() * state.display.axisLabels"
        :key="'+x0y' + index"
        :x="px2rem(width / 2) + calculateRadius(index) + 'rem'"
        :y="px2rem(height / 2) - getValueFontSizeRem() + 0.5 * getStrokeWidth() + 'rem'"
        text-anchor="middle"
        :font-size="0.75 * getFontSizeRem() + 'rem'"
        fill="#CCCCCC"
        font-family="Arial, sans-serif"
        font-weight="bold"
      >
        {{ index }}
      </text>

      <!-- LonG, LatG as text -->
      <text
        :x="px2rem(width / 2) + 'rem'"
        :y="px2rem(height / 2) + getValueFontSizeRem() + getAvailableRadius() + 'rem'"
        text-anchor="middle"
        :font-size="getValueFontSizeRem() + 'rem'"
        fill="#ffffff"
        font-family="Arial, sans-serif"
        font-weight="bold"
      >
        Lon: {{ lonG.toFixed(Math.max(0, state.display.precision)) }} g&#x2003;Lat:
        {{ latG.toFixed(Math.max(0, state.display.precision)) }} g
      </text>

      <!-- Red dot marker (current position) -->
      <circle
        :cx="mapG2rem(latG, lonG).mappedX + 'rem'"
        :cy="mapG2rem(latG, lonG).mappedY - getValueFontSizeRem() + 'rem'"
        :r="1.5 * getStrokeWidth() + 'rem'"
        :fill="state.display.markerColor"
      />
    </svg>
  </gg-display>
</template>

<style src="./style.css" scoped></style>
