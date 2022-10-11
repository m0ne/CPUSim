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
  <div id="byteOffsetCalculator"></div>
</template>

<script>

export default {
  name: 'Layout',
};

</script>

<style>
:root {
  --byteSize: calc(0.16rem + 1vw);
  --paddingSize: calc(var(--byteSize) * 1.25);
  --borderRadiusSize: calc(var(--byteSize) * 1.8);
  --buttonWidth: calc(var(--byteSize) * 10);
  --byteOffset: calc(var(--byteSize) * 1.75);
  --fontTitleSize: calc(var(--byteSize) * 1.6);
  --fontNormalSize: calc(var(--byteSize) * 0.9);
  --shadowIntensity: #00000044;
  --shadowIntensityStackPointer: rgba(199,113,124,0.9);
  --shadowIntensityStackPointerTransparent: rgba(199,113,124,0);
  --shadowIntensityBasePointer: rgba(135,105,211,0.9);
  --shadowIntensityBasePointerTransparent: rgba(135,105,211,0);
  --shadowIntensityPulse: var(--attentionPulseColor);
  --shadowIntensityPulseTransparent: rgba(204,169,44, 0);
}

/* A workaround to get the calculated "calc" value for the byteOffset in JavaScript */
#byteOffsetCalculator {
  width: var(--byteOffset);
}

body {
  font-size: var(--byteSize) !important;
}

/* remove focus highlight in editor */
:focus-visible {
  outline: none;
}

.q-toggle__inner {
  font-size: calc(var(--byteSize) * 3) !important;
}

.q-btn {
  font-size: var(--fontNormalSize);
}

.q-btn__wrapper {
  padding: calc(var(--byteSize) * 0.25) calc(var(--byteSize) * 1) !important;
  min-height: 2.572em;
}

.q-btn--rectangle {
  border-radius: calc(var(--byteSize) * 0.1875);
}

i.q-icon {
  font-style: normal !important;
}
</style>
