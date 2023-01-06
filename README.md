
# rrweb player vue

Vue3-based player for [rrweb](https://github.com/rrweb-io/rrweb)

## Installation

### npm

```sh
npm install @bpsmartdesign/rrweb-player-vue3
```

### Yarn

```sh
yarn add @bpsmartdesign/rrweb-player-vue3
```

### pnpm

```sh
pnpm install @bpsmartdesign/rrweb-player-vue3
```

## Basic usage

```vue
<template>
  <RRWebPlayer :events="events" />
</template>

<script lang="ts" setup>
import { ref } from "vue"
import { RRWebPlayer } from '@bpsmartdesign/rrweb-player-vue3'
import '@bpsmartdesign/rrweb-player-vue3/dist/styles.css'

const events = ref<any[]>([]) // Events are required, Full type will be available in next versions
</script>

```

## Props

| Name | Type     | Default                |
| :-------- | :------- | :------------------------- |
| events | `Array` | `[]` |
| width | `number` | `1024` |
| height | `number` | `576` |
| skipInactive | `boolean` | `true` |
| autoplay | `boolean` | `true` |
| speedOption | `number[]` | `[1, 2, 4, 8]` |
| speed | `number` | `speedOption[0]` |
| showController | `boolean` | `true` |
| tags | `Object` | `{}` |

## Events

| Name |
| :-------- |
| ui-update-current-time
| ui-update-player-state

## Notes

- Typscript types will be fully available in the nexts version
- If you like it, give a star 🙂.
