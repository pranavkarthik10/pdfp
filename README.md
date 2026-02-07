# pdfp

Fast PDF compression for your terminal. Beautiful, interactive CLI tool powered by Ghostscript.

![Demo](demo.gif)

## Installation

```bash
npm install -g pdfp
```

Then run:

```bash
pdfp
```

## Prerequisites

Ghostscript is required for PDF compression. It's automatically installed for you, or you can install it manually:

**macOS:** `brew install ghostscript`  
**Linux:** `sudo apt-get install ghostscript`  
**Windows:** Download from [ghostscript.com](https://www.ghostscript.com/download/gsdnld.html)

## Features

- Clean, minimal terminal UI
- PDF compression with multiple quality presets
- Multiple quality presets (screen, ebook, printer, prepress)
- Batch processing support
- Advanced settings (target size, custom output folder)

## Usage

Simply run `pdfp` and follow the interactive prompts. Compressed files are saved with a `-pdfp` suffix in the same directory (or your chosen output folder). Run `pdfp auto {path_to_pdf}` to compress files skipping questions.

## License

MIT
