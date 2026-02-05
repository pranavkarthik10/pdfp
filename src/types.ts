export type QualityLevel = 'screen' | 'ebook' | 'printer' | 'prepress';

export type FileType = 'pdf';

// PDF quality settings map to Ghostscript PDFSETTINGS
// screen - lowest quality, smallest file size
// ebook - medium quality, good for ebooks
// printer - high quality, for printing
// prepress - highest quality, for professional printing
export interface QualityOption {
  label: string;
  value: QualityLevel;
  description: string;
}

export const QUALITY_OPTIONS: QualityOption[] = [
  {
    label: 'Screen',
    value: 'screen',
    description: 'Lowest quality, smallest file size (72dpi)',
  },
  {
    label: 'eBook',
    value: 'ebook',
    description: 'Medium quality, good for digital reading (150dpi)',
  },
  {
    label: 'Printer',
    value: 'printer',
    description: 'High quality, suitable for printing (300dpi)',
  },
  {
    label: 'Prepress',
    value: 'prepress',
    description: 'Highest quality, professional printing (300dpi+)',
  },
];

export interface AdvancedSettings {
  outputFolder: string | null;  // null means same as input
  targetSize: number | null;    // in bytes, null means no target
  targetSizeUnit: 'KB' | 'MB';  // display unit
}

export interface CompressionSettings {
  quality: QualityLevel;
  removeInputFile?: boolean;
  advanced?: AdvancedSettings;
}

export interface FileInfo {
  path: string;
  name: string;
  size: number;
  type: FileType;
  extension: string;
}

export interface CompressionResult {
  inputPath: string;
  outputPath: string;
  inputSize: number;
  outputSize: number;
  savedBytes: number;
  savedPercentage: number;
  duration: number;
  inputFileRemoved?: boolean;
  alreadyOptimized?: boolean; // True if compression didn't reduce size (output file deleted)
}

// Batch processing types
export type FileStatus = 'pending' | 'compressing' | 'completed' | 'error' | 'skipped';

export interface BatchFileInfo extends FileInfo {
  id: string;
  status: FileStatus;
  progress: number;
  result?: CompressionResult;
  error?: string;
}

export interface ProgressInfo {
  percentage: number;
  elapsed: number;
  estimated?: number;
}

export type AppStep =
  | 'welcome'
  | 'file-input'
  | 'quality-select'
  | 'remove-input-prompt'
  | 'advanced-settings-prompt'
  | 'advanced-settings'
  | 'compressing'
  | 'summary'
  | 'compress-more';
