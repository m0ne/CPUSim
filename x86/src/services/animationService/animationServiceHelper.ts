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

import {
  copyNode,
  removeClonedElementAfterAnimation, waitForAnimationToFinish,
} from '@/services/animationService/documentHelper';
import Coordinate from '@/services/interfaces/Coordinate';
import htmlId, { htmlClass } from '@/services/helper/htmlIds';

let animationSpeed = 1;

function setMoveByteAnimationParameters(elementToAnimate: HTMLElement, translate: Coordinate) {
  elementToAnimate.style.setProperty('--leftTranslate', `${translate.x}px`);
  elementToAnimate.style.setProperty('--topTranslate', `${translate.y}px`);
  elementToAnimate.style.setProperty('--animationSpeed', `${animationSpeed}`);
}

function getTranslation(originalElement: Element, targetElement: Element, byteNumberForOffset: number): Coordinate {
  let byteOffset: number;
  const byteOffsetCalculatorElement = document.getElementById('byteOffsetCalculator');
  if (byteOffsetCalculatorElement) {
    byteOffset = byteOffsetCalculatorElement.getBoundingClientRect().width;
  } else {
    throw new Error('Byte offset calculator did not work');
  }
  const originalRect = originalElement.getBoundingClientRect();
  const targetElementRect = targetElement.getBoundingClientRect();

  return {
    x: targetElementRect.left - originalRect.left + (byteOffset * byteNumberForOffset),
    y: targetElementRect.top - originalRect.top,
  };
}

function startMoveByteAnimation(elementToAnimate: HTMLElement) {
  elementToAnimate.classList.add(htmlClass.moveByte);
}

export async function moveByte(fromID: string, toID: string, byteNumberForOffset: number) {
  const copyElement = window.document.getElementById(fromID);
  const targetElement = window.document.getElementById(toID);

  if (copyElement && targetElement) {
    const clonedNode = copyNode(copyElement);
    const animationEndPromise = removeClonedElementAfterAnimation(clonedNode as HTMLElement);

    const translate = getTranslation(copyElement, targetElement, byteNumberForOffset);
    setMoveByteAnimationParameters(clonedNode as HTMLElement, translate);

    startMoveByteAnimation(clonedNode as HTMLElement);
    return animationEndPromise;
  }
  return Promise.resolve();
}

export async function moveExecutionBoxLeft() {
  const executionBoxElement = document.getElementById(htmlId.magicBox);
  if (executionBoxElement) {
    const animationEndPromise = waitForAnimationToFinish(executionBoxElement);
    executionBoxElement.classList.add(htmlClass.magicBoxLeft);
    return animationEndPromise;
  }
  return Promise.resolve();
}

export async function moveExecutionBoxRight() {
  const executionBoxElement = document.getElementById(htmlId.magicBox);
  if (executionBoxElement) {
    executionBoxElement.classList.remove(htmlClass.magicBoxLeft);
  }
  return Promise.resolve();
}

export async function changeAnimationSpeed(speed: number) {
  animationSpeed = speed;
}
