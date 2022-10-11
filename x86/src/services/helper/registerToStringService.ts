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

import Address from '../interfaces/Address';
import Register from '../interfaces/Register';

const isPointer = (register: Register) => register.name === 'RSP' || register.name === 'RBP';

const getAddressFromRegister = (register: Register): Address => {
  const firstByte = register.content[0].content;
  const secondByte = register.content[1].content;
  const addressString = secondByte.concat(firstByte);
  return {
    address: addressString,
  };
};

const getAddress = (register: Register) => {
  const address = isPointer(register) ? getAddressFromRegister(register) : undefined;
  if (address) {
    address.pointerName = register.name;
  }
  return address;
};

const getAddressAsStringFromRegister = (register: Register): string => getAddressFromRegister(register)?.address;

const getPointerName = (register: Register): string => {
  let pointerName = '';
  if (isPointer(register)) {
    if (register.name === 'RSP') {
      pointerName = 'Stack Pointer';
    } else if (register.name === 'RBP') {
      pointerName = 'Base Pointer';
    }
  }
  return pointerName;
};

export {
  isPointer, getAddressFromRegister, getAddress, getPointerName, getAddressAsStringFromRegister,
};
