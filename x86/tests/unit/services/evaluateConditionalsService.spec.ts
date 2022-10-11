/* SPDX-License-Identifier: GPL-2.0-only */

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

import { expect } from 'chai';
import StepController from '@/services/stepController';
import createConditional, { createBreakpointWithCondition } from '@/services/debuggerService/conditionalFactoryService';
import DebuggerController from '@/services/debuggerController';
import mapLinesToMemory from '@/services/debuggerService/mapLinesToMemoryService';
import Disassembler from '@/services/disassembler/disassemblerService';
import Unicorn from '@/services/emulator/emulatorService';
import Condition from '@/services/interfaces/debugger/Condition';
import { startAddExampleProgram, startSimpleTestProgram } from './testEmulator';

const evaluateToTrueConditions = [
  'RAX = RAX',
  'RBX = RBX',
  '(RBX = RBX) AND (RAX = RAX)',
  '(RAX - 1 + 1) = RAX',
  'RAX - 1 + 1 = RAX',
  'RAX + 1 > RAX',
  'RAX - 1 < RAX',
  'RAX <= RAX',
  'RAX >= RAX',
  'RAX = 1 OR RAX = RAX',
  'RAX = RAX OR RAX = 1',
  'RAX != RAX + 1',
  '2 * 2 = 4',
  '2 / 2 = 1',
  'RAX + RAX + RAX = 3 * RAX',
  'RAX = RAX AND RBX = RBX',
  'RAX = RBX OR RAX = RAX',
];

const evaluateToFalseConditions = [
  'RAX = 1',
  'RAX >= RAX + 1',
  '2 < 1',
  '1 > 2',
  'RAX != RAX',
  'RAX + 1 <= RAX',
  '1 / 1 = 2',
  'RAX + RAX + RAX + RAX = 5 * RAX',
  '1 - 2 - 3 - 4 = 10',
  'RAX * RAX = 1',
  'RAX != RAX',
  'RAX = 1 AND RAX = 2',
];

const loadInAllConditions = (conditions: Array<string>) => {
  const conditionals = [];
  const errors = [];
  for (let i = 0; i < conditions.length; i += 1) {
    const { conditional, error } = createConditional(conditions[i]);
    if (error) {
      errors.push(error);
    } else {
      conditionals.push(conditional);
    }
  }
  return { conditionals, errors };
};

const createConditionalBreakpointsAtLineFromArray = (conditions: Array<Condition>, line: number) => {
  const breakpoints = [];
  for (let i = 0; i < conditions.length; i += 1) {
    const breakpoint = createBreakpointWithCondition(line, conditions[i]);
    breakpoints.push(breakpoint);
  }
  return breakpoints;
};

describe('Test TRUE Conditions', async () => {
  const ucInstance = new Unicorn();
  const disassemblerInstance = new Disassembler();

  const { conditionals, errors } = loadInAllConditions(evaluateToTrueConditions);
  const breakpoints = createConditionalBreakpointsAtLineFromArray(conditionals, 2);

  it('succeeds if createConditional service does not return an error', () => {
    expect(errors.length).to.be.equal(0);
  });

  await startSimpleTestProgram(ucInstance, disassemblerInstance).then(async (program) => {
    for (let i = 0; i <= breakpoints.length; i += 1) {
      const testController = new StepController(program);
      const editorLines = await mapLinesToMemory(program);
      const debuggerController = new DebuggerController(testController, editorLines);
      it(`succeeds if test condtion ${i} evaluates to TRUE: ${conditionals[i].value}`, async () => {
        debuggerController.setBreakpoint(breakpoints[i]);
        await debuggerController.runForwardUntilBreakpoint();
        expect(testController.getCurrentStep().numberInCycleSequence).to.equal(1);
        debuggerController.toggleBreakpoint(breakpoints[i]);
        await debuggerController.runBackwardUntilBreakpoint();
      });
    }
  });
});

describe('Test FALSE Conditions', async () => {
  const { conditionals, errors } = loadInAllConditions(evaluateToFalseConditions);
  const breakpoints = createConditionalBreakpointsAtLineFromArray(conditionals, 2);

  it('succeeds if createConditional service does not return an error', () => {
    expect(errors.length).to.be.equal(0);
  });

  await startAddExampleProgram().then(async (program) => {
    for (let k = 0; k <= breakpoints.length; k += 1) {
      const testController = new StepController(program);
      const editorLines = await mapLinesToMemory(program);
      const debuggerController = new DebuggerController(testController, editorLines);

      it(`succeeds if test condtion ${k} evaluates to FALSE: ${conditionals[k].value}`, async () => {
        debuggerController.setBreakpoint(breakpoints[k]);
        await debuggerController.runForwardUntilBreakpoint();
        expect(debuggerController.getCurrentlyActiveLine()).to.eql(editorLines.size);
        debuggerController.toggleBreakpoint(breakpoints[k]);
        await debuggerController.runBackwardUntilBreakpoint();
      });
    }
  });
});
