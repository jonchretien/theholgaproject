/**
 * Unit tests for file validation utilities
 */
import { describe, it, expect } from 'vitest';
import {
  validateFileExists,
  validateFileSize,
  validateFileType,
  validateFileExtension,
  validateImageFile,
  formatFileSize,
} from './validation';
import { FILE_CONSTRAINTS } from '../config/canvas';

/**
 * Helper to create a mock File object for testing
 */
function createMockFile(
  name: string,
  size: number,
  type: string
): File {
  const blob = new Blob(['x'.repeat(size)], { type });
  return new File([blob], name, { type });
}

describe('File Validation', () => {
  describe('validateFileExists', () => {
    it('should return valid:true for existing file', () => {
      const file = createMockFile('test.jpg', 1000, 'image/jpeg');
      const result = validateFileExists(file);
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should return valid:false for null file', () => {
      const result = validateFileExists(null);
      expect(result.valid).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should return valid:false for undefined file', () => {
      const result = validateFileExists(undefined);
      expect(result.valid).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('validateFileSize', () => {
    it('should return valid:true for file under max size', () => {
      const file = createMockFile('test.jpg', 1000, 'image/jpeg');
      const result = validateFileSize(file);
      expect(result.valid).toBe(true);
    });

    it('should return valid:true for file at max size', () => {
      const file = createMockFile(
        'test.jpg',
        FILE_CONSTRAINTS.maxSize,
        'image/jpeg'
      );
      const result = validateFileSize(file);
      expect(result.valid).toBe(true);
    });

    it('should return valid:false for file over max size', () => {
      const file = createMockFile(
        'test.jpg',
        FILE_CONSTRAINTS.maxSize + 1,
        'image/jpeg'
      );
      const result = validateFileSize(file);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('too large');
    });
  });

  describe('validateFileType', () => {
    it('should return valid:true for JPEG', () => {
      const file = createMockFile('test.jpg', 1000, 'image/jpeg');
      const result = validateFileType(file);
      expect(result.valid).toBe(true);
    });

    it('should return valid:true for PNG', () => {
      const file = createMockFile('test.png', 1000, 'image/png');
      const result = validateFileType(file);
      expect(result.valid).toBe(true);
    });

    it('should return valid:true for WebP', () => {
      const file = createMockFile('test.webp', 1000, 'image/webp');
      const result = validateFileType(file);
      expect(result.valid).toBe(true);
    });

    it('should return valid:false for PDF', () => {
      const file = createMockFile('test.pdf', 1000, 'application/pdf');
      const result = validateFileType(file);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Invalid file type');
    });

    it('should return valid:false for video', () => {
      const file = createMockFile('test.mp4', 1000, 'video/mp4');
      const result = validateFileType(file);
      expect(result.valid).toBe(false);
    });
  });

  describe('validateFileExtension', () => {
    it('should return valid:true for .jpg extension', () => {
      const file = createMockFile('photo.jpg', 1000, 'image/jpeg');
      const result = validateFileExtension(file);
      expect(result.valid).toBe(true);
    });

    it('should return valid:true for .jpeg extension', () => {
      const file = createMockFile('photo.jpeg', 1000, 'image/jpeg');
      const result = validateFileExtension(file);
      expect(result.valid).toBe(true);
    });

    it('should return valid:true for .png extension', () => {
      const file = createMockFile('photo.png', 1000, 'image/png');
      const result = validateFileExtension(file);
      expect(result.valid).toBe(true);
    });

    it('should be case-insensitive', () => {
      const file = createMockFile('photo.JPG', 1000, 'image/jpeg');
      const result = validateFileExtension(file);
      expect(result.valid).toBe(true);
    });

    it('should return valid:false for .pdf extension', () => {
      const file = createMockFile('document.pdf', 1000, 'application/pdf');
      const result = validateFileExtension(file);
      expect(result.valid).toBe(false);
    });

    it('should return valid:false for .txt extension', () => {
      const file = createMockFile('file.txt', 1000, 'text/plain');
      const result = validateFileExtension(file);
      expect(result.valid).toBe(false);
    });
  });

  describe('validateImageFile (comprehensive)', () => {
    it('should validate a proper image file', () => {
      const file = createMockFile('photo.jpg', 1000, 'image/jpeg');
      const result = validateImageFile(file);
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should reject null file', () => {
      const result = validateImageFile(null);
      expect(result.valid).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should reject file that is too large', () => {
      const file = createMockFile(
        'huge.jpg',
        FILE_CONSTRAINTS.maxSize + 1000,
        'image/jpeg'
      );
      const result = validateImageFile(file);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('too large');
    });

    it('should reject file with invalid type and extension', () => {
      const file = createMockFile('doc.pdf', 1000, 'application/pdf');
      const result = validateImageFile(file);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Invalid file type');
    });

    it('should accept file with valid extension but wrong MIME type (browser quirk)', () => {
      // Some browsers report incorrect MIME types
      const file = createMockFile('photo.jpg', 1000, 'application/octet-stream');
      const result = validateImageFile(file);
      expect(result.valid).toBe(true); // Extension fallback succeeds
    });
  });

  describe('formatFileSize', () => {
    it('should format bytes', () => {
      expect(formatFileSize(500)).toBe('500.0 B');
    });

    it('should format kilobytes', () => {
      expect(formatFileSize(1024)).toBe('1.0 KB');
      expect(formatFileSize(2560)).toBe('2.5 KB');
    });

    it('should format megabytes', () => {
      expect(formatFileSize(1024 * 1024)).toBe('1.0 MB');
      expect(formatFileSize(2.5 * 1024 * 1024)).toBe('2.5 MB');
    });

    it('should format gigabytes', () => {
      expect(formatFileSize(1024 * 1024 * 1024)).toBe('1.0 GB');
    });

    it('should handle zero', () => {
      expect(formatFileSize(0)).toBe('0.0 B');
    });
  });
});
