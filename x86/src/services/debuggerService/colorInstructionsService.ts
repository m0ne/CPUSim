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

import State from '@/services/interfaces/State';
import addHexAndIntToStringService from '@/services/debuggerService/addHexAndIntToStringService';
import EditorLine from '@/services/interfaces/codeEditor/EditorLine';

export default async function colorInstructionsService(state: State, editorLines: Map<number, EditorLine>) {
  const evenInstructions: string[] = [];
  const unevenInstructions: string[] = [];

  let isEven = true; // 0 is even
  editorLines.forEach((line) => {
    for (let i = 0; i < line.instruction.length; i += 1) {
      const byte = addHexAndIntToStringService(line.memoryAddressFrom.address, i);
      if (isEven) {
        evenInstructions.push(byte);
      } else {
        unevenInstructions.push(byte);
      }
    }
    isEven = !isEven;
  });
  state.byteInformation.evenInstructionBytes = evenInstructions;
  state.byteInformation.unevenInstructionBytes = unevenInstructions;
}
