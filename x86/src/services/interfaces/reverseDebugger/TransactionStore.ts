/* SPDX-License-Identifier: GPL-2.0-only */
/*
 * CPUSim
 *
 * Copyright © 2022 by Michael Schneider <michael.schneider@hispeed.com> and Tobias Petter <tobiaspetter@chello.at>
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

import StateTransactions from '@/services/interfaces/reverseDebugger/StateTransactions';
import Version from '@/services/interfaces/reverseDebugger/Version';
import ProgramTransactions from '@/services/interfaces/reverseDebugger/ProgramTransactions';

interface TransactionStore {
  stateTransactions: StateTransactions;
  programStates: [{version: Version; value: ProgramTransactions}];
}
export default TransactionStore;
