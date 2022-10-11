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

import Breakpoint from '../interfaces/debugger/Breakpoint';
import Condition from '../interfaces/debugger/Condition';
import Watchpoint from '../interfaces/debugger/Watchpoint';
import { validateConditionalString } from './expressionParser/expressionParser';

const createConditional = (conditionalString: string) => {
  const { error } = validateConditionalString(conditionalString.toUpperCase());
  const conditional: Condition = { value: conditionalString.toUpperCase() };
  return { conditional, error };
};

export const createBreakpointWithoutCondition = (line: number): Breakpoint => ({
  line,
});

export const createBreakpointWithCondition = (line: number, condition: Condition): Breakpoint => ({
  line, condition,
});

export const createWatchpoint = (condition: Condition): Watchpoint => ({ condition });

export default createConditional;
