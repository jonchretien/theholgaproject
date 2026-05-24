# 📷 The Holga Project

A browser-based photo editor that applies Holga camera-style filters to images using HTML5 Canvas API. Drag and drop a photo from your desktop to apply vintage black & white effects with vignetting, blur, and overexposure.

[**theholgaproject**](https://projects.jonchretien.com/theholgaproject/)

## Tech Stack

- **TypeScript** 5.9+ with strict mode enabled
- **Vite** for development and production builds
- **Vitest** testing framework with 243 tests
- **HTML5 APIs**: Canvas, Drag & Drop, FileReader
- **Architecture**: Finite State Machine, Pub/Sub pattern, Dependency Injection

## Development

### First-Time Setup

Install [node.js](https://nodejs.org/en/) through [nvm](https://github.com/nvm-sh/nvm?tab=readme-ov-file#installing-and-updating) and [pnpm](https://pnpm.io/installation), then install all dependencies:

```bash
pnpm install
```

### Available Commands

```bash
# Start development server
pnpm dev

# Run tests (watch mode)
pnpm test

# Run tests (single run)
pnpm test -- --run

# Run tests with UI
pnpm test:ui

# Run tests with coverage report
pnpm test:coverage

# Type-check TypeScript
pnpm type-check

# Build for production (runs type-check + tests + build)
pnpm build

# Build for production (skip checks)
pnpm build:skip-checks

# Preview production build
pnpm preview
```

### Project Structure

```
src/
├── components/     # UI components (Canvas, Buttons, Heading)
├── config/         # Configuration values for effects and UI
├── lib/            # Core libraries (effects, browser support)
├── state/          # State management (FSM, PubSub, Store)
├── strings/        # UI message strings
├── types/          # TypeScript type definitions and custom errors
├── utils/          # Utility functions (DOM, validation)
└── main.ts         # Application entry point
```

## Features

- **Drag & Drop Upload**: Drop any image file (JPEG, PNG, WebP, GIF) onto the canvas
- **File Validation**: Checks file type, size (max 10MB), and format before processing
- **Black & White Filter**: Grayscale conversion with weighted RGB values for natural monochrome
- **Blur Effect**: Soft focus simulation mimicking toy camera lens imperfections
- **Vignette Effect**: Radial darkening at edges with center glow for authentic Holga look
- **Image Export**: Save processed images as PNG files
- **Error Recovery**: Graceful error handling with retry/reset options
- **Browser Support Detection**: Checks for required HTML5 APIs before initialization
- **Type-Safe**: Full TypeScript coverage with strict mode enabled
- **Comprehensive Tests**: 243 tests ensuring code quality and reliability

## To Do

- Add progress bar for file uploads
- Add offline support with Service Worker
- Add image preview before applying effects
- Support for multiple image formats in export (JPEG, WebP)

## Resources

- Robert Fleischmann's vignette filter from [vintageJS](https://github.com/rendro/vintageJS/blob/master/src/vintage.js)
- Matt Riggott's [Gaussian Blur experiments](http://www.flother.com/blog/2010/image-blur-html5-canvas/)
- [Canvas2Image](https://github.com/hongru/canvas2image)
- [Mozilla Developer Network](https://developer.mozilla.org/en/HTML/Canvas)
- [HTML5 Demos](http://html5demos.com/)
- [Stack Overflow](http://stackoverflow.com/)
- [HTML5 Canvas Tutorials](http://www.html5canvastutorials.com/)
