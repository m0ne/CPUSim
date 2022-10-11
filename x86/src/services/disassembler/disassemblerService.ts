/* SPDX-License-Identifier: GPL-2.0-only */
/**
 * Code in this file has been converted, modified and extended from a file which was originally written by:
 * (c) 2014-2017 Capstone.JS
 * Wrapper made by Alexandro Sanchez Bach.
 * https://github.com/AlexAltea/capstone.js/blob/master/src/capstone-wrapper.js
 */
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
/*
This is the software license for Capstone disassembly framework.
Capstone has been designed & implemented by Nguyen Anh Quynh <aquynh@gmail.com>

See http://www.capstone-engine.org for further information.

Copyright (c) 2013, COSEINC.
All rights reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:

* Redistributions of source code must retain the above copyright notice,
  this list of conditions and the following disclaimer.
* Redistributions in binary form must reproduce the above copyright notice,
  this list of conditions and the following disclaimer in the documentation
  and/or other materials provided with the distribution.
* Neither the name of the developer(s) nor the names of its
  contributors may be used to endorse or promote products derived from this
  software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE
LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN
CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
POSSIBILITY OF SUCH DAMAGE.
*/
/* Capstone Disassembly Engine */
/* By Nguyen Anh Quynh <aquynh@gmail.com>, 2013-2015 */

/* eslint-disable */
// @ts-ignore
import Module from '../../../lib/libcapstone-x86.out';
import Instruction from "@/services/interfaces/Instruction";
import Byte from "@/services/interfaces/Byte";
import uInt8ArrayToHexStringArray from "@/services/helper/uInt8ArrayHelper";
import {dataStringsToCurrentInstructionBytes} from "@/services/dataServices/byteService";
import getInstructionInformationFromCapstone
  from '@/services/disassembler/instructionOperandsService';
import fillAddress from "@/services/helper/htmlIdService";
/* eslint-enable */

/* eslint camelcase: 0 */
/* eslint no-underscore-dangle: 0 */
/* eslint no-bitwise: 0 */
class Disassembler {
  private MCapstone!: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    HEAPU8: any;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    getValue: (arg0: any, arg1: string) => any;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    UTF8ToString: (arg0: any) => string;

    // returns pointer to memory
    _malloc: (bytes: number) => number;

    _free: (pointer: number) => void;

    // takes various native JS types as arguments
    // returns various native JS types
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ccall: (name: string, returnType: string | null, argumentTypes: string[], args: any[]) => any;

  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private handle_ptr: any;

  async initialiseDisassembler() {
    this.MCapstone = await Module();
    this.handle_ptr = this.MCapstone._malloc(4);

    const ret = this.MCapstone.ccall(
      'cs_open',
      'number',
      ['number', 'number', 'pointer'],
      [this.cs.ARCH_X86, this.cs.MODE_64, this.handle_ptr],
    );

    if (ret !== this.cs.ERR_OK) {
      throw new Error(`Capstone.js: Function cs_open failed with code ${ret}:\n${this.strerror(ret)}`);
    }

    // enable instruction details
    const handle = this.MCapstone.getValue(this.handle_ptr, '*');
    const retOption = this.MCapstone.ccall(
      'cs_option',
      'number',
      ['pointer', 'number', 'number'],
      [handle, this.cs.OPT_DETAIL, this.cs.OPT_ON],
    );

    if (retOption !== this.cs.ERR_OK) {
      console.error('Disassembler.js: Function cs_option failed with code %d.', ret);
    }
  }

