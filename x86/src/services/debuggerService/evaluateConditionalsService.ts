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

import State from '../interfaces/State';
import { FlagOperand, Operand, RegisterOperand } from './operandEnums';
import NamedByteContainer from '../interfaces/NamedByteContainer';

const registerToString = (byteContainer: NamedByteContainer) => byteContainer.content.map((byte) => byte.content).join('');

const isRegisterOperand = (operand: string): operand is RegisterOperand => !!RegisterOperand[operand as RegisterOperand];
const isFlagOperand = (operand: string): operand is FlagOperand => !!FlagOperand[operand as FlagOperand];
export const isOperand = (maybeOperand: string): maybeOperand is Operand => (isFlagOperand(maybeOperand) || isRegisterOperand(maybeOperand));

const findFlag = (state: State, operand: FlagOperand) => state.flags.find((flag) => flag.name === operand);
const findRegister = (state: State, operand: RegisterOperand) => state.registers.find((register) => register.name === operand);

const littleEndianToBigEndian = (input: string) => {
  const result = [];
  let len = input.length - 2;
  while (len >= 0) {
    result.push(input.substr(len, 2));
    len -= 2;
  }
  return result.join('');
};

const convertOperandValueToString = (state: State, operand: Operand) => {
  if (isRegisterOperand(operand)) {
    if (operand === 'RIP') {
      return state.instructionPointer.address.address;
    }
    const register = findRegister(state, operand);
    if (register) {
      const registerAsString = registerToString(register);
      const registerAsBE = littleEndianToBigEndian(registerAsString);
      return registerAsBE;
    }
  }

  if (isFlagOperand(operand)) {
    const flag = findFlag(state, operand);
    if (flag) {
      return flag.content.content;
    }
  }

  return '0';
};

export default convertOperandValueToString;
