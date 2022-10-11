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
  <div>
    <div v-if="dataIsLoaded" class="SimulatorContainer">
      <CPU :current-state="currentState" />
      <div class="MemoryContainer">
        <div class="topContainer">
          <CpuCycle
            :disable-button="disableNextButton"
            :current-step="currentStep"
            :all-steps="allSteps"
            :is-last-step="isLastStep"
            :is-initial-step="isInitialStep"
            v-on:runBack="runBackwardUntilBreakpoint"
            v-on:stepBack="stepBack"
            v-on:nextStep="nextStep"
            v-on:runForward="runForwardUntilBreakpoint"
            v-on:changeStepAnimate="changeStepAnimate"
          />
          <Controls
            :change-history="currentState.changeHistory"
            v-on:changeAnimationSpeed="changeAnimationSpeed"
          />
        </div>
        <Memory
          :byte-information="currentState.byteInformation"
          :memory-data="currentState.memoryData"
        />
      </div>
      <CodeViewer
        class="code-viewer"
        :assembly-code="assemblyCode()"
        :currentLine="getCurrentlyActiveLine()"
        :breakpoints="breakpoints"
        :watchpoints="watchpoints"
        v-on:breakpointToggle="breakpointToggle"
        v-on:conditionalBreakpointSet="conditionalBreakpointSet"
        v-on:conditionalWatchpointSet="conditionalWatchpointSet"
        v-on:conditionalWatchpointDelete="conditionalWatchpointDelete"
        v-on:delete-breakpoints="deleteBreakpoints"
        v-on:jumpToLine="jumpToLine"
      />
    </div>
    <AnimationHelper />
  </div>
</template>

<script lang="ts">
import CPU from '@/components/cpu/Cpu.vue';
import Memory from '@/components/memory/Memory.vue';
import CpuCycle from '@/components/simulatorControls/CpuCycle.vue';
import StepController from '@/services/stepController';
import Controls from '@/components/simulatorControls/Controls.vue';
import AnimationHelper from '@/components/general/AnimationHelper.vue';
import Program from '@/services/interfaces/Program';
import startEmulator from '@/services/startSimulatorService';
import CodeViewer from '@/components/CodeViewer/CodeViewer.vue';
import {
  defineComponent, reactive, Ref, ref,
} from 'vue';
import { useRouter } from 'vue-router';
import State from '@/services/interfaces/State';
import CpuCycleStep from '@/services/interfaces/CpuCycleStep';
import { mergeWith, isArray } from 'lodash';
import DebuggerController from '@/services/debuggerController';
import colorInstructionsService from '@/services/debuggerService/colorInstructionsService';
import mapLinesToMemory from '@/services/debuggerService/mapLinesToMemoryService';
import Breakpoint from '@/services/interfaces/debugger/Breakpoint';
import Watchpoint from '@/services/interfaces/debugger/Watchpoint';