  private cs = {
    // Return codes
    ERR_OK: 0, // No error: everything was fine
    ERR_MEM: 1, // Out-Of-Memory error: cs_open(), cs_disasm(), cs_disasm_iter()
    ERR_ARCH: 2, // Unsupported architecture: cs_open()
    ERR_HANDLE: 3, // Invalid handle: cs_op_count(), cs_op_index()
    ERR_CSH: 4, // Invalid csh argument: cs_close(), cs_errno(), cs_option()
    ERR_MODE: 5, // Invalid/unsupported mode: cs_open()
    ERR_OPTION: 6, // Invalid/unsupported option: cs_option()
    ERR_DETAIL: 7, // Information is unavailable because detail option is OFF
    ERR_MEMSETUP: 8, // Dynamic memory management uninitialized (see OPT_MEM)
    ERR_VERSION: 9, // Unsupported version (bindings)
    ERR_DIET: 10, // Access irrelevant data in "diet" engine
    ERR_SKIPDATA: 11, // Access irrelevant data for "data" instruction in SKIPDATA mode
    ERR_X86_ATT: 12, // X86 AT&T syntax is unsupported (opt-out at compile time)
    ERR_X86_INTEL: 13, // X86 Intel syntax is unsupported (opt-out at compile time)

    // Architectures
    ARCH_ARM: 0, // ARM architecture (including Thumb, Thumb-2)
    ARCH_ARM64: 1, // ARM-64, also called AArch64
    ARCH_MIPS: 2, // Mips architecture
    ARCH_X86: 3, // X86 architecture (including x86 & x86-64)
    ARCH_PPC: 4, // PowerPC architecture
    ARCH_SPARC: 5, // Sparc architecture
    ARCH_SYSZ: 6, // SystemZ architecture
    ARCH_XCORE: 7, // XCore architecture
    ARCH_MAX: 8,
    ARCH_ALL: 0xFFFF,

    // Modes
    MODE_LITTLE_ENDIAN: 0, // Little-Endian mode (default mode)
    MODE_ARM: 0, // 32-bit ARM
    MODE_16: 1 << 1, // 16-bit mode (X86)
    MODE_32: 1 << 2, // 32-bit mode (X86)
    MODE_64: 1 << 3, // 64-bit mode (X86, PPC)
    MODE_THUMB: 1 << 4, // ARM's Thumb mode, including Thumb-2
    MODE_MCLASS: 1 << 5, // ARM's Cortex-M series
    MODE_V8: 1 << 6, // ARMv8 A32 encodings for ARM
    MODE_MICRO: 1 << 4, // MicroMips mode (MIPS)
    MODE_MIPS3: 1 << 5, // Mips III ISA
    MODE_MIPS32R6: 1 << 6, // Mips32r6 ISA
    MODE_MIPSGP64: 1 << 7, // General Purpose Registers are 64-bit wide (MIPS)
    MODE_V9: 1 << 4, // SparcV9 mode (Sparc)
    MODE_BIG_ENDIAN: 1 << 31, // Big-Endian mode
    MODE_MIPS32: 1 << 2, // Mips32 ISA (Mips)
    MODE_MIPS64: 1 << 3, // Mips64 ISA (Mips)

    // Options
    OPT_SYNTAX: 1, // Intel X86 asm syntax (CS_ARCH_X86 arch)
    OPT_DETAIL: 2, // Break down instruction structure into details
    OPT_MODE: 3, // Change engine's mode at run-time
    OPT_MEM: 4, // Change engine's mode at run-time
    OPT_SKIPDATA: 5, // Skip data when disassembling
    OPT_SKIPDATA_SETUP: 6, // Setup user-defined function for SKIPDATA option

    // Capstone option value
    OPT_OFF: 0, // Turn OFF an option - default option of CS_OPT_DETAIL
    OPT_ON: 3, // Turn ON an option (CS_OPT_DETAIL)

    // Capstone syntax value
    OPT_SYNTAX_DEFAULT: 0, // Default assembly syntax of all platforms (CS_OPT_SYNTAX)
    OPT_SYNTAX_INTEL: 1, // Intel X86 asm syntax - default syntax on X86 (CS_OPT_SYNTAX, CS_ARCH_X86)
    OPT_SYNTAX_ATT: 2, // ATT asm syntax (CS_OPT_SYNTAX, CS_ARCH_X86)
    OPT_SYNTAX_NOREGNAME: 3, // Asm syntax prints register name with only number - (CS_OPT_SYNTAX, CS_ARCH_PPC, CS_ARCH_ARM)

    // Common instruction groups - to be consistent across all architectures.
    GRP_INVALID: 0, // uninitialized/invalid group.
    GRP_JUMP: 1, // all jump instructions (conditional+direct+indirect jumps)
    GRP_CALL: 2, // all call instructions
    GRP_RET: 3, // all return instructions
    GRP_INT: 4, // all interrupt instructions (int+syscall)
    GRP_IRET: 5, // all interrupt return instructions

    // Common instruction operand types - to be consistent across all architectures.
    OP_INVALID: 0,
    OP_REG: 1,
    OP_IMM: 2,
    OP_MEM: 3,
    OP_FP: 4,
  };

