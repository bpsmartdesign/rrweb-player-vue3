<script setup lang="ts">
import { ref } from 'vue';
import Player from './components/Player.vue'
import events from './../dev/data'

const _events = ref<any[]>(events)
</script>

<template>
  <Player :events="_events" />
</template>
