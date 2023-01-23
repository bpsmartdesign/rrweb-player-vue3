
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
import '@bpsmartdesign/rrweb-player-vue3/dist/style.css'

const events = ref<any[]>([]) // Events are required, Full type will be available in next versions
</script>

```

## Props

| Name | Type     | Default                |
| :-------- | :------- | :------------------------- |
| events | `Array` | `[]` |
| width | `number` | `1024` |
| height | `number` | `576` |
| goto | `number` | `undefined` |
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

## Versions

### To-Do

-[x] The initial version of rrweb-player for vue3
-[ ] Fix `skip innactive`
-[ ] Fix `go-to`
-[ ] Fix auto-play setted to true sometimes
-[ ] Set definitions files for ts and autocomplete

## Issues / Suggestions

If you find any bugs or if you have any suggestion, please open an issue.

## Get in touch

- Author:  BIYA Paul (bpsmartdesign) <bpsmartdesign@hotmail.com>
- [github](https://github.com/bpsmartdesign)
- [portfolio](https://bpsmartdesign.netlify.app)

## Suport

<a href="https://www.buymeacoffee.com/bpsmartdesign">
  <img src="https://img.buymeacoffee.com/button-api/?text=Buy me a Sandwitch 😉&emoji=🥪&slug=bpsmartdesign&button_colour=5F7FFF&font_colour=ffffff&font_family=Inter&outline_colour=000000&coffee_colour=FFDD00" />
</a>
