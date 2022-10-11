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
  removeClonedElementAfterAnimation,
} from '@/services/animationService/documentHelper';
import scrollLastElementIntoView from '@/services/animationService/scrollHelper';
import { htmlClass } from '@/services/helper/htmlIds';

let animationSpeed = 1;

export enum AttentionMode {
  Pulse,
  Attention,
  AttentionPulse,
}

const keyValueAttentionModeCSSClass: Array<[AttentionMode, string]> = [
  [AttentionMode.Pulse, htmlClass.pulse],
  [AttentionMode.Attention, htmlClass.attention],
  [AttentionMode.AttentionPulse, htmlClass.attentionPulse],
];

const attentionModeCSSClassMap: Map<AttentionMode, string> = new Map(keyValueAttentionModeCSSClass);

function removeAttentionAnimationAfterAnimation(elementToAnimate: HTMLElement, attentionMode: AttentionMode): Promise<void> {
  return new Promise(((resolve) => {
    // listen to the end of the css animation
    elementToAnimate.addEventListener('animationend', function animationendListener() {
      elementToAnimate.removeEventListener('animationend', animationendListener);
      const attentionModeString = attentionModeCSSClassMap.get(attentionMode);
      if (attentionModeString) {
        elementToAnimate.classList.remove(attentionModeString);
      }
      resolve();
    });
  }));
}

function startAttentionAnimation(elementToAnimate: HTMLElement, attentionMode: AttentionMode) {
  const attentionModeString = attentionModeCSSClassMap.get(attentionMode);
  if (attentionModeString) {
    elementToAnimate.style.setProperty('--animationSpeed', `${animationSpeed}`);
    elementToAnimate.classList.add(attentionModeString);
  }
}

function hideElement(elementToAnimate: HTMLElement) {
  elementToAnimate.classList.add(htmlClass.hide);
}

function unhideElement(elementToAnimate: HTMLElement) {
  elementToAnimate.classList.remove(htmlClass.hide);
}

async function elementAttentionWithCloning(locationID: string, attentionMode: AttentionMode) {
  const copyElement = window.document.getElementById(locationID);
  if (copyElement) {
    const clonedNode = copyNode(copyElement);
    const animationEndPromise = removeClonedElementAfterAnimation(clonedNode as HTMLElement).then(() => { unhideElement(copyElement); });
    hideElement(copyElement);
    startAttentionAnimation(clonedNode as HTMLElement, attentionMode);
    return animationEndPromise;
  }
  return Promise.resolve();
}

async function elementAttention(locationID: string, attentionMode: AttentionMode) {
  const element = window.document.getElementById(locationID);
  if (element) {
    const animationEndPromise = removeAttentionAnimationAfterAnimation(element, attentionMode);
    startAttentionAnimation(element as HTMLElement, attentionMode);
    return animationEndPromise;
  }
  return Promise.resolve();
}

export async function animateAttentionLocationIDs(locationIDs: Array<string>, attentionMode: AttentionMode, scrollIntoView: boolean) {
  const allAnimations: Promise<unknown>[] = [];
  await scrollLastElementIntoView(scrollIntoView, locationIDs);
  switch (attentionMode) {
    case AttentionMode.Attention:
    case AttentionMode.AttentionPulse: {
      locationIDs.forEach((locationID) => {
        allAnimations.push(elementAttentionWithCloning(locationID, attentionMode));
      });
      break;
    }
    case AttentionMode.Pulse: {
      locationIDs.forEach((locationID) => {
        allAnimations.push(elementAttention(locationID, attentionMode));
      });
      break;
    }
    default: {
      break;
    }
  }
  return Promise.all(allAnimations);
}

export async function changeAnimationSpeed(speed: number) {
  animationSpeed = speed;
}
