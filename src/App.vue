<script setup lang="ts">
import { ref } from "vue";
import Player from "./../lib/components/Player.vue";
import events from "./../dev/data";
import { events2 } from "../dev/events-2";

const _events = ref<any[]>(events);
const _events3 = ref<any[]>(events2);
</script>

<template>
  <div>
    <!-- <Player :events="_events" :width="900" :height="350" :auto-play="true" /> <br /> -->
    <Player
      :events="_events3"
      :width="800"
      :height="350"
      :go-to="15000"
      :auto-play="false"
    />
  </div>
</template>
