<!-- SPDX-License-Identifier: GPL-2.0-only -->
<!--
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
-->

<template>
  <div class="animationBytesContainer">
    <div class="leftAnimationBytes">

      <!-- Imm -->
      <div v-if="accessedElements.immediateAccess">
        <div v-for="(line, index) in accessedElements.immediateAccess" :key="index">
          <div class="animationBytesZone" :id="animationZoneIdImmediate(line.address.address)">
            <div class="animationByte" v-for="byte in line.dataBytes" :key="byte.locationId">
              <!-- Duplication to get start and end for animation -->
              <ByteVue class="offsetImmediateToInstructionBox" :byte="byte" :id="byte.locationId"/>
              <ByteVue class="hideBytes" :byte="byte" :id="animationIdImmediate(byte.locationId)"/>
            </div>
          </div>
        </div>
      </div>

      <!-- Memory Read -->
      <div v-if="accessedElements.memoryReadAccess">
        <div v-for="(line, index) in accessedElements.memoryReadAccess" :key="index">
          <div class="animationBytesZone" :id="animationZoneIdMemory(line.address.address, false, index)">
            <div class="animationByte hideBytes" v-for="(byte) in line.dataBytes" :key="byte.locationId">
              <ByteVue :byte="byte" :id="animationIdMemory(byte.locationId, false, index)"/>
            </div>
          </div>
        </div>
      </div>

      <!-- Register Read-->
      <div v-if="accessedElements.registerReadAccess">
        <div v-for="(line, index) in accessedElements.registerReadAccess" :key="index">
          <div class="animationBytesZone" :id="animationZoneIdRegister(line.name, false, index)">
            <div class="animationByte hideBytes" v-for="(byte) in line.content" :key="byte.locationId">
              <ByteVue :byte="byte" :id="animationIdRegister(byte.locationId, false, index)"/>
            </div>
          </div>
        </div>
      </div>

      <!-- FlagTest -->
      <div v-if="accessedElements.flagTestAccess">
        <div class="animationBytesZone" :id="animationZoneIdFlags(false)">
          <div class="animationByte hideBytes" v-for="flag in accessedElements.flagTestAccess" :key="flag.name">
            <ByteVue :byte="flag.content" :id="animationIdFlag(flag.content.locationId, false)"/>
          </div>
        </div>
      </div>

    </div>
    <div class="rightAnimationBytes">

      <!-- MemWrite -->
      <div v-if="accessedElements.memoryWriteAccess">
        <div v-for="(line, index) in accessedElements.memoryWriteAccess" :key="index">
          <div class="animationBytesZone" :id="animationZoneIdMemory(line.address.address, true, index)">
            <div class="animationByte" v-for="(byte) in line.dataBytes" :key="byte.locationId">
              <ByteVue :byte="byte" :id="animationIdMemory(byte.locationId, true, index)"/>
            </div>
          </div>
        </div>
      </div>

      <!-- RegWrite -->
      <div v-if="accessedElements.registerWriteAccess">
        <div v-for="(line, index) in accessedElements.registerWriteAccess" :key="index">
          <div class="animationBytesZone" :id="animationZoneIdRegister(line.name, true, index)">
            <div class="animationByte" v-for="(byte) in line.content" :key="byte.locationId">
              <ByteVue :byte="byte" :id="animationIdRegister(byte.locationId, true, index)"/>
            </div>
          </div>
        </div>
      </div>

      <!-- FlagWrite -->
      <div v-if="accessedElements.flagWriteAccess">
        <div class="animationBytesZone" :id="animationZoneIdFlags(true)">
          <div class="animationByte"  v-for="flag in accessedElements.flagWriteAccess" :key="flag.name">
            <ByteVue :byte="flag.content" :id="animationIdFlag(flag.content.locationId, true)"/>
          </div>
        </div>
      </div>

      <!-- JumpDestinationWrite -->
      <div v-if="accessedElements.jumpDestinationWriteAccess">
        <div v-for="(line, index) in accessedElements.jumpDestinationWriteAccess" :key="index">
          <div class="animationBytesZone" :id="animationZoneIdJumpDestination(line.name, true, index)">
            <div class="animationByte" v-for="(byte) in line.content" :key="byte.locationId">
              <ByteVue :byte="byte" :id="animationIdJumpDestination(byte.locationId, true, index)"/>
            </div>
          </div>
        </div>
      </div>

    </div>
    <div :id="magicBox" class="magicBox">
      <div class="leftText">
        <div v-for="(item, index) in getLeftText()" :key="index">
          <div class="leftTextItem">{{item}}</div><br>
        </div>
      </div>
      <div class="instructionNameClass">
        {{instructionName}}
      </div>
      <div class="rightText">
        <div v-for="(item, index) in getRightText()" :key="index">
          <div class="rightTextItem">{{item}}</div><br>
        </div>
      </div>
      <q-tooltip style="font-size: 16px" anchor="bottom middle" self="top middle">
        {{getInstructionDescription()}}
      </q-tooltip>
    </div>
  </div>
