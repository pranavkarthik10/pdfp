import { spawn } from 'child_process';
import fs from 'fs';
import {
  CompressionSettings,
  CompressionResult,
  FileInfo,
  QualityLevel,
} from '../types.js';
import { generateOutputPath, deleteFile, getGhostscriptCommand } from '../utils.js';

interface CompressionProgress {
  percentage: number;
}

// Ghostscript PDFSETTINGS mapping
const PDF_SETTINGS: Record<QualityLevel, string> = {
  screen: '/screen',    // 72dpi, lowest quality
  ebook: '/ebook',      // 150dpi, medium quality
  printer: '/printer',  // 300dpi, high quality
  prepress: '/prepress', // 300dpi+, highest quality
};

export class CompressionService {
  private calculateResult(
    fileInfo: FileInfo,
    outputPath: string,
    startTime: number
  ): CompressionResult {
    const outputSize = fs.statSync(outputPath).size;
    const savedBytes = fileInfo.size - outputSize;
    const savedPercentage = (savedBytes / fileInfo.size) * 100;
    const duration = (Date.now() - startTime) / 1000;

    // If compression didn't reduce size, delete output and mark as already optimized
    if (outputSize >= fileInfo.size) {
      try {
        fs.unlinkSync(outputPath);
      } catch {
        // Ignore deletion errors
      }
      return {
        inputPath: fileInfo.path,
        outputPath: fileInfo.path, // Point back to original file
        inputSize: fileInfo.size,
        outputSize: fileInfo.size, // No change
        savedBytes: 0,
        savedPercentage: 0,
        duration,
        alreadyOptimized: true,
      };
    }

    return {
      inputPath: fileInfo.path,
      outputPath,
      inputSize: fileInfo.size,
      outputSize,
      savedBytes,
      savedPercentage,
      duration,
    };
  }

  async compressPDF(
    fileInfo: FileInfo,
    settings: CompressionSettings,
    onProgress: (progress: CompressionProgress) => void
  ): Promise<CompressionResult> {
    const startTime = Date.now();
    const outputPath = generateOutputPath(fileInfo.path, settings.advanced);
    const pdfSettings = PDF_SETTINGS[settings.quality];
    const gsCommand = getGhostscriptCommand();

    return new Promise((resolve, reject) => {
      // Simulate progress since Ghostscript doesn't provide progress updates
      let progress = 0;
      const progressInterval = setInterval(() => {
        progress += Math.random() * 15;
        if (progress > 90) progress = 90;
        onProgress({ percentage: progress });
      }, 500);

      const args = [
        '-sDEVICE=pdfwrite',
        '-dCompatibilityLevel=1.4',
        `-dPDFSETTINGS=${pdfSettings}`,
        '-dNOPAUSE',
        '-dQUIET',
        '-dBATCH',
        `-sOutputFile=${outputPath}`,
        fileInfo.path,
      ];

      const gsProcess = spawn(gsCommand, args);

      gsProcess.on('close', (code) => {
        clearInterval(progressInterval);
        onProgress({ percentage: 100 });

        if (code === 0) {
          const result = this.calculateResult(fileInfo, outputPath, startTime);
          // Handle input file removal (only if compression was successful)
          if (settings.removeInputFile && !result.alreadyOptimized) {
            deleteFile(fileInfo.path);
            result.inputFileRemoved = true;
          }
          resolve(result);
        } else {
          reject(new Error(`Ghostscript exited with code ${code}`));
        }
      });

      gsProcess.on('error', (err) => {
        clearInterval(progressInterval);
        if (err.message.includes('ENOENT')) {
          reject(new Error('Ghostscript is not installed. Please install Ghostscript first.'));
        } else {
          reject(new Error(`Ghostscript error: ${err.message}`));
        }
      });
    });
  }

  async compress(
    fileInfo: FileInfo,
    settings: CompressionSettings,
    onProgress: (progress: CompressionProgress) => void
  ): Promise<CompressionResult> {
    return this.compressPDF(fileInfo, settings, onProgress);
  }
}
