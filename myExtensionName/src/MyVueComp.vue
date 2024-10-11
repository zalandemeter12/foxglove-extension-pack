<script>
import { defineComponent, ref, watch, onMounted, onBeforeUnmount } from "vue";

export default defineComponent({
  props: {
    context: {
      type: Object,
      required: true,
    },
  },
  setup(props) {
    const topics = ref([]);
    const messages = ref([]);
    const renderDone = ref(null);

    const handleRender = (renderState, done) => {
      renderDone.value = done;
      topics.value = renderState.topics || [];
      messages.value = renderState.currentFrame || [];
    };

    onMounted(() => {
      const { context } = props;

      context.onRender = handleRender;

      context.watch("topics");
      context.watch("currentFrame");
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

    onBeforeUnmount(() => {
      const { context } = props;
      context.unsubscribeAll();
    });

    return {
      topics,
      messagesCount: () => messages.value.length,
    };
  },
});
</script>

<template>
  <div style="padding: 1rem">
    <h2>Welcome to your new extension panel!</h2>
    <p>
      Check the
      <a
        href="https://foxglove.dev/docs/studio/extensions/getting-started"
        target="_blank"
        rel="noopener noreferrer"
      >
        documentation
      </a>
      for more details on building extension panels for Foxglove Studio.
    </p>
    <div style="display: grid; grid-template-columns: 1fr 1fr; row-gap: 0.2rem">
      <b style="border-bottom: 1px solid">Topic</b>
      <b style="border-bottom: 1px solid">Schema name</b>
      <template v-for="topic in topics" :key="topic.name">
        <div>{{ topic.name }}</div>
        <div>{{ topic.schemaName }}</div>
      </template>
    </div>
  </div>
</template>
