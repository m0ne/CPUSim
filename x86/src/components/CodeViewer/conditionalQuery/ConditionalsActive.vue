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
  <div class="row flex-center q-py-md">
    <div class="text-h6">{{ title }}</div>
  </div>
  <q-card id="card">
    <q-card-section style="min-width: 450px; min-height: 350px">
      <q-table
        flat
        :rows="conditionals"
        :columns="columns"
        table-class="table-color"
        table-header-class="table-color"
        card-style="min-height: 300px"
        card-class="table-color"
        :row-key="getRowKey"
        selection="multiple"
        v-model:selected="selected"
        virtual-scroll
        v-model:pagination="pagination"
        :no-data-label="noRecords"
        :rows-per-page-options="[0]"
      >
        <template v-slot:no-data="{ message }">
          <div class="full-width row flex-center q-gutter-sm">
            <span> {{ message }}</span>
          </div>
        </template></q-table
      >
      <div class="row flex-center q-gutter-sm">
        <q-btn
          class="cardBtn"
          label="Delete"
          type="submit"
          v-on:click="deleteFunction(selected)"
        ></q-btn>
      </div>
    </q-card-section>
  </q-card>
</template>

<script lang="ts">
import Breakpoint from '@/services/interfaces/debugger/Breakpoint';
import Condition from '@/services/interfaces/debugger/Condition';
import Watchpoint from '@/services/interfaces/debugger/Watchpoint';
import { defineComponent, PropType, ref } from 'vue';

export default defineComponent({
  name: 'ConditionalsActive',
  props: {
    conditionals: { type: Object as PropType<Array<Watchpoint> | Array<Breakpoint>>, required: false },
    deleteFunction: {
      type: Function as PropType<(selected: Array<Watchpoint> | Array<Breakpoint>) => void>,
      required: true,
    },
    title: String,
    lookupFunction: { type: Function as PropType<(line: number) => number>, required: true },
  },
  setup(props) {
    const noRecords = `No ${props.title} defined`;
    let columns;
    let getRowKey;

    if (props.title === 'Watchpoints') {
      columns = [
        {
          name: 'condition',
          required: true,
          label: 'Condition',
          align: 'left',
          field: (row: Watchpoint) => row.condition,
          format: (val: Condition) => `${val.value}`,
          sortable: true,
        },
      ];
      getRowKey = (row: Watchpoint) => row.condition.value;
    }

    if (props.title === 'Breakpoints') {
      columns = [
        {
          name: 'line',
          required: true,
          label: 'Line',
          align: 'left',
          field: (row: Breakpoint) => props.lookupFunction(row.line),
          sortable: true,
        },
        {
          name: 'condition',
          required: true,
          label: 'Condition',
          align: 'left',
          field: (row: Breakpoint) => (row.condition ? row.condition.value : 'no Condition'),
          sortable: false,
        },
      ];
      getRowKey = (row: Breakpoint) => row.line;
    }
    const selected = ref([]);
    const pagination = ref({
      rowsPerPage: 0,
    });

    return {
      selected,
      pagination,
      columns,
      noRecords,
      getRowKey,
    };
  },
});
</script>

<style scoped>
#card {
  background: var(--primaryColor);
}

.table-color {
  background-color: var(--primaryColor);
  color: var(--baseFontColor);
}
</style>
