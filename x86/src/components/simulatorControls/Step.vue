<!-- SPDX-License-Identifier: GPL-2.0-only -->
<!--
/* CPUSim
 *
 * Copyright © 2021 by Eliane Schmidli <seliane.github@gmail.com> and Yves Boillat <yvbo@protonmail.com>
 * Modified 2022 by Michael Schneider <michael.schneider@hispeed.com> and Tobias Petter <tobiaspetter@chello.at>
 *
 * This file is part of CPUSim
 *
 * CPUSim is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, version 2 of the License only.
 *
 * CPUSim is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with CPUSim.  If not, see <https://www.gnu.org/licenses/>.
 */
-->

<template>
  <div v-if="step" class="step-container" >
    <q-chip :class="[isLastStep ? 'past-step' : isCurrentStep() ? 'current-step' : isFutureStep() ? 'future-step' : 'past-step']">
      <q-avatar :class="[isCurrentStep() ? 'current-step-avatar' : isFutureStep() ? 'future-step-avatar' : 'past-step-avatar']" >
        {{ step.numberInCycleSequence + 1 }}
      </q-avatar>
      {{step.name}}
    </q-chip>
    <q-toggle
      class="toggle-icon"
      v-model= "animationCheckbox"
      @update:model-value="changeStepAnimate"
      color="secondary"
      unchecked-icon="bi-x-lg"
      checked-icon="bi-check2"
      size="lg"
    >
      <q-tooltip style="font-size: 16px" anchor="bottom middle" self="top middle">
        <span v-if="isAnimated()">Animations for this step are enabled</span>
        <span v-else>Animations for this step are disabled</span>
      </q-tooltip>
    </q-toggle>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType, ref } from 'vue';
import CpuCycleStep from '@/services/interfaces/CpuCycleStep';

export default defineComponent({
  name: 'StepVue',
  components: {},
  emits: ['changeStepAnimate'],
  props: {
    step: { type: Object as PropType<CpuCycleStep>, required: true },
    currentStep: { type: Object as PropType<CpuCycleStep>, required: true },
    isInitialStep: { type: Boolean, required: false },
    isLastStep: { type: Boolean, required: false },
  },
  setup(props, { emit }) {
    const isAnimated = () => props.step.animate;

    const isCurrentStep = () => !props.isLastStep && props.step.numberInCycleSequence === props.currentStep.numberInCycleSequence;

    const isFutureStep = () => props.step.numberInCycleSequence > props.currentStep.numberInCycleSequence;

    const changeStepAnimate = () => {
      emit('changeStepAnimate', props.step.numberInCycleSequence);
    };

    const animationCheckbox = ref(props.step.animate);

    return {
      animationCheckbox,
      isAnimated,
      isCurrentStep,
      isFutureStep,
      changeStepAnimate,
    };
  },
});

</script>

<style scoped>
.toggle-icon {
  font-family: bootstrap-icons;
}

.current-step, .past-step, .future-step, .back-step {
  width: calc(var(--byteSize) * 16);
}
/* Avatars (circles) */
.current-step-avatar, .past-step-avatar, .future-step-avatar {
  background: var(--stepAvatarBackgroundColor);
}
.current-step-avatar, .future-step-avatar {
  color: var(--byteFontColor);
}
.past-step, .past-step-avatar {
  color: var(--pastStepFontColor);
}
/* Steps (background)*/
.current-step, .future-step {
  color: var(--currentFutureStepFontColor);
}
.current-step {
  background-color: var(--currentStepBackgroundColor);
}
.past-step {
  background-color: var(--pastStepBackgroundColor);
}
.future-step {
  background-color: var(--stepBackgroundColor);
}

.step-container {
  width: calc(var(--byteSize) * 21);
  display: inline-block;
}

.q-chip {
  font-size: var(--fontNormalSize);
  margin: calc(var(--paddingSize) * 0.5) 0;
}

/* Some classes are in Layout.vue */
/* .q-toggle__inner */
</style>
