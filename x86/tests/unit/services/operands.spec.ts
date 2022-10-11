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
import MemoryDataLine from '@/services/interfaces/MemoryDataLine';
import {
  FlagAccessMode,
  ImmediateOperand,
  ReadWriteAccessMode,
} from '@/services/interfaces/InstructionOperands';
import getInstructionInformationFromCapstone, {
  getFlagAccessModFromName,
  getReadWriteAccessModFromName,
} from '@/services/disassembler/instructionOperandsService';
import { RegisterID } from '@/services/emulator/emulatorEnums';
import { closeEmulator, startOperandsTestProgram, stepOverOneInstruction } from './testEmulator';
import { testDataEmptyAccessedElements } from './testDataCurrentState';

describe('Immediate', () => {
  const expectedBigMemoryLine: MemoryDataLine = {
    address: { address: '0000' },
    dataBytes: [
      { content: 'FF', locationId: 'immediate_0_0' },
      { content: 'FF', locationId: 'immediate_0_1' },
      { content: 'FF', locationId: 'immediate_0_2' },
    ],
  };
  const expectedBigImmediate: ImmediateOperand = {
    size: 8,
    value: 16777215,
  };
  const expectedLittleImmediate: ImmediateOperand = {
    size: 8,
    value: 19,
  };
  const expectedLittleMemoryLine = {
    address: { address: '0000' },
    dataBytes: [
      { content: '13', locationId: 'immediate_0_0' },
    ],
  };

  it('succeeds if big immediate detected', async () => {
    const ucInstance = new Unicorn();
    const disassemblerInstance = new Disassembler();

    await startOperandsTestProgram(ucInstance, disassemblerInstance).then(async (program) => {
      const testController = new StepController(program);
      await testController.nextStep();
      const { operands } = testController.getState().currentInstruction;
      const accessedElements = testController.getState().currentAccessedElements;
      expect(operands.immediate).to.eql([expectedBigImmediate]);
      expect(accessedElements.immediateAccess).to.eql([expectedBigMemoryLine]);
      closeEmulator(program);
    });
  });
  it('succeeds if little immediate detected', async () => {
    const ucInstance = new Unicorn();
    const disassemblerInstance = new Disassembler();

    await startOperandsTestProgram(ucInstance, disassemblerInstance).then(async (program) => {
      const testController = new StepController(program);
      await stepOverOneInstruction(testController);
      await stepOverOneInstruction(testController);
      await testController.nextStep();
      const { operands } = testController.getState().currentInstruction;
      const accessedElements = testController.getState().currentAccessedElements;
      expect(operands.immediate).to.eql([expectedLittleImmediate]);
      expect(accessedElements.immediateAccess).to.eql([expectedLittleMemoryLine]);
      closeEmulator(program);
    });
  });
  it('succeeds if currentAccessedElements cleared after execution', async () => {
    const ucInstance = new Unicorn();
    const disassemblerInstance = new Disassembler();

    await startOperandsTestProgram(ucInstance, disassemblerInstance).then(async (program) => {
      const testController = new StepController(program);
      await testController.nextStep();
      await testController.nextStep();
      await testController.nextStep();
      const accessedElements = testController.getState().currentAccessedElements;
      expect(accessedElements).to.eql(testDataEmptyAccessedElements);
      closeEmulator(program);
    });
  });
});
describe('Registers', () => {
  const expectedRegisterRax = {
    content: [
      { content: 'FF', locationId: 'RAX_0' },
      { content: 'FF', locationId: 'RAX_1' },
      { content: 'FF', locationId: 'RAX_2' },
      { content: '00', locationId: 'RAX_3' },
      { content: '00', locationId: 'RAX_4' },
      { content: '00', locationId: 'RAX_5' },
      { content: '00', locationId: 'RAX_6' },
      { content: '00', locationId: 'RAX_7' },
    ],
    name: 'RAX',
  };
  const expectedRegisterRbx = {
    content: [
      { content: '00', locationId: 'RBX_0' },
      { content: '00', locationId: 'RBX_1' },
      { content: '00', locationId: 'RBX_2' },
      { content: '00', locationId: 'RBX_3' },
      { content: '00', locationId: 'RBX_4' },
      { content: '00', locationId: 'RBX_5' },
      { content: '00', locationId: 'RBX_6' },
      { content: '00', locationId: 'RBX_7' },
    ],
    name: 'RBX',
  };

  it('succeeds if register write detected', async () => {
    const ucInstance = new Unicorn();
    const disassemblerInstance = new Disassembler();

    await startOperandsTestProgram(ucInstance, disassemblerInstance).then(async (program) => {
      const testController = new StepController(program);
      await testController.nextStep();
      const { operands } = testController.getState().currentInstruction;
      const accessedElements = testController.getState().currentAccessedElements;
      expect(operands.registersWrite).to.eql([RegisterID.RAX]);
      expect(accessedElements.registerWriteAccess).to.eql([expectedRegisterRax]);
      closeEmulator(program);
    });
  });
  it('succeeds if registers read detected', async () => {
    const ucInstance = new Unicorn();
    const disassemblerInstance = new Disassembler();

    await startOperandsTestProgram(ucInstance, disassemblerInstance).then(async (program) => {
      const testController = new StepController(program);
      await stepOverOneInstruction(testController);
      await stepOverOneInstruction(testController);
      await stepOverOneInstruction(testController);
      await testController.nextStep();
      const { operands } = testController.getState().currentInstruction;
      const accessedElements = testController.getState().currentAccessedElements;
      expect(operands.registersRead).to.eql([RegisterID.RBX, RegisterID.RBX]);
      expect(accessedElements.registerReadAccess).to.eql([expectedRegisterRbx, expectedRegisterRbx]);
      closeEmulator(program);
    });
  });
  it('succeeds if register write detected (xor)', async () => {
    const ucInstance = new Unicorn();
    const disassemblerInstance = new Disassembler();

    await startOperandsTestProgram(ucInstance, disassemblerInstance).then(async (program) => {
      const testController = new StepController(program);
      await stepOverOneInstruction(testController);
      await stepOverOneInstruction(testController);
      await stepOverOneInstruction(testController);
      await testController.nextStep();
      const { operands } = testController.getState().currentInstruction;
      const accessedElements = testController.getState().currentAccessedElements;
      expect(operands.registersWrite).to.eql([RegisterID.RBX]);
      expect(accessedElements.registerWriteAccess).to.eql([expectedRegisterRbx]);
      closeEmulator(program);
    });
  });
});

