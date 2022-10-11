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

import EditorLine from '@/services/interfaces/codeEditor/EditorLine';
import StepController from '@/services/stepController';
import Breakpoint from './interfaces/debugger/Breakpoint';
import evaluateConditionalString from './debuggerService/expressionParser/expressionParser';
import Watchpoint from './interfaces/debugger/Watchpoint';
import { isBreakpoint } from './debuggerService/conditionalTypesService';

export default class DebuggerController {
  private editorLines: Map<number, EditorLine>;

  public breakpoints: Array<Breakpoint>;

  private watchpoints: Array<Watchpoint>;

  private controller: StepController;

  private breakForWatchpoint: boolean;

  constructor(controller: StepController, editorLines: Map<number, EditorLine>) {
    this.controller = controller;

    this.editorLines = editorLines;
    this.breakpoints = [];
    this.watchpoints = [];
    this.breakForWatchpoint = false;
  }

  private setBreakForWatchpoint = (value: boolean) => {
    this.breakForWatchpoint = value;
  }

  // Helper Method: Needed because of RIP increase in Step 2
  public async stepForwardToStartOfNextInstruction() {
    while (!this.breakForWatchpoint && this.controller.getCurrentStep().numberInCycleSequence !== 1) {
      await this.nextStepWithWatchpointCheck().then(({ watchpointsHold }) => this.setBreakForWatchpoint(watchpointsHold));
    }
    this.setBreakForWatchpoint(false);
  }

  public async runToStartOfProgram() {
    const animations = this.controller.turnOfAllAnimations();

    while (!this.breakForWatchpoint && !this.controller.isInitialStep()) {
      await this.previousStepWithWatchpointCheck().then((watchpointsHold: boolean) => this.setBreakForWatchpoint(watchpointsHold));
    }

    this.setBreakForWatchpoint(false);
    this.controller.setSteps(animations);
  }

  public async runToEndOfProgram() {
    const animations = this.controller.turnOfAllAnimations();

    while (!this.breakForWatchpoint && !this.controller.isLastStep()) {
      await this.nextStepWithWatchpointCheck().then(({ watchpointsHold }) => this.setBreakForWatchpoint(watchpointsHold));
    }

    this.setBreakForWatchpoint(false);
    this.controller.setSteps(animations);
  }

  // backward: false = forwards, backward: true = backwards
  public async runUntil(breakpoint: Breakpoint, backward = false) {
    if (this.editorLines.size >= breakpoint.line) {
      const animations = this.controller.turnOfAllAnimations();

      const requestedLine = this.editorLines.get(breakpoint.line);

      if (requestedLine !== undefined) {
        while ((!this.breakForWatchpoint) && this.controller.getState().instructionPointer.address.address !== requestedLine.memoryAddressFrom.address) {
          if (!backward) {
            await this.nextStepWithWatchpointCheck().then(({ watchpointsHold }) => this.setBreakForWatchpoint(watchpointsHold));
          } else {
            await this.previousStepWithWatchpointCheck().then((watchpointsHold: boolean) => this.setBreakForWatchpoint(watchpointsHold));
          }
        }

        if (!backward && !this.breakForWatchpoint) {
          await this.stepForwardToStartOfNextInstruction();
        }

        this.setBreakForWatchpoint(false);
      }
      this.controller.setSteps(animations);
    }
    return !this.controller.isLastStep();
  }

  private runUntilInitializer(backward = false) {
    const currentLine = this.getCurrentlyActiveLine();
    let sortedBreakpoints: Array<Breakpoint>;

    if (backward) {
      sortedBreakpoints = this.breakpoints.sort((a, b) => b.line - a.line);
    } else {
      sortedBreakpoints = this.breakpoints.sort((a, b) => a.line - b.line);
    }

    return { sortedBreakpoints, currentLine };
  }

  private selectPreviousBreakpoint = () => {
    const { sortedBreakpoints, currentLine } = this.runUntilInitializer(true);
    let selectedBreakpoint: Breakpoint | undefined;

    Object.entries(sortedBreakpoints).every(([, value]) => {
      if (value.line >= currentLine) {
        return true;
      }
      selectedBreakpoint = value;
      return false;
    });

    return selectedBreakpoint;
  }

