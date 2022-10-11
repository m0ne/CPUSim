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

import { ExpressionParser } from 'expressionparser';
import State from '../../interfaces/State';
import convertOperandValueToString, { isOperand } from '../evaluateConditionalsService';
import {
  ExpressionValue, InfixOps,
} from './expressionParserTypes';

const isNumeric = (operand: ExpressionValue | bigint) => {
  if (typeof operand === 'bigint') {
    return operand;
  }
  throw new Error(`Expected BigInt, found: ${operand}, ${typeof operand} ${JSON.stringify(operand)}`);
};

const infixOps: InfixOps = {
  '+': (a, b) => isNumeric(a()) + isNumeric(b()),
  '-': (a, b) => isNumeric(a()) - isNumeric(b()),
  '*': (a, b) => isNumeric(a()) * isNumeric(b()),
  '/': (a, b) => isNumeric(a()) / isNumeric(b()),
  '=': (a, b) => a() === b(),
  '!=': (a, b) => a() !== b(),
  '>': (a, b) => a() > b(),
  '<': (a, b) => a() < b(),
  '>=': (a, b) => a() >= b(),
  '<=': (a, b) => a() <= b(),
  AND: (a, b) => a() && b(),
  OR: (a, b) => a() || b(),
  '^': (a, b) => isNumeric(a()) ** isNumeric(b()),
};

export const getInfixOps = () => Object.keys(infixOps);

const conditionalLanguage = {
  INFIX_OPS: infixOps,
  PREFIX_OPS: {},
  PRECEDENCE: [['^'],
    ['*', '/'],
    ['+', '-'],
    ['<', '>', '<=', '>='],
    ['=', '!=', '<>', '~='],
    ['AND', 'OR']],
  SEPARATOR: ' ',
  SYMBOLS: ['^',
    '*',
    '/',
    '+',
    '-',
    '<',
    '>',
    '=',
    '!',
  ],
  ESCAPE_CHAR: '\\',
  GROUP_OPEN: '(',
  GROUP_CLOSE: ')',
  LITERAL_OPEN: '"',
  LITERAL_CLOSE: '"',
  AMBIGUOUS: {
    '-': 'NEG',
  },
};

const isBigInt = (maybeNumber: string) => {
  const result = Number(`0x${maybeNumber}`);
  if (!Number.isNaN(result)) {
    const result = BigInt(`0x${maybeNumber}`);
    return typeof result === 'bigint';
  }
  return false;
};

const isSymbol = (maybeSymbol: string) => conditionalLanguage.SYMBOLS.includes(maybeSymbol);

export const validateConditionalString = (condition: string) => {
  let error = '';
  const termDelegate = (term: string) => {
    if (!(isOperand(term) || isBigInt(term))) {
      if (isSymbol(term)) {
        error = 'Missing at least one other operand or value';
      } else {
        error += `${term}, `;
      }
    }
    return BigInt(1);
  };

  const validationLanguage = {
    ...conditionalLanguage,
    termDelegate,
  };
  if (condition.split(' ').join('') === '') {
    error = 'Please enter your condition.';
    return { error };
  }

  let result = 1n;

  try {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore // we extended the termDelegate with BigInt, which supports all the required operations
    result = new ExpressionParser(validationLanguage).expressionToValue(condition);
  } catch {
    error = 'Your arrangement of operations and operands is formally not correct';
  }

  if (error !== '') {
    const terms = error.split(',').length - 1;
    if (terms >= 1) {
      error = error.substring(0, error.length - 2);
      if (terms === 1) {
        error += ' is not a valid operand. Use registers, flags or constants.';
      } else {
        error += ' are not valid operands. Use registers, flags or constants.';
      }
    }
  }
  if (typeof result !== 'boolean' && error === '') {
    error = 'Your Condition does not evaluate to TRUE or FALSE';
  }

  if (!error) {
    const errorMessage = 'Your arrangement of operations and operands is formally not correct';
    let shouldBeOperand = true;
    condition.split(' ').forEach((x) => {
      if (x !== ' ') {
        if (shouldBeOperand) {
          if (conditionalLanguage.SYMBOLS.includes(x)) {
            error = errorMessage;
          }
          shouldBeOperand = false;
        }
      } else {
        if (!conditionalLanguage.SYMBOLS.includes(x)) {
          error = errorMessage;
        }
        shouldBeOperand = true;
      }
    });
  }

  return { error };
};

const hexStringToBigInt = (input: string) => BigInt(`0x${input}`);

const buildLanguageForEvaluation = (state: State) => {
  const termDelegate = (term: string) => {
    if (isOperand(term)) {
      const operandValueAsString = convertOperandValueToString(state, term);
      const operandValueAsInt = hexStringToBigInt(operandValueAsString);
      return operandValueAsInt;
    }
    return hexStringToBigInt(term);
  };

  const evaluationLanguage = {
    ...conditionalLanguage,
    termDelegate,
  };

  return evaluationLanguage;
};

const evaluateConditionalString = (state: State, condition: string) => {
  const conditionalParser = buildLanguageForEvaluation(state);
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const parser = new ExpressionParser(conditionalParser);
  const result = parser.expressionToValue(condition);

  if (typeof result !== 'boolean') {
    console.error('You did not enter a valid Conditional String');
    return false;
  }
  return result;
};

export default evaluateConditionalString;
