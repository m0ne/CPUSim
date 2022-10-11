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
import CpuCycleStep, { Step } from '@/services/interfaces/CpuCycleStep';
import CpuCycle from '@/components/simulatorControls/CpuCycle.vue';
import StepVue from '@/components/simulatorControls/Step.vue';
import ControlButton from '@/components/simulatorControls/ControlButton.vue';

const steps: Array<CpuCycleStep> = [{
  name: 'Get Instruction',
  numberInCycleSequence: Step.GET_INSTRUCTION,
  animate: false,
}, {
  name: 'Increment Instr. Pointer',
  numberInCycleSequence: Step.INCREASE_IP,
  animate: false,
}, {
  name: 'Execute Instruction',
  numberInCycleSequence: Step.EXECUTE_INSTRUCTION,
  animate: false,
}];

describe('CpuCycle.vue Component', () => {
  it('succeeds if StepVues rendered', () => {
    const wrapper = shallowMount(CpuCycle, {
      props: { allSteps: steps, currentStep: steps[0] },
    });
    expect(wrapper.findAllComponents(StepVue).length).to.be.equal(3);
  });
  it('succeeds if buttons rendered', () => {
    const wrapper = shallowMount(CpuCycle, {
      props: { allSteps: steps, currentStep: steps[0] },
    });
    expect(wrapper.findAllComponents(ControlButton).length).to.be.equal(4);
  });
});

describe('Step.vue Component', () => {
  it('renders HTML when passed', () => {
    const wrapper = shallowMount(StepVue, {
      props: {
        step: steps[0], currentStep: steps[0], isInitialStep: false, isLastStep: false,
      },
    });
    expect(wrapper.html().length).to.be.greaterThan(1);
  });
});
