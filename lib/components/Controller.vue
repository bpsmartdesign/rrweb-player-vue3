<script setup lang="ts">
import { computed, onMounted, onUnmounted, onUpdated, ref, watch } from "vue";
import PlayerSwitch from "./PlayerSwitch.vue";
import { EventType } from "rrweb";
import { formatTime } from "./../utils";

// @ts-expect-error
import type { playerMetaData } from "rrweb/typings/types";
import type { Replayer } from "rrweb";
import type { PlayerMachineState, SpeedMachineState } from "rrweb/typings/replay/machine";

export interface RRWebControllerProps {
  replayer: Replayer;
  skipInactive: boolean;
  autoPlay: boolean;
  speedOption: number[];
  speed: number;
  goTo: number;
  showController: boolean;
  tags: Record<string, string>;
}

type CustomEvent = {
  name: string;
  background: string;
  position: string;
};

const emit = defineEmits([
  "speed",
  "fullscreen",
  "skip-inactive",
  "ui-update-current-time",
  "ui-update-progress",
  "ui-update-player-state",
]);

const props = withDefaults(defineProps<RRWebControllerProps>(), {
  replayer: undefined,
  skipInactive: false,
  autoPlay: true,
  speedOption: undefined,
  speed: undefined,
  goTo: undefined,
  showController: true,
  tags: undefined,
});

const _currentTime = ref<number>(0);
const _timer = ref<number>(0);
const _playerState = ref<"playing" | "paused" | "live">("playing");
const _speedState = ref<"normal" | "skipping">("normal");
const _finished = ref<boolean>(false);
const _meta = ref<playerMetaData>();
const _percentage = ref<string>("");

const __progress = ref<HTMLDivElement>();
const __step = ref<HTMLDivElement>();

const step = computed(() => __step.value);
const progress = computed(() => __progress.value);
const customEvents = computed(() => {
  const { context } = props.replayer.service.state;
  const totalEvents = context.events.length;
  const start = context.events[0].timestamp;
  const end = context.events[totalEvents - 1].timestamp;
  const _customEvents: CustomEvent[] = [];

  // calculate tag position.
  const position = (startTime: number, endTime: number, tagTime: number) => {
    const sessionDuration = endTime - startTime;
    const eventDuration = endTime - tagTime;
    const eventPosition = 100 - (eventDuration / sessionDuration) * 100;

    return eventPosition.toFixed(2);
  };

  // loop through all the events and find out custom event.
  context.events.forEach((event) => {
    /**
     * we are only interested in custom event and calculate it's position
     * to place it in player's timeline.
     */
    if (event.type === EventType.Custom) {
      const customEvent = {
        name: event.data.tag,
        background: props.tags[event.data.tag] || "rgb(73, 80, 246)",
        position: `${position(start, end, event.timestamp)}%`,
      };
      _customEvents.push(customEvent);
    }
  });
  return _customEvents;
});

const formatTimeLocal = (ms: number) => formatTime(ms);
const stopTimer = () => {
  if (_timer.value) {
    cancelAnimationFrame(_timer.value);
    _timer.value = 0;
  }
};
const loopTimer = () => {
  stopTimer();

  const update = () => {
    _currentTime.value = props.replayer.getCurrentTime();

    if (_currentTime.value < _meta.value.totalTime) {
      _timer.value = requestAnimationFrame(update);
    }
  };

  _timer.value = requestAnimationFrame(update);
};
const goTo = (timeOffset: number) => {
  const isPlaying = _playerState.value === "playing";

  _currentTime.value = timeOffset;

  props.replayer.pause();
  props.replayer.play(timeOffset);

  if (!isPlaying) {
    props.replayer.pause();
  }
};
const play = () => {
  if (_playerState.value !== "paused") {
    return;
  }
  if (_finished.value) {
    props.replayer.play();
    _finished.value = false;
  } else {
    props.replayer.play(_currentTime.value);
  }
};
const pause = () => {
  if (_playerState.value !== "playing") return;

  props.replayer.pause();
};
const toggle = () => {
  switch (_playerState.value) {
    case "playing":
      pause();
      break;
    case "paused":
      play();
      break;
    default:
      break;
  }
};
const setSpeed = (newSpeed: number) => {
  let needFreeze = _playerState.value === "playing";
  emit("speed", newSpeed);
  if (needFreeze) {
    props.replayer.pause();
  }
  props.replayer.setConfig({ speed: props.speed });
  if (needFreeze) {
    props.replayer.play(_currentTime.value);
  }
};
const handleProgressClick = (e: MouseEvent) => {
  if (!progress) return;
  if (_speedState.value === "skipping") return;

  const progressRect = progress.value!.getBoundingClientRect();
  const x = e.clientX - progressRect.left;

  let percent = x / progressRect.width;
  if (percent < 0) {
    percent = 0;
  } else if (percent > 1) {
    percent = 1;
  }
  const timeOffset = _meta.value.totalTime * percent;
  goTo(timeOffset);
};
const toggleSkipInactive = (canSkip: boolean) => {
  emit("skip-inactive", canSkip);
};

