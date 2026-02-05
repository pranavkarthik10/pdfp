import React, { useState, useEffect } from 'react';
import { Box, Text, useApp } from 'ink';
import { CompressionService } from './services/compression.js';
import { getFileInfo, formatBytes } from './utils.js';
import { CompressionSettings, CompressionResult, FileInfo } from './types.js';
import { Progress, Summary, ErrorBox } from './components.js';

interface AutoCompressProps {
  filePath: string;
}

type AutoStep = 'validating' | 'compressing' | 'done' | 'error';

export const AutoCompress: React.FC<AutoCompressProps> = ({ filePath }) => {
  const { exit } = useApp();
  const [step, setStep] = useState<AutoStep>('validating');
  const [fileInfo, setFileInfo] = useState<FileInfo | null>(null);
  const [progress, setProgress] = useState(0);
  const [startTime, setStartTime] = useState(0);
  const [result, setResult] = useState<CompressionResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const runCompression = async () => {
      // Validate file
      const info = getFileInfo(filePath);
      if (!info) {
        setError(`Invalid file: "${filePath}"\nMake sure the file exists and is a PDF.`);
        setStep('error');
        setTimeout(() => exit(), 2000);
        return;
      }

      // Check for extremely large files and warn user
      const LARGE_FILE_THRESHOLD = 100 * 1024 * 1024; // 100MB

      if (info.size > LARGE_FILE_THRESHOLD) {
        console.log(`⚠️  Warning: File size (${(info.size / 1024 / 1024).toFixed(1)}MB) is large.`);
        console.log('   Compression may take a while.');
      }

      setFileInfo(info);
      setStep('compressing');
      setStartTime(Date.now());

      // Compression settings: ebook quality, keep original, no advanced settings
      const settings: CompressionSettings = {
        quality: 'ebook',
        removeInputFile: false,
      };

      const compressionService = new CompressionService();

      try {
        const compressionResult = await compressionService.compress(
          info,
          settings,
          (progressInfo) => {
            setProgress(progressInfo.percentage);
          }
        );

        setResult(compressionResult);
        setStep('done');
        setTimeout(() => exit(), 100);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Compression failed');
        setStep('error');
        setTimeout(() => exit(), 2000);
      }
    };

    runCompression();
  }, [filePath, exit]);

  return (
    <Box flexDirection="column">
      {/* Header */}
      <Box marginBottom={1}>
        <Text bold color="cyan">Chunk Auto</Text>
        <Text color="gray"> - Quick compress with ebook quality</Text>
      </Box>

      {/* File info */}
      {fileInfo && (
        <Box marginBottom={1}>
          <Text>
            <Text color="green">✓</Text>
            <Text> File: </Text>
            <Text color="cyan">{fileInfo.name}</Text>
            <Text color="gray"> ({formatBytes(fileInfo.size)} - PDF)</Text>
          </Text>
        </Box>
      )}

      {/* Progress */}
      {step === 'compressing' && fileInfo && (
        <Progress
          percentage={progress}
          fileName={fileInfo.name}
          startTime={startTime}
        />
      )}

      {/* Result */}
      {step === 'done' && result && (
        <Summary result={result} />
      )}

      {/* Error */}
      {step === 'error' && error && (
        <ErrorBox
          title="Compression Failed"
          message={error}
        />
      )}
    </Box>
  );
};
