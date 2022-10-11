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
    <div class="registerElement">
      <div class="registerName">{{ register.name }}</div>
      <div class="registerBytes" v-for="byte in register.content" :key="byte.locationId">
        <ByteVue :byte="byte" />
      </div>
    </div>
    <div v-if="isPointerWithProps()" class="registerAddress">
      <MemoryAddress id="pointerByte" :address="getAddressWithProps()"></MemoryAddress>
    </div>
    <q-tooltip
      v-if="isPointerWithProps"
      style="font-size: 16px"
      anchor="center right"
      self="center right"
      :offset="[200, 0]"
    >
      <span>{{ getPointerNameWithProps() }} Register</span>
    </q-tooltip>
  </div>
</template>

<script lang="ts">
import ByteVue from '@/components/general/ByteVue.vue';
import Register from '@/services/interfaces/Register';
import Address from '@/services/interfaces/Address';
import MemoryAddress from '@/components/general/MemoryAddress.vue';
import { isPointer, getAddress, getPointerName } from '@/services/helper/registerToStringService';
import { defineComponent, PropType } from 'vue';

export default defineComponent({
  name: 'RegisterVue',
  components: {
    ByteVue,
    MemoryAddress,
  },
  props: {
    register: { type: Object as PropType<Register>, required: true },
  },
  setup(props) {
    const isPointerWithProps = (): boolean => isPointer(props.register);

    const getAddressWithProps = (): Address | undefined => getAddress(props.register);

    const getPointerNameWithProps = (): string => getPointerName(props.register);

    return {
      getPointerNameWithProps,
      getAddressWithProps,
      isPointerWithProps,
    };
  },
});
</script>

<style scoped>
.registerElement {
  background-color: var(--registerColor);
  border-radius: 100px;
  padding: calc(var(--byteSize) * 0.1);
  display: inline-block;
  font-size: calc(var(--byteSize) * 0.8);
}
.registerAddress,
.registerName,
.registerBytes {
  display: inline;
}
.registerName {
  font-size: calc(var(--byteSize) * 1);
  line-height: 0;
  padding-left: calc(var(--byteSize) * 0.3);
}
.registerBytes {
  font-size: calc(var(--byteSize) * 0.5);
}
#pointerByte {
  background-color: var(--byteCPUColor);
}
</style>
