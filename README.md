
# rrweb player vue

Vue-based player for [rrweb](https://github.com/rrweb-io/rrweb)

## Installation

### npm

```sh
npm install @bpsmartdesign/rrweb-player-vue-3
```

### Yarn

```sh
yarn add @bpsmartdesign/rrweb-player-vue-3
```

## Basic usage

```vue
<template>
  <RrWebPlayer :events="events" />
</template>

<script>
import RrWebPlayer from '@bpsmartdesign/rrweb-player-vue-3'
export default {
  components: {
    RrWebPlayer
  },
  data: () => ({
    events: []
  })
}
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
