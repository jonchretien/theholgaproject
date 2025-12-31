/**
 * Unit tests for error types
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  AppError,
  BrowserSupportError,
  FileUploadError,
  ImageProcessingError,
  StateTransitionError,
  CanvasError,
  isAppError,
  isBrowserSupportError,
  isFileUploadError,
  isImageProcessingError,
  isStateTransitionError,
  isCanvasError,
  getUserErrorMessage,
  logError,
} from './errors';

describe('Error Types', () => {
  describe('AppError', () => {
    it('should create an AppError with all properties', () => {
      const error = new AppError(
        'Test error',
        'TEST_ERROR',
        'User friendly message'
      );

      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(AppError);
      expect(error.message).toBe('Test error');
      expect(error.code).toBe('TEST_ERROR');
      expect(error.userMessage).toBe('User friendly message');
      expect(error.name).toBe('AppError');
    });

    it('should capture cause if provided', () => {
      const cause = new Error('Original error');
      const error = new AppError(
        'Wrapped error',
        'WRAPPED_ERROR',
        'User message',
        cause
      );

      expect(error.cause).toBe(cause);
    });
  });

  describe('BrowserSupportError', () => {
    it('should create error with feature name', () => {
      const error = new BrowserSupportError('Canvas API');

      expect(error).toBeInstanceOf(BrowserSupportError);
      expect(error.message).toContain('Canvas API');
      expect(error.code).toBe('BROWSER_SUPPORT_ERROR');
      expect(error.userMessage).toContain('modern browser');
    });

    it('should have helpful user message', () => {
      const error = new BrowserSupportError('FileReader');

      expect(error.userMessage).toContain('FileReader');
      expect(error.userMessage).toContain('Chrome');
      expect(error.userMessage).toContain('Firefox');
    });
  });

  describe('FileUploadError', () => {
    it('should create validation error', () => {
      const error = FileUploadError.validation('File too large');

      expect(error).toBeInstanceOf(FileUploadError);
      expect(error.message).toContain('File validation failed');
      expect(error.userMessage).toBe('File too large');
      expect(error.code).toBe('FILE_UPLOAD_ERROR');
    });

    it('should create reading error with file info', () => {
      const file = new File(['content'], 'test.jpg', { type: 'image/jpeg' });
      const error = FileUploadError.reading(file);

      expect(error.message).toContain('test.jpg');
      expect(error.file).toBe(file);
      expect(error.userMessage).toContain('reading file');
    });

    it('should create no file error', () => {
      const error = FileUploadError.noFile();

      expect(error.message).toBe('No file provided');
      expect(error.userMessage).toContain('select an image');
      expect(error.file).toBeUndefined();
    });

    it('should preserve cause in reading error', () => {
      const file = new File([''], 'test.jpg');
      const cause = new Error('Read failed');
      const error = FileUploadError.reading(file, cause);

      expect(error.cause).toBe(cause);
    });
  });

  describe('ImageProcessingError', () => {
    it('should create error with operation name', () => {
      const error = new ImageProcessingError('applying filter');

      expect(error).toBeInstanceOf(ImageProcessingError);
      expect(error.message).toContain('applying filter');
      expect(error.operation).toBe('applying filter');
      expect(error.code).toBe('IMAGE_PROCESSING_ERROR');
    });

    it('should have helpful user message', () => {
      const error = new ImageProcessingError('blur');

      expect(error.userMessage).toContain('Failed to process image');
      expect(error.userMessage).toContain('try again');
    });
  });

  describe('StateTransitionError', () => {
    it('should create error with state and action', () => {
      const error = new StateTransitionError('idle', 'SAVE_IMAGE');

      expect(error).toBeInstanceOf(StateTransitionError);
      expect(error.currentState).toBe('idle');
      expect(error.action).toBe('SAVE_IMAGE');
      expect(error.message).toContain('idle');
      expect(error.message).toContain('SAVE_IMAGE');
    });

    it('should have generic user message (internal error)', () => {
      const error = new StateTransitionError('photo', 'INVALID_ACTION');

      expect(error.userMessage).toContain('refresh the page');
    });
  });

  describe('CanvasError', () => {
    it('should create error with operation', () => {
      const error = new CanvasError('drawing image');

      expect(error).toBeInstanceOf(CanvasError);
      expect(error.operation).toBe('drawing image');
      expect(error.code).toBe('CANVAS_ERROR');
    });

    it('should create context creation error', () => {
      const error = CanvasError.contextCreation();

      expect(error.message).toContain('create 2D context');
      expect(error.operation).toContain('2D context');
    });

    it('should create image loading error', () => {
      const cause = new Error('Network error');
      const error = CanvasError.imageLoading(cause);

      expect(error.message).toContain('load image');
      expect(error.cause).toBe(cause);
    });
  });

  describe('Type guards', () => {
    it('isAppError should identify AppError instances', () => {
      const appError = new AppError('test', 'TEST', 'user message');
      const regularError = new Error('test');

      expect(isAppError(appError)).toBe(true);
      expect(isAppError(regularError)).toBe(false);
      expect(isAppError('string')).toBe(false);
      expect(isAppError(null)).toBe(false);
    });

    it('isBrowserSupportError should identify BrowserSupportError', () => {
      const error = new BrowserSupportError('Canvas');
      const otherError = new FileUploadError('test', 'test');

      expect(isBrowserSupportError(error)).toBe(true);
      expect(isBrowserSupportError(otherError)).toBe(false);
    });

    it('isFileUploadError should identify FileUploadError', () => {
      const error = FileUploadError.noFile();
      const otherError = new CanvasError('test');

      expect(isFileUploadError(error)).toBe(true);
      expect(isFileUploadError(otherError)).toBe(false);
    });

    it('isImageProcessingError should identify ImageProcessingError', () => {
      const error = new ImageProcessingError('filter');
      const otherError = new StateTransitionError('idle', 'TEST');

      expect(isImageProcessingError(error)).toBe(true);
      expect(isImageProcessingError(otherError)).toBe(false);
    });

    it('isStateTransitionError should identify StateTransitionError', () => {
      const error = new StateTransitionError('idle', 'TEST');
      const otherError = new BrowserSupportError('test');

      expect(isStateTransitionError(error)).toBe(true);
      expect(isStateTransitionError(otherError)).toBe(false);
    });

    it('isCanvasError should identify CanvasError', () => {
      const error = CanvasError.contextCreation();
      const otherError = new ImageProcessingError('test');

      expect(isCanvasError(error)).toBe(true);
      expect(isCanvasError(otherError)).toBe(false);
    });
  });

  describe('getUserErrorMessage', () => {
    it('should return userMessage for AppError', () => {
      const error = new AppError('tech', 'CODE', 'User friendly message');
      expect(getUserErrorMessage(error)).toBe('User friendly message');
    });

    it('should return generic message for regular Error', () => {
      const error = new Error('Something broke');
      const message = getUserErrorMessage(error);

      expect(message).toContain('unexpected error');
      expect(message).toContain('try again');
    });

    it('should return fallback for unknown errors', () => {
      const message = getUserErrorMessage('string error');

      expect(message).toContain('Something went wrong');
      expect(message).toContain('refresh');
    });

    it('should handle null/undefined', () => {
      expect(getUserErrorMessage(null)).toBeTruthy();
      expect(getUserErrorMessage(undefined)).toBeTruthy();
    });
  });

  describe('logError', () => {
    let consoleErrorSpy: any;

    beforeEach(() => {
      consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
      consoleErrorSpy.mockRestore();
    });

    it('should log AppError with code', () => {
      const error = new AppError('test message', 'TEST_CODE', 'user msg');
      logError(error);

      expect(consoleErrorSpy).toHaveBeenCalled();
      const call = consoleErrorSpy.mock.calls[0].join(' ');
      expect(call).toContain('AppError');
      expect(call).toContain('TEST_CODE');
      expect(call).toContain('test message');
    });

    it('should log with context prefix', () => {
      const error = new Error('test');
      logError(error, 'FileUpload');

      expect(consoleErrorSpy).toHaveBeenCalled();
      const call = consoleErrorSpy.mock.calls[0].join(' ');
      expect(call).toContain('[FileUpload]');
    });

    it('should log regular Error with stack', () => {
      const error = new Error('Regular error');
      logError(error);

      expect(consoleErrorSpy).toHaveBeenCalled();
    });

    it('should log unknown errors', () => {
      logError('string error');

      expect(consoleErrorSpy).toHaveBeenCalled();
      const call = consoleErrorSpy.mock.calls[0].join(' ');
      expect(call).toContain('Unknown error');
    });

    it('should log cause for AppError', () => {
      const cause = new Error('Root cause');
      const error = new AppError('Wrapped', 'CODE', 'User msg', cause);
      logError(error);

      expect(consoleErrorSpy).toHaveBeenCalled();
      const call = consoleErrorSpy.mock.calls[0];
      expect(call).toContain(cause);
    });
  });
});
