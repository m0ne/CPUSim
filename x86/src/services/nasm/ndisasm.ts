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
/*
NASM is now licensed under the 2-clause BSD license, also known as the
simplified BSD license.

    Copyright 1996-2010 the NASM Authors - All rights reserved.

    Redistribution and use in source and binary forms, with or without
    modification, are permitted provided that the following
    conditions are met:

    * Redistributions of source code must retain the above copyright
      notice, this list of conditions and the following disclaimer.
    * Redistributions in binary form must reproduce the above
      copyright notice, this list of conditions and the following
      disclaimer in the documentation and/or other materials provided
      with the distribution.

      THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND
      CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES,
      INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF
      MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
      DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR
      CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
      SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT
      NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
      LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION)
      HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN
      CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR
      OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE,
      EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/

/* eslint-disable */
// @ts-ignore
import Module from '../../../lib/ndisasm';
/* eslint-enable */

interface MNdisasm {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ccall: (name: string, returnType: string, argumentTypes: string[], args: any[]) => any;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  callMain: (args: any[]) => any;

  FS: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    readFile: (path: string) => string|Uint8Array;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    writeFile: (path: string, data: string|ArrayBufferView) => void;
  };
}

export interface NdisasmInstruction {
  offset: string;
  data: string;
  instruction: string;
}

export function processNdisasmInstructions(disassemblerOutput: string): Array<NdisasmInstruction> {
  const lines = disassemblerOutput.split('\n');
  const instructions: Array<NdisasmInstruction> = [];

  lines.forEach((line) => {
    if (line !== '') {
      const offset = line.split(' ', 1)[0];
      const dataAndInstr = line.substr(offset.length).trimStart();
      const data = dataAndInstr.split(' ', 1)[0];
      const instruction = dataAndInstr.substr(data.length).trimStart();

      instructions.push({
        offset,
        data,
        instruction,
      });
    }
  });
  return instructions;
}

export async function ndisasm(machineCode: Uint8Array): Promise<string> {
  let output = '';
  let error = '';

  const ndisasmInstance: MNdisasm = await Module({
    noInitialRun: true,

    print(text: string) {
      output += `${text}\n`;
    },

    printErr(text: string) {
      error = text;
    },
  });

  const binaryFile = '/binary.o';
  ndisasmInstance.FS.writeFile(binaryFile, machineCode);

  await ndisasmInstance.callMain([binaryFile, '-b64']);
  if (error !== '') {
    throw new Error(error);
  }
  return output;
}

function addSpaceAfterComma(assemblyInstruction: string): string {
  return assemblyInstruction.replace(',', ', ');
}

export async function getFirstInstruction(machineCode: Uint8Array): Promise<string> {
  const ndisasmInstruction = processNdisasmInstructions(await ndisasm(machineCode))[0];
  return addSpaceAfterComma(ndisasmInstruction.instruction);
}

export default ndisasm;
