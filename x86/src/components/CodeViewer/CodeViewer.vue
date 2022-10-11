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
  <div class="assemblyBox">
    <div class="title">ASSEMBLY</div>
    <div class="conditionalBox">
      <q-btn id="conditionalBtn" class="btn" v-on:click="toggleConditional">
        <q-icon :name="conditionalIcon" />
        <q-tooltip style="font-size: 16px" anchor="bottom middle" self="top middle">
          <span>Set conditional breakpoint</span>
        </q-tooltip>
      </q-btn>
      <q-btn class="btn" v-on:click="toggleWatchpoint">
        <q-icon :name="watchpointIcon" />
        <q-tooltip style="font-size: 16px" anchor="bottom middle" self="top middle">
          <span>Watchpoints</span>
        </q-tooltip>
      </q-btn>
    </div>
    <div class="editor scroll">
      <table>
        <colgroup>
          <col style="width: 2%" />
          <col style="width: 8%" />
          <col style="width: 90%" />
        </colgroup>
        <template v-for="(line, index) in ASMLineArray()">
          <!-- eslint-disable-next-line --><!-- (Bug im Linter) -->
          <tr v-bind:id="`line-${index + 1}`">
            <td v-bind:id="`question-mark-${index + 1}`">
              <q-tooltip
                style="font-size: 16px"
                anchor="bottom middle"
                self="top middle"
                v-if="condTooltip[index + 1]"
              >
                <span>{{ condBreakpointTooltip }}</span>
              </q-tooltip>
            </td>
            <td v-on:click="toggleBreakpoint" @keydown="toggleBreakpoint" class="breakpoint">
              {{ index + 1 }}
            </td>
            <td
              v-on:click="jumpToLine"
              @keyup="jumpToLine"
              v-bind:id="`instr-${index + 1}`"
              v-html="highlighter(line)"
              class="instruction"
              :class="{ activeLine: calculateActiveLine(index + 1) }"
            ></td>
          </tr>
        </template>
      </table>
    </div>
    <q-dialog v-model="conditionalPopup">
      <conditional-configurator
        :lookup-function="reverseLookup"
        :title="'Breakpoints'"
        :conditionals="breakpoints"
        :set-conditional-function="setConditionalBreakpoint"
        :delete-conditional-function="deleteBreakpoints"
      />
    </q-dialog>

    <q-dialog v-model="conditionalWatchpointPopup">
      <conditional-configurator
        :lookup-function="reverseLookup"
        :title="'Watchpoints'"
        :conditionals="watchpoints"
        :set-conditional-function="setConditionalWatchpoint"
        :deleteConditionalFunction="deleteWatchpoints"
      />
    </q-dialog>
  </div>
</template>

<script lang="ts">
import {
  defineComponent, onBeforeUnmount, onUnmounted, PropType, Ref, ref,
} from 'vue';
import 'vue-prism-editor/dist/prismeditor.min.css';
import { highlight, languages } from 'prismjs/components/prism-core';
import 'prismjs/components/prism-nasm';
import 'prismjs/themes/prism-solarizedlight.css';
import DOMPurify from 'dompurify';
import createConditional, {
  createBreakpointWithoutCondition,
  createBreakpointWithCondition,
  createWatchpoint,
} from '@/services/debuggerService/conditionalFactoryService';
import {
  matAlarmOn as watchpointIcon,
  matRule as conditionalIcon,
} from '@quasar/extras/material-icons';
import { useQuasar } from 'quasar';
import Breakpoint from '@/services/interfaces/debugger/Breakpoint';
import Watchpoint from '@/services/interfaces/debugger/Watchpoint';
import { isBreakpoint, isWatchpoint } from '@/services/debuggerService/conditionalTypesService';
import ConditionalConfigurator from './conditionalQuery/ConditionalConfigurator.vue';

/*
The line numbers displayed in the GUI are 1-indexed. (first line has number 1)
The line numbers used by the backend are also 1-indexed. (first instruction in memory is at line number 1)

nextValidElementTable: for the code line at index X, the next valid code line is stored in this array.
Example: when X is valid, X is given back. If line X is not valid, but line X+1 is, X+1 is given back.

TranslationTable: this table translates frontend line numbers to backend line numbers.
The backend only counts valid instructions since only those are written to memory. So in source code
1 BITS 64
2 mov rbx, rax
3 ; Add
4 mov rax, rbx
lines 1 and 3 don't exist for the backend. Therefore, when the frontend wants to convey "line 4" to the backend,
it must say "line 2" instead.
 */

