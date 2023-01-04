<script setup lang="ts">
// @ts-expect-error
import type { eventWithTime } from "rrweb/typings/types";
import { Replayer, unpack } from "rrweb";
import {
  openFullscreen,
  exitFullscreen,
  isFullscreen,
  onFullscreenChange,
} from "./../utils";
import { computed, nextTick, onMounted, ref, WritableComputedRef } from "vue";

export interface PlayerProps {
  width?: number;
  height?: number;
  events: eventWithTime[];
  skipInactive?: boolean;
  autoPlay?: boolean;
  speedOption: number[];
  speed?: number;
  showController: boolean;
  tags: Record<string, string>;
}

const props = withDefaults(defineProps<PlayerProps>(), {
  width: undefined,
  height: undefined,
  events: undefined,
  skipInactive: false,
  autoPlay: true,
  speedOption: undefined,
  speed: undefined,
  showController: true,
  tags: undefined,
});

const _width = ref<number>(0);
const _height = ref<number>(0);
const _defaultSpeed = ref<number>(1);
const _defaultWidth = ref<number>(1024);
const _defaultHeight = ref<number>(576);
const _replayer = ref<Replayer>();

// @ts-ignore
const _controllerHeight = ref<number>(80);
// @ts-ignore
const _defaultSkipInactive = ref<boolean>(false);


const __player = ref<HTMLDivElement>();
const __frame = ref<HTMLDivElement>();

// @ts-expect-error
const computedWidth = computed<number>(() => {
  get: () => props.width ?? _defaultWidth.value;
  set: (v: number) => {
    if (props.width) {
      // emit event?
    } else {
      _defaultWidth.value = v;
    }
  };
});
// @ts-expect-error
const computedHeight = computed<number>(() => {
  get: () => props.height ?? _defaultHeight.value;
  set: (v: number) => {
    if (props.height) {
      // emit event?
    } else {
      _defaultHeight.value = v;
    }
  };
});
// @ts-expect-error
const computedSpeed = computed<number>(() => {
  get: (): number => props.speed ?? _defaultSpeed.value;
  set: (v: number) => {
    if (props.speed) {
      // emit event?
    } else {
      _defaultSpeed.value = v;
    }
  };
});

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
// @ts-expect-error
const toggleFullScreen = () => {
  if (__player.value) {
    isFullscreen() ? exitFullscreen() : openFullscreen(__player.value)
  }
}

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
    root: __frame.value,
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

  onFullscreenChange(() => {
    if (isFullscreen()) {
      setTimeout(() => {
        _width.value = computedWidth.value;
        _height.value = computedHeight.value;
        (computedWidth as WritableComputedRef<number>).value = __player.value?.offsetWidth ?? 0;
        (computedHeight as WritableComputedRef<number>).value = __player.value?.offsetHeight ?? 0;
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
</script>

<template>
  <div class="rr-player" ref="__player">
    <div class="rr-player__frame" ref="__frame"></div>
  </div>
</template>
