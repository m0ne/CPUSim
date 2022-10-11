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

export const demoProgramLabels = {
  one: 'Add',
  two: 'Swap',
  three: 'Multiply',
  four: 'Stack',
  five: 'Jump',
  six: 'Surprise',
};

const demoProgramOne = {
  label: demoProgramLabels.one,
  program: 'BITS 64\n'
    + 'mov rax, [0x0]\n'
    + 'mov rbx, [0x30]\n'
    + 'add rbx, rax\n'
    + 'mov [0x20], rbx\n'
    + `; ${demoProgramLabels.one}`,
};

const demoProgramTwo = {
  label: demoProgramLabels.two,
  program: 'BITS 64\n'
    + 'SECTION .data\n'
    + '\tfirstVar:\n'
    + '\t\tdq 0x1337\n'
    + '\totherVar:\n'
    + '\t\tdq 0xcafe\n'
    + '\n'
    + 'SECTION .text\n'
    + '\tmov rax , [ firstVar ]\n'
    + '\tmov rbx , [ otherVar ]\n'
    + '\tmov [ firstVar ], rbx\n'
    + '\tmov [ otherVar ], rax\n'
    + `; ${demoProgramLabels.two}`,
};

const demoProgramThree = {
  label: demoProgramLabels.three,
  program: 'BITS 64\n'
    + 'SECTION .text\n'
    + '\tmov rax, 0x4E\n'
    + '\tmov rbx, 0x3\n'
    + '\tloop:\n'
    + '\t\tadd rcx, rax\n'
    + '\t\tdec rbx\n'
    + '\t\tcmp rbx, 0\n'
    + '\t\tjne loop\n'
    + '\tmov [0x50], rcx\n'
    + '\txor rax, rax\n'
    + '\txor rcx, rcx\n'
    + `; ${demoProgramLabels.three}`,
};

const demoProgramFour = {
  label: demoProgramLabels.four,
  program: 'BITS 64\n'
    + 'SECTION .text\n'
    + '\tpush 0x6\n'
    + '\tpush qword [0x6]\n'
    + '\tmov rax, qword [0x0]\n'
    + '\tpush rax\n'
    + '\tpop rbx\n'
    + '\tpop qword [0x40]\n'
    + `; ${demoProgramLabels.four}`,
};

const demoProgramFive = {
  label: demoProgramLabels.five,
  program: 'BITS 64\n'
    + 'JumpDestination:\n'
    + '\tinc rax\n'
    + '\tcmp rax, 3\n'
    + '\tjne JumpDestination\n'
    + `; ${demoProgramLabels.five}`,
};

const demoProgramSix = {
  label: demoProgramLabels.six,
  program: 'BITS 64\n'
    + 'mov al, [0x74]\n'
    + 'mov al, [0x78]\n'
    + 'mov al, [0x96]\n'
    + 'mov al, [0xA4]\n'
    + 'mov al, [0xB5]\n'
    + 'mov al, [0xC6]\n'
    + 'mov al, [0xB7]\n'
    + 'mov al, [0xA8]\n'
    + `; ${demoProgramLabels.six}`,
};

const demoPrograms: Array<{label: string; program: string}> = [demoProgramOne, demoProgramTwo, demoProgramThree, demoProgramFour, demoProgramFive, demoProgramSix];
export default demoPrograms;