describe('getFlagAccessModFromName', () => {
  it('succeeds if FlagAccessMode TEST found', () => {
    expect(getFlagAccessModFromName('TEST')).to.eql(FlagAccessMode.TEST);
  });
  it('succeeds if FlagAccessMode mod found', () => {
    expect(getFlagAccessModFromName('mod')).to.eql(FlagAccessMode.MOD);
  });
  it('succeeds if not defined FlagAccessMode does not throw', () => {
    expect(getFlagAccessModFromName('abd')).to.eql(undefined);
  });
});

describe('getReadWriteAccessModFromName', () => {
  it('succeeds if ReadWriteAccessMode READ found', () => {
    expect(getReadWriteAccessModFromName('READ')).to.eql(ReadWriteAccessMode.READ);
  });
  it('succeeds if ReadWriteAccessMode WRITE found', () => {
    expect(getReadWriteAccessModFromName('WRITE')).to.eql(ReadWriteAccessMode.WRITE);
  });
  it('succeeds if ReadWriteAccessMode READ_WIRTE found', () => {
    expect(getReadWriteAccessModFromName('READ_WRITE')).to.eql(ReadWriteAccessMode.READ_WRITE);
  });
  it('succeeds if ReadWriteAccessMode read found', () => {
    expect(getReadWriteAccessModFromName('read')).to.eql(ReadWriteAccessMode.READ);
  });
  it('succeeds if ReadWriteAccessMode write found', () => {
    expect(getReadWriteAccessModFromName('write')).to.eql(ReadWriteAccessMode.WRITE);
  });
  it('succeeds if ReadWriteAccessMode read_write found', () => {
    expect(getReadWriteAccessModFromName('read_write')).to.eql(ReadWriteAccessMode.READ_WRITE);
  });
  it('succeeds if not defined ReadWriteAccessMode does not throw', () => {
    expect(getReadWriteAccessModFromName('abd')).to.eql(undefined);
  });
});

