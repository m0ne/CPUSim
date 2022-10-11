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

/* eslint-disable no-use-before-define */
export interface ExpressionArray<T> extends Array<T> {
  isArgumentsArray?: boolean;
}
export interface ArgumentsArray extends ExpressionArray<ExpressionThunk> {
  isArgumentsArray: true;
}
export declare const isArgumentsArray: (args: ExpressionValue) => args is ArgumentsArray;
export declare type ValuePrimitive = number | boolean | string | bigint;
export declare type Delegate = (...args: ExpressionValue[]) => ExpressionValue;
export declare type ExpressionFunction = Delegate;
export declare type ExpressionValue = ValuePrimitive | ArgumentsArray | ExpressionArray<ExpressionValue> | {
  [key: string]: ExpressionValue;
} | ExpressionThunk | ExpressionFunction;
export declare type ExpressionThunk = () => ExpressionValue;
export declare type TermDelegate = (term: string) => ExpressionValue;
export declare type TermType = 'number' | 'boolean' | 'string' | 'function' | 'array' | 'object' | 'unknown' | 'bigint';
export declare type TermTyper = (term: string) => TermType;
declare type Infixer<T> = (token: string, lhs: T, rhs: T) => T;
declare type Prefixer<T> = (token: string, rhs: T) => T;
declare type Terminator<T> = (token: string, terms?: Record<string, ExpressionValue>) => T;
export declare type PrefixOp = (expr: ExpressionThunk) => ExpressionValue;
export interface PrefixOps {
  [op: string]: PrefixOp;
}
export declare type InfixOp = (a: ExpressionThunk, b: ExpressionThunk) => ExpressionValue;
export interface InfixOps {
  [op: string]: InfixOp;
}
export interface Description {
  op: string;
  fix: 'infix' | 'prefix' | 'surround';
  sig: string[];
  text: string;
}
export interface ExpressionParserOptions {
  AMBIGUOUS: {
    [op: string]: string;
  };
  PREFIX_OPS: PrefixOps;
  INFIX_OPS: InfixOps;
  ESCAPE_CHAR: string;
  LITERAL_OPEN: string;
  LITERAL_CLOSE: string;
  GROUP_OPEN: string;
  GROUP_CLOSE: string;
  SYMBOLS: string[];
  PRECEDENCE: string[][];
  SEPARATOR: string;
  termDelegate: TermDelegate;
  termTyper?: TermTyper;
  SURROUNDING?: {
    [token: string]: {
      OPEN: string;
      CLOSE: string;
    };
  };
  isCaseInsensitive?: boolean;
  descriptions?: Description[];
}
declare class ExpressionParser {
  options: ExpressionParserOptions;

  surroundingOpen: {
    [token: string]: boolean;
  };

  surroundingClose: {
    [token: string]: {
      OPEN: string;
      ALIAS: string;
    };
  };

  symbols: {
    [token: string]: string;
  };

  LIT_CLOSE_REGEX?: RegExp;

  LIT_OPEN_REGEX?: RegExp;

  constructor(options: ExpressionParserOptions);

  resolveCase(key: string): string;

  resolveAmbiguity(token: string): string;

  isSymbol(char: string): boolean;

  getPrefixOp(op: string): PrefixOp;

  getInfixOp(op: string): InfixOp;

  getPrecedence(op: string): number;

  tokenize(expression: string): string[];

  tokensToRpn(tokens: string[]): string[];

  evaluateRpn<T>(stack: string[], infixer: Infixer<T>, prefixer: Prefixer<T>, terminator: Terminator<T>, terms?: Record<string, ExpressionValue>): T;

  rpnToExpression(stack: string[]): string;

  rpnToTokens(stack: string[]): string[];

  rpnToThunk(stack: string[], terms?: Record<string, ExpressionValue>): ExpressionThunk;

  rpnToValue(stack: string[], terms?: Record<string, ExpressionValue>): ExpressionValue;

  thunkToValue(thunk: ExpressionThunk): ExpressionValue;

  expressionToRpn(expression: string): string[];

  expressionToThunk(expression: string, terms?: Record<string, ExpressionValue>): ExpressionThunk;

  expressionToValue(expression: string, terms?: Record<string, ExpressionValue>): ExpressionValue;

  tokensToValue(tokens: string[]): ExpressionValue;

  tokensToThunk(tokens: string[]): ExpressionThunk;
}
export default ExpressionParser;
