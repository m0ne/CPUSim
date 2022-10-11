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
  <div class="screenFlex">
    <div class="assemblyBox">
      <div class="boxTitle">x64 GRAPHICAL CPU SIMULATOR</div>
      <div>Load Example Programs</div>
      <div class="buttonFlex">
        <q-btn class="programButtons" v-for="(program, index) in programs" :key="index" color="primary" text-color="baseFontColor" @click="loadDemoCode(program.program)">
          {{program.label}}
          <q-tooltip style="font-size: 16px" max-width="500px">
            {{programDescription(program.label)}}
          </q-tooltip>
        </q-btn>
      </div>
      <div>x64 Assembly (Nasm Syntax)</div>
      <div class="editorBox">
        <div class="editorOutside" :class="{ 'editorOnError': hasError() }">
          <div class="editorFlex">
            <prism-editor class="editor" v-model="code" :highlight="highlighter" line-numbers></prism-editor>
          </div>
        </div>
        <div class="errorBox" v-if="hasError()">{{ error }}</div>
        <div class="startButton">
          <q-btn color="secondary" text-color="baseFontColor" label="Start Program" :loading="isLoading" @click="goToSimulator"/>
        </div>
      </div>
    </div>
    <div id="bottomCorner">
      <LicenseButton class="licenseMenuButton"></LicenseButton>
      <div id="themeSwitcherDiv">
        <q-btn-toggle v-model="selectedTheme" :options=themes @update:model-value="setTheme" size="sm" toggle-text-color="buttonFontColor"></q-btn-toggle>
      </div>
    </div>
  </div>

</template>

<script lang="ts">
import {
  defineComponent, ref,
} from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { PrismEditor } from 'vue-prism-editor';
import 'vue-prism-editor/dist/prismeditor.min.css';
import { highlight, languages } from 'prismjs/components/prism-core';
import 'prismjs/components/prism-clike';
import 'prismjs/components/prism-nasm';
import 'prismjs/themes/prism-solarizedlight.css';
import { nasm } from '@/services/nasm/nasm';
import uInt8ArrayToHexStringArray from '@/services/helper/uInt8ArrayHelper';
import demoPrograms from '@/services/editorService/demoPrograms';
import LicenseButton from './licenseButton/licenseButton.vue';

export default defineComponent({
  name: 'Editor',
  components: {
    PrismEditor,
    LicenseButton,
  },
  props: {
    base64AssemblyFromURLEditor: { type: String },
  },
  setup(props) {
    const router = useRouter();
    const route = useRoute();
    const { path } = route;

    let machineCode = Uint8Array.from([]);
    let base64code = '';
    const error = ref('');
    const isLoading = ref(false);
    const programs = demoPrograms;

    const code = ref('');

    const loadDefaultCode = () => {
      code.value = programs[0].program;
    };

    const hasError = () => error.value !== '';

    const base64Encode = () => {
      base64code = btoa(code.value);
    };

    const base64Decode = () => {
      if (props.base64AssemblyFromURLEditor) {
        code.value = atob(props.base64AssemblyFromURLEditor);
      }
    };

    const highlighter = (codeToHighlight: string) => highlight(codeToHighlight, languages.nasm, 'nasm');

    const assembleCode = async () => {
      machineCode = Uint8Array.from([]);
      error.value = '';

      try {
        machineCode = await nasm(code.value);
        if (machineCode.length === 0) {
          error.value = 'The machine code of your assembly program is empty.';
          isLoading.value = false;
        }
        base64Encode();
      } catch (e) {
        isLoading.value = false;
        if (e instanceof Error) {
          error.value = e.toString();
        } else {
          error.value = 'generic error in assemble Code';
        }
      }
    };

    const getMachineCodeStringForURL = () => {
      const uInt8ArrayMachineCode = Uint8Array.from(machineCode);
      return uInt8ArrayToHexStringArray(uInt8ArrayMachineCode)
        .toString();
    };

    const setBase64CodeToEditorURL = () => {
      const newRoute = `/editor/${base64code}`;
      if (newRoute !== path) {
        return router.push({ path: `/editor/${base64code}` });
      }
      return Promise.resolve();
    };

    const loadDemoCode = (demoCode: string) => {
      code.value = demoCode;
    };

    const demoProgramDescriptor = new Map([
      ['Add', 'This program takes two pieces of data from memory, adds them and puts the result back into memory.'],
      ['Swap', 'This program takes two pieces of data in memory and exchanges their places.'],
      ['Multiply', 'This program multiplies the content of RAX by 3 by continually adding in a loop. It then saves the result into memory and nulls the used registers.'],
      ['Stack', 'This program pushes three values to the stack before popping one into a register and one into memory.'],
      ['Jump', 'This program continually increases rax by jumping to the beginning of the loop. As soon as rax equals 3, it exits the loop and stops.'],
      ['Surprise', 'This program is not very interesting in a programming sense, but you should check the memory after you have fully executed it ;)'],
    ]);

    const programDescription = (programName: string) => demoProgramDescriptor.get(programName) || '';

    const themes = [
      {
        label: 'light',
        value: 0,
      },
      {
        label: 'dark',
        value: 1,
      },
      {
        label: 'legacy',
        value: 2,
      },
    ];

    // Theme fulfilling user preference is standard, else use light mode
    const getInitialTheme = themes.find((obj) => obj.label === document.documentElement.className);

    const setInitialTheme = () => (getInitialTheme ? getInitialTheme.value : 0);

    const selectedTheme = ref(setInitialTheme());

    const setTheme = () => {
      document.documentElement.className = themes[selectedTheme.value].label;
    };

    const navigateToSimulator = () => router.push({ path: `/simulator/${getMachineCodeStringForURL()}/${base64code}` });

    const goToSimulator = async () => {
      isLoading.value = true;
      await assembleCode()
        .then(async () => {
          if (error.value === '') {
            await setBase64CodeToEditorURL()
              .then(async () => {
                await navigateToSimulator();
              });
          }
        });
    };

    const populateCodeEditorContent = () => {
      try {
        if (props.base64AssemblyFromURLEditor) {
          base64Decode();
        } else {
          loadDefaultCode();
        }
      } catch {
        router.push('/fail');
      }
    };

    populateCodeEditorContent();

    return {
      programs,
      code,
      hasError,
      isLoading,
      highlighter,
      goToSimulator,
      error,
      loadDemoCode,
      programDescription,
      setTheme,
      selectedTheme,
      themes,
    };
  },
});
</script>

