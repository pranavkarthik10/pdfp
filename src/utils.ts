import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { FileInfo, QualityLevel, AdvancedSettings, BatchFileInfo } from './types.js';

// Format utilities
export function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

// Determine if file size should be displayed in KB or MB
export function getFileSizeUnit(bytes: number): 'KB' | 'MB' {
  const MB = 1024 * 1024;
  return bytes < MB ? 'KB' : 'MB';
}

// Convert bytes to the appropriate unit value
export function bytesToUnit(bytes: number, unit: 'KB' | 'MB'): number {
  if (unit === 'KB') {
    return Math.round(bytes / 1024);
  }
  return Math.round((bytes / (1024 * 1024)) * 100) / 100; // 2 decimal places for MB
}

// Convert unit value back to bytes
export function unitToBytes(value: number, unit: 'KB' | 'MB'): number {
  if (unit === 'KB') {
    return value * 1024;
  }
  return value * 1024 * 1024;
}

export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);

  if (mins > 0) {
    return `${mins}m ${secs}s`;
  }
  return `${secs}s`;
}

// Ghostscript utilities
export function checkGhostscriptInstalled(): boolean {
  try {
    execSync('gs --version', { stdio: 'pipe' });
    return true;
  } catch (error) {
    try {
      execSync('gsc --version', { stdio: 'pipe' });
      return true;
    } catch {
      return false;
    }
  }
}

export function getGhostscriptCommand(): string {
  try {
    execSync('gs --version', { stdio: 'pipe' });
    return 'gs';
  } catch {
    return 'gsc';
  }
}

export function getGhostscriptInstallInstructions(): string {
  const platform = process.platform;

  switch (platform) {
    case 'darwin':
      return 'brew install ghostscript';
    case 'linux':
      return 'sudo apt-get install ghostscript  (or)  sudo yum install ghostscript';
    case 'win32':
      return 'Download from https://www.ghostscript.com/download/gsdnld.html';
    default:
      return 'Visit https://www.ghostscript.com/download/gsdnld.html';
  }
}

// File utilities
const SUPPORTED_PDF_FORMATS = ['.pdf'];

