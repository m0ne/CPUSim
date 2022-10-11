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
  <div class="memoryAreaDataFlex">
    <div class="memoryAreaDataElement">
      <ul class="dataMemoryLine" v-for="memoryLine in getMemoryLines()" :key="memoryLine.address.address">
        <li>
          <MemoryLine :memory-line="memoryLine" :byte-information="byteInformation"/>
        </li>
      </ul>
    </div>
  </div>
</template>

<script lang="ts">
import MemoryLine from '@/components/memory/MemoryLine.vue';
import { defineComponent, PropType } from 'vue';
import MemoryData from '@/services/interfaces/MemoryData';
import ByteInformation from '@/services/interfaces/ByteInformation';

export default defineComponent({
  name: 'MemoryAreaData',
  components: {
    MemoryLine,
  },
  props: {
    memoryData: { type: Object as PropType<MemoryData>, required: true },
    byteInformation: { type: Object as PropType<ByteInformation>, required: false },
  },
  setup(props) {
    const getMemoryLines = () => props.memoryData.memoryDataLines;

    return {
      getMemoryLines,
    };
  },
});

</script>

<style scoped>
.memoryAreaDataElement {
  overflow-y: scroll;
  overflow-x: visible;
  display: inline-block;
  padding-left: var(--paddingSize);
  padding-right: var(--paddingSize);
  padding-top: calc(var(--byteSize) * 0.64);
  margin-top: calc(var(--byteSize) * 0.6875);
}

.memoryAreaDataFlex {
  display: flex;
  height: calc(100% - calc(var(--paddingSize) * 2))
}

.memoryAreaDataElement ul {
  margin: 0;
  padding: 0;
  list-style: none;
}

.dataMemoryLine {
  line-height: 0;
  display: table;
}
</style>
