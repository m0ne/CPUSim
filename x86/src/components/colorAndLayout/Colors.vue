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
  <div></div>
</template>

<script>

export default {
  name: 'Colors',
};
</script>

<style>
:root.light {
  /* Main colors */
  --primaryColor: #cee5d0; /* background color of all primary elements */
  --elementColor: #f3f0d7; /* background color of secondary elements contained within primary elements */
  --quasarSecondary: #fed2aa; /* color of Quasar GUI elements (toggles, buttons, sliders) */
  --backgroundColor: #d9d9d9; /* main background color */
  --baseFontColor: black;
  --byteFontColor: black;
  --buttonFontColor: black;

  /* Memory */
  --memoryAddressColor: var(--elementColor);
  --memoryBlockColor: var(--primaryColor);
  --memoryByteHeaderColor: var(--elementColor);

  /* CPU */
  --cpuBlockColor: var(--primaryColor);
  --currentInstructionBlockColor: var(--elementColor);
  --currentInstructionAssemblyBlockColor: var(--registerColor);
  --executionBoxColor:  var(--elementColor);
  --executionBoxByteZoneColor: var(--registerColor);
  --instructionPointerBlockColor: var(--elementColor);
  --registerBlockColor: var(--elementColor);
  --registerColor: #d6d2d2;
  --byteCPUColor: var(--registerColor);

  /* Attention animation color */
  --attentionPulseColor: var(--backgroundColor);

  /* CPU Cycle Box */
  --cpuCycleBoxBorderColor: #ccc;
  --stepAvatarBackgroundColor: floralwhite;
  --pastStepFontColor: #949494;
  --currentFutureStepFontColor: var(--buttonFontColor);
  --currentStepBackgroundColor: #aa6e03;
  --pastStepBackgroundColor: #b0b0b0;
  --stepBackgroundColor: var(--quasarSecondary);

  /* Editor */
  --editorBackgroundColor: var(--elementColor); /* color of the field inside code viewer*/
  --editorFontColor: var(--baseFontColor);
  --editorBoxBackgroundColor: var(--primaryColor);
  --editorErrorBoxColor: #b32727;
  --editorErrorBoxFontColor: #FFFFFF;
  --licenseButtonColor: var(--primaryColor);

  /* Code Viewer */
  --breakpointColor: #d24f4f;
  --conditionalSelected: blue;
  --activeLineColor: #e3dca1;

  /* Byte color */
  --byteBackgroundColor: white;
  --unusedByteBackgroundColor: #9c9c9c;
  --unusedByteFontColor: #00000066;
  --instructionByteBackgroundColor: lightgoldenrodyellow;
  --baseByteBackgroundColor: lightblue;
  --stackByteBackgroundColor: #F9BDA5;
  --basePointerColor: #0004ff;
  --stackPointerColor: #931953;
  --stackPointerTextFontColor: white;
  --basePointerTextFontColor: white;
  --stackPointerTextBackgroundColor: #931953;
  --basePointerTextBackgroundColor: #0004ff;
  --instructionPointerTextBackgroundColor: var(--instructionByteBackgroundColor);
  --instructionPointerTextBorderColor: #0e00f2;
  --instructionPointerByteBorderColor: #1000ff;
  --evenInstructionColor: #48c3f7;
  --unevenInstructionColor: #f0ac59;
  /* even: #44b3e3 */
  /* uneven: #32e370 */

  /* Quasar related colors like buttons */
  --quasarPrimary: var(--quasarSecondary);
  --quasarAccent: var(--quasarSecondary);
  --quasarDark: #1D1D1D;
  --quasarPositive: #21BA45;
  --quasarNegative: #C10015;
  /* --quasarInfo: #31CCEC; */
  --quasarInfo: var(--baseFontColor);
  --quasarWarning: #F2C037;
}

:root.light {
  color: var(--baseFontColor);
}

