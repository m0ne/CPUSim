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
<div class="registerBlockElement">
  <div class="registerTitle">Register</div>
  <div class="registerListFlex">
    <div class="registerList">
      <div class="registerArea" v-for="register in registers" :key="register.name">
        <RegisterVue :register="register" />
      </div>
      <Flags :flags="flags" />
    </div>
  </div>
</div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import Register from '@/services/interfaces/Register';
import RegisterVue from '@/components/cpu/RegisterVue.vue';
import Flags from '@/components/cpu/Flags.vue';
import Flag from '@/services/interfaces/Flag';

export default defineComponent({
  name: 'RegisterBlock',
  components: {
    Flags,
    RegisterVue,
  },
  props: {
    registers: Object as PropType<Array<Register>>,
    flags: Object as PropType<Array<Flag>>,
  },
  setup() {
    return {};
  },
});
</script>

<style scoped>
.registerBlockElement {
  background-color: var(--registerBlockColor);
  display: flex;
  flex-direction: column;
  border-radius: var(--borderRadiusSize);
  padding: var(--paddingSize);
  min-height: calc(var(--byteSize) * 6.5);
  max-height: calc(var(--byteSize) * 21);
}

.registerListFlex {
  display: flex;
  height: calc(100% - calc(var(--paddingSize) * 1));
  overflow: hidden;
}

.registerList {
  overflow-y: scroll;
  overflow-x: visible;
}

.registerArea {
  line-height: 0;
  margin: calc(var(--byteSize) * 0.3) 0;
}

.registerTitle {
  font-size: calc(var(--byteSize) * 1);
}
</style>
