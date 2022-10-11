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
  name: 'Scaling',
};

</script>

<style>
@media screen
and (min-height: 850px) {
  @media screen and (min-width: 1100px) { :root {
      --borderRadiusSize: calc(var(--byteSize) * 0.6);
      --byteSize: calc(0.3rem + 1vw);
    }
  }
  @media screen
  and (min-width: 850px)
  and (max-width: 1100px) {
    :root {
      --byteSize: calc(0.2rem + 1vw);
    }
  }
}

@media screen
and (min-height: 600px)
and (max-height: 850px) {
  @media screen
  and (min-width: 1100px) {
    :root {
      --byteSize: calc(0.5rem + 1vh);
    }
  }
  @media screen
  and (max-width: 1100px)
  and (min-width: 950px) {
    :root {
      --byteSize: calc(0.2rem + 1vw);
    }
  }
  @media screen
  and (min-width: 850px)
  and (max-width: 950px) {
    :root {
      --byteSize: calc(0.3rem + 1vw);
      --paddingSize: calc(var(--byteSize) * 0.5);
      --borderRadiusSize: calc(var(--byteSize) * 0.4);
    }
  }
}

@media screen
and (min-height: 450px)
and (max-height: 600px) {
  @media screen
  and (min-width: 950px) {
    :root {
      --byteSize: calc(0.4rem + 1vh);
    }
  }
  @media screen
  and (min-width: 850px)
  and (max-width: 950px) {
    :root {
      --byteSize: calc(0.2rem + 1vw);
      --paddingSize: calc(var(--byteSize) * 0.5);
      --borderRadiusSize: calc(var(--byteSize) * 0.4);
    }
  }
}

@media screen
and (max-height: 450px) {
  :root {
    --byteSize: calc(0.4rem + 1vh);
    --paddingSize: calc(var(--byteSize) * 0.2);
    --borderRadiusSize: calc(var(--byteSize) * 0.4);
  }
}

@media screen
and (max-width: 850px) {
  :root {
    --byteSize: calc(0.2rem + 1vw);
    --paddingSize: calc(var(--byteSize) * 0.5);
    --borderRadiusSize: calc(var(--byteSize) * 0.4);
  }
}

@media screen
and (max-width: 740px) {
  :root {
    --paddingSize: calc(var(--byteSize) * 0.4);
  }

  body {
    font-size: var(--byteSize) !important;
  }
}
</style>
