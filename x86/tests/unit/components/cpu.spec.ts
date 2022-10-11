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
import Register from '@/services/interfaces/Register';
import CurrentInstructionAssemblyBlock from '@/components/cpu/CurrentInstructionAssemblyBlock.vue';
import CurrentInstructionBlock from '@/components/cpu/CurrentInstructionBlock.vue';
import InstructionPointerBlock from '@/components/cpu/InstructionPointerBlock.vue';
import RegisterBlock from '@/components/cpu/RegisterBlock.vue';
import RegisterVue from '@/components/cpu/RegisterVue.vue';
import Cpu from '@/components/cpu/Cpu.vue';
import ByteVue from '@/components/general/ByteVue.vue';
import MemoryAddress from '@/components/general/MemoryAddress.vue';
import ExecutionBox from '@/components/cpu/ExecutionBox.vue';
import { getEmptyAccessedElements } from '@/services/dataServices/accessedElementsService';
import {
  testDataCurrentInstruction,
  testDataInstructionPointer,
  testDataRegisters, testDataState,
} from '../services/testDataCurrentState';

const expectedRegister: Array<Register> = testDataRegisters;
const expectedInstructionPointer = testDataInstructionPointer;
const expectedCurrentInstruction = testDataCurrentInstruction;
const expectedState = testDataState;

describe('Cpu.vue Component', () => {
  it('succeeds if InstructionPointerBlock rendered', () => {
    const wrapper = shallowMount(Cpu, {
      propsData: { currentState: expectedState },
    });
    expect(wrapper.findAllComponents(InstructionPointerBlock).length).to.be.equal(1);
  });
  it('succeeds if CurrentInstructionBlock rendered', () => {
    const wrapper = shallowMount(Cpu, {
      propsData: { currentState: expectedState },
    });
    expect(wrapper.findAllComponents(CurrentInstructionBlock).length).to.be.equal(1);
  });
  it('succeeds if RegisterBlock rendered', () => {
    const wrapper = shallowMount(Cpu, {
      propsData: { currentState: expectedState },
    });
    expect(wrapper.findAllComponents(RegisterBlock).length).to.be.equal(1);
  });
});
describe('CurrentInstructionAssemblyBlock.vue Component', () => {
  it('succeeds if assembly of current instruction rendered', () => {
    const wrapper = shallowMount(CurrentInstructionAssemblyBlock, {
      propsData: { currentInstructionAssembly: expectedCurrentInstruction.assemblyInterpretation },
    });
    expect(wrapper.text()).to.include('add rbx, rax');
  });
});
describe('CurrentInstructionBlock.vue Component', () => {
  it('succeeds if Bytes rendered', () => {
    const wrapper = shallowMount(CurrentInstructionBlock, {
      propsData: { currentInstruction: expectedCurrentInstruction },
    });
    expect(wrapper.findAllComponents(ByteVue).length).to.be.equal(3);
  });
  it('succeeds if CurrentInstructionAssemblyBlock rendered', () => {
    const wrapper = shallowMount(CurrentInstructionBlock, {
      propsData: { currentInstruction: expectedCurrentInstruction },
    });
    expect(wrapper.findAllComponents(CurrentInstructionAssemblyBlock).length).to.be.equal(1);
  });
});
describe('InstructionPointerBlock.vue Component', () => {
  it('succeeds if MemoryAddress rendered', () => {
    const wrapper = shallowMount(InstructionPointerBlock, {
      propsData: { instructionPointer: expectedInstructionPointer },
    });
    expect(wrapper.findAllComponents(MemoryAddress).length).to.be.equal(1);
  });
});
describe('RegisterBlock.vue Component', () => {
  it('succeeds if Register rendered', () => {
    const wrapper = shallowMount(RegisterBlock, {
      propsData: { registers: expectedRegister },
    });
    expect(wrapper.findAllComponents(RegisterVue).length).to.be.equal(3);
  });
});
describe('RegisterVue.vue Component', () => {
  it('succeeds if RAX rendered', () => {
    const wrapper = shallowMount(RegisterVue, {
      propsData: { register: expectedRegister[0] },
    });
    expect(wrapper.text()).to.include('RAX');
  });
  it('succeeds if Bytes of RAX rendered', () => {
    const wrapper = shallowMount(RegisterVue, {
      propsData: { register: expectedRegister[0] },
    });
    expect(wrapper.findAllComponents(ByteVue).length).to.be.equal(8);
  });
});

describe('ExecutionBox.vue Component', () => {
  it('succeeds if only one default Byte rendered', () => {
    const wrapper = shallowMount(ExecutionBox, {
      propsData: { accessedElements: getEmptyAccessedElements() },
    });
    expect(wrapper.findAllComponents(ByteVue).length).to.be.equal(0);
  });
  it('succeeds if all Bytes for MemoryDataLine rendered', () => {
    const memoryAccess = getEmptyAccessedElements();
    memoryAccess.memoryWriteAccess.push(expectedState.memoryData.memoryDataLines[0]);
    const wrapper = shallowMount(ExecutionBox, {
      propsData: { accessedElements: memoryAccess },
    });
    expect(wrapper.findAllComponents(ByteVue).length).to.be.equal(16);
  });
});