export default defineComponent({
  name: 'CodeViewer',
  components: { ConditionalConfigurator },
  emits: [
    'conditionalBreakpointSet',
    'conditionalWatchpointSet',
    'conditionalWatchpointDelete',
    'deleteBreakpoints',
    'breakpointToggle',
    'jumpToLine',
  ],
  props: {
    assemblyCode: { type: String, required: true },
    currentLine: { type: Number, required: true },
    breakpoints: { type: Object as PropType<Array<Breakpoint>>, required: false },
    watchpoints: { type: Object as PropType<Array<Watchpoint>>, required: false },
  },
  setup(props, { emit }) {
    const highlighter = (codeToHighlight: string) => highlight(codeToHighlight, languages.nasm, 'nasm');
    const ASMLineArray = () => DOMPurify.sanitize(props.assemblyCode).split('\n');
    const nextValidElementTable: Ref<Map<number, number>> = ref(new Map());
    const translationTable: Ref<Map<number, number>> = ref(new Map());
    const conditionalSelected: Ref<boolean> = ref(false);
    const conditionalPopup: Ref<boolean> = ref(false);
    const conditionalWatchpointPopup: Ref<boolean> = ref(false);
    const breakpointTablePopup: Ref<boolean> = ref(false);
    const condTooltip: Ref<Array<boolean>> = ref(Array(ASMLineArray().length).fill(false));
    let condBreakpointLineNumber = -1;
    let breakpointDisplay: HTMLElement;
    let conditionalQuestionMarkCell: HTMLTableCellElement;
    const notification = useQuasar();
    const timeoutIds: Array<number> = [];
    let condBreakpointTooltip = 'A conditional breakpoint has been set on this line';
    const invalidStarts = [
      ';',
      '%',
      '.',
      'bits',
      'section',
      'segment',
      'use16',
      'use32',
      'default',
      'absolute',
      'extern',
      'global',
      'required',
      'common',
      'static',
      'db',
      'dw',
      'dd',
      'dq',
      'dt',
      'resb',
      'resw',
      'resd',
      'resq',
      'rest',
    ];
    const invalidContains = ['incbin', 'equ', ':'];

    const reverseLookup = (backendLineNumber: number) => {
      const result = [...translationTable.value].find(([, val]) => val === backendLineNumber);
      if (result) {
        return result[0];
      }
      return -1;
    };

    const calculateActiveLine = (index: number) => reverseLookup(props.currentLine) === index;

    const toggleConditional = () => {
      conditionalSelected.value = !conditionalSelected.value;
      const conditionalBtn = document.querySelector('#conditionalBtn') as HTMLElement;
      conditionalBtn.classList.toggle('conditionalSelected');
      if (conditionalSelected.value) {
        notification.notify({
          message: 'Now click on a line number to set a conditional breakpoint',
        });
      }
    };

    const deleteWatchpoints = (selected: Array<Watchpoint>) => {
      emit('conditionalWatchpointDelete', selected);
    };

    const deleteBreakpoints = (selected: Array<Breakpoint>) => {
      emit('deleteBreakpoints', selected);
      selected.forEach((bp) => {
        const frontendLineNumber = reverseLookup(bp.line) as number;
        const breakpointRow = document.getElementById(
          `line-${frontendLineNumber}`,
        ) as HTMLTableRowElement;
        (breakpointRow.childNodes[1] as HTMLTableCellElement).classList.remove('breakpointSet');
        if (bp.condition) {
          (breakpointRow.firstElementChild as HTMLTableCellElement).classList.remove(
            'conditionalQuestionMark',
          );
          condTooltip.value[frontendLineNumber] = false;
        }
      });
    };

    const toggleWatchpoint = () => {
      conditionalWatchpointPopup.value = !conditionalWatchpointPopup.value;
    };

    const toggleBreakpointTable = () => {
      breakpointTablePopup.value = !breakpointTablePopup.value;
    };

    const untriggerBreakpoint = (breakpoint: Breakpoint) => {
      const frontEndLineNumber = reverseLookup(breakpoint.line);
      const questionMarkCell = document.getElementById(
        `question-mark-${frontEndLineNumber}`,
      ) as HTMLTableCellElement;
      questionMarkCell.classList.remove('triggeredBreakpoint');
      questionMarkCell.classList.add('conditionalQuestionMark');
      condBreakpointTooltip = 'A conditional breakpoint has been set on this line';
    };

    // listen for breakpoint notifications from debuggerController
    const triggerBreakpoint = (breakpoint: Breakpoint) => {
      const frontEndLineNumber = reverseLookup(breakpoint.line);
      notification.notify({
        group: false,
        message: `Breakpoint ${breakpoint.condition?.value} has been triggered on line ${frontEndLineNumber}`,
      });
      const questionMarkCell = document.getElementById(
        `question-mark-${frontEndLineNumber}`,
      ) as HTMLTableCellElement;
      questionMarkCell.classList.add('triggeredBreakpoint');
      questionMarkCell.classList.remove('conditionalQuestionMark');
      condBreakpointTooltip = 'The conditional breakpoint on this line has triggered';
      const timeoutId = setTimeout(
        (breakpoint1: Breakpoint) => {
          untriggerBreakpoint(breakpoint1);
        },
        5000,
        breakpoint,
      );
      timeoutIds.push(timeoutId);
    };

    // listen for watchpoint notifications from debuggerController
    const triggerWatchpoint = (watchpoint: Watchpoint) => {
      notification.notify({
        group: false,
        message: `Watchpoint ${watchpoint.condition?.value} has been triggered.`,
      });
    };

    const toggleBreakpoint = (ev: Event) => {
      breakpointDisplay = ev.target as HTMLElement;
      const clickedLineNr = parseInt(breakpointDisplay.innerHTML, 10);
      const nextValidLine = nextValidElementTable.value.get(clickedLineNr);
      let number = -1;

      if (nextValidLine === clickedLineNr) {
        // determine which line to set breakpoint on
        number = clickedLineNr;
      } else if (nextValidLine === clickedLineNr + 1) {
        // set breakpoint only at next line if it is valid
        const line = document.getElementById(
          `line-${(nextValidElementTable.value.get(clickedLineNr) as number).toString()}`,
        ) as HTMLElement;
        breakpointDisplay = line.childNodes[1] as HTMLElement; // finds first td element of tr for setting breakpoint
        number = nextValidElementTable.value.get(clickedLineNr) as number;
      } else {
        // Can't set breakpoint when clicked line and next line are not valid
        return;
      }
      conditionalQuestionMarkCell = document.getElementById(
        `question-mark-${parseInt(breakpointDisplay.innerText, 10)}`,
      ) as HTMLTableCellElement;

      if (conditionalSelected.value) {
        // set normal or conditional breakpoint
        condBreakpointLineNumber = translationTable.value.get(number) as number;
        conditionalPopup.value = true; // Triggers popup
        toggleConditional();
      } else {
        conditionalQuestionMarkCell.classList.remove('conditionalQuestionMark');
        condTooltip.value[parseInt(breakpointDisplay.innerText, 10)] = false;
        breakpointDisplay.classList.toggle('breakpointSet');
        emit(
          'breakpointToggle',
          createBreakpointWithoutCondition(translationTable.value.get(number) as number),
        );
      }
    };

    const setConditionalBreakpoint = (condition: string) => {
      conditionalPopup.value = false; // Closes popup

      const { conditional, error } = createConditional(condition);
      if (error) {
        console.log('An error has occurred creating the condition', error);
        return;
      }
      breakpointDisplay.classList.add('breakpointSet');
      conditionalQuestionMarkCell.classList.add('conditionalQuestionMark');
      condTooltip.value[parseInt(breakpointDisplay.innerText, 10)] = true;
      emit(
        'conditionalBreakpointSet',
        createBreakpointWithCondition(condBreakpointLineNumber, conditional),
      );
    };

    const setConditionalWatchpoint = (condition: string) => {
      conditionalWatchpointPopup.value = false; // Closes popup
      const { conditional, error } = createConditional(condition);
      if (error) {
        console.log('An error has occurred creating the condition', error);
        return;
      }
      emit('conditionalWatchpointSet', createWatchpoint(conditional));
    };

    const jumpToLine = (ev: Event) => {
      let button = ev.target as HTMLElement;
      if (button.classList.contains('token')) {
        // in case user clicks on span token
        button = button.parentElement as HTMLElement;
      }
      const lineNr = parseInt(button.id.substring(6), 10);
      if (nextValidElementTable.value.get(lineNr) === lineNr) {
        emit('jumpToLine', translationTable.value.get(lineNr));
      } else {
        const nextValidLine = nextValidElementTable.value.get(lineNr) as number;
        if (nextValidLine !== -1) {
          emit('jumpToLine', translationTable.value.get(nextValidLine));
        }
      }
    };

    // Validity checker tries to detect all NASM commands
    // that are not directly translatable to a CPU instruction
    const checkLineValidity = (line: string) => {
      let result = true;
      if (line.trim().length === 0) {
        return false;
      }
      invalidStarts.forEach((word) => {
        if (line.toLowerCase().trim().startsWith(word)) {
          result = false;
        }
      });
      if (result) {
        invalidContains.forEach((word) => {
          if (line.toLowerCase().includes(word)) {
            result = false;
          }
        });
      }
      return result;
    };

    const buildValidityTable = () => {
      let lastValidLine = -1;
      for (let i = ASMLineArray().length; i >= 1; i -= 1) {
        if (checkLineValidity(ASMLineArray()[i - 1])) {
          nextValidElementTable.value.set(i, i);
          lastValidLine = i;
        } else {
          nextValidElementTable.value.set(i, lastValidLine);
        }
      }
    };

    // Key: Frontend-Line-Number
    // Value: Backend-Line-Number
    const buildTranslationTable = () => {
      let backendLineNumber = 1;
      for (
        let frontendLineNumber = 1;
        frontendLineNumber < nextValidElementTable.value.size + 1;
        frontendLineNumber += 1
      ) {
        if (nextValidElementTable.value.get(frontendLineNumber) === frontendLineNumber) {
          translationTable.value.set(frontendLineNumber, backendLineNumber);
          backendLineNumber += 1;
        }
      }
    };

    buildValidityTable();
    buildTranslationTable();

    const eventFunctionBreakpoint = ((e: Event) => {
      const { detail } = e as CustomEvent;
      if (isBreakpoint(detail)) {
        triggerBreakpoint(detail);
      }
    });

    const eventFunctionWatchpoint = ((e: Event) => {
      const { detail } = e as CustomEvent;
      if (isWatchpoint(detail)) {
        triggerWatchpoint(detail);
      }
    });

    window.addEventListener('triggerBreakpoint', eventFunctionBreakpoint);
    window.addEventListener('triggerWatchpoint', eventFunctionWatchpoint);

    onBeforeUnmount(() => {
      timeoutIds.forEach((id) => clearTimeout(id));
    });

    onUnmounted(() => {
      window.removeEventListener('triggerWatchpoint', eventFunctionWatchpoint);
      window.removeEventListener('triggerBreakpoint', eventFunctionBreakpoint);
    });

    return {
      highlighter,
      jumpToLine,
      translationTable,
      toggleBreakpoint,
      toggleConditional,
      toggleWatchpoint,
      ASMLineArray,
      calculateActiveLine,
      conditionalIcon,
      watchpointIcon,
      conditionalPopup,
      conditionalWatchpointPopup,
      condBreakpointTooltip,
      setConditionalBreakpoint,
      setConditionalWatchpoint,
      deleteWatchpoints,
      condTooltip,
      triggerBreakpoint,
      deleteBreakpoints,
      reverseLookup,
      breakpointTablePopup,
      toggleBreakpointTable,
    };
  },
});
</script>