</template>

<script lang="ts">
import ByteVue from '@/components/general/ByteVue.vue';
import {
  getInputNamesForExecutionBox,
  getOutputNamesForExecutionBox,
} from '@/services/dataServices/accessedElementsService';
import AccessedElements from '@/services/interfaces/AccessedElements';
import {
  getAnimationIdFlag,
  getAnimationIdImmediate,
  getAnimationIdMemory,
  getAnimationIdRegister,
  getAnimationZoneIdFlags,
  getAnimationZoneIdImmediate,
  getAnimationZoneIdMemory,
  getAnimationZoneIdRegister,
  getAnimationIdJumpDestination,
  getAnimationZoneIdJumpDestination,
} from '@/services/helper/htmlIdService';
import htmlId from '@/services/helper/htmlIds';
import { defineComponent, PropType } from 'vue';

export default defineComponent({
  name: 'ExecutionBox',
  components: {
    ByteVue,
  },
  props: {
    accessedElements: { type: Object as PropType<AccessedElements>, required: true },
    instructionName: { type: String },
  },
  setup(props) {
    const { magicBox } = htmlId;

    const instructionDescriptors = new Map([
      // Arithmetic
      ['mov', 'The instruction \'mov x, y\' copies the content of y into x. X and Y can be immediates, registers or memory locations.'],
      ['add', 'The instruction \'add x, y\' adds the content of y to x. The result is stored in x. (similar to x += y)'],
      ['sub', 'The instruction \'sub x, y\' subtracts the content of y from x. The result is stored in x. (similar to x -= y)'],
      ['imul', 'The instruction \'imul x, y\' multiplies the content of y with x. The result is stored in x. (similar to x *= y)'],
      ['neg', 'The instruction \'neg x\' negates x. (similar to x *= -1)'],
      ['inc', 'The instruction \'inc x\' increases x by one. (similar to x++)'],
      ['cmp', 'The instruction \'cmp x, y\' is used to compare two numbers: it calculates x-y and sets the flags accordingly. It does not store x-y anywhere. Usually used to prepare conditional jumps.'],
      ['sal', 'The instruction \'sal A, y\' (\'shift arithmetic left\') arithmetically left shifts y by A and stores the result in y. (similar to y <<= A)'],
      ['sar', 'The instruction \'sar A, y\' (\'shift arithmetic right\') arithmetically right shifts y by A and stores the result in y. (similar to y >>= A)'],
      ['shr', 'The instruction \'shr A, y\' (\'shift right\') logically right shifts y by A and stores the result in y. (similar to y >>= A)'],
      // Jumping
      ['jmp', 'The instruction \'jmp x\' performs an unconditional jump to location x. It is executed no matter what.'],
      ['je', 'The instruction \'je x\' (\'jump (if) equal\') performs a conditional jump to location x in case the zero flag is 1.'],
      ['jne', 'The instruction \'jne x\' (\'jump (if) not equal\') performs a conditional jump to location x in case the zero flag is 0.'],
      ['js', 'The instruction \'js x\' (\'jump (if) negative\') performs a conditional jump to location x in case the sign flag is 1.'],
      ['jns', 'The instruction \'jns x\' (\'jump (if) not negative\') performs a conditional jump to location x in case the sign flag is 0.'],
      ['jg', 'The instruction \'jg x\' (\'jump (if) greater (signed)\') performs a conditional jump to location x in case the zero flag is 0 and the sign flag equals the overflow flag.'],
      ['jge', 'The instruction \'jge x\' (\'jump (if) greater (or) equal (signed)\') performs a conditional jump to location x in case the sign flag equals the overflow flag.'],
      ['jl', 'The instruction \'jl x\' (\'jump (if) less (signed)\') performs a conditional jump to location x in case the sign flag does not equal the overflow flag.'],
      ['jle', 'The instruction \'jle x\' (\'jump (if) less (or) equal (signed)\') performs a conditional jump to location x in case the zero flag is 1 and the sign flag does not equal the overflow flag.'],
      ['ja', 'The instruction \'ja x\' (\'jump (if) greater (unsigned)\') performs a conditional jump to location x in case the carry and zero flag are both 0.'],
      ['jae', 'The instruction \'jae x\' (\'jump (if) greater (or) equal (unsigned)\') performs a conditional jump to location x in case the carry flag is 0.'],
      ['jb', 'The instruction \'jb x\' (\'jump (if) less (unsigned)\') performs a conditional jump to location x in case the carry flag is 1.'],
      ['jbe', 'The instruction \'jbe x\' (\'jump (if) less (or) equal (unsigned)\') performs a conditional jump to location x in case the carry and zero flag are both 1.'],
      // Stack
      ['push', 'The instruction \'push x\' pushes x to the stack. This means it copies x to the location of RSP and then decreases RSP by the system register size.'],
      ['pop', 'The instruction \'pop x\' pops the top of the stack into x. This means it copies the top of the stack to x and then decreases RSP by the system register size.'],
      ['call', 'The instruction \'call x\' pushes the instruction pointer register (rip) to the stack and then jumps to location x.'],
      ['ret', 'The instruction \'ret\' pops the instruction pointer register (rip). This means the program will continue where it left off before the call.'],
      // Logical operations
      ['and', 'The instruction \'and x, y\' performs a bitwise AND between the content of y and x. The result is stored in x. (similar to x &= y)'],
      ['or', 'The instruction \'or x, y\' performs a bitwise OR between the content of y and x. The result is stored in x. (similar to x |= y)'],
      ['xor', 'The instruction \'xor x, y\' performs a bitwise XOR between the content of y and x. The result is stored in x. (similar to x ^= y)'],
      ['not', 'The instruction \'not x\' inverts x bitwise - 0 becomes 1 and 1 becomes 0 (similar to x = ~x)'],
      // Special
      ['lea', 'The instruction \'lea x, [y*A+z]\' (\'load effective address\') performs address calculations in the right-hand operand and stores the result in x.'],
    ]);

    const getInstructionDescription = () => (props.instructionName ? instructionDescriptors.get(props.instructionName) : '');

    const getLeftText = () => getInputNamesForExecutionBox(props.accessedElements);

    const getRightText = () => getOutputNamesForExecutionBox(props.accessedElements);

    const animationIdRegister = (locationId: string, write: boolean, index: number): string => getAnimationIdRegister(locationId, write, index);

    const animationIdMemory = (locationId: string, write: boolean, index: number): string => getAnimationIdMemory(locationId, write, index);

    const animationIdFlag = (locationId: string, write: boolean): string => getAnimationIdFlag(locationId, write);

    const animationIdImmediate = (locationId: string): string => getAnimationIdImmediate(locationId);

    const animationZoneIdRegister = (name: string, write: boolean, index: number): string => getAnimationZoneIdRegister(name, write, index);

    const animationZoneIdMemory = (address: string, write: boolean, index: number): string => getAnimationZoneIdMemory(address, write, index);

    const animationZoneIdFlags = (write: boolean): string => getAnimationZoneIdFlags(write);

    const animationZoneIdJumpDestination = (name: string, write: boolean, index: number): string => getAnimationZoneIdJumpDestination(name, write, index);

    const animationIdJumpDestination = (locationId: string, write: boolean, index: number): string => getAnimationIdJumpDestination(locationId, write, index);

    const animationZoneIdImmediate = (address: string): string => getAnimationZoneIdImmediate(address);

    return {
      animationZoneIdImmediate,
      animationIdJumpDestination,
      animationZoneIdJumpDestination,
      animationZoneIdFlags,
      animationZoneIdMemory,
      animationZoneIdRegister,
      animationIdImmediate,
      animationIdFlag,
      animationIdMemory,
      animationIdRegister,
      getRightText,
      getLeftText,
      getInstructionDescription,
      magicBox,
    };
  },
});
</script>

