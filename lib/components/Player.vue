<script setup lang="ts">
// @ts-expect-error
import type { eventWithTime } from "rrweb/typings/types";
import { Replayer, unpack } from "rrweb";
import {
  openFullscreen,
  exitFullscreen,
  isFullscreen,
  onFullscreenChange,
  inlineCss,
} from "./../utils";
import {
  computed,
  nextTick,
  onMounted,
  onUnmounted,
  ref,
  watch,
  WritableComputedRef,
} from "vue";
import Controller from "./Controller.vue";

export interface PlayerProps {
  width?: number;
  height?: number;
  goTo?: number;
  events: eventWithTime[];
  skipInactive?: boolean;
  autoPlay?: boolean;
  speedOption: number[];
  speed?: number;
  showController: boolean;
  tags: Record<string, string>;
}

const emit = defineEmits([
  "update:skip-inactive",
  "update:speed",
  "update:height",
  "update:width",
  "ui-update-current-time",
  "ui-update-player-state",
]);

const props = withDefaults(defineProps<PlayerProps>(), {
  width: undefined,
  height: undefined,
  goTo: undefined,
  speed: undefined,
  autoPlay: false,
  skipInactive: false,
  showController: true,
  events: () => [],
  speedOption: () => [1, 2, 4, 8],
  tags: () => ({}),
});

const _width = ref<number>(0);
const _height = ref<number>(0);
const _defaultSpeed = ref<number>(1);
const _defaultWidth = ref<number>(1024);
const _defaultHeight = ref<number>(576);
const _replayer = ref<Replayer>();
const _controllerHeight = ref<number>(80);
const _defaultSkipInactive = ref<boolean>(false);

const __player = ref<HTMLDivElement>();
const __frame = ref<HTMLDivElement>();

const frame = computed(() => __frame.value);
const replayerInitialized = computed(() => _replayer.value instanceof Replayer);
const style = computed<string>(() =>
  inlineCss({
    width: `${computedWidth.value}px`,
    height: `${computedHeight.value}px`,
  })
);
const playerStyle = computed<string>(() =>
  inlineCss({
    width: `${computedWidth.value}px`,
    height: `${
      computedHeight.value + (props.showController ? _controllerHeight.value : 0)
    }px`,
  })
);
const computedSpeed = computed({
  get: () => props.speed ?? _defaultSpeed.value,
  set(speed: number) {
    if (props.speed) {
      emit('update:speed', speed)
    } else {
      _defaultSpeed.value = speed
    }
  }
})
const computedWidth = computed({
  get: () => props.width ?? _defaultWidth.value,
  set(width: number) {
    if (props.width) {
      emit('update:width', width)
    } else {
      _defaultWidth.value = width
    }
  }
})
const computedHeight = computed({
  get: () => props.height ?? _defaultHeight.value,
  set(height: number) {
    if (props.height) {
      emit('update:height', height)
    } else {
      _defaultHeight.value = height
    }
  }
})
const computedSkipInactive = computed({
  get: () => props.skipInactive ?? _defaultSkipInactive.value,
  set(skipInactive: boolean) {
    console.log('setting up skip-inactive: ', skipInactive)
    if (props.skipInactive !== undefined) {
      emit('update:skip-inactive', skipInactive)
    } else {
      _defaultSkipInactive.value = skipInactive
    }
  }
})

let fullScreenListener = () => {};

const updateScale = (
  el: HTMLElement | undefined,
  frameDimension: { width: number; height: number }
) => {
  const widthScale = computedWidth.value / frameDimension.width;
  const heightScale = computedHeight.value / frameDimension.height;

  if (el) {
    el.style.transform = `scale(${Math.min(
      widthScale,
      heightScale,
      1
    )}) translate(-50%, -50%)`;
  }
};
const toggleFullScreen = () => {
  if (__player.value) {
    isFullscreen() ? exitFullscreen() : openFullscreen(__player.value);
  }
};
const toggleSkipInactive = (canSkip: boolean) => {
  computedSkipInactive.value = canSkip;
};
const setSpeed = (val: number) => {
  computedSpeed.value = val;
};

