/* SPDX-License-Identifier: GPL-2.0-only */
/*
 * CPUSim
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

import { createRouter, createWebHashHistory, RouteRecordRaw } from 'vue-router';
import Editor from '@/components/Editor.vue';
import Simulator from '@/components/Simulator.vue';

export const routeCodeEditorWithCode = 'CodeEditorWithCode';

export const routeCodeEditor = 'CodeEditor';

export const routeSimulator = 'SimulatorWithMachineCodeAndAssembly';

export const routes: Array<RouteRecordRaw> = [
  {
    path: '/', redirect: '/editor',
  },
  {
    path: '/editor',
    name: routeCodeEditor,
    component: Editor,
  },
  {
    path: '/editor/:base64AssemblyFromURLEditor',
    name: routeCodeEditorWithCode,
    component: Editor,
    props: (route) => ({
      ...route.params,
    }),
  },
  {
    path: '/simulator', redirect: '/editor',
  },
  {
    path: '/simulator//:base64AssemblyFromURLSimulator', redirect: '/editor/:base64AssemblyFromURLSimulator',
  },
  {
    path: '/simulator/:machineCodeFromURLSimulator', redirect: '/editor',
  },
  {
    path: '/simulator/:machineCodeFromURLSimulator/:base64AssemblyFromURLSimulator',
    name: routeSimulator,
    component: Simulator,
    props: (route) => ({
      ...route.params,
    }),
  },
  {
    path: '/fail', redirect: '/editor',
  },
];

const router = createRouter({
  history: createWebHashHistory(), // createWebHistory(process.env.BASE_URL),
  routes,
});

export default router;
