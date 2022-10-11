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
import Unicorn from '@/services/emulator/emulatorService';
import Disassembler from '@/services/disassembler/disassemblerService';
import StepController from '@/services/stepController';
import Register from '@/services/interfaces/Register';
import { RegisterID } from '@/services/emulator/emulatorEnums';
import {
  changeRegistersToLongSizeRegisters, getLocationIdsInLongSizeRegister, getLongSizeRegister,
} from '@/services/dataServices/registerAssignmentService';
import {
  closeEmulator,
  startCallAndStackTestProgram,
  startOperandsTestProgram,
  stepOverOneInstruction,
} from './testEmulator';

describe('RegistersToShow', () => {
  function compareName(register: Register, name: string) {
    return register.name === name;
  }
  it('succeeds if registersToShow has only long size registers', async () => {
    const ucInstance = new Unicorn();
    const disassemblerInstance = new Disassembler();

    await startCallAndStackTestProgram(ucInstance, disassemblerInstance).then(async (program) => {
      const testController = new StepController(program);
      expect(testController.getState().registers.findIndex((reg) => compareName(reg, 'RIP'))).to.be.greaterThan(0);
      expect(testController.getState().registers.findIndex((reg) => compareName(reg, 'EIP'))).to.be.equal(-1);
      closeEmulator(program);
    });
  });
  it('succeeds if new Register added to registersToShow', async () => {
    const ucInstance = new Unicorn();
    const disassemblerInstance = new Disassembler();

    await startOperandsTestProgram(ucInstance, disassemblerInstance).then(async (program) => {
      const testController = new StepController(program);
      expect(testController.getState().registers.findIndex((reg) => compareName(reg, 'RSP'))).to.be.equal(-1);
      await stepOverOneInstruction(testController);
      await testController.nextStep();
      await testController.nextStep();
      expect(testController.getState().registers.findIndex((reg) => compareName(reg, 'RSP'))).to.be.greaterThan(0);
      closeEmulator(program);
    });
  });
});
describe('getLongSizeRegister', () => {
  it('succeeds if Long Size Register found from Int Size Register EIP', () => {
    expect(getLongSizeRegister(RegisterID.EIP)).to.be.equal(RegisterID.RIP);
  });
  it('succeeds if Long Size Register found from Int Size Register R10D', () => {
    expect(getLongSizeRegister(RegisterID.R10D)).to.be.equal(RegisterID.R10);
  });
  it('succeeds if Long Size Register found from Int Size Register ESI', () => {
    expect(getLongSizeRegister(RegisterID.ESI)).to.be.equal(RegisterID.RSI);
  });
  it('succeeds if Long Size Register found from Short Size Register AX', () => {
    expect(getLongSizeRegister(RegisterID.AX)).to.be.equal(RegisterID.RAX);
  });
  it('succeeds if Long Size Register found from Short Size Register R12W', () => {
    expect(getLongSizeRegister(RegisterID.R12W)).to.be.equal(RegisterID.R12);
  });
  it('succeeds if Long Size Register found from Short Size Register SP', () => {
    expect(getLongSizeRegister(RegisterID.SP)).to.be.equal(RegisterID.RSP);
  });
  it('succeeds if Long Size Register found from High Char Size Register AH', () => {
    expect(getLongSizeRegister(RegisterID.AH)).to.be.equal(RegisterID.RAX);
  });
  it('succeeds if Long Size Register found from Low Char Size Register BL', () => {
    expect(getLongSizeRegister(RegisterID.BL)).to.be.equal(RegisterID.RBX);
  });
  it('succeeds if Long Size Register found from Low Char Size Register AH', () => {
    expect(getLongSizeRegister(RegisterID.SIL)).to.be.equal(RegisterID.RSI);
  });
  it('succeeds if Long Size Register found from Low Char Size Register AH', () => {
    expect(getLongSizeRegister(RegisterID.R8B)).to.be.equal(RegisterID.R8);
  });
  it('succeeds if Register returned when Long Size Register not found', () => {
    expect(getLongSizeRegister(RegisterID.RAX)).to.be.equal(RegisterID.RAX);
  });
});
describe('changeRegistersToLongSizeRegisters', () => {
  it('succeeds if one register changed to Long Size Registers', () => {
    expect(changeRegistersToLongSizeRegisters([RegisterID.EAX])).to.be.eql([RegisterID.RAX]);
  });
  it('succeeds if registers changed to Long Size Registers', () => {
    expect(changeRegistersToLongSizeRegisters([RegisterID.RIP, RegisterID.BL])).to.be.eql([RegisterID.RIP, RegisterID.RBX]);
  });
  it('succeeds if empty array does not throw', () => {
    expect(changeRegistersToLongSizeRegisters([])).to.be.eql([]);
  });
});
describe('getLocationIdsInLongSizeRegister', () => {
  it('succeeds if Location Ids found from Int Size Register', () => {
    expect(getLocationIdsInLongSizeRegister(RegisterID.EIP)).to.be.eql(['RIP_0', 'RIP_1', 'RIP_2', 'RIP_3']);
  });
  it('succeeds if Location Ids found from Short Size Register', () => {
    expect(getLocationIdsInLongSizeRegister(RegisterID.AX)).to.be.eql(['RAX_0', 'RAX_1']);
  });
  it('succeeds if Location Ids found from Low Char Size Register', () => {
    expect(getLocationIdsInLongSizeRegister(RegisterID.AL)).to.be.eql(['RAX_0']);
  });
  it('succeeds if Location Ids found from High Char Size Register', () => {
    expect(getLocationIdsInLongSizeRegister(RegisterID.AH)).to.be.eql(['RAX_1']);
  });
  it('succeeds if Location Ids found when Long Size Register not found', () => {
    expect(getLocationIdsInLongSizeRegister(RegisterID.RAX)).to.be.eql(['RAX_0', 'RAX_1', 'RAX_2', 'RAX_3', 'RAX_4', 'RAX_5', 'RAX_6', 'RAX_7']);
  });
});