<style scoped>
.editor {
  background: var(--editorBackgroundColor);
  color: var(--editorFontColor);
  font-family: monospace;
  font-size: 15px;
  line-height: 1.5;
  width: 100%;
  padding: var(--paddingSize) calc(var(--paddingSize) * 0.1);
  height: 100%;
  border-radius: var(--borderRadiusSize);
}

.assemblyBox {
  background-color: var(--editorBoxBackgroundColor);
  border-radius: var(--borderRadiusSize);
  padding: calc(var(--paddingSize) * 0.5);
  height: 95%;
  box-shadow: 0 0 calc(var(--byteSize) / 0.3) calc(var(--byteSize) / 0.6) var(--shadowIntensity);
  display: flex;
  flex-direction: column;
  justify-content: space-evenly;
  margin: 0 0 0 calc(var(--byteSize) / 1.5);
  min-width: 250px;
  max-width: 380px;
}

.conditionalBox {
  display: flex;
  justify-content: space-evenly;
}

#card {
  background: var(--primaryColor);
}

#tabs {
  background: var(--backgroundColor);
  min-height: 500px;
  min-width: 500px;
}

#subTab {
  background-color: var(--primaryColor);
}

.cardBtn {
  background-color: var(--elementColor);
  padding: 0.5rem;
  margin-top: 2rem;
}

.queryField {
  background-color: var(--primaryColor);
  color: var(--baseFontColor);
}

.table-card-container {
  min-height: 400px;
}

.btn {
  margin: 0.75em 0;
  width: calc(var(--buttonWidth) * 0.25);
  align-self: center;
}

.conditionalSelected {
  color: var(--conditionalSelected);
}

.watchpointActive {
  color: var(--conditionalSelected);
}

.title {
  text-align: center;
  margin: 1vh 0;
  font-size: var(--fontTitleSize);
}

.breakpoint {
  font-size: 75%;
  text-align: center;
  border-radius: 1em;
}

.breakpointSet {
  background-color: var(--breakpointColor);
  font-weight: bolder;
}

.conditionalQuestionMark::before {
  font-size: x-small;
  text-align: right;
  font-weight: bolder;
  color: var(--conditionalSelected);
  content: "?";
}

.triggeredBreakpoint::before {
  font-size: medium;
  text-align: right;
  font-weight: bolder;
  color: var(--breakpointColor);
  content: "!";
}

.activeLine {
  background-color: var(--activeLineColor);
}
</style>
