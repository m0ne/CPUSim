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
import { nasm } from '@/services/nasm/nasm';
import {
  assemblyCode0, assemblyCode1, machineCode0, machineCode1,
} from './testDataNasm';

describe('Compare built in nasm output with native command line tool', () => {
  it('succeeds if nasm output matches command line for test code 0', async () => {
    const result = await nasm(assemblyCode0);
    expect(result).to.deep.equal(machineCode0);
  });
  it('succeeds if nasm output matches command line for test code 1', async () => {
    const result = await nasm(assemblyCode1);
    expect(result).to.deep.equal(machineCode1);
  });
});
