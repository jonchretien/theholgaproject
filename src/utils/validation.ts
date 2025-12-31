/**
 * File validation utilities
 */
import { FILE_CONSTRAINTS, FILE_ERROR_MESSAGES } from '../config/canvas';

/**
 * Validation result type
 */
export interface ValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Validates that a file exists
 *
 * @param file - The file to validate (can be null/undefined)
 * @returns Validation result
 */
export function validateFileExists(
  file: File | null | undefined
): ValidationResult {
  if (!file) {
    return {
      valid: false,
      error: FILE_ERROR_MESSAGES.noFile,
    };
  }

  return { valid: true };
}

/**
 * Validates file size against maximum allowed size
 *
 * @param file - The file to validate
 * @returns Validation result
 */
export function validateFileSize(file: File): ValidationResult {
  if (file.size > FILE_CONSTRAINTS.maxSize) {
    return {
      valid: false,
      error: FILE_ERROR_MESSAGES.tooLarge,
    };
  }

  return { valid: true };
}

/**
 * Validates file MIME type against allowed types
 *
 * @param file - The file to validate
 * @returns Validation result
 */
export function validateFileType(file: File): ValidationResult {
  const allowedTypes = FILE_CONSTRAINTS.allowedTypes as readonly string[];

  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: FILE_ERROR_MESSAGES.invalidType,
    };
  }

  return { valid: true };
}

/**
 * Validates file extension as a fallback when MIME type is unreliable
 *
 * @param file - The file to validate
 * @returns Validation result
 */
export function validateFileExtension(file: File): ValidationResult {
  const fileName = file.name.toLowerCase();
  const allowedExtensions =
    FILE_CONSTRAINTS.allowedExtensions as readonly string[];

  const hasValidExtension = allowedExtensions.some((ext) =>
    fileName.endsWith(ext)
  );

  if (!hasValidExtension) {
    return {
      valid: false,
      error: FILE_ERROR_MESSAGES.invalidType,
    };
  }

  return { valid: true };
}

/**
 * Performs comprehensive file validation
 * Checks existence, size, type, and extension
 *
 * @param file - The file to validate (can be null/undefined)
 * @returns Validation result with specific error message if invalid
 *
 * @example
 * ```typescript
 * const result = validateImageFile(droppedFile);
 * if (!result.valid) {
 *   console.error(result.error);
 *   return;
 * }
 * // File is valid, proceed with upload
 * ```
 */
export function validateImageFile(
  file: File | null | undefined
): ValidationResult {
  // Check if file exists
  const existsResult = validateFileExists(file);
  if (!existsResult.valid) {
    return existsResult;
  }

  // TypeScript now knows file is not null/undefined
  const validFile = file as File;

  // Check file size
  const sizeResult = validateFileSize(validFile);
  if (!sizeResult.valid) {
    return sizeResult;
  }

  // Check MIME type (primary check)
  const typeResult = validateFileType(validFile);
  if (!typeResult.valid) {
    // Fallback to extension check (some browsers report incorrect MIME types)
    const extensionResult = validateFileExtension(validFile);
    if (!extensionResult.valid) {
      return typeResult; // Return the type error if both fail
    }
  }

  return { valid: true };
}

/**
 * Formats file size to human-readable string
 *
 * @param bytes - File size in bytes
 * @returns Formatted string (e.g., "2.5 MB")
 */
export function formatFileSize(bytes: number): string {
  const units = ['B', 'KB', 'MB', 'GB'];
  let size = bytes;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }

  return `${size.toFixed(1)} ${units[unitIndex]}`;
}
