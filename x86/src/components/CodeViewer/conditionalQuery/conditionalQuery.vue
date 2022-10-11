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
  <q-tabs
    v-model="tabModel"
    dense
    class="text-black"
    active-class="active-class-color"
    indicator-color="primary"
    narrow-indicator
  >
    <q-tab name="Registers" label="Registers" />
    <q-tab name="Flags" label="Flags" />
    <q-tab name="Operations" label="Operations" />
  </q-tabs>
  <q-separator dark></q-separator>
  <q-tab-panels id="subTab" v-model="tabModel" animated>
    <q-tab-panel style="max-height: 180px" name="Registers">
      <q-list bordered separator id="card">
        <q-item
          v-for="operand in RegisterOperands"
          :key="operand"
          clickable
          v-ripple
          id="card"
          @click="addToQuery(operand)"
        >
          <q-item-section>{{ operand }}</q-item-section>
        </q-item>
      </q-list>
    </q-tab-panel>
    <q-tab-panel style="max-height: 180px" name="Flags">
      <q-list bordered separator id="card">
        <q-item
          v-for="flag in FlagOperands"
          :key="flag"
          clickable
          v-ripple
          @click="addToQuery(flag)"
        >
          <q-item-section>{{ flag }}</q-item-section>
        </q-item>
      </q-list>
    </q-tab-panel>
    <q-tab-panel style="max-height: 180px" name="Operations">
      <q-list bordered separator id="card">
        <q-item v-for="op in getInfixOps()" :key="op" clickable v-ripple @click="addToQuery(op)">
          <q-item-section>{{ op }}</q-item-section>
        </q-item>
      </q-list>
    </q-tab-panel>
  </q-tab-panels>
  <div class="row flex-center q-py-md">
    <div class="text-h6 marg">New {{title?.slice(0,-1)}}</div>
  </div>
  <q-card id="card">
    <q-card-section style="min-width: 450px">
      <q-form @submit="setFunctionWithWhitespaceReplacement(query)">
        <q-input
          label-color="white"
          v-model="query"
          label="Please enter your condition: "
          :rules="[inputValidator]"
          clearable
          input-style="color: var(--baseFontColor)"
        ></q-input>
        <div class="row flex-center q-gutter-sm">
          <q-btn class="cardBtn" label="Set" type="submit"></q-btn>
        </div>
      </q-form>
    </q-card-section>
  </q-card>
</template>

<script lang="ts">
import { FlagOperand, RegisterOperand } from '@/services/debuggerService/operandEnums';
import {
  defineComponent, PropType, ref,
} from 'vue';
import { getInfixOps } from '@/services/debuggerService/expressionParser/expressionParser';

export default defineComponent({
  name: 'ConditionalQuery',
  props: {
    setFunction: { type: Function as PropType<(condition: string) => void>, required: true },
    inputValidator: { type: Function as PropType<(val: string) => string | true>, required: true },
    title: String,
  },
  setup(props) {
    const tabModel = ref('Registers');
    const query = ref('');
    const RegisterOperands = Object.keys(RegisterOperand);
    const FlagOperands = Object.keys(FlagOperand);

    const setFunctionWithWhitespaceReplacement = (condition: string) => {
      const cleanedCondition = condition.replace(/  +/g, ' ');
      props.setFunction(cleanedCondition);
    };

    const addToQuery = (input: string) => {
      if (query.value === null) {
        query.value = `${input} `;
      } else {
        query.value += `${input} `;
      }
    };

    return {
      RegisterOperands,
      FlagOperands,
      addToQuery,
      query,
      getInfixOps,
      tabModel,
      setFunctionWithWhitespaceReplacement,
    };
  },
});
</script>

<style scoped>
#subTab {
  background-color: var(--primaryColor);
}

#card {
  background: var(--primaryColor);
}
</style>
