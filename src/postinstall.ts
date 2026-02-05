#!/usr/bin/env node

import { checkGhostscriptInstalled } from './utils.js';

const RESET = '\x1b[0m';
const GREEN = '\x1b[32m';
const CYAN = '\x1b[36m';
const GRAY = '\x1b[90m';
const BOLD = '\x1b[1m';

// Clean, minimal progress bar
function showProgress(message: string, percentage: number) {
  const barLength = 50;
  const filled = Math.floor((percentage / 100) * barLength);
  const empty = barLength - filled;
  const bar = '■'.repeat(filled) + '□'.repeat(empty);
  
  process.stdout.write(`\r${CYAN}${message}${RESET}\n${bar} ${percentage}%`);
}

async function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function animateInstall() {
  const version = '1.0.0';
  console.log(`\n${BOLD}${CYAN}Installing pdfp version: ${version}${RESET}`);
  
  // Simulate installation progress
  for (let i = 0; i <= 100; i += 2) {
    showProgress('', i);
    await sleep(20);
  }
  
  console.log('\n');
}

async function main() {
  try {
    await animateInstall();
    
    // Check if Ghostscript is installed
    const gsInstalled = checkGhostscriptInstalled();
    
    if (gsInstalled) {
      console.log(`${GREEN}✓${RESET} ${BOLD}Ghostscript detected${RESET}`);
      console.log(`${GREEN}✓${RESET} ${BOLD}pdfp is ready to use${RESET}`);
      console.log(`\n${GRAY}Run ${CYAN}pdfp${GRAY} to start compressing PDF files${RESET}\n`);
    } else {
      console.log(`${GRAY}⚠ Ghostscript not detected${RESET}`);
      console.log(`${GRAY}pdfp requires Ghostscript to compress PDF files${RESET}`);
      console.log(`\n${GRAY}Install Ghostscript:${RESET}`);
      
      const platform = process.platform;
      if (platform === 'darwin') {
        console.log(`  ${CYAN}brew install ghostscript${RESET}`);
      } else if (platform === 'linux') {
        console.log(`  ${CYAN}sudo apt-get install ghostscript${RESET}`);
      } else if (platform === 'win32') {
        console.log(`  ${CYAN}Download from https://www.ghostscript.com/download/gsdnld.html${RESET}`);
      }
      
      console.log(`\n${GRAY}Then run ${CYAN}pdfp${GRAY} to start${RESET}\n`);
    }
  } catch (error) {
    // Silently fail - postinstall errors shouldn't block installation
    process.exit(0);
  }
}

main();
