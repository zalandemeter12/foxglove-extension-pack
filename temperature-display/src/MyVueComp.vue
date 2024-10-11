<script>
import { defineComponent, ref, watch, onMounted, onBeforeUnmount } from "vue";
import { produce } from "immer";
import { set, merge } from "lodash";
import { reactive } from "vue";
import CircleProgress from "js-circle-progress";

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
    const circleValue = ref(Math.floor(Math.random() * 38));

    const defaultState = {
      data: {
        label: "Data",
        topic: "",
        unit: "°",
        min: 0,
        max: 100,
      },
    };

    const state = ref(merge({}, defaultState, context.initialState));

    const textFormatFunc = ref((val) => val + state.value.data.unit);
    const progressValue = ref(circleValue.value / state.value.data.max);

    const handleRender = (renderState, done) => {
      renderDone.value = done;
      topics.value = renderState.topics || [];
      messages.value = renderState.currentFrame || [];

      debugString.value = JSON.stringify(messages.value, null, 2);
    };

    const updateSettingsEditor = () => {
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
              unit: {
                label: "Unit",
                input: "string",
                value: state.value.data.unit,
              },
              min: {
                label: "Min",
                input: "number",
                value: state.value.data.min,
              },
              max: {
                label: "Max",
                input: "number",
                value: state.value.data.max,
              },
            },
          },
        },
      });
    };

    const settingsActionHandler = (action) => {
      if (action.action === "update") {
        const { path, value } = action.payload;
        state.value = produce(state.value, (draft) => set(draft, path, value));

        // If the topic was changed, update our subscriptions.
        if (path[1] === "topic") {
          context.unsubscribeAll();
          context.subscribe([{ topic: value }]);
        }

        if (path[1] === "unit") {
          textFormatFunc.value = (val) => val + state.value.data.unit;
        }

        if (path[1] === "max") {
          progressValue.value =
            (circleValue.value - state.value.data.min) /
            (state.value.data.max - state.value.data.min);
        }

        if (path[1] === "min") {
          progressValue.value =
            (circleValue.value - state.value.data.min) /
            (state.value.data.max - state.value.data.min);
        }
      }
    };

    onMounted(() => {
      context.onRender = handleRender;
      context.watch("topics");
      context.watch("currentFrame");

      // Initialize settings editor
      updateSettingsEditor();
    });

    watch(
      () => renderDone.value,
      (done) => {
        if (done) {
          // debugString.value = JSON.stringify(messages?.value, null, 2);

          document.querySelector("#value-input").addEventListener("change", (e) => {
            circleValue.value = e.target.value;
            progressValue.value =
              (circleValue.value - state.value.data.min) /
              (state.value.data.max - state.value.data.min);
          });

          textFormatFunc.value = (val) => val + state.value.data.unit;

          done();
          renderDone.value = null;
        }
      },
    );

    watch(
      [state, topics],
      () => {
        updateSettingsEditor();
        context.saveState(state.value);
      },
      { deep: true },
    );

    onBeforeUnmount(() => {
      const { context } = props;
      context.unsubscribeAll();
    });

    return {
      topics,
      messages,
      debugString,
      state,
      circleValue,
      textFormatFunc,
      progressValue,
      messagesCount: () => messages.value.length,
    };
  },
});
</script>

<template>
  <!-- <pre>{{ progressValue }}</pre> -->
  <circle-progress
    class="progress"
    :value="circleValue"
    :max="state.data.max"
    :min="state.data.min"
    :textFormat="textFormatFunc"
    :style="{
      '--progress-value': progressValue,
    }"
    animationDuration="250"
  ></circle-progress>
</template>

<style src="./style.css" scoped></style>