describe('getInstructionInformationFromCapstone', () => {
  it('succeeds if Operands created (register Write, memory read)', () => {
    const input = '{ "Prefix": "0x00 0x00 0x00 0x00 ", "Opcode": "0x8b 0x00 0x00 0x00 ", "rex": "0x48", "addr_size": "8", "modrm": { "modrm_value": "0x4", "modrm_offset": "0x2" }, "disp": { "disp_value": "0x0", "disp_offset": "0x4", "disp_size": "0x4" }, "sib": { "sib_value": "0x25", "sib_scale": "1" }, "op_count": "2", "operands": [{"type": "REG", "value": "rax", "size": "8", "access": "WRITE" }, {"type": "MEM", "size": "8", "access": "READ" }], "registers_modified": [ "rax"] }';
    const expectedOutput = JSON.parse('{"opcode":"","operandCount":2,"memoryWrite":[],"memoryRead":[{"size":8,"pointerArithmeticOperands":{},"access":0}],"flagsTest":[],"flagsWrite":[],"immediate":[],"registersRead":[],"registersWrite":[35]}');
    expectedOutput.opcode = Uint8Array.from([139, 0, 0, 0, 0]);
    expect(getInstructionInformationFromCapstone(input)).to.eql(expectedOutput);
  });
  it('succeeds if Operands created (register read, register write, flags)', () => {
    const input = '{ "Prefix": "0x00 0x00 0x00 0x00 ", "Opcode": "0x01 0x00 0x00 0x00 ", "rex": "0x48", "addr_size": "8", "modrm": { "modrm_value": "0xc3", "modrm_offset": "0x2" }, "disp": { "disp_value": "0x0" }, "sib": { "sib_value": "0x0" }, "op_count": "2", "operands": [{"type": "REG", "value": "rbx", "size": "8", "access": "READ_WRITE" }, {"type": "REG", "value": "rax", "size": "8", "access": "READ" }], "registers_read": [ "rbx", "rax"], "registers_modified": [ "rflags", "rbx"], "EFLAGS": [ { "name": "AF", "access": "MOD" }, { "name": "CF", "access": "MOD" }, { "name": "SF", "access": "MOD" }, { "name": "ZF", "access": "MOD" }, { "name": "PF", "access": "MOD" }, { "name": "OF", "access": "MOD" }]  }';
    const expectedOutput = JSON.parse('{"opcode":"","operandCount":2,"memoryWrite":[],"memoryRead":[],"flagsTest":[],"flagsWrite":[0,11,6,7],"immediate":[],"registersRead":[37,35],"registersWrite":[37]}');
    expectedOutput.opcode = Uint8Array.from([1, 0, 0, 0, 0]);
    expect(getInstructionInformationFromCapstone(input)).to.eql(expectedOutput);
  });
  it('succeeds if Operands created (push)', () => {
    const input = '{ "Prefix": "0x00 0x00 0x00 0x00 ", "Opcode": "0xff 0x00 0x00 0x00 ", "rex": "0x0", "addr_size": "8", "modrm": { "modrm_value": "0x34", "modrm_offset": "0x1" }, "disp": { "disp_value": "0x0", "disp_offset": "0x3", "disp_size": "0x4" }, "sib": { "sib_value": "0x25", "sib_scale": "1" }, "op_count": "1", "operands": [{"type": "MEM", "size": "8", "access": "READ" }], "registers_read": [ "rsp"], "registers_modified": [ "rsp"] }';
    const expectedOutput = JSON.parse('{"opcode":"","operandCount":1,"memoryWrite":[],"memoryRead":[{"size":8,"pointerArithmeticOperands":{},"access":0}],"flagsTest":[],"flagsWrite":[],"immediate":[],"registersRead":[44],"registersWrite":[44]}');
    expectedOutput.opcode = Uint8Array.from([255, 0, 0, 0, 0]);
    expect(getInstructionInformationFromCapstone(input)).to.eql(expectedOutput);
  });
  it('succeeds if Operands created (push, immediate, flags)', () => {
    const input = '{ "Prefix": "0x00 0x00 0x00 0x00 ", "Opcode": "0x83 0x00 0x00 0x00 ", "rex": "0x48", "addr_size": "8", "modrm": { "modrm_value": "0xc4", "modrm_offset": "0x2" }, "disp": { "disp_value": "0x0" }, "sib": { "sib_value": "0x0" }, "imm_count": "1", "imms": [{ "imm": "0x20", "imm_offset": "0x3", "imm_size": "0x1" } ] , "op_count": "2", "operands": [{"type": "REG", "value": "rsp", "size": "8", "access": "READ_WRITE" }, {"type": "IMM", "value": "0x20", "size": "8" }], "registers_read": [ "rsp"], "registers_modified": [ "rflags", "rsp"], "EFLAGS": [ { "name": "AF", "access": "MOD" }, { "name": "CF", "access": "MOD" }, { "name": "SF", "access": "MOD" }, { "name": "ZF", "access": "MOD" }, { "name": "PF", "access": "MOD" }, { "name": "OF", "access": "MOD" }]  }';
    const expectedOutput = JSON.parse('{"opcode":"","operandCount":2,"memoryWrite":[],"memoryRead":[],"flagsTest":[],"flagsWrite":[0,11,6,7],"immediate":[{"size":8,"value":32}],"registersRead":[44],"registersWrite":[44]}');
    expectedOutput.opcode = Uint8Array.from([131, 0, 0, 0, 0]);
    expect(getInstructionInformationFromCapstone(input)).to.eql(expectedOutput);
  });
  it('succeeds if Operands created (pointer arithmetic)', () => {
    const input = '{ "Prefix": "0x00 0x00 0x00 0x00 ", "Opcode": "0x8b 0x00 0x00 0x00 ", "rex": "0x48", "addr_size": "8", "modrm": { "modrm_value": "0x5d", "modrm_offset": "0x2" }, "disp": { "disp_value": "0x10", "disp_offset": "0x3", "disp_size": "0x1" }, "sib": { "sib_value": "0x0" }, "op_count": "2", "operands": [{"type": "REG", "value": "rbx", "size": "8", "access": "WRITE" }, {"type": "MEM", "reg_base": "rbp", "disp": "0x10", "size": "8", "access": "READ" }], "registers_read": [ "rbp"], "registers_modified": [ "rbx"] }';
    const expectedOutput = JSON.parse('{"opcode":"","operandCount":2,"memoryWrite":[],"memoryRead":[{"size":8,"pointerArithmeticOperands":{"regBase":36,"disp":16, "regIndex": 1, "scale": 1},"access":0}],"flagsTest":[],"flagsWrite":[],"immediate":[],"registersRead":[36],"registersWrite":[37]}');
    expectedOutput.memoryRead[0].pointerArithmeticOperands.regIndex = undefined;
    expectedOutput.memoryRead[0].pointerArithmeticOperands.scale = undefined;
    expectedOutput.opcode = Uint8Array.from([139, 0, 0, 0, 0]);
    expect(getInstructionInformationFromCapstone(input)).to.eql(expectedOutput);
  });
  it('succeeds if throws instruction information invalid)', () => {
    const input = '{ "Prefix": "0x00 0x00 0x00 0x00, "Opcode": "0x8b 0x00 0x00 0x00 ", "rex": "0x48", "addr_size": "8", "modrm": { "modrm_value": "0x5d", "modrm_offset": "0x2" }, "disp": { "disp_value": "0x10", "disp_offset": "0x3", "disp_size": "0x1" }, "sib": { "sib_value": "0x0" }, "op_count": "2", "operands": [{"type": "REG", "value": "rbx", "size": "8", "access": "WRITE" }, {"type": "MEM", "reg_base": "rbp", "disp": "0x10", "size": "8", "access": "READ" }], "registers_read": [ "rbp"], "registers_modified": [ "rbx"] }';
    expect(() => getInstructionInformationFromCapstone(input)).to.throw('Instruction Information JSON from Capstone is invalid: Unexpected token O in JSON at position 35');
  });
  it('succeeds if throws mem operand has no access mode', () => {
    const input = '{ "Prefix": "0x00 0x00 0x00 0x00", "Opcode": "0x8b 0x00 0x00 0x00 ", "rex": "0x48", "addr_size": "8", "modrm": { "modrm_value": "0x5d", "modrm_offset": "0x2" }, "disp": { "disp_value": "0x10", "disp_offset": "0x3", "disp_size": "0x1" }, "sib": { "sib_value": "0x0" }, "op_count": "2", "operands": [{"type": "REG", "value": "rbx", "size": "8", "access": "WRITE" }, {"type": "MEM", "reg_base": "rbp", "disp": "0x10", "size": "8" }], "registers_read": [ "rbp"], "registers_modified": [ "rbx"] }';
    expect(() => getInstructionInformationFromCapstone(input)).to.throw('Instruction Information JSON from Capstone is invalid: MEM operand has no access attribute');
  });
  it('succeeds if throws reg operand has no access mode', () => {
    const input = '{ "Prefix": "0x00 0x00 0x00 0x00", "Opcode": "0x8b 0x00 0x00 0x00 ", "rex": "0x48", "addr_size": "8", "modrm": { "modrm_value": "0x5d", "modrm_offset": "0x2" }, "disp": { "disp_value": "0x10", "disp_offset": "0x3", "disp_size": "0x1" }, "sib": { "sib_value": "0x0" }, "op_count": "2", "operands": [{"type": "REG", "value": "rbx", "size": "8"}, {"type": "MEM", "reg_base": "rbp", "disp": "0x10", "size": "8", "access": "READ" }], "registers_read": [ "rbp"], "registers_modified": [ "rbx"] }';
    expect(() => getInstructionInformationFromCapstone(input)).to.throw('Instruction Information JSON from Capstone is invalid: REG operand has no access or value attribute');
  });
  it('succeeds if throws immediate has no value', () => {
    const input = '{ "Prefix": "0x00 0x00 0x00 0x00 ", "Opcode": "0x83 0x00 0x00 0x00 ", "rex": "0x48", "addr_size": "8", "modrm": { "modrm_value": "0xc4", "modrm_offset": "0x2" }, "disp": { "disp_value": "0x0" }, "sib": { "sib_value": "0x0" }, "imm_count": "1", "imms": [{ "imm": "0x20", "imm_offset": "0x3", "imm_size": "0x1" } ] , "op_count": "2", "operands": [{"type": "REG", "value": "rsp", "size": "8", "access": "READ_WRITE" }, {"type": "IMM", "size": "8" }], "registers_read": [ "rsp"], "registers_modified": [ "rflags", "rsp"], "EFLAGS": [ { "name": "AF", "access": "MOD" }, { "name": "CF", "access": "MOD" }, { "name": "SF", "access": "MOD" }, { "name": "ZF", "access": "MOD" }, { "name": "PF", "access": "MOD" }, { "name": "OF", "access": "MOD" }]  }';
    expect(() => getInstructionInformationFromCapstone(input)).to.throw('Instruction Information JSON from Capstone is invalid: IMM operand has no value attribute');
  });
});