<style scoped>

/* Execution Box - START */
.magicBox {
  background-color: var(--executionBoxColor);
  color: var(--baseFontColor);
  height: var(--fullHeight);
  width: var(--boxWidth);
  display: flex;
  position: absolute;
  z-index: 1;
  border-radius: calc(var(--borderRadiusSize) * 0.66);
  padding: calc(var(--byteSize) * 0.68) 0;
  justify-content: space-between;
  transform: translateX(calc(var(--fullWidth) - var(--boxWidth)));
  font-size: calc(var(--byteSize) * 1);
  line-height: calc(var(--byteSize) * 1.25);
}

.leftTextItem {
  padding-left: calc(var(--byteSize) * 0.3125);
  margin: calc(var(--byteSize) * 0.125) 0;
}

.rightTextItem {
  padding-right: calc(var(--byteSize) * 0.3125);
  margin: calc(var(--byteSize) * 0.125) 0;
  text-align: end;
}

.instructionNameClass {
  font-size: calc(var(--byteSize) * 2.5);
  padding: calc(var(--byteSize) * 1.5) calc(var(--byteSize) * 4);
  position: absolute;
}
/* This class is added dynamically in the services. Look at htmlClass in htmlIds.ts */
.magicBoxLeft {
  animation: animateMagicBoxLeft 0.5s;
  transform: translateX(0px) !important;
}

