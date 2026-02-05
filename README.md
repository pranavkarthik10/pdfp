# Chunk

Fast PDF compression for your terminal. Beautiful, interactive CLI tool powered by Ghostscript.

## Installation

```bash
npm install -g chunk
```

Then run:

```bash
chunk
```

## Prerequisites

Ghostscript must be installed:

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

Simply run `chunk` and follow the interactive prompts. Compressed files are saved with a `-chunked` suffix in the same directory (or your chosen output folder). Run `chunk auto {path_to_pdf}` to compress files skipping questions.

## License

MIT
