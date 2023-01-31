<script setup lang="ts">
import { ref } from "vue";
import Player from "./../lib/components/Player.vue";
import events from "./../dev/data";
import { events2 } from "../dev/events-2";

const _events = ref<any[]>(events);
const _events3 = ref<any[]>(events2);
</script>

<template>
  <Player :events="_events" :width="400" :height="200" :go-to="5000" :auto-play="false" /> <br />
  <Player :events="_events3" :width="800" :height="350" :go-to="15000" :auto-play="false" />
</template>