<style scoped>
#bottomCorner {
  position: absolute;
  bottom: 0px;
  right: 0px;
  display: flex;
  flex-direction: column;
}

#themeSwitcherDiv {
  display: inline-block;
  background-color: var(--primaryColor);
  align-content: end;
}

.licenseMenuButton {
  align-self: end;
}

.toggle-icon {
  font-family: bootstrap-icons;
}

.editorOutside, .editorFlex, .editorBox {
  overflow: hidden;
  display: flex;
  width: 100%;
}

.editorOutside {
  border-radius: var(--borderRadiusSize);
  margin-bottom: var(--paddingSize);
}

.editorBox {
  flex-direction: column;
}

.editor {
  background: var(--editorBackgroundColor);
  color: var(--editorFontColor);
  font-family: Fira code, Fira Mono, Consolas, Menlo, Courier, monospace;
  font-size: 14px;
  line-height: 1.5;
  width: 100%;
  padding: var(--paddingSize);
  height: calc(var(--byteSize) * 25);
  max-height: calc(var(--byteSize) * 36.875);
}

.editorOnError {
  margin-bottom: 0;
  border-radius: var(--borderRadiusSize) var(--borderRadiusSize) 0 0;
}

.errorBox {
  background-color: var(--editorErrorBoxColor);
  color: var(--editorErrorBoxFontColor);
  padding: var(--paddingSize);
  border-radius: 0 0 var(--borderRadiusSize) var(--borderRadiusSize);
  margin-bottom: var(--paddingSize);
  width: 100%;
}

.assemblyBox, .screenFlex, .buttonFlex, .startButton {
  display: flex;
}

.assemblyBox {
  background-color: var(--editorBoxBackgroundColor);
  border-radius: var(--borderRadiusSize);
  padding: var(--paddingSize);
  max-height: 98vh;
  width: 50%;
  box-shadow: 0 0 calc(var(--byteSize) / 0.3) calc(var(--byteSize) / 0.6) var(--shadowIntensity);
  flex-direction: column;
}

.screenFlex {
  flex-direction: row;
  height: 100vh;
  width: 100vw;
  align-items: center;
  align-content: center;
  justify-content: space-evenly;
}

.boxTitle {
  margin-top: var(--paddingSize);
  margin-bottom: var(--paddingSize);
  font-size: calc(var(--byteSize) * 1.6);
  display: inline-block;
  line-height: 0;
}

.programButtons {
  width: calc(var(--byteSize) * 6.5);
  margin-right: var(--paddingSize);
}

.buttonFlex {
  margin-bottom: var(--paddingSize);
}

.startButton {
  justify-content: center;
}
</style>
