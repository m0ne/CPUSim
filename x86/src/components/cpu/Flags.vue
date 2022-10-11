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
  <div class="flagElements">
    <div class="flagTitle">Flags:</div>
    <div  class="flagContainer" v-for="(flag, index) in flags" :key="index">
      <div class="flag">{{ flag.name }}</div>
      <ByteVue :byte="flag.content"/>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import ByteVue from '@/components/general/ByteVue.vue';
import Flag from '@/services/interfaces/Flag';

export default defineComponent({
  name: 'FlagsVue',
  components: {
    ByteVue,
  },
  props: {
    flags: Object as PropType<Array<Flag>>,
  },
  setup() {
    return {};
  },
});

</script>

<style scoped>
.flagElements {
  background-color: var(--registerColor);
  display: inline-block;
  border-radius: 100px;
  padding: calc(var(--byteSize) * 0.1);
}

.flagContainer, .flag, .flagTitle{
  display: inline;
}

.flagTitle {
  font-size: calc(var(--byteSize) * 1);
  line-height: 0;
  padding-left: calc(var(--byteSize) * 0.3);
}

.flag, .flagElements {
  font-size: calc(var(--byteSize) * 0.8);
}

.flag, ByteVue {
  margin-right: 2px;
}

</style>