watch(
  () => _currentTime.value,
  (val) => {
    emit("ui-update-current-time", { payload: val });
    //? What is this technique below
    //
    const percent = Math.min(1, _currentTime.value / _meta.value.totalTime);
    _percentage.value = `${100 * percent}%`;
    emit("ui-update-progress", { payload: percent });
    //
  }
);
watch(
  () => _playerState.value,
  (val) => {
    emit("ui-update-player-state", { payload: val });
  }
);

onMounted(async () => {
  _meta.value = props.replayer.getMetaData();
  _playerState.value = props.replayer.service.state.value;
  _speedState.value = props.replayer.speedService.state.value;

  props.replayer.on(
    "state-change",
    //@ts-ignore
    (states: { player?: PlayerMachineState; speed?: SpeedMachineState }) => {
      const { player, speed } = states;
      if (player?.value && _playerState.value !== player.value) {
        _playerState.value = player.value;
        switch (_playerState.value) {
          case "playing":
            loopTimer();
            break;
          case "paused":
            stopTimer();
            break;
          default:
            break;
        }
      }
      if (speed?.value && _speedState.value !== speed.value) {
        _speedState.value = speed.value;
      }
    }
  );
  props.replayer.on("finish", () => {
    _finished.value = true;
  });

  if (props.autoPlay) {
    props.replayer.play();
  }

  if (props.goTo) {
    goTo(props.goTo);
  }
});
onUpdated(() => {
  if (props.skipInactive !== props.replayer.config.skipInactive) {
    props.replayer.setConfig({ skipInactive: props.skipInactive });
  }
});
onUnmounted(() => {
  props.replayer.pause();
  stopTimer();
});
</script>

