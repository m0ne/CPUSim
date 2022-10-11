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
import rfdc from 'rfdc';
import Unicorn from '@/services/emulator/emulatorService';
import Disassembler from '@/services/disassembler/disassemblerService';
import StepController from '@/services/stepController';
// import State from '@/services/interfaces/State';
import {
  closeEmulator,
  startSimpleTestProgram,
} from './testEmulator';

const clone = rfdc();

const stepXTimesForwardAndBack = async (nr: number, controller: StepController) => {
  for (let i = 0; i < nr; i += 1) {
    // eslint-disable-next-line no-await-in-loop
    await controller.nextStep();
  }

  for (let k = 0; k < nr; k += 1) {
    // eslint-disable-next-line no-await-in-loop
    await controller.previousStep();
  }
};

describe('Initial step + forward/backward', async () => {
  const ucInstance = new Unicorn();
  const disassemblerInstance = new Disassembler();

  await startSimpleTestProgram(ucInstance, disassemblerInstance).then(async (program) => {
    const testController = new StepController(program);
    const expectedState = clone(testController.getState());
    const expectedStep = clone(testController.getCurrentStep());

    await testController.nextStep();
    await testController.previousStep();

    closeEmulator(program);
    it('succeeds if states are identical', () => {
      expect(testController.getState()).to.deep.equal(expectedState);
    });
    it('succeeds if currentSteps are identical', () => {
      expect(testController.getCurrentStep()).to.deep.equal(expectedStep);
    });
  });
});

describe('Initial step + 2x forward/backward', async () => {
  const ucInstance = new Unicorn();
  const disassemblerInstance = new Disassembler();

  await startSimpleTestProgram(ucInstance, disassemblerInstance).then(async (program) => {
    const testController = new StepController(program);
    const expectedState = clone(testController.getState());
    const expectedStep = clone(testController.getCurrentStep());

    await stepXTimesForwardAndBack(2, testController);

    closeEmulator(program);
    it('succeeds if states are identical', () => {
      expect(testController.getState()).to.deep.equal(expectedState);
    });
    it('succeeds if currentSteps are identical', () => {
      expect(testController.getCurrentStep()).to.deep.equal(expectedStep);
    });
  });
});

describe('Initial step + 3x forward/backward', async () => {
  const ucInstance = new Unicorn();
  const disassemblerInstance = new Disassembler();

  await startSimpleTestProgram(ucInstance, disassemblerInstance).then(async (program) => {
    const testController = new StepController(program);
    const expectedState = clone(testController.getState());
    const expectedStep = clone(testController.getCurrentStep());

    await stepXTimesForwardAndBack(3, testController);

    closeEmulator(program);
    it('succeeds if states are identical', () => {
      expect(testController.getState()).to.deep.equal(expectedState);
    });
    it('succeeds if currentSteps are identical', () => {
      expect(testController.getCurrentStep()).to.deep.equal(expectedStep);
    });
  });
});

describe('Initial step + 4x forward/backward', async () => {
  const ucInstance = new Unicorn();
  const disassemblerInstance = new Disassembler();

  await startSimpleTestProgram(ucInstance, disassemblerInstance).then(async (program) => {
    const testController = new StepController(program);
    const expectedState = clone(testController.getState());
    const expectedStep = clone(testController.getCurrentStep());

    await stepXTimesForwardAndBack(4, testController);

    closeEmulator(program);
    it('succeeds if states are identical', () => {
      expect(testController.getState()).to.deep.equal(expectedState);
    });
    it('succeeds if currentSteps are identical', () => {
      expect(testController.getCurrentStep()).to.deep.equal(expectedStep);
    });
  });
});
