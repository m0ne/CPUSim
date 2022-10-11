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
    <MemoryAddress id="memAddress" :address="memoryLine.address"/>
    <div class="memoryLineBytes" v-for="byte in memoryLine.dataBytes" :key="byte.locationId">
      <ByteVue :byte="byte" :byte-information="byteInformation"/>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import MemoryAddress from '@/components/general/MemoryAddress.vue';
import ByteVue from '@/components/general/ByteVue.vue';
import MemoryDataLine from '@/services/interfaces/MemoryDataLine';
import ByteInformation from '@/services/interfaces/ByteInformation';

export default defineComponent({
  name: 'MemoryLine',
  components: { MemoryAddress, ByteVue },
  props: {
    memoryLine: Object as PropType<MemoryDataLine>,
    byteInformation: Object as PropType<ByteInformation>,
  },
});

</script>

<style scoped>
.memoryLineBytes {
  display: inline;
}
#memAddress {
  background-color: var(--memoryByteHeaderColor);
  color: var(--baseFontColor);
}
</style>
