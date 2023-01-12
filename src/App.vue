<script setup lang="ts">
import { ref } from "vue";
import Player from "./../lib/components/Player.vue";
import events from "./../dev/data";
import { events2, pageInfoDiagram } from "../dev/events-2";

const _events = ref<any[]>(events);
const _events2 = ref<any[]>(events2);
const _screenshots = ref<any[]>(pageInfoDiagram);
</script>

<template>
  <Player :events="_events" :width="400" :height="200" :go-to="5000" :auto-play="false" />

  <div>
    <div v-for="(s, id) in _screenshots" :key="id">
      <Player
        class="mb-4"
        :events="_events2"
        :auto-play="false"
        :width="400"
        :height="200"
        :go-to="(s as any)?.offset_ms"
      />
    </div>
  </div>
</template>