  buildInstruction(pointer: number): Instruction {
    // Basic instruction information data are read directly from a C struct via pointer access.
    // This code was directly taken form the original wrapper.
    // The offsets match with the size of the underlying C types within the struct.
    const addressOfInstruction = this.MCapstone.getValue(pointer + 8, 'i64');
    const sizeOfInstruction = this.MCapstone.getValue(pointer + 16, 'i16');
    const machineBytesOfInstruction = this.buildInstructionBytes(sizeOfInstruction, pointer);

    const mnemonicInAscii = this.MCapstone.UTF8ToString(pointer + 34);

    const instructionOperandsInAscii = this.MCapstone.UTF8ToString(pointer + 66);
    const handle = this.MCapstone.getValue(this.handle_ptr, 'i32');

    // The buffer should be long enough to carry all data provided by the function print_insn_detail.
    const bufferLength = 2000;

    // print_insn_detail is function extending the capabilities of the normal Capstone distribution.
    // It prints details of a given instruction.
    // The code is written within the cs.c file provided with CPUSim and is needed when compiling Capstone.
    const instructionDetailString_ptr = this.MCapstone._malloc(bufferLength);
    const ret = this.MCapstone.ccall(
      'print_insn_detail',
      'number',
      ['number', 'number', 'number'],
      [handle, pointer, instructionDetailString_ptr],
    );

    let text: string = this.MCapstone.UTF8ToString(instructionDetailString_ptr);
    text = text.split('[,').join('[');
    const operands = getInstructionInformationFromCapstone(text);

    this.MCapstone._free(instructionDetailString_ptr);
    if (ret !== 0) {
      throw new Error('print_insn_detail: Instruction detail "OPT_DETAIL" is not set in Capstone.');
    }

    return {
      assemblyInterpretation: `${mnemonicInAscii} ${instructionOperandsInAscii}`,
      length: sizeOfInstruction,
      content: machineBytesOfInstruction,
      address: fillAddress(addressOfInstruction),
      operands,
    };
  }

  private buildInstructionBytes(sizeOfInstruction: number, pointer: number): Byte[] {
    const byteContents = [];
    for (let i = 0; i < sizeOfInstruction; i += 1) {
      let byteValue = this.MCapstone.getValue(pointer + 18 + i, 'i8');
      if (byteValue < 0) {
        byteValue = 256 + byteValue;
      }
      byteContents.push(byteValue);
    }
    const hexStrings = uInt8ArrayToHexStringArray(Uint8Array.from(byteContents));
    return dataStringsToCurrentInstructionBytes(hexStrings);
  }

  strerror(code: number): string {
    return this.MCapstone.ccall('cs_strerror', 'string', ['number'], [code]);
  }

  errno(): number {
    const handle = this.MCapstone.getValue(this.handle_ptr, '*');
    return this.MCapstone.ccall('cs_errno', 'number', ['pointer'], [handle]);
  }

  // Destructor
  delete() {
    const ret = this.MCapstone.ccall('cs_close', 'number', ['pointer'], [this.handle_ptr]);
    if (ret !== this.cs.ERR_OK) {
      throw new Error(`Capstone.js: Function cs_close failed with code ${ret}:\n${this.strerror(ret)}`);
    }
    this.MCapstone._free(this.handle_ptr);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  disassemble(buffer: any, addr: any, max: any): Instruction[] {
    const handle = this.MCapstone.getValue(this.handle_ptr, 'i32');

    // Allocate buffer and copy data
    const buffer_ptr = this.MCapstone._malloc(buffer.length);
    const buffer_heap = new Uint8Array(this.MCapstone.HEAPU8.buffer, buffer_ptr, buffer.length);
    buffer_heap.set(new Uint8Array(buffer));

    // Pointer to the instruction array
    const insn_ptr_ptr = this.MCapstone._malloc(4);

    const count: number = this.MCapstone.ccall(
      'cs_disasm',
      'number',
      ['number', 'pointer', 'number', 'number', 'number', 'pointer'],
      [handle, buffer_heap.byteOffset, buffer_heap.length, addr, 0, max || 0, insn_ptr_ptr],
    );

    if (count === 0 && buffer.length !== 0) {
      this.MCapstone._free(insn_ptr_ptr);
      this.MCapstone._free(buffer_ptr);
      this.MCapstone._free(buffer_heap.byteOffset);

      throw new Error('Capstone.js: Function cs_disasm failed. Maybe you forgot to delete a Disassembler instance');
    }

    // Dereference intruction array
    const insn_ptr = this.MCapstone.getValue(insn_ptr_ptr, 'i32');
    const insn_size = 232;

    const instructions: Instruction[] = this.saveInstructions(count, insn_ptr, insn_size);

    this.MCapstone.ccall(
      'cs_free',
      'void',
      ['pointer', 'number'],
      [insn_ptr, count],
    );

    this.MCapstone._free(insn_ptr_ptr);
    this.MCapstone._free(buffer_ptr);
    this.MCapstone._free(buffer_heap.byteOffset);
    return instructions;
  }

  private saveInstructions(count: number, insn_ptr: number, insn_size: number): Instruction[] {
    const instructions: Instruction[] = [];
    for (let i = 0; i < count; i += 1) {
      instructions.push(this.buildInstruction(insn_ptr + i * insn_size));
    }
    return instructions;
  }
}

export default Disassembler;
