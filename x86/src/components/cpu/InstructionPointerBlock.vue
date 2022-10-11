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
<div class="instructionPointerBlock" :id="instructionPointerBlock">
  <div class="title">Instruction Pointer</div>
  <MemoryAddress id="ipBlock" :address="instructionPointerAddress()"/>
</div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import MemoryAddress from '@/components/general/MemoryAddress.vue';
import InstructionPointer from '@/services/interfaces/InstructionPointer';
import htmlId from '@/services/helper/htmlIds';

export default defineComponent({
  name: 'InstructionPointerBlock',
  components: {
    MemoryAddress,
  },
  props: {
    instructionPointer: {
      type: Object as PropType<InstructionPointer>,
      required: true,
    },
  },
  setup(props) {
    const instructionPointerAddress = () => {
      const { address } = props.instructionPointer;
      address.pointerName = 'RIP';
      return address;
    };

    const { instructionPointerBlock } = htmlId;

    return {
      instructionPointerBlock,
      instructionPointerAddress,
    };
  },
});

</script>

<style scoped>
.instructionPointerBlock {
  background-color: var(--instructionPointerBlockColor);
  display: block;
  border-radius: var(--borderRadiusSize);
  padding: var(--paddingSize);
  margin-bottom: var(--paddingSize);
  font-size: var(--byteSize);
}

.title {
  display: inline;
}

#ipBlock {
  background-color: var(--byteCPUColor);
}
</style>
