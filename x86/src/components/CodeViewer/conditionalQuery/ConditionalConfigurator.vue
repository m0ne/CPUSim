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

<template>
  <div class="q-pa-md">
    <div class="q-gutter-y-md" style="max-width: 600px">
      <q-card>
        <q-tabs
          v-model="tab"
          dense
          class="text-black"
          active-class="active-class-color"
          indicator-color="primary"
          narrow-indicator
          id="card"
        >
          <q-tab name="New" label="New" />
          <q-tab :name="title" :label="title" />
        </q-tabs>

        <q-separator />

        <q-tab-panels id="tabs" v-model="tab" animated>
          <q-tab-panel name="New">
            <conditional-query
              :inputValidator="checkInput"
              :setFunction="setConditionalFunction"
              :title="title"
            />
          </q-tab-panel>

          <q-tab-panel :name="title">
            <conditionals-active :lookupFunction="lookupFunction" :title="title" :conditionals="conditionals" :deleteFunction="deleteConditionalFunction" />
          </q-tab-panel>
        </q-tab-panels>
      </q-card>
    </div>
  </div>
</template>

<script lang="ts">
import createConditional from '@/services/debuggerService/conditionalFactoryService';
import Breakpoint from '@/services/interfaces/debugger/Breakpoint';
import Watchpoint from '@/services/interfaces/debugger/Watchpoint';
import { defineComponent, PropType, ref } from 'vue';
import ConditionalQuery from './conditionalQuery.vue';
import ConditionalsActive from './ConditionalsActive.vue';

export default defineComponent({
  name: 'ConditionalConfigurator',
  components: { ConditionalsActive, ConditionalQuery },
  props: {
    setConditionalFunction: { type: Function as PropType<(condition: string) => void>, required: true },
    title: String,
    conditionals: { type: Object as PropType<Array<Watchpoint | Breakpoint>>, required: false },
    deleteConditionalFunction: { type: Function as PropType<(selected: Array<Watchpoint> | Array<Breakpoint>) => void>, required: true },
    lookupFunction: { type: Function as PropType<(line: number) => number>, required: true },
  },
  setup() {
    const tab = ref('New');

    const checkInput = (val: string) => {
      const result = createConditional(val);
      if (result.error) {
        return result.error;
      }
      return true;
    };

    return {
      tab,
      checkInput,
    };
  },
});
</script>

<style scoped>
#tabs {
  background: var(--backgroundColor);
  min-height: 500px;
  min-width: 500px;
}

#card {
  background: var(--primaryColor);
}

.active-class-color {
  color: var(--baseFontColor);
  background-color: var(--primaryColor);
}
</style>
