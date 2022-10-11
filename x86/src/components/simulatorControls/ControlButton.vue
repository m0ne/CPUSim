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
  <div class="button-container">
    <q-btn v-if="type < 3" :disable="disableButton" text-color="buttonFontColor"
           class="execution-button" :class="isInitialStep ? 'initial-step' : 'regular-step'"
           @click="btnClick">
      <q-icon :name="imgType"/>
      <span v-if="!verySmall">{{label}}</span>
    </q-btn>
    <q-btn v-else class="execution-button regular-step" :disable="disableButton"
           text-color="buttonFontColor" @click="btnClick">
      <template v-if="isLastStep">
        <q-icon name="bi-arrow-counterclockwise" class="bootstrap-icon"/>
        <span v-if="!verySmall">Restart</span>
      </template>
      <template v-else>
        <span v-if="type === 4 && small && !verySmall">{{altLabel}}</span>
        <span v-else-if="!verySmall">{{label}}</span>
        <q-icon :name="imgType"/>
      </template>
    </q-btn>
    <q-tooltip style="font-size: 16px" anchor="bottom middle" self="top middle">
      <span>{{ tooltipText }}</span>
    </q-tooltip>
  </div>
</template>

<script lang="ts">
import {
  matSkipPrevious, matUndo, matRedo, matSkipNext, matWarning,
} from '@quasar/extras/material-icons';
import { defineComponent, ref } from 'vue';

export default defineComponent({
  name: 'ControlButton',
  props: {
    isInitialStep: { type: Boolean, required: true },
    isLastStep: { type: Boolean, required: true },
    disableButton: { type: Boolean, required: true },
    type: { type: Number, required: true },
    label: { type: String, required: true },
    tooltipText: { type: String, required: true },
  },
  components: {},
  emits: ['runBack', 'stepBack', 'nextStep', 'runForward'],
  setup(props, { emit }) {
    const imgType = ref('');
    const altLabel = 'Run Fwd.';
    const small = ref(false);
    const verySmall = ref(false);

    const btnClick = () => {
      switch (props.type) {
        case 1:
          emit('runBack');
          break;
        case 2:
          emit('stepBack');
          break;
        case 3:
          emit('nextStep');
          break;
        case 4:
          emit('runForward');
          break;
        default:
          console.error('Error when emitting btnClick event');
      }
    };

    switch (props.type) {
      case 1:
        imgType.value = matSkipPrevious;
        break;
      case 2:
        imgType.value = matUndo;
        break;
      case 3:
        imgType.value = matRedo;
        break;
      case 4:
        imgType.value = matSkipNext;
        break;
      default:
        imgType.value = matWarning;
    }

    const resizeCheck = () => {
      small.value = window.innerWidth < 1085;
      verySmall.value = window.innerWidth < 855;
    };

    window.addEventListener('resize', resizeCheck);
    resizeCheck();

    return {
      btnClick,
      imgType,
      small,
      verySmall,
      altLabel,
    };
  },
});
</script>

<style scoped>
.initial-step {
  background: var(--pastStepBackgroundColor);
  color: var(--pastStepFontColor);
}

.regular-step {
  background: var(--quasarPrimary);
}

.execution-button {
  width: var(--buttonWidth);
  font-size: small;
  margin-bottom: 0.5em;
  margin-right: 0.5em;
}
.bootstrap-icon {
  font-family: bootstrap-icons;
  padding-left: 10px;
}
</style>