export default defineComponent({
  name: 'Simulator',
  components: {
    CodeViewer,
    AnimationHelper,
    CpuCycle,
    Memory,
    CPU,
    Controls,
  },
  props: {
    machineCodeFromURLSimulator: { type: String, required: true },
    base64AssemblyFromURLSimulator: { type: String, required: true },
  },
  setup(props) {
    const router = useRouter();

    const assemblyCode = () => atob(props.base64AssemblyFromURLSimulator);

    const dataIsLoaded = ref(false);

    const isLastStep = ref(false);

    const isInitialStep = ref(true);

    const disableNextButton = ref(false);

    const currentStep: Partial<CpuCycleStep> = reactive({});

    const allSteps: Partial<Array<CpuCycleStep>> = reactive([]);

    const currentState: Partial<State> = reactive({});

    const breakpoints: Ref<Array<Breakpoint>> = ref([]);

    const watchpoints: Ref<Array<Watchpoint>> = ref([]);

    let program: Program;
    let stepController: StepController;
    let debuggerController: DebuggerController;

    async function synchronize() {
      const customizer = (objValue: unknown, srcValue: unknown) => (isArray(objValue) ? srcValue : undefined);

      if (currentState && currentState.byteInformation) {
        Object.keys(currentState).forEach((key) => {
          if ((key as keyof State) === 'byteInformation') {
            mergeWith(
              currentState.byteInformation,
              stepController.getState().byteInformation,
              customizer,
            );
          } else {
            // is safe, checking for existence of object and checking for every field, can't typecast because Proxy would be lost
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            currentState[key as keyof State] = stepController.getState()[key as keyof State];
          }
        });
      } else {
        mergeWith(currentState, stepController.getState(), customizer);
      }

      Object.assign(allSteps, stepController.getAllSteps());
      Object.assign(currentStep, stepController.getCurrentStep());
      breakpoints.value = debuggerController.getBreakpoints();
      watchpoints.value = debuggerController.getWatchpoints();
    }

    const initialization = async () => {
      dataIsLoaded.value = false;
      try {
        program = await startEmulator(props.machineCodeFromURLSimulator);
        program.vm = this;

        const editorLines = await mapLinesToMemory(program);
        stepController = new StepController(program);
        debuggerController = new DebuggerController(stepController, editorLines);

        isLastStep.value = false;
        isInitialStep.value = true;
        await colorInstructionsService(stepController.getState(), editorLines);
        await synchronize();
      } catch {
        await router.push('/fail');
      }
      dataIsLoaded.value = true;
    };

    const updateButtons = (isNotLastStep: boolean) => {
      if (!isNotLastStep) {
        isLastStep.value = true;
        Object.assign(currentStep, {});
      }
      disableNextButton.value = false;
      isInitialStep.value = false;
    };

    const nextStep = async () => {
      if (isLastStep.value) {
        window.location.reload();
      } else if (stepController) {
        disableNextButton.value = true;
        await debuggerController.nextStepWithWatchpointCheck().then(({ isNotLastStep }) => {
          updateButtons(isNotLastStep);
        });
        await synchronize();
      }
    };

    const stepBack = async () => {
      if (stepController && !isInitialStep.value) {
        isLastStep.value = false;
        await debuggerController.previousStepWithWatchpointCheck();
        if (stepController.isInitialStep()) {
          isInitialStep.value = true;
        }
        program = stepController.getProgram();
        program.vm = this;
        await synchronize();
      }
    };

    const runUntil = async (line: number, backward = false): Promise<void> => {
      if (debuggerController) {
        await debuggerController.runUntil({ line }, backward).then((isNotLastStep: boolean) => {
          updateButtons(isNotLastStep);
        });
        await synchronize();
      }
    };

    const runForwardUntilBreakpoint = async (): Promise<void> => {
      if (isLastStep.value) {
        window.location.reload();
      } else if (debuggerController) {
        await debuggerController.runForwardUntilBreakpoint().then((isNotLastStep: boolean) => {
          updateButtons(isNotLastStep);
        });
        await synchronize();
      }
    };

    const runBackwardUntilBreakpoint = async () => {
      if (debuggerController && stepController && !isInitialStep.value) {
        isLastStep.value = false;
        await debuggerController.runBackwardUntilBreakpoint();
        if (stepController.isInitialStep()) {
          isInitialStep.value = true;
        }
        program = stepController.getProgram();
        program.vm = this;
        await synchronize();
      }
    };

    const getCurrentlyActiveLine = () => {
      if (debuggerController) {
        return debuggerController.getCurrentlyActiveLine();
      }
      return -1;
    };

    const codeAsNumberArray = (): Array<number> => {
      const stringArray = props.machineCodeFromURLSimulator.split(',');
      return stringArray.map((value) => parseInt(value, 16));
    };

    const changeStepAnimate = (currentStep: number) => {
      if (stepController) {
        stepController.changeStepAnimate(currentStep);
      }
    };

    const changeAnimationSpeed = (speed: number) => {
      if (stepController) {
        stepController.changeAnimationSpeed(speed);
      }
    };

    const breakpointToggle = async (breakpoint: Breakpoint) => {
      if (debuggerController) {
        debuggerController.toggleBreakpoint(breakpoint);
      }
      await synchronize();
    };

    const conditionalBreakpointSet = async (breakpoint: Breakpoint) => {
      if (debuggerController) {
        debuggerController.setBreakpoint(breakpoint);
      }
      await synchronize();
    };

    const conditionalWatchpointSet = async (watchpoint: Watchpoint) => {
      if (debuggerController) {
        debuggerController.setWatchpoint(watchpoint);
      }
      await synchronize();
    };

    const conditionalWatchpointDelete = async (watchpoints: Array<Watchpoint>) => {
      watchpoints.forEach((wp) => debuggerController.unsetWatchPoint(wp));
      await synchronize();
    };

    const deleteBreakpoints = async (breakpoints: Array<Breakpoint>) => {
      breakpoints.forEach((bp) => debuggerController.unsetBreakpoint(bp));
      await synchronize();
    };

    const jumpToLine = async (line: number) => {
      if (getCurrentlyActiveLine() > line) {
        await runUntil(line, true);
      } else {
        await runUntil(line, false);
      }
    };

    const closeEmulator = () => {
      if (program) {
        program.ucInstance.close();
        program.disassemblerInstance.delete();
      }
    };

    const terminate = () => {
      isLastStep.value = true;
      closeEmulator();
    };

    initialization();

    return {
      changeAnimationSpeed,
      changeStepAnimate,
      codeAsNumberArray,
      terminate,
      closeEmulator,
      nextStep,
      stepBack,
      dataIsLoaded,
      assemblyCode,
      isInitialStep,
      isLastStep,
      disableNextButton,
      currentState,
      currentStep,
      allSteps,
      runBackwardUntilBreakpoint,
      runForwardUntilBreakpoint,
      getCurrentlyActiveLine,
      breakpointToggle,
      conditionalBreakpointSet,
      conditionalWatchpointSet,
      conditionalWatchpointDelete,
      jumpToLine,
      breakpoints,
      watchpoints,
      deleteBreakpoints,
    };
  },
});
</script>

<style scoped>
.SimulatorContainer {
  align-content: center;
  align-items: center;
  height: 98vh;
  width: 98vw;
  margin: auto;
  justify-content: space-evenly;
}

.MemoryContainer {
  flex-direction: column;
  align-content: space-around;
  height: 95%;
  justify-content: space-between;
}

.MemoryContainer,
.SimulatorContainer {
  display: flex;
}

.topContainer {
  display: flex;
  max-width: 37vw;
}

@media screen and (max-width: 1150px) {
  .code-viewer {
    display: none;
  }
}
</style>