:root.dark {
  /* Main colors */
  --primaryColor: #2d2d2d;; /* background color of all primary elements */
  --elementColor: #0e087c; /* background color of secondary elements contained within primary elements */
  --quasarSecondary: var(--primaryColor); /* color of Quasar GUI elements (toggles, buttons, sliders) */
  --backgroundColor: #727272; /* main background color */
  --baseFontColor: white;
  --byteFontColor: black;
  --buttonFontColor: white;

  /* Memory */
  --memoryAddressColor: var(--elementColor);
  --memoryBlockColor: var(--primaryColor);
  --memoryByteHeaderColor: var(--elementColor);

  /* CPU */
  --cpuBlockColor: var(--primaryColor);
  --currentInstructionBlockColor: var(--elementColor);
  --currentInstructionAssemblyBlockColor: var(--unusedByteBackgroundColor);
  --executionBoxColor:  var(--elementColor);
  --executionBoxByteZoneColor: var(--unusedByteBackgroundColor);
  --instructionPointerBlockColor: var(--elementColor);
  --registerBlockColor: var(--elementColor);
  --registerColor: var(--unusedByteBackgroundColor);
  --byteCPUColor: var(--unusedByteBackgroundColor);

  /* Attention animation color */
  --attentionPulseColor: var(--backgroundColor);

  /* CPU Cycle Box */
  --cpuCycleBoxBorderColor: #ccc;
  --stepAvatarBackgroundColor: floralwhite;
  --pastStepFontColor: #949494;
  --currentFutureStepFontColor: white;
  --currentStepBackgroundColor: var(--quasarSecondary);
  --pastStepBackgroundColor: #6c6c6c;
  --stepBackgroundColor: #5a5959;

  /* Editor */
  --editorBackgroundColor: #3c3b3b; /* color of the field inside code viewer #2d2d2d;*/
  --editorFontColor: #ccc;
  --editorBoxBackgroundColor: var(--primaryColor);
  --editorErrorBoxColor: #b32727;
  --editorErrorBoxFontColor: #FFFFFF;
  --licenseButtonColor: var(--primaryColor);

  /* Code Viewer */
  --breakpointColor: #d24f4f;
  --conditionalSelected: blue;
  --activeLineColor: grey;

  /* Byte color */
  --byteBackgroundColor: white;
  --unusedByteBackgroundColor: #7a7a7a;
  --unusedByteFontColor: #00000033;
  --instructionByteBackgroundColor: lightgoldenrodyellow;
  --baseByteBackgroundColor: lightblue;
  --stackByteBackgroundColor: #F9BDA5;
  --basePointerColor: #0004ff;
  --stackPointerColor: #931953;
  --stackPointerTextFontColor: white;
  --basePointerTextFontColor: white;
  --stackPointerTextBackgroundColor: #931953;
  --basePointerTextBackgroundColor: #0004ff;
  --instructionPointerTextBackgroundColor: var(--stepBackgroundColor);
  --instructionPointerTextBorderColor: #0e00f2;
  --instructionPointerByteBorderColor: #1000ff;
  --evenInstructionColor: #48c3f7;
  --unevenInstructionColor: #f0ac59;

  /* Quasar related colors like buttons */
  --quasarPrimary: var(--quasarSecondary);
  --quasarAccent: var(--quasarSecondary);
  --quasarDark: #1D1D1D;
  --quasarPositive: #21BA45;
  --quasarNegative: #C10015;
  --quasarInfo: var(--baseFontColor);
  --quasarWarning: #F2C037;
}
:root.dark {
  color: var(--baseFontColor);
}

:root.legacy{
  /* Main font color */
  --baseFontColor: #000;

  /* Memory */
  --byteCPUColor:  #ffff64;
  --memoryBlockColor:  #f9c9d0;
  --memoryByteHeaderColor: var(--byteCPUColor);

  /* CPU */
  --cpuBlockColor: #ccebf5;
  --currentInstructionBlockColor: #5cafff;
  --currentInstructionAssemblyBlockColor: #ffffff;
  --executionBoxColor:  #7fcc62;
  --executionBoxByteZoneColor: #0000001c;
  --instructionPointerBlockColor: #ffffc6;
  --registerBlockColor: #ff6161;;
  --registerColor: #ffffff7a;

  /* Main background color */
  --backgroundColor: #e9e9e9;

  /* Attention animation color */
  --attentionPulseColor: #ccaa2c;

  /* CPU Cycle Box */
  --cpuCycleBoxBorderColor: #ccc;
  --currentStepBackgroundColor: orange;
  --pastStepFontColor: grey;
  --currentStepFontColor: var(--baseFontColor);
  --stepAvatarBackgroundColor: floralwhite;
  --currentFutureStepFontColor: black;
  --pastStepBackgroundColor: #b0b0b0;
  --stepBackgroundColor: #e0e0e0;

  /* Editor */
  --editorBackgroundColor: #2d2d2d;
  --editorFontColor: #ccc;
  --editorBoxBackgroundColor: #d0d6ff;
  --editorErrorBoxColor: #b32727;
  --editorErrorBoxFontColor: #FFFFFF;
  --licenseButtonColor: #808080;

  /* Code Viewer */
  --breakpointColor: #d24f4f;
  --conditionalSelected: blue;

  /* Byte color */
  --byteBackgroundColor: white;
  --unusedByteBackgroundColor: #ffffff7a;
  --unusedByteFontColor: #00000033;
  --instructionByteBackgroundColor: lightgoldenrodyellow;
  --baseByteBackgroundColor: lightblue;
  --stackByteBackgroundColor: #F9BDA5;
  --basePointerColor: #0004ff;
  --stackPointerColor: #931953;
  --stackPointerTextFontColor: white;
  --basePointerTextFontColor: white;
  --stackPointerTextBackgroundColor: #931953;
  --basePointerTextBackgroundColor: #0004ff;
  --instructionPointerTextBackgroundColor: #fafad2;
  --instructionPointerTextBorderColor: #0e00f2;
  --instructionPointerByteBorderColor: #1000ff;

  /* Quasar related colors like buttons */
  --quasarPrimary: var(--quasarSecondary);
  --quasarSecondary: #26A69A;
  --quasarAccent: var(--quasarSecondary);
  --quasarDark: #1D1D1D;
  --quasarPositive: #21BA45;
  --quasarNegative: #C10015;
  --quasarInfo: var(--baseFontColor);
  --quasarWarning: #F2C037;
  --buttonFontColor: black;
}
:root.legacy {
  color: var(--baseFontColor);
}
</style>