  private selectNextBreakpoint = () => {
    const { sortedBreakpoints, currentLine } = this.runUntilInitializer(false);
    let selectedBreakpoint: Breakpoint | undefined;

    Object.entries(sortedBreakpoints).every(([, value]) => {
      if (value.line <= currentLine) {
        return true;
      }
      selectedBreakpoint = value;
      return false;
    });

    return { selectedBreakpoint, sortedBreakpoints };
  }

  private conditionDoesHold = (selectedObject: Breakpoint | Watchpoint) => {
    let result = true;
    if (selectedObject.condition) {
      result = evaluateConditionalString(this.controller.getState(), selectedObject.condition.value);
      if (result) {
        if (isBreakpoint(selectedObject)) {
          window.dispatchEvent(new CustomEvent<Breakpoint>('triggerBreakpoint', { detail: selectedObject }));
        } else {
          window.dispatchEvent(new CustomEvent<Watchpoint>('triggerWatchpoint', { detail: selectedObject }));
        }
      }
    }
    return result;
  }

  public async runBackwardUntilBreakpoint() {
    const selectedBreakpoint = this.selectPreviousBreakpoint();

    if (selectedBreakpoint) {
      await this.runUntil(selectedBreakpoint, true);

      if (!this.conditionDoesHold(selectedBreakpoint)) {
        await this.runBackwardUntilBreakpoint();
      }
    } else {
      await this.runToStartOfProgram();
    }
  }

  public runForwardUntilBreakpoint = async () => {
    const { selectedBreakpoint, sortedBreakpoints } = this.selectNextBreakpoint();

    if (selectedBreakpoint) {
      await this.runUntil(selectedBreakpoint, false);

      if (!this.conditionDoesHold(selectedBreakpoint)) {
        await this.runForwardUntilBreakpoint();
      }

      this.breakpoints = sortedBreakpoints;
    } else {
      await this.runToEndOfProgram();
    }

    return !this.controller.isLastStep();
  }

  public setBreakpoint(breakpoint: Breakpoint) {
    const replaceBreakpoint = (index: number, newBreakpoint: Breakpoint) => {
      this.breakpoints[index] = newBreakpoint;
    };

    const breakpointPosition = this.breakpoints.findIndex((bp) => bp.line === breakpoint.line);
    if (breakpointPosition === -1) {
      this.breakpoints.push(breakpoint);
    } else {
      replaceBreakpoint(breakpointPosition, breakpoint);
    }
  }

  public unsetBreakpoint(breakpoint: Breakpoint) {
    this.breakpoints = this.breakpoints.filter((bp) => bp.line !== breakpoint.line);
  }

  public toggleBreakpoint(breakpoint: Breakpoint) {
    const breakpointPosition = this.breakpoints.findIndex((bp) => bp.line === breakpoint.line);
    if (breakpointPosition === -1) {
      this.setBreakpoint(breakpoint);
    } else {
      this.unsetBreakpoint(breakpoint);
    }
  }

  private evaluateWatchpoints() {
    let watchpointsHolds = false;
    this.watchpoints.forEach((wp) => {
      if (this.conditionDoesHold(wp)) {
        watchpointsHolds = true;
      }
    });

    return watchpointsHolds;
  }

  private checkWatchpoints = () => {
    if (this.getWatchpoints().length > 0) {
      return this.evaluateWatchpoints();
    }
    return false;
  }

  public nextStepWithWatchpointCheck = async () => this.controller.nextStep().then((isNotLastStep: boolean) => {
    const watchpointsHold = this.checkWatchpoints();
    return { isNotLastStep, watchpointsHold };
  });

  public previousStepWithWatchpointCheck = async () => {
    await this.controller.previousStep();
    return this.checkWatchpoints();
  }

  public setWatchpoint(watchpoint: Watchpoint) {
    this.watchpoints.push(watchpoint);
  }

  public unsetWatchPoint(watchpoint: Watchpoint) {
    this.watchpoints = this.watchpoints.filter((wp) => wp.condition.value !== watchpoint.condition.value);
  }

  public getWatchpoints() {
    return this.watchpoints;
  }

  public getBreakpoints() {
    return this.breakpoints;
  }

  public getCurrentlyActiveLine() {
    const currentMemoryAddress = this.controller.getState().currentInstruction.address.address;

    let currentlyActiveLine = -1;
    this.editorLines.forEach((line) => {
      if (currentlyActiveLine === -1) {
        if (line.memoryAddressFrom.address === currentMemoryAddress) {
          currentlyActiveLine = line.line;
        }
      }
    });
    return currentlyActiveLine;
  }
}
