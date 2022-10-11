/* SPDX-License-Identifier: GPL-2.0-only */
/**
 * Code in this file has been converted, modified and extended from a file which was originally written by:
 * (c) 2016-2017 Unicorn.JS
 * Wrapper made by Alexandro Sanchez Bach.
 * https://github.com/AlexAltea/unicorn.js/blob/master/src/unicorn-wrapper.js
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
© Unicorn.JS 2016-2017. Wrapper made by Alexandro Sánchez Bach.

Unicorn.JS uses the Unicorn framework, originally developed by Nguyen Anh Quynh, Dang Hoang Vu et al.
Check the repository for license details.

Unicorn.js is a port of the Unicorn emulator framework for JavaScript, done with Emscripten.

Unicorn is a lightweight, multi-platform, multi-architecture CPU emulator framework based on QEMU.
Developed by Nguyen Anh Quynh et al. and released under GPLv2 only.

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, version 2 of the License only.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/

/* eslint-disable */
import Instruction from "@/services/interfaces/Instruction";
// @ts-ignore
import Module from '../../../lib/libunicorn-x86.out';
/* eslint-enable */
import { RegisterID, registerSize, eUC } from './emulatorEnums';
import EmulatorHook from '../interfaces/EmulatorHook';

/* eslint camelcase: 0 */
/* eslint no-underscore-dangle: 0 */
/* eslint no-plusplus: 0 */
/* eslint no-bitwise: 0 */

class Unicorn {
  private MUnicorn!: {
    /*
    preamble.js - JS API to interact with the C world
    https://emscripten.org/docs/api_reference/preamble.js.html
    */

    // returns pointer to memory
    _malloc: (bytes: number) => number;

    _free: (pointer: number) => void;

    // takes various native JS types as arguments
    // returns various native JS types
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ccall: (name: string, returnType: string, argumentTypes: string[], args: any[]) => any;

    // NOTE: 'i64' data access is broken with the current compilation
    setValue: (pointer: number, value: number|string, dataTypeLLVM: string) => void;

    // NOTE: 'i64' data access returns truncated 32-bit JS number
    getValue: (pointer: number, dataTypeLLVM: string) => number;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    writeArrayToMemory: (array: any[], pointer: number) => void;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    removeFunction: (callback_ptr: any) => void;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    addFunction: (callback: any, signature: string) => any;
  };

  uc = {
    ERR_OK: 0,
    X86_REG_EAX: 19,
    X86_REG_EBX: 21,
    PROT_ALL: 7,
  };

  private ucHandle_ptr!: number;

  // DON'T FORGET FREE :)
  private malloc_pointerToData(bytes: number): number {
    return this.MUnicorn._malloc(bytes);
  }

  // DON'T FORGET FREE :)
  private mallocToZero_pointerToData(sizeInBytes: number): number {
    const pointerToData = this.malloc_pointerToData(sizeInBytes);
    // initialize data to zero
    for (let i = 0; i < sizeInBytes; i++) {
      this.MUnicorn.setValue(pointerToData + i, 0, 'i8');
    }
    return pointerToData;
  }

