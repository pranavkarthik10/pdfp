#!/usr/bin/env node

import React, { useState } from 'react';
import { render } from 'ink';
import { App } from './App.js';
import { Setup } from './Setup.js';
import { AutoCompress } from './AutoCompress.js';
import { checkGhostscriptInstalled } from './utils.js';

// Handle command line arguments
const args = process.argv.slice(2);

if (args.includes('--help') || args.includes('-h')) {
  console.log(`
pdfp - Fast PDF compression for your terminal

Usage:
  pdfp                  Start the interactive CLI
  pdfp auto <file>      Quick compress a single PDF (ebook quality, no questions)
  pdfp setup            Run setup manually
  pdfp setup --force    Run setup flow even if Ghostscript is installed
  pdfp --help           Show this help message
  pdfp --version        Show version number

Supported formats:
  PDF files only

Requirements:
  - Ghostscript must be installed on your system
  - Install via: brew install ghostscript (macOS)
              or: sudo apt-get install ghostscript (Linux)

Examples:
  pdfp                           Start interactive mode
  pdfp auto /path/to/file.pdf    Quick compress with defaults
  `);
  process.exit(0);
}

if (args.includes('--version') || args.includes('-v')) {
  console.log('pdfp v1.0.0');
  process.exit(0);
}

// Main wrapper that handles setup -> app flow
interface MainProps {
  forceSetup?: boolean;
}

const Main: React.FC<MainProps> = ({ forceSetup = false }) => {
  const isGhostscriptInstalled = checkGhostscriptInstalled();
  const needsSetup = !isGhostscriptInstalled || forceSetup;
  const [showApp, setShowApp] = useState(!needsSetup);

  const handleSetupComplete = () => {
    setShowApp(true);
  };

  if (showApp) {
    return <App />;
  }

  return <Setup forceSetup={forceSetup} onComplete={handleSetupComplete} />;
};

// Handle commands
if (args[0] === 'setup') {
  const forceSetup = args.includes('--force') || args.includes('-f');
  render(<Main forceSetup={forceSetup} />);
} else if (args[0] === 'auto') {
  // Auto compress command - quick compression with defaults
  const filePath = args.slice(1).join(' '); // Join in case path has spaces

  if (!filePath) {
    console.log('Usage: pdfp auto <file>');
    console.log('Example: pdfp auto /path/to/file.pdf');
    process.exit(1);
  }

  // Check Ghostscript first
  if (!checkGhostscriptInstalled()) {
    console.log('Error: Ghostscript is not installed.');
    console.log('Install via: brew install ghostscript (macOS) or sudo apt-get install ghostscript (Linux)');
    process.exit(1);
  }

  render(<AutoCompress filePath={filePath} />);
} else {
  render(<Main />);
}
