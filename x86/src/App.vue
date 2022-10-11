<!--/* SPDX-License-Identifier: GPL-2.0-only */-->
<!--/*
* CPUSim
*
* Copyright © 2021 by Eliane Schmidli seliane.github@gmail.com and Yves Boillat yvbo@protonmail.com
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
* along with CPUSim.  If not, see https://www.gnu.org/licenses/ .
*/
-->

<template>
  <div class="background">
    <Layout/>
    <Scaling/>
    <Colors/>
    <q-layout view="lHh Lpr lFf">
      <q-page-container>
        <router-view/>
      </q-page-container>
    </q-layout>
  </div>
</template>

<script>
import { defineComponent } from 'vue';
import Layout from '@/components/colorAndLayout/Layout.vue';
import Colors from '@/components/colorAndLayout/Colors.vue';
import Scaling from '@/components/colorAndLayout/Scaling.vue';

export default defineComponent({
  name: 'LayoutDefault',
  components: {
    Scaling,
    Colors,
    Layout,
  },
  props: {},
  setup() {
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      document.documentElement.className = 'dark';
    } else {
      document.documentElement.className = 'light';
    }
  },
});

</script>

<style>
.background {
  background-color: var(--backgroundColor);
  font-family: "Roboto Mono", "Roboto", "-apple-system", "Helvetica Neue", Helvetica, Arial, sans-serif;
  width: 100vw;
  height: 100vh;
}

body {
  overscroll-behavior: none;
}
</style>
