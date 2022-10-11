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

import { shallowMount } from '@vue/test-utils';
import { expect } from 'chai';
import ByteVue from '@/components/general/ByteVue.vue';
import MemoryAddress from '@/components/general/MemoryAddress.vue';
import MemoryLine from '@/components/memory/MemoryLine.vue';
import MemoryDataLine from '@/services/interfaces/MemoryDataLine';
import { testDataMemory } from '../services/testDataCurrentState';

describe('MemoryAddress.vue Component', () => {
  it('renders Address name when passed', () => {
    const wrapper = shallowMount(MemoryAddress, {
      propsData: { address: { address: '8000' } },
    });
    expect(wrapper.text()).to.include('8000');
  });
});
describe('MemoryLine.vue Component', () => {
  const memoryDataLine: MemoryDataLine = testDataMemory.memoryDataLines[0];
  it('succeeds if all Bytes rendered', () => {
    const wrapper = shallowMount(MemoryLine, {
      propsData: {
        memoryLine: memoryDataLine,
      },
    });
    expect(wrapper.findAllComponents(ByteVue).length).to.be.equal(16);
  });
  it('succeeds if Address rendered', () => {
    const wrapper = shallowMount(MemoryLine, {
      propsData: {
        memoryLine: memoryDataLine,
      },
    });
    expect(wrapper.findAllComponents(MemoryAddress).length).to.be.equal(1);
  });
});
