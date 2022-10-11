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
  <div class="shadowAndBorder">
    <div class="memoryAddressElement" :id="getMemoryAddressId()">
      {{ address.address }}
    </div>
  </div>
</template>

<script lang="ts">
import Address from '@/services/interfaces/Address';
import htmlId from '@/services/helper/htmlIds';
import { defineComponent, PropType } from 'vue';

export default defineComponent({
  name: 'MemoryAddress',
  components: {},
  props: {
    address: { type: Object as PropType<Address>, required: true },
  },
  setup(props) {
    const getMemoryAddressId = () => {
      let { addressPrefix } = htmlId;
      if (props.address.pointerName) {
        addressPrefix += `_${props.address.pointerName}`;
      } else {
        addressPrefix += `_${props.address.address}`;
      }
      return addressPrefix;
    };

    return {
      getMemoryAddressId,
    };
  },
});

</script>

<style scoped>
.memoryAddressElement {
  border-radius: var(--size);
  font-family: Arial, "Roboto Mono", "Fira code", "Fira Mono", Consolas, Menlo, Courier, monospace;
  font-size: var(--size);
  line-height: 1;
  width: calc(var(--size) * 3);
  text-align: center;
  padding-bottom: calc(var(--size) / 16);
  z-index: 1;
}

.shadowAndBorder {
  margin: calc(var(--size) / var(--margin-ratio));
  border-radius: 1000px;
  line-height: 0;
  box-shadow: 0 0 calc(var(--size) / 3) calc(var(--size) / 10) var(--shadowIntensity);
}

.shadowAndBorder, .memoryAddressElement {
  --size: var(--byteSize);
  --margin-ratio: 16;
  display: inline-block;
  position: relative;
}
</style>