export function getFileInfo(filePath: string): FileInfo | null {
  try {
    // Unescape spaces (\ ) and handle quotes
    const cleanPath = filePath.trim().replace(/^["']|["']$/g, '').replace(/\\ /g, ' ');

    if (!fs.existsSync(cleanPath)) {
      return null;
    }

    const stats = fs.statSync(cleanPath);

    if (!stats.isFile()) {
      return null;
    }

    const ext = path.extname(cleanPath).toLowerCase();
    const name = path.basename(cleanPath);

    if (!SUPPORTED_PDF_FORMATS.includes(ext)) {
      return null;
    }

    return {
      path: cleanPath,
      name,
      size: stats.size,
      type: 'pdf',
      extension: ext.slice(1), // Remove the dot
    };
  } catch (error) {
    return null;
  }
}

export function isSupportedFormat(filePath: string): boolean {
  const ext = path.extname(filePath).toLowerCase();
  return SUPPORTED_PDF_FORMATS.includes(ext);
}

// Get all supported files from a folder (non-recursive)
export function getFilesFromFolder(folderPath: string): FileInfo[] {
  try {
    // Unescape spaces (\ ) and handle quotes
    const cleanPath = folderPath.trim().replace(/^["']|["']$/g, '').replace(/\\ /g, ' ');
    
    if (!fs.existsSync(cleanPath)) {
      return [];
    }
    
    const stats = fs.statSync(cleanPath);
    if (!stats.isDirectory()) {
      return [];
    }
    
    const files: FileInfo[] = [];
    const entries = fs.readdirSync(cleanPath);
    
    for (const entry of entries) {
      // Skip hidden files
      if (entry.startsWith('.')) continue;
      
      const fullPath = path.join(cleanPath, entry);
      const fileInfo = getFileInfo(fullPath);
      
      if (fileInfo) {
        files.push(fileInfo);
      }
    }
    
    // Sort by name
    files.sort((a, b) => a.name.localeCompare(b.name));
    
    return files;
  } catch {
    return [];
  }
}

// Check if a path is a directory
export function isDirectory(filePath: string): boolean {
  try {
    // Unescape spaces (\ ) and handle quotes
    const cleanPath = filePath.trim().replace(/^["']|["']$/g, '').replace(/\\ /g, ' ');
    return fs.existsSync(cleanPath) && fs.statSync(cleanPath).isDirectory();
  } catch {
    return false;
  }
}

export function generateOutputPath(inputPath: string, advanced?: AdvancedSettings): string {
  const ext = path.extname(inputPath);
  const dir = advanced?.outputFolder || path.dirname(inputPath);
  const basename = path.basename(inputPath, ext);

  // Base output name with -pdfp suffix
  const baseOutputName = `${basename}-pdfp`;
  let outputPath = path.join(dir, `${baseOutputName}${ext}`);

  // Check for existing files and add incrementing suffix if needed
  let counter = 1;
  while (fs.existsSync(outputPath)) {
    outputPath = path.join(dir, `${baseOutputName}-${counter}${ext}`);
    counter++;
  }

  return outputPath;
}

// Validate if a directory exists
export function isValidDirectory(dirPath: string): boolean {
  try {
    // Unescape spaces (\ ) and handle quotes
    const cleanPath = dirPath.trim().replace(/^["']|["']$/g, '').replace(/\\ /g, ' ');
    return fs.existsSync(cleanPath) && fs.statSync(cleanPath).isDirectory();
  } catch {
    return false;
  }
}

export function getSupportedFormats(): string {
  return SUPPORTED_PDF_FORMATS.map(ext => ext.replace('.', '')).join(', ');
}

// Delete a file safely
export function deleteFile(filePath: string): boolean {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

// File size prediction based on quality level
export function estimateCompressedSize(originalSize: number, quality: QualityLevel): number {
  // Estimation ratios based on typical Ghostscript PDF compression results
  let compressionRatio: number;
  
  switch (quality) {
    case 'screen':
      // Lowest quality, smallest file size
      compressionRatio = 0.3;
      break;
    case 'ebook':
      // Medium quality
      compressionRatio = 0.5;
      break;
    case 'printer':
      // High quality
      compressionRatio = 0.7;
      break;
    case 'prepress':
      // Highest quality
      compressionRatio = 0.85;
      break;
    default:
      compressionRatio = 0.5;
  }
  
  return Math.round(originalSize * compressionRatio);
}

// Batch processing utilities

// Generate a unique ID for batch files
export function generateBatchId(): string {
  return Math.random().toString(36).substring(2, 9);
}

// Validate batch files - all must be PDF
export function validateBatchFiles(files: FileInfo[]): { valid: boolean; error?: string } {
  if (files.length === 0) {
    return { valid: false, error: 'No valid files found' };
  }

  if (files.length === 1) {
    return { valid: true };
  }

  // All files must be PDF
  const allPdf = files.every(f => f.type === 'pdf');

  if (!allPdf) {
    return {
      valid: false,
      error: 'All files must be PDF files',
    };
  }

  return { valid: true };
}

// Convert FileInfo array to BatchFileInfo array
export function toBatchFiles(files: FileInfo[]): BatchFileInfo[] {
  return files.map(file => ({
    ...file,
    id: generateBatchId(),
    status: 'pending' as const,
    progress: 0,
  }));
}

// Calculate total size of files
export function calculateTotalSize(files: FileInfo[]): number {
  return files.reduce((total, file) => total + file.size, 0);
}

/**
 * Development helper to validate conditional rendering
 * Use this during development to ensure all required data exists before rendering
 * 
 * @example
 * if (!validateRenderCondition({ files, primaryFile, quality })) {
 *   console.warn('Missing required data for render');
 * }
 */
export function validateRenderCondition(conditions: Record<string, any>): boolean {
  return Object.entries(conditions).every(([key, value]) => {
    if (value === undefined || value === null) {
      if (process.env.NODE_ENV === 'development') {
        console.warn(`[Render Validation] Missing required data: ${key}`);
      }
      return false;
    }
    if (Array.isArray(value) && value.length === 0) {
      if (process.env.NODE_ENV === 'development') {
        console.warn(`[Render Validation] Empty array: ${key}`);
      }
      return false;
    }
    return true;
  });
}
