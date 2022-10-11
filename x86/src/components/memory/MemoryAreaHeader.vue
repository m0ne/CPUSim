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
<div class="memoryAreaHeaderContainer">
  <div class="memoryAreaHeader">
    <div class="shadowAndBorder"><div class="memoryAreaHeaderDescription">Address</div></div>
    <div class="shadowAndBorder"><div class="memoryAreaHeaderOffset">+1</div></div>
    <div class="shadowAndBorder"><div class="memoryAreaHeaderOffset">+2</div></div>
    <div class="shadowAndBorder"><div class="memoryAreaHeaderOffset">+3</div></div>
    <div class="shadowAndBorder"><div class="memoryAreaHeaderOffset">+4</div></div>
    <div class="shadowAndBorder"><div class="memoryAreaHeaderOffset">+5</div></div>
    <div class="shadowAndBorder"><div class="memoryAreaHeaderOffset">+6</div></div>
    <div class="shadowAndBorder"><div class="memoryAreaHeaderOffset">+7</div></div>
    <div class="shadowAndBorder"><div class="memoryAreaHeaderOffset">+8</div></div>
    <div class="shadowAndBorder"><div class="memoryAreaHeaderOffset">+9</div></div>
    <div class="shadowAndBorder"><div class="memoryAreaHeaderOffset">+A</div></div>
    <div class="shadowAndBorder"><div class="memoryAreaHeaderOffset">+B</div></div>
    <div class="shadowAndBorder"><div class="memoryAreaHeaderOffset">+C</div></div>
    <div class="shadowAndBorder"><div class="memoryAreaHeaderOffset">+D</div></div>
    <div class="shadowAndBorder"><div class="memoryAreaHeaderOffset">+E</div></div>
    <div class="shadowAndBorder"><div class="memoryAreaHeaderOffset">+F</div></div>
  </div>
</div>
</template>

<script lang="ts">

import { defineComponent } from 'vue';

export default defineComponent({
  name: 'MemoryAreaHeader',
  components: {},
  props: {},
});

</script>
<style scoped>
.memoryAreaHeaderDescription {
  --margin-ratio: 16;
  display: inline-block;
  width: calc(var(--size) * 4.6);
  font-weight: bold;
}

.memoryAreaHeaderOffset {
  --margin-ratio: 16;
  display: inline-table;
  width: calc(var(--size) * 1.5);
}

.memoryAreaHeaderOffset, .memoryAreaHeaderDescription {
  --size: var(--byteSize);
  border-radius: var(--size);
  background-color: var(--memoryByteHeaderColor);
  color: var(--baseFontColor);
  font-family: "Roboto Mono", "Fira code", "Fira Mono", Consolas, Menlo, Courier, monospace;
  font-size: var(--size);
  line-height: 1;
  text-align: center;
  padding-bottom: calc(var(--size) / 16);
  z-index: 1;
}

.memoryAreaHeaderOffset, .memoryAreaHeaderDescription, .memoryAreaHeader, .shadowAndBorder {
  position: relative;
}

.memoryAreaHeader {
  margin-bottom: calc(var(--byteSize) * -1.35);
  z-index: 2;
  display: table;
  padding: 0 var(--paddingSize);
}

.shadowAndBorder {
  --size: var(--byteSize);
  --margin-ratio: 8;
  display: inline-block;
  margin: calc(var(--size) / var(--margin-ratio));
  border-radius: 1000px;
  line-height: 0;
  box-shadow: 0 0 calc(var(--size) / 3) calc(var(--size) / 10) var(--shadowIntensity);
}

.memoryAreaHeaderContainer {
  line-height: 0;
}
</style>