<template>
  <div class="rr-controller" v-if="showController">
    <div class="rr-timeline">
      <span class="rr-timeline__time">{{ formatTimeLocal(_currentTime) }}</span>
      <div
        class="rr-progress"
        :class="{ disabled: _speedState === 'skipping' }"
        ref="__progress"
        @click="handleProgressClick"
      >
        <div class="rr-progress__step" ref="__step" :style="{ width: _percentage }" />
        <div
          v-for="(event, index) in customEvents"
          :key="index"
          :title="event.name"
          :data-id="index"
          style="
            width: 10px;
            height: 5px;
            position: absolute;
            top: 2px;
            transform: translate(-50%, -50%);
          "
          :style="{ background: event.background, left: event.position }"
        />

        <div class="rr-progress__handler" :style="{ left: _percentage }" />
      </div>
      <span class="rr-timeline__time">{{ formatTimeLocal(_meta?.totalTime) }}</span>
    </div>
    <div class="rr-controller__btns">
      <button @click="toggle">
        <template v-if="_playerState === 'playing'">
          <svg
            class="icon"
            viewBox="0 0 1024 1024"
            version="1.1"
            xmlns="http://www.w3.org/2000/svg"
            xmlns:xlink="http://www.w3.org/1999/xlink"
            width="16"
            height="16"
          >
            <path
              d="M682.65984 128q53.00224 0 90.50112 37.49888t37.49888 90.50112l0
              512q0 53.00224-37.49888 90.50112t-90.50112
              37.49888-90.50112-37.49888-37.49888-90.50112l0-512q0-53.00224
              37.49888-90.50112t90.50112-37.49888zM341.34016 128q53.00224 0
              90.50112 37.49888t37.49888 90.50112l0 512q0 53.00224-37.49888
              90.50112t-90.50112
              37.49888-90.50112-37.49888-37.49888-90.50112l0-512q0-53.00224
              37.49888-90.50112t90.50112-37.49888zM341.34016 213.34016q-17.67424
              0-30.16704 12.4928t-12.4928 30.16704l0 512q0 17.67424 12.4928
              30.16704t30.16704 12.4928 30.16704-12.4928
              12.4928-30.16704l0-512q0-17.67424-12.4928-30.16704t-30.16704-12.4928zM682.65984
              213.34016q-17.67424 0-30.16704 12.4928t-12.4928 30.16704l0 512q0
              17.67424 12.4928 30.16704t30.16704 12.4928 30.16704-12.4928
              12.4928-30.16704l0-512q0-17.67424-12.4928-30.16704t-30.16704-12.4928z"
            />
          </svg>
        </template>
        <template v-else>
          <svg
            class="icon"
            viewBox="0 0 1024 1024"
            version="1.1"
            xmlns="http://www.w3.org/2000/svg"
            xmlns:xlink="http://www.w3.org/1999/xlink"
            width="16"
            height="16"
          >
            <path
              d="M170.65984 896l0-768 640 384zM644.66944
              512l-388.66944-233.32864 0 466.65728z"
            />
          </svg>
        </template>
      </button>
      <template v-for="(s, index) in speedOption" :key="index">
        <button
          :data-id="index"
          :class="{ active: s === speed && _speedState !== 'skipping' }"
          @click="setSpeed(s)"
          :disabled="_speedState === 'skipping'"
        >
          {{ s }}x
        </button>
      </template>
      <PlayerSwitch
        id="skip"
        :checked="skipInactive"
        :disabled="_speedState === 'skipping'"
        :label="_speedState === 'skipping' ? 'Skiping ...' : 'skip inactive'"
        @input="toggleSkipInactive"
      />
      <button @click="$emit('fullscreen')">
        <svg
          class="icon"
          viewBox="0 0 1024 1024"
          version="1.1"
          xmlns="http://www.w3.org/2000/svg"
          xmlns:xlink="http://www.w3.org/1999/xlink"
          width="12"
          height="12"
        >
          <path
            d="M916 380c-26.4 0-48-21.6-48-48L868 223.2 613.6 477.6c-18.4
            18.4-48.8 18.4-68 0-18.4-18.4-18.4-48.8 0-68L800 156 692 156c-26.4
            0-48-21.6-48-48 0-26.4 21.6-48 48-48l224 0c26.4 0 48 21.6 48 48l0
            224C964 358.4 942.4 380 916 380zM231.2 860l108.8 0c26.4 0 48 21.6 48
            48s-21.6 48-48 48l-224 0c-26.4 0-48-21.6-48-48l0-224c0-26.4 21.6-48
            48-48 26.4 0 48 21.6 48 48L164 792l253.6-253.6c18.4-18.4 48.8-18.4
            68 0 18.4 18.4 18.4 48.8 0 68L231.2 860z"
            p-id="1286"
          />
        </svg>
      </button>
    </div>
  </div>
</template>

<style>
.rr-controller {
  width: 100%;
  height: 80px;
  background: #fff;
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  align-items: center;
  border-radius: 0 0 5px 5px;
}

.rr-timeline {
  width: 80%;
  display: flex;
  align-items: center;
}

.rr-timeline__time {
  display: inline-block;
  width: 100px;
  text-align: center;
  color: #11103e;
}

.rr-progress {
  flex: 1;
  height: 12px;
  background: #eee;
  position: relative;
  border-radius: 3px;
  cursor: pointer;
  box-sizing: border-box;
  border-top: solid 4px #fff;
  border-bottom: solid 4px #fff;
}

.rr-progress.disabled {
  cursor: not-allowed;
}

.rr-progress__step {
  height: 100%;
  position: absolute;
  left: 0;
  top: 0;
  background: #e0e1fe;
}

.rr-progress__handler {
  width: 20px;
  height: 20px;
  border-radius: 10px;
  position: absolute;
  top: 2px;
  transform: translate(-50%, -50%);
  background: rgb(73, 80, 246);
}

.rr-controller__btns {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  font-size: 13px;
}

.rr-controller__btns button {
  width: 32px;
  height: 32px;
  display: flex;
  padding: 0;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

.rr-controller__btns button:hover {
  opacity: 0.75;
}

.rr-controller__btns button:active {
  background: #e0e1fe;
}

.rr-controller__btns button.active {
  color: #fff;
  background: rgb(73, 80, 246);
}

.rr-controller__btns button:disabled {
  cursor: not-allowed;
}
</style>
