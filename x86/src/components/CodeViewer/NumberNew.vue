<!-- /* SPDX-License-Identifier: GPL-2.0-only */ -->
<!--
/*
* CPUSim
*
* Copyright © 2022 by Michael Schneider <michael.schneider@hispeed.com> and Tobias Petter <tobiaspetter@chello.at>
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

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'NumberBox',
  components: {},
  emits: ['inputNumber'],
  props: {
    value: {
      type: Number,
      default: 0,
    },
  },
  setup(props, { emit }) {
    const numberModel = {
      get() {
        return props.value;
      },
      set(value: number) {
        emit('inputNumber', value);
      },
    };

    return {
      numberModel,
    };
  },
});

</script>

<template>
  <!-- eslint-disable-next-line -->
  <input type="number" v-model="numberModel" placeholder="dummy number">
</template>
