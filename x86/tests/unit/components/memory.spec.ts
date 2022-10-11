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

import { expect } from 'chai';
import { shallowMount } from '@vue/test-utils';
import Memory from '@/components/memory/Memory.vue';
import MemoryAreaData from '@/components/memory/MemoryAreaData.vue';
import MemoryAreaHeader from '@/components/memory/MemoryAreaHeader.vue';
import MemoryData from '@/services/interfaces/MemoryData';
import MemoryLine from '@/components/memory/MemoryLine.vue';
import {
  testDataMemory,
  testDataState,
} from '../services/testDataCurrentState';

const expectedMemory: MemoryData = testDataMemory;
const expectedState = testDataState;

describe('Memory.vue Component', () => {
  it('succeeds if MemoryAreaData rendered', () => {
    const wrapper = shallowMount(Memory, {
      props: { memoryData: expectedState.memoryData, byteInformation: expectedState.byteInformation },
    });
    expect(wrapper.findAllComponents(MemoryAreaData).length).to.be.equal(1);
  });
  it('succeeds if MemoryAreaHeader rendered', () => {
    const wrapper = shallowMount(Memory, {
      props: { memoryData: expectedState.memoryData, byteInformation: expectedState.byteInformation },
    });
    expect(wrapper.findAllComponents(MemoryAreaHeader).length).to.be.equal(1);
  });
});

describe('MemoryAreaData.vue Component', () => {
  it('renders all memory lines when passed', () => {
    const wrapper = shallowMount(MemoryAreaData, {
      props: { memoryData: expectedMemory },
    });
    expect(wrapper.findAllComponents(MemoryLine).length).to.be.equal(256);
  });
});

describe('MemoryAreaHeader.vue Component', () => {
  it('renders header when passed', () => {
    const msg = 'Address+1+2+3+4+5+6+7+8+9+A+B+C+D+E+F';
    const wrapper = shallowMount(MemoryAreaHeader, {
    });
    expect(wrapper.text()).to.include(msg);
  });
});
