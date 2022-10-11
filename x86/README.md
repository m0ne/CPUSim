# CPUSim - A Graphical CPU Simulator - Setup

_For all commands make sure you are in the `x86` directory, not in the repository root._

## Project setup and build

This project uses [npm](https://www.npmjs.com/) for packaging and dependency management. npm comes usually with [node.js](https://nodejs.org/en/).

**1. Navigate to the x86 directory**

```bash
cd x86
```

**2. Install dependencies**

```bash
npm install
```

**3. Increase memory limit**

Building can cause out of memory errors to occurs when running node binaries. To avoid this use the NODE_OPTIONS environment variable to increase the memory limit.

Windows powershell:

```bash
set NODE_OPTIONS=--max_old_space_size=4096
```

Linux and macOS:

```bash
export NODE_OPTIONS=--max_old_space_size=4096
```

**4. Build**

Build and pack into a single HTML for production

Can take up to 30 minutes

```bash
npm run build:prod
```

Build artefact: `x86/dist/index.html`

## Development

Open the `x86` directory with an IDE like JetBrains WebStorm

**Builds, starts and hot-reloads the app for development**

Takes quite long the first time

```bash
npm run serve
```

_Use `CTRL`+ `C` to stop the app._

**Build and pack for production**

Can take up to 30 minutes

```bash
npm run build:prod
```

Build artefacts: `x86/dist/*`

**Run unit tests**

```bash
npm run test:unit
```

**Lint the project**

```bash
npm run lint
```

**Lint the project and fixes files**

```bash
npm run lint --fix
```

## Overview

- Project is written in [TypeScript](https://www.typescriptlang.org) as a [Vue.js](https://vuejs.org/) single page application
- [Quasar Vue CLI Plugin](https://quasar.dev/start/vue-cli-plugin) was used for some GUI elements

## External libraries used

External C/C++ libraries are ported to JavaScript using [Emscripten](https://emscripten.org/).

### Building external libraries

Build manuals and patches for external libraries can be found in [libraryPatches](libraryPatches).

#### Unicorn.js

For the x64 emulation we use the [Unicorn Engine](https://www.unicorn-engine.org/).
We use converted, modified and extended wrapper code from [Unicorn.js](https://github.com/AlexAltea/unicorn.js/blob/7ccd46b951f1df4c35f540acc5d5bc030a6f593d/src/unicorn-wrapper.js) in the [emulatorService](x86/src/services/emulator/emulatorService.ts).

#### Capstone.js

To get instruction details we use the [Capstone disassembly engine](http://www.capstone-engine.org/).
We use converted, modified and extended wrapper code from [Capstone.js](https://github.com/AlexAltea/capstone.js/blob/75c34477675318ab3423a0c8236eb96b8abed39b/src/capstone-wrapper.js) in the [disassemblerService](x86/src/services/disassembler/disassemblerService.ts).

#### NASM and NDISAM

To assemble and disassemble we use [Netwide Assembler and Disassembler](https://www.nasm.us).

## Project structure

- [lib](x86/lib) contains modified and compiled external libraries. Build manuals and patches can be found in [libraryPatches](libraryPatches)
- [dist](x86/dist) contains production build artifacts
- [public](x86/public) contains the main html file that Vue injects its code into
- [src](x86/src) contains the project code
  - [components](x86/src/components) contains Vue pages and components
  - [router](x86/src/router) contains Vue router setup for page navigation
  - [services](x86/src/services) contains application logic and access to external libraries
  - [styles](x86/src/styles) contains CSS for Quasar
- [tests](x86/tests) contains unit tests for Vue components and services
- [typescriptTypes](x86/typescriptTypes) contains declarations for TypeScript
- [vue.config.js](x86/vue.config.js) configuration to set up webpack bundeling
- web project related files

## Introduction to Vue.js

- [VUE Introduction](https://vuejs.org/guide/introduction.html) (scrolling down on this page should give a good overview)

- [More TypeScript with vue](https://vuejs.org/guide/typescript/composition-api.html)

- [Vue CLI Quasar Plugin](https://quasar.dev/start/vue-cli-plugin)

- [Quasar Vue GUI Component Examples](https://quasar.dev/vue-components/button)
