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
  <div class="menus">
    <q-btn outline class="editor-button" :loading="isLoading" color="secondary" text-color="buttonFontColor" @click="backToEditor()" label="Back to Editor">
      <q-tooltip style="font-size: 16px" anchor="bottom middle" self="top middle">
        <span>Go back to code editor</span>
      </q-tooltip>
    </q-btn>
    <q-btn class="menu" color="accent" text-color="buttonFontColor" label="Change Log" @click="showingLog = false">
      <q-menu fit>
        <div v-if="changeHistory.length > 0">
          <q-list v-for="(changeHistoryItem, index) in changeHistory" :key="index">
            <q-item class="menuItemContainer changeLogCard">
              <q-item-section>
                <q-item-label class="menuItemText">{{changeHistoryItem.instruction}}</q-item-label>
                <div v-for="(element, indexElement) in changeHistoryItem.changedElements" :key="indexElement">
                  <q-item-label class="menuItemText" caption lines="2">{{ element }}</q-item-label>
                </div>
              </q-item-section>
              <q-item-section side top>
                <q-badge outline color="primary">
                  {{ index + 1 }}
                </q-badge>
              </q-item-section>
            </q-item>
          </q-list>
        </div>
        <div v-else>
          <q-item class="menuItemContainer changeLogCardEmpty">
            <q-item-section>
              <q-item-label class="menuItemText">Nothing has changed yet</q-item-label>
            </q-item-section>
          </q-item>
        </div>
      </q-menu>
      <q-tooltip v-model="showingLog" style="font-size: 16px" anchor="bottom middle" self="top middle">
        <span>Show past instructions and changes</span>
      </q-tooltip>
    </q-btn>
    <div class="controlDiv">
      <q-slider
        v-model="animationSpeed" color="secondary" markers snap :min="0.5" :step="0.5" :max="4" @input="setAnimationSpeed" label label-text-color="info" :label-value="animationSpeed + 'x'">
      </q-slider>
      <div id="animationSpeedLabel">Animation Speed</div>
    </div>
    <div class="controlDiv">
      <q-btn-toggle v-model="selectedTheme" :options=themes @update:model-value="setTheme" size="sm" toggle-text-color="buttonFontColor"></q-btn-toggle>
      <div id="themeSwitcherLabel">Theme Switcher</div>
    </div>
  </div>

</template>

<script lang="ts">
import { defineComponent, PropType, ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { ChangeHistory } from '@/services/interfaces/State';

export default defineComponent({
  name: 'Controls',
  components: {},
  emits: ['changeAnimationSpeed'],
  props: {
    changeHistory: { type: Object as PropType<Array<ChangeHistory>> },
  },
  setup(props, { emit }) {
    const router = useRouter();

    const route = useRoute();

    const showingLog = ref(false);

    const isLoading = ref(false);

    const animationSpeed = ref(1.0);

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

    const backToEditor = async () => {
      isLoading.value = true;

      const base64AssemblyFromURLEditor = route.params.base64AssemblyFromURLSimulator;
      await router.push({
        name: 'CodeEditorWithCode',
        params: { base64AssemblyFromURLEditor },
      });
    };

    const setAnimationSpeed = () => {
      emit('changeAnimationSpeed', animationSpeed);
    };

    const setTheme = () => {
      document.documentElement.className = themes[selectedTheme.value].label;
    };

    return {
      isLoading,
      backToEditor,
      setTheme,
      setAnimationSpeed,
      showingLog,
      selectedTheme,
      themes,
      animationSpeed,
    };
  },
});
</script>

<style scoped>
.menus {
  display: flex;
  flex-direction: column;
  justify-content: space-evenly;
  align-items: center;
  width: 30%;
  margin-left: calc(var(--byteSize) * 1.2);;
}
.menu, .editor-button {
  width: var(--buttonWidth);
}
.menuItemText {
  letter-spacing: +1px;
  margin-bottom: 5px;
}
.menuItemContainer {
  margin-top: 10px;
  margin-bottom: 10px;
}
.changeLogCard {
  min-width: 310px;
}
.changeLogCardEmpty {
  min-width: 250px;
}
#animationSpeedLabel {
  text-align: center;
  color: var(--baseFontColor);
  font-size: var(--fontNormalSize);
}
#themeSwitcherLabel {
  text-align: center;
  color: var(--baseFontColor);
  font-size: var(--fontNormalSize);
  padding-top: 4px;
}
.controlDiv {
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
}
.q-slider :deep(.q-slider__track-container--h) {
  padding: 8px 0;
}
.q-btn-toggle {
  flex-direction: column;
}
</style>
