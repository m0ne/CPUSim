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
  <div class="cpu-cycle-steps">
    <div class="cpuCycleTitle">CPU CYCLE</div>
    <div class="controlsContainer">
      <div class="buttonContainer">
        <ControlButton class="step-button-container" v-for="btn in getButtonsBack()" v-bind:key="btn.type"
                       :disable-button="disableButton" :is-initial-step="isInitialStep"
                       :is-last-step="isLastStep" :type="btn.type" :label="btn.label"
                       :tooltip-text="btn.tooltipText"
                       v-on:runBack="runBack" v-on:stepBack="stepBack"
                       v-on:nextStep="nextStep" v-on:runForward="runForward">
        </ControlButton>
      </div>
      <div class="buttonContainer">
        <ControlButton class="step-button-container" v-for="btn in getButtonsForward()" v-bind:key="btn.type"
                       :disable-button="disableButton" :is-initial-step="isInitialStep"
                       :is-last-step="isLastStep" :type="btn.type" :label="btn.label"
                       :tooltip-text="btn.tooltipText"
                       v-on:runBack="runBack" v-on:stepBack="stepBack"
                       v-on:nextStep="nextStep" v-on:runForward="runForward">
        </ControlButton>
      </div>
    </div>
    <div class="steps-container" v-for="step in allSteps" :key="step.numberInCycleSequence" >
      <Step :step="step" :current-step="currentStep" :is-last-step="isLastStep" :is-initial-step="isInitialStep" v-on:changeStepAnimate="changeStepAnimate"></Step>
    </div>
  </div>

</template>

<script lang="ts">
import StepVue from '@/components/simulatorControls/Step.vue';
import CpuCycleStep from '@/services/interfaces/CpuCycleStep';
import {
  defineComponent, PropType, ref,
} from 'vue';
import ControlButton from '@/components/simulatorControls/ControlButton.vue';

export default defineComponent({
  name: 'CpuCycle',
  components: {
    ControlButton,
    Step: StepVue,
  },
  emits: ['changeStepAnimate', 'nextStep', 'previousStep', 'runBack', 'stepBack', 'runForward', 'changeStepAnimate'],
  props: {
    currentStep: { type: Object as PropType<CpuCycleStep>, required: true },
    allSteps: { type: Object as PropType<Array<CpuCycleStep>>, required: true },
    isLastStep: Boolean,
    isInitialStep: Boolean,
    disableButton: Boolean,
  },
  setup(props, { emit }) {
    const isBackStep = ref(false);

    const nextStep = () => {
      isBackStep.value = false;
      emit('nextStep');
    };

    const stepBack = () => {
      isBackStep.value = true;
      emit('stepBack');
    };

    const runBack = () => {
      isBackStep.value = true;
      emit('runBack');
    };

    const runForward = () => {
      isBackStep.value = false;
      emit('runForward');
    };

    const changeStepAnimate = (currentStep: number) => {
      emit('changeStepAnimate', currentStep);
    };

    const getButtonsBack = () => [
      {
        type: 1,
        label: 'Run Back',
        tooltipText: 'Run backwards until a breakpoint is hit or the program start is reached',
      },
      {
        type: 2,
        label: 'Step Back',
        tooltipText: 'Go back one step',
      },
    ];

    const getButtonsForward = () => [
      {
        type: 4,
        label: 'Run Forward',
        tooltipText: 'Run forwards until a breakpoint is hit or the program end is reached',
      },
      {
        type: 3,
        label: 'Next Step',
        tooltipText: 'Advance one step',
      },
    ];

    return {
      isBackStep,
      nextStep,
      changeStepAnimate,
      getButtonsBack,
      getButtonsForward,
      runBack,
      stepBack,
      runForward,
    };
  },
});
</script>

<style scoped>
  .controlsContainer {
    display: flex;
    justify-content: space-between;
    padding-right: var(--paddingSize);
  }

  .buttonContainer{
    flex-direction: column;
    align-items: center;
  }

  .steps-container {
    display: block;
  }

  .cpu-cycle-steps, .step-button-container, .cpuCycleTitle {
    display: inline-block
  }

  .cpu-cycle-steps {
    border-radius: var(--borderRadiusSize);
    padding: 0 0 calc(var(--paddingSize) * 0.5) var(--paddingSize);
    border: solid 2px var(--cpuCycleBoxBorderColor);
  }

  .cpuCycleTitle {
    margin-top: var(--paddingSize);
    margin-bottom: var(--paddingSize);
    font-size: var(--fontTitleSize);
    line-height: 0;
    text-align: center;
    width: 100%;
  }
</style>