  async initialiseEmulator() {
    this.MUnicorn = await Module();

    this.ucHandle_ptr = this.mallocToZero_pointerToData(4);

    const ret = this.MUnicorn.ccall(
      'uc_open',
      'number',
      ['number', 'number', 'pointer'],
      [4, 8, this.ucHandle_ptr],
    );
    if (ret !== this.uc.ERR_OK) {
      this.MUnicorn.setValue(this.ucHandle_ptr, 0, '*');
      throw new Error(`Unicorn.js: Function uc_open failed with code ${ret}:\n${this.strerror(ret)}`);
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  strerror(code: any) {
    return this.MUnicorn.ccall('uc_strerror', 'string', ['number'], [code]);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  memory_map(address: any, size: any, perms: any) {
    const handle = this.MUnicorn.getValue(this.ucHandle_ptr, '*');
    const ret = this.MUnicorn.ccall(
      'uc_mem_map',
      'number',
      ['pointer', 'number', 'number', 'number', 'number'],
      [handle, address, 0, size, perms],
    );
    if (ret !== this.uc.ERR_OK) {
      throw new Error(`Unicorn.js: Function uc_mem_map failed with code ${ret}:\n${this.strerror(ret)}`);
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  memory_write(address: number, bytesArray: any[]) {
    // Allocate bytes buffer and copy data
    const buffer_len = bytesArray.length;
    const buffer_ptr = this.malloc_pointerToData(buffer_len);
    this.MUnicorn.writeArrayToMemory(bytesArray, buffer_ptr);

    // Write to memory
    const handle = this.MUnicorn.getValue(this.ucHandle_ptr, '*');
    const ret = this.MUnicorn.ccall(
      'uc_mem_write',
      'number',
      ['pointer', 'number', 'number', 'pointer', 'number'],
      [handle, address, 0, buffer_ptr, buffer_len],
    );
    // Free memory and handle return code
    this.MUnicorn._free(buffer_ptr);
    if (ret !== this.uc.ERR_OK) {
      throw new Error(`Unicorn.js: Function uc_mem_write failed with code ${ret}:\n${this.strerror(ret)}`);
    }
  }

  private getData(pointer: number, bytes: number): Uint8Array {
    const data = new Uint8Array(bytes);
    for (let i = 0; i < bytes; i++) {
      data[i] = this.MUnicorn.getValue(pointer + i, 'i8');
    }
    return data;
  }

  memory_read(address: number, bytes: number): Uint8Array {
    // Allocate space for the output value
    const buffer_ptr = this.mallocToZero_pointerToData(bytes);

    // Read from memory
    const handle = this.MUnicorn.getValue(this.ucHandle_ptr, '*');
    const ret = this.MUnicorn.ccall(
      'uc_mem_read',
      'number',
      ['pointer', 'number', 'number', 'pointer', 'number'],
      [handle, address, 0, buffer_ptr, bytes],
    );

    // Get register value, free memory and handle return code
    const data = this.getData(buffer_ptr, bytes);

    this.MUnicorn._free(buffer_ptr);
    if (ret !== this.uc.ERR_OK) {
      throw new Error(`Unicorn.js: Function uc_mem_read failed with code ${ret}:\n${this.strerror(ret)}`);
    }
    return data;
  }

  close() {
    const handle = this.MUnicorn.getValue(this.ucHandle_ptr, '*');
    const ret = this.MUnicorn.ccall('uc_close', 'number', ['pointer'], [handle]);
    if (ret !== eUC.ERR_OK) {
      throw new Error(`Unicorn.js: Function uc_close failed with code ${ret}:\n${this.strerror(ret)}`);
    }
    this.MUnicorn._free(this.ucHandle_ptr);
  }

  static getInstructionAddressEnd(instruction: Instruction): string {
    let address = (parseInt(instruction.address.address, 16) + instruction.length).toString(16).toUpperCase();
    while (address.length < 4) {
      address = `0${address}`;
    }
    return `0x${address}`;
  }

  executeInstruction(instruction: Instruction) {
    this.emu_start(`0x${instruction.address.address}`, Unicorn.getInstructionAddressEnd(instruction), 0, 1);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  emu_start(begin: any, until: any, timeout: any, count: any) {
    const handle = this.MUnicorn.getValue(this.ucHandle_ptr, '*');
    const ret = this.MUnicorn.ccall(
      'uc_emu_start',
      'number',
      ['pointer', 'number', 'number', 'number', 'number', 'number', 'number', 'number'],
      [handle, begin, 0, until, 0, timeout, 0, count],
    );
    if (ret !== this.uc.ERR_OK) {
      throw new Error(`Unicorn.js: Function uc_emu_start failed with code ${ret}:\n${this.strerror(ret)}`);
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  register_read(registerID: RegisterID) {
    return this.register_read_length(registerID, registerSize(registerID));
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  register_read_length(registerID: RegisterID, bytes: number) {
    // Allocate space for the output value
    const value_ptr = this.mallocToZero_pointerToData(bytes);

    // Register read
    const handle = this.MUnicorn.getValue(this.ucHandle_ptr, '*');
    const ret = this.MUnicorn.ccall(
      'uc_reg_read',
      'number',
      ['pointer', 'number', 'pointer'],
      [handle, registerID, value_ptr],
    );

    // Get register value, free memory and handle return code
    const registerData = this.getData(value_ptr, bytes);

    this.MUnicorn._free(value_ptr);
    if (ret !== this.uc.ERR_OK) {
      throw new Error(`Unicorn.js: Function uc_reg_read failed with code ${ret}:\n${this.strerror(ret)}`);
    }
    return registerData;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  register_write(registerID: RegisterID, data: number[]|string[]) {
    return this.register_write_length(registerID, registerSize(registerID), data);
  }

  // data: LITTLE ENDIAN
  register_write_length(registerID: RegisterID, bytes: number, data: number[]|string[]) {
    // Allocate space for the output value
    const value_ptr = this.mallocToZero_pointerToData(bytes);

    for (let i = 0; i < bytes; i++) {
      this.MUnicorn.setValue(value_ptr + i, data[i], 'i8');
    }

    // Register write
    const handle = this.MUnicorn.getValue(this.ucHandle_ptr, '*');
    const ret = this.MUnicorn.ccall(
      'uc_reg_write',
      'number',
      ['pointer', 'number', 'pointer'],
      [handle, registerID, value_ptr],
    );

    // Free memory and handle return code
    this.MUnicorn._free(value_ptr);
    if (ret !== this.uc.ERR_OK) {
      throw new Error(`Unicorn.js: Function uc_reg_write failed with code ${ret}:\n${this.strerror(ret)}`);
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  hook_add(type: any, user_callback: any, user_data_A: any, begin_A: any, end_A: any, extra: any): EmulatorHook {
    const handle = this.MUnicorn.getValue(this.ucHandle_ptr, '*');
    // Default arguments
    let user_data = user_data_A;
    if (typeof user_data_A === 'undefined') {
      user_data = {};
    }
    let begin = begin_A;
    let end = end_A;
    if (typeof begin_A === 'undefined'
      && typeof end_A === 'undefined') {
      begin = 1;
      end = 0;
    }
    // Wrap callback
    /* eslint-disable @typescript-eslint/no-unused-vars */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let callback: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let callback_ptr: any;
    switch (type) {
      case eUC.HOOK_INSN:
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        callback = (_empty0: any, _empty1: any) => {
          user_callback(handle, user_data);
        };
        callback_ptr = this.MUnicorn.addFunction(callback, 'vii');
        break;
      // uc_cb_hookintr_t
      case eUC.HOOK_INTR:
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        callback = (_empty0: any, intno: any, _empty1: any) => {
          user_callback(handle, intno, user_data);
        };
        callback_ptr = this.MUnicorn.addFunction(callback, 'viii');
        break;
      // uc_cb_hookcode_t
      case eUC.HOOK_CODE:
      case eUC.HOOK_BLOCK:
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        callback = (_empty0: any, addr_lo: any, addr_hi: any, size: any, _empty1: any) => {
          user_callback(handle, addr_lo, addr_hi, size, user_data);
        };
        callback_ptr = this.MUnicorn.addFunction(callback, 'viiii');
        break;
      default:
        // uc_cb_hookmem_t
        if ((type & eUC.HOOK_MEM_READ)
          || (type & eUC.HOOK_MEM_WRITE)
          || (type & eUC.HOOK_MEM_FETCH)
          || (type & eUC.HOOK_MEM_READ_AFTER)) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          callback = (_empty0: any, type_A: any, addr_lo: any, addr_hi: any, size: any, value_lo: any, value_hi: any, _empty1: any) => {
            user_callback(handle, type, addr_lo, addr_hi, size, value_lo, value_hi, user_data);
          };
          callback_ptr = this.MUnicorn.addFunction(callback, 'viiiiiiii');
        }
        // uc_cb_eventmem_t
        if ((type & eUC.HOOK_MEM_READ_UNMAPPED)
          || (type & eUC.HOOK_MEM_WRITE_UNMAPPED)
          || (type & eUC.HOOK_MEM_FETCH_UNMAPPED)
          || (type & eUC.HOOK_MEM_READ_PROT)
          || (type & eUC.HOOK_MEM_WRITE_PROT)
          || (type & eUC.HOOK_MEM_FETCH_PROT)) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          callback = (_empty0: any, type_A: any, addr_lo: any, addr_hi: any, size: any, value_lo: any, value_hi: any, _empty1: any) => {
            user_callback(handle, type, addr_lo, addr_hi, size, value_lo, value_hi, user_data);
          };
          callback_ptr = this.MUnicorn.addFunction(callback, 'iiiiiiiii');
        }
    }
    if (typeof callback === 'undefined') {
      throw new Error('Unicorn.js: Unimplemented hook type');
    }
    // Set hook
    const hook_ptr = this.MUnicorn._malloc(4);
    const ret = this.MUnicorn.ccall(
      'uc_hook_add',
      'number',
      ['pointer', 'pointer', 'number', 'pointer', 'pointer',
        'number', 'number', 'number', 'number', 'number'],
      [handle, hook_ptr, type, callback_ptr, 0,
        begin, 0, end, 0, extra],
    );
    if (ret !== this.uc.ERR_OK) {
      this.MUnicorn.removeFunction(callback_ptr);
      this.MUnicorn._free(hook_ptr);
      throw new Error(`Unicorn.js: Function uc_mem_unmap failed with code ${ret}:\n${this.strerror(ret)}`);
    }
    const hook: EmulatorHook = {
      handle: this.MUnicorn.getValue(hook_ptr, '*'),
      callback: callback_ptr,
    };
    this.MUnicorn._free(hook_ptr);
    return hook;
  }

  hook_del(hook: EmulatorHook) {
    const handle = this.MUnicorn.getValue(this.ucHandle_ptr, '*');
    const ret = this.MUnicorn.ccall(
      'uc_hook_del',
      'number',
      ['pointer', 'pointer'],
      [handle, hook.handle],
    );
    if (ret !== this.uc.ERR_OK) {
      throw new Error(`Unicorn.js: Function uc_mem_unmap failed with code ${ret}:\n${this.strerror(ret)}`);
    }
    this.MUnicorn.removeFunction(hook.callback);
  }
  // Hook Call Example:
  // (also have a look at this: https://github.com/unicorn-engine/unicorn/blob/master/samples/sample_x86.c)
  //
  // static addHookExamples() {
  //   /* eslint-disable @typescript-eslint/no-unused-vars */
  //
  //   // eslint-disable-next-line @typescript-eslint/no-explicit-any
  //   ucInstance.hook_add(eUC.HOOK_CODE, (handle: any, addrLo: number, addrHi: any, size: any, userData: any) => {
  //     console.log(addrLo.toString(16));
  //   }, 0, 0, -1, []);
  //
  //   // eslint-disable-next-line @typescript-eslint/no-explicit-any
  //   ucInstance.hook_add(eUC.HOOK_MEM_READ, (handle: any, type: any, addrLo: any, addrHi: any, size: any, valueLo: any, valueHi: any, userData: any) => {
  //     console.log(`Memory Read: ${ucInstance.memory_read(addrLo, size)}`);
  //   }, 0, 0, -1, []);
  //
  //   // eslint-disable-next-line @typescript-eslint/no-explicit-any
  //   ucInstance.hook_add(eUC.HOOK_INSN, (handle: any, userData: any) => { console.log(handle); console.log(userData); }, 0, 1, 0, 699);
  //   // eslint-disable-next-line @typescript-eslint/no-explicit-any
  //   ucInstance.hook_add(eUC.HOOK_INSN, (handle: any, userData: any) => { console.log(handle); console.log(userData); }, 0, 1, 0, 700);
  //
  //   // eslint-disable-next-line @typescript-eslint/no-explicit-any
  //   const interruptHook = (handle: any, intno: any, userData: any) => {
  //     console.log(`Interrupt Number: ${intno}`);
  //   };
  //   // This hook can be used empty to prevent a stop of unicorn when an interrupt instruction is executed.
  //   // It can also be used to implement the corresponding interrupt.
  //   ucInstance.hook_add(eUC.HOOK_INTR, interruptHook, 0, 0, -1, []);
  //   const testHook = ucInstance.hook_add(eUC.HOOK_INTR, interruptHook, 0, 0, -1, []);
  //   ucInstance.hook_del(testHook);
  //
  //   /* eslint-enable @typescript-eslint/no-unused-vars */
  // }
}

export default Unicorn;
