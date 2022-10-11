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

import htmlId, { htmlClass } from '@/services/helper/htmlIds';

function setInitialClonePosition(clonedElement: HTMLElement, originalElement: HTMLElement) {
  const originalElementRect = originalElement.getBoundingClientRect();
  const element = clonedElement;
  element.style.position = 'absolute';
  element.style.top = `${originalElementRect.top}px`;
  element.style.left = `${originalElementRect.left}px`;
  element.style.zIndex = '1000';
}

function insertNodeIntoDocument(nodeToInsert: Node, originalElement: HTMLElement) {
  const insertAtElement = window.document.getElementsByClassName(htmlClass.qPageContainer)[0];
  insertAtElement.appendChild(nodeToInsert);
  setInitialClonePosition(nodeToInsert as HTMLElement, originalElement);
}

export function copyNode(elementToCopy: HTMLElement): Node {
  const clonedNode = elementToCopy.cloneNode(true);
  // Add a class to avoid double animations within the CSS of the clonedElement
  (clonedNode as HTMLElement).classList.add(htmlClass.copyNode);
  // Change id of the clone to be unique
  (clonedNode as HTMLElement).id = `${htmlId.clonePrefix}_${elementToCopy.id}`;
  insertNodeIntoDocument(clonedNode, elementToCopy);
  return clonedNode;
}

export function removeClonedElementAfterAnimation(elementToAnimate: HTMLElement): Promise<void> {
  return new Promise(((resolve) => {
    // listen to the end of the css animation
    elementToAnimate.addEventListener('animationend', function animationendListener() {
      elementToAnimate.removeEventListener('animationend', animationendListener);
      elementToAnimate.remove();
      resolve();
    });
  }));
}

export function waitForAnimationToFinish(elementToAnimate: HTMLElement): Promise<void> {
  return new Promise(((resolve) => {
    // listen to the end of the css animation
    elementToAnimate.addEventListener('animationend', function animationendListener() {
      elementToAnimate.removeEventListener('animationend', animationendListener);
      resolve();
    });
  }));
}
