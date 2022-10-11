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
  name: 'AnimationHelper',
};
</script>

<style>
:root {
  --leftTranslate: 0;
  --topTranslate: 0;
  --firstLeftTranslate: 0;
  --firstTopTranslate: 0;
  --secondLeftTranslate: 0;
  --secondTopTranslate: 0;
  --animationSpeed: 1.0;
}
/* This class is added dynamically in the services. Look at htmlClass in htmlIds.ts */
.moveByte {
  animation: animationMoveByte calc(2s / var(--animationSpeed));
}

@keyframes animationMoveByte {
  from {
    transform: translate( 0px, 0px);
  }

  to {
    transform: translate( var(--leftTranslate), var(--topTranslate));
  }
}
/* This class is added dynamically in the services. Look at htmlClass in htmlIds.ts */
.attention {
  animation: animationAttentionByte calc(1s / var(--animationSpeed));
}

@keyframes animationAttentionByte {
  from {
    transform: rotate(0deg);
  }

  10% {
    transform: rotate(-3deg) scale(0.8, 0.8);
  }

  50% {
    transform: rotate(20deg) scale(1.5, 1.5);
  }

  to {
    transform: rotate(0deg) scale(1, 1);
  }
}
/* This class is added dynamically in the services. Look at htmlClass in htmlIds.ts */
.hide {
  visibility: hidden;
}
/* This class is added dynamically in the services. Look at htmlClass in htmlIds.ts */
.pulse {
  background: var(--attentionPulseColor);
  animation: pulse2 calc(0.75s / var(--animationSpeed));
}
/* This class is added dynamically in the services. Look at htmlClass in htmlIds.ts */
.attentionPulse {
  animation-duration: calc(1s / var(--animationSpeed)), calc(1s / var(--animationSpeed));
  animation-name: animationAttentionByte, pulse;
}

@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 var(--shadowIntensityPulse);
  }
  50% {
    box-shadow: 0 0 0 calc(var(--byteSize) * 6.25) var(--shadowIntensityPulseTransparent);
  }
  100% {
    box-shadow: 0 0 0 0 var(--shadowIntensityPulseTransparent);
  }
}

@keyframes pulse2 {
  0% {
    box-shadow: 0 0 0 0 var(--shadowIntensityPulse);
  }

  100% {
    box-shadow: 0 0 0 calc(var(--byteSize) * 6.25) var(--shadowIntensityPulseTransparent);
  }
}
</style>
