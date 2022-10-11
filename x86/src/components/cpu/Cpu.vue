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
<div class="cpu">
  <div class="upperBlock">
    <div class="cpuTitle">CPU</div>
    <CurrentInstructionBlock :current-instruction="currentState.currentInstruction"/>
    <ExecutionBox :accessed-elements="currentState.currentAccessedElements" :instructionName="instructionName()"/>
    <InstructionPointerBlock :instruction-pointer="currentState.instructionPointer"/>
  </div>
  <RegisterBlock :registers="currentState.registers" :flags="currentState.flags"/>
</div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import RegisterBlock from '@/components/cpu/RegisterBlock.vue';
import CurrentInstructionBlock from '@/components/cpu/CurrentInstructionBlock.vue';
import InstructionPointerBlock from '@/components/cpu/InstructionPointerBlock.vue';
import State from '@/services/interfaces/State';
import ExecutionBox from '@/components/cpu/ExecutionBox.vue';

export default defineComponent({
  name: 'CPU',
  components: {
    ExecutionBox,
    InstructionPointerBlock,
    CurrentInstructionBlock,
    RegisterBlock,
  },
  props: {
    currentState: { type: Object as PropType<State>, required: true },
  },
  setup(props) {
    const instructionName = () => props.currentState.currentInstruction.assemblyInterpretation.split(' ', 1)[0];
    return { instructionName };
  },
});

</script>

<style scoped>
.cpu {
  background-color: var(--cpuBlockColor);
  display: flex;
  flex-direction: column;
  border-radius: calc(var(--borderRadiusSize) * 1.5);
  padding: var(--paddingSize);
  box-shadow: 0 0 calc(var(--byteSize) / 0.3) calc(var(--byteSize) / 0.6) var(--shadowIntensity);
  max-width: 50vw;
  height: 95%;
  justify-content: space-between;
  margin: 0 calc(var(--byteSize) / 1.5) 0 0;
  box-sizing: border-box;
}

.upperBlock {
  display: flex;
  flex-direction: column;
  max-height: 70%;
  height: fit-content;
}

.cpuTitle {
  margin-top: var(--paddingSize);
  margin-bottom: calc(var(--paddingSize) * 2);
  font-size: var(--fontTitleSize);
  display: inline-block;
  line-height: 0;
  align-self: center;
}
</style>
