<script setup lang="ts">import { computed, ref } from 'vue';

export interface PlayerSwitchProps {
  disabled?: boolean;
  checked?: boolean;
  id?: string;
  label?: string;
}

const props = withDefaults(defineProps<PlayerSwitchProps>(), {
  disabled: false,
  checked: false,
  id: "skip-inactive-checkbox",
  label: "",
});
const emit = defineEmits(['input'])

const isChecked = ref<boolean>(props.checked)
const checked = computed(() => isChecked.value)

const onToggleCheck = () => {
  emit('input', checked.value)
}
</script>

<template>
  <div class="rr-player-switch" :class="{ disabled }">
    <input
      type="checkbox"
      :id="props.id"
      v-model="isChecked"
      @change="onToggleCheck"
      :disabled="props.disabled"
    />
    <label :for="props.id" />
    <span class="label">{{ label }}</span>
  </div>
</template>

<style>
.rr-player-switch {
  height: 1em;
  display: flex;
  align-items: center;
}

.rr-player-switch.disabled {
  opacity: 0.5;
}

.label {
  margin: 0 8px;
}

.rr-player-switch input[type="checkbox"] {
  position: absolute;
  opacity: 0;
  pointer-events: none;
}

.rr-player-switch label {
  width: 2em;
  height: 1em;
  position: relative;
  cursor: pointer;
  display: block;
}

.rr-player-switch.disabled label {
  cursor: not-allowed;
}

.rr-player-switch label:before {
  content: "";
  position: absolute;
  width: 2em;
  height: 1em;
  left: 0.1em;
  transition: background 0.1s ease;
  background: rgba(73, 80, 246, 0.5);
  border-radius: 50px;
}

.rr-player-switch label:after {
  content: "";
  position: absolute;
  width: 1em;
  height: 1em;
  border-radius: 50px;
  left: 0;
  transition: all 0.2s ease;
  box-shadow: 0px 2px 5px 0px rgba(0, 0, 0, 0.3);
  background: #fcfff4;
  animation: switch-off 0.2s ease-out;
  z-index: 2;
}

.rr-player-switch input[type="checkbox"]:checked + label:before {
  background: rgb(73, 80, 246);
}

.rr-player-switch input[type="checkbox"]:checked + label:after {
  animation: switch-on 0.2s ease-out;
  left: 1.1em;
}
</style>