@keyframes animateMagicBoxLeft {
  from {
    transform: translateX(calc(var(--fullWidth) - var(--boxWidth)));
  }
  to {
    transform: translateX(0px);
  }
}

@keyframes animateMagicBoxRight {
  from {
    transform: translateX(0px);
  }
  to {
    transform: translateX(calc(var(--fullWidth) - var(--boxWidth)));
  }
}
/* Execution Box - END */

/* Animation Bytes - START */
.animationBytesContainer {
  --fullWidth: calc(var(--byteSize) * 23);
  --fullHeight: calc(var(--byteSize) * 7.6);
  --boxWidth: calc(var(--byteSize) * 11.5);
  --byteZonesWidth: calc(var(--byteSize) * 11);
  --paddingExecBoxY: calc(var(--byteSize) * 0.68);
  --paddingExecBoxX: calc(var(--byteSize) * 0.25);
  display: flex;
  width: var(--fullWidth);
  justify-content: space-between;
  height: var(--fullHeight);
  margin-bottom: var(--paddingSize);
}

.leftAnimationBytes {
  padding: var(--paddingExecBoxY) 0 var(--paddingExecBoxY) var(--paddingExecBoxX);
}

.rightAnimationBytes {
  padding: var(--paddingExecBoxY) var(--paddingExecBoxX) var(--paddingExecBoxY) 0;
}

.animationBytesZone {
  width: var(--byteZonesWidth);
  background-color: var(--executionBoxByteZoneColor);
  border-radius: calc(var(--byteSize) * 0.625);
  padding: 0;
  margin: calc(var(--byteSize) * 0.125) 0;
  line-height: 0;
}

.animationBytesZone .hideBytes {
  visibility: hidden;
}
/* This class is added dynamically in the services. Look at htmlClass in htmlIds.ts */
.showBytes .hideBytes {
  visibility: visible !important;
}

.animationByte {
  display: inline;
}

/* To get a start and end for the immediate animation we duplicate the */
/* immediate byte in html take it out of the flow and move the start   */
/* byte to the current instruction box below the assembly.             */
.offsetImmediateToInstructionBox {
  --offsetPadding: calc(var(--paddingSize) * 2);
  --offsetPaddingBox: calc(var(--paddingExecBoxY) *2);
  --offsetPaddingFinal: calc(calc(var(--offsetPadding) + var(--offsetPaddingBox)) * -1);
  --offsetX: calc(var(--byteSize) * 8);
  transform: translate(var(--offsetX), var(--offsetPaddingFinal));
  position: absolute;
}
/* Animation Bytes - END */
</style>