watch(
  () => computedSpeed.value,
  (val) => {
    if (!replayerInitialized.value) return;
    _replayer.value?.setConfig({ speed: val });
  },
  { immediate: true }
);
watch(
  () => computedSkipInactive.value,
  (val) => {
    if (!replayerInitialized.value) return;
    _replayer.value?.setConfig({ skipInactive: val });
  },
  { immediate: true }
);

onMounted(async () => {
  if (props.speedOption !== undefined && !Array.isArray(props.speedOption)) {
    throw new Error("speedOption must be array");
  }

  props.speedOption.forEach((option: any) => {
    if (typeof option !== "number") {
      throw new Error("item of speedOption must be number");
    }
  });

  _defaultSpeed.value = props.speedOption[0];

  if (props.speedOption.indexOf(computedSpeed.value) < 0) {
    throw new Error(`speed must be one of speedOption,
      current config: {
        ...
        speed: ${computedSpeed.value},
        speedOption: [${props.speedOption.toString()}]
        ...
      }
    `);
  }

  _replayer.value = new Replayer(props.events, {
    speed: computedSpeed.value,
    root: frame.value,
    unpackFn: unpack,
  });

  await nextTick();

  _replayer.value.on(
    "resize",
    // @ts-expect-error
    (dimensions: { width: number; height: number }) => {
      updateScale(_replayer.value?.wrapper, dimensions);
    }
  );

  fullScreenListener = onFullscreenChange(() => {
    if (isFullscreen()) {
      setTimeout(() => {
        _width.value = computedWidth.value;
        _height.value = computedHeight.value;
        (computedWidth as WritableComputedRef<number>).value =
          __player.value?.offsetWidth ?? 0;
        (computedHeight as WritableComputedRef<number>).value =
          __player.value?.offsetHeight ?? 0;
        updateScale(_replayer.value?.wrapper, {
          width: _replayer.value?.iframe.offsetWidth ?? 0,
          height: _replayer.value?.iframe.offsetHeight ?? 0,
        });
      }, 0);
    } else {
      (computedWidth as WritableComputedRef<number>).value = _width.value;
      (computedHeight as WritableComputedRef<number>).value = _height.value;
      updateScale(_replayer.value?.wrapper, {
        width: _replayer.value?.iframe.offsetWidth ?? 0,
        height: _replayer.value?.iframe.offsetHeight ?? 0,
      });
    }
  });
});
onUnmounted(() => {
  fullScreenListener && fullScreenListener();
});
</script>

<template>
  <div class="rr-player" ref="__player" :style="playerStyle">
    <div class="rr-player__frame" ref="__frame" :style="style"></div>
    <template v-if="_replayer && Object.values(_replayer as any).length">
      <Controller
        ref="controller"
        :replayer="_replayer"
        :show-controller="showController"
        :auto-play="autoPlay"
        :speed-option="speedOption"
        :tags="tags"
        :speed="computedSpeed"
        :go-to="goTo"
        @speed="setSpeed"
        @skip-inactive="toggleSkipInactive"
        @fullscreen="toggleFullScreen"
        @ui-update-current-time="$emit('ui-update-current-time', $event.payload)"
        @ui-update-player-state="$emit('ui-update-player-state', $event.payload)"
      />
    </template>
  </div>
</template>

<style>
@import "./../style.css";

.rr-player {
  position: relative;
  background: white;
  float: left;
  border-radius: 5px;
  box-shadow: 0 24px 48px rgba(17, 16, 62, 0.12);
}

.rr-player__frame {
  overflow: hidden;
}

.replayer-wrapper {
  float: left;
  clear: both;
  transform-origin: top left;
  left: 50%;
  top: 50%;
}

.replayer-wrapper > iframe {
  border: none;
}
</style>
