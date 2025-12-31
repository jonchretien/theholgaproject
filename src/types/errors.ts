/**
 * Custom error types for the application
 *
 * Provides specific error classes for different failure scenarios,
 * making error handling more precise and user-friendly.
 */

/**
 * Base error class for all application errors
 */
export class AppError extends Error {
  /**
   * Error code for programmatic error handling
   */
  public readonly code: string;

  /**
   * User-friendly error message
   */
  public readonly userMessage: string;

  /**
   * Original error if this error wraps another
   */
  public readonly cause?: Error;

  constructor(
    message: string,
    code: string,
    userMessage: string,
    cause?: Error
  ) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.userMessage = userMessage;
    this.cause = cause;

    // Maintains proper stack trace for where error was thrown (V8 only)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

/**
 * Error thrown when browser doesn't support required features
 */
export class BrowserSupportError extends AppError {
  constructor(feature: string, cause?: Error) {
    super(
      `Browser does not support ${feature}`,
      "BROWSER_SUPPORT_ERROR",
      `Your browser doesn't support ${feature}. Please use a modern browser like Chrome, Firefox, or Edge.`,
      cause
    );
  }
}

/**
 * Error thrown during file upload/reading
 */
export class FileUploadError extends AppError {
  public readonly file?: File;

  constructor(
    message: string,
    userMessage: string,
    file?: File,
    cause?: Error
  ) {
    super(message, "FILE_UPLOAD_ERROR", userMessage, cause);
    this.file = file;
  }

  /**
   * Creates a FileUploadError for file validation failures
   */
  static validation(reason: string, file?: File): FileUploadError {
    return new FileUploadError(
      `File validation failed: ${reason}`,
      reason,
      file
    );
  }

  /**
   * Creates a FileUploadError for file reading failures
   */
  static reading(file: File, cause?: Error): FileUploadError {
    return new FileUploadError(
      `Failed to read file: ${file.name}`,
      "Error reading file. Please try again.",
      file,
      cause
    );
  }

  /**
   * Creates a FileUploadError for no file provided
   */
  static noFile(): FileUploadError {
    return new FileUploadError(
      "No file provided",
      "Please select an image file to upload.",
      undefined
    );
  }
}

/**
 * Error thrown during image processing
 */
export class ImageProcessingError extends AppError {
  public readonly operation: string;

  constructor(operation: string, cause?: Error) {
    super(
      `Image processing failed during ${operation}`,
      "IMAGE_PROCESSING_ERROR",
      `Failed to process image. Please try again or use a different image.`,
      cause
    );
    this.operation = operation;
  }
}

/**
 * Error thrown during state transitions
 */
export class StateTransitionError extends AppError {
  public readonly currentState: string;
  public readonly action: string;

  constructor(currentState: string, action: string, cause?: Error) {
    super(
      `Invalid state transition: cannot perform '${action}' from state '${currentState}'`,
      "STATE_TRANSITION_ERROR",
      "Something went wrong. Please refresh the page.",
      cause
    );
    this.currentState = currentState;
    this.action = action;
  }
}

/**
 * Error thrown when canvas operations fail
 */
export class CanvasError extends AppError {
  public readonly operation: string;

  constructor(operation: string, cause?: Error) {
    super(
      `Canvas operation failed: ${operation}`,
      "CANVAS_ERROR",
      "Failed to process image. Please try again.",
      cause
    );
    this.operation = operation;
  }

  /**
   * Creates a CanvasError for context creation failures
   */
  static contextCreation(): CanvasError {
    return new CanvasError("Failed to create 2D context");
  }

  /**
   * Creates a CanvasError for image loading failures
   */
  static imageLoading(cause?: Error): CanvasError {
    return new CanvasError("Failed to load image onto canvas", cause);
  }
}

/**
 * Type guard to check if error is an AppError
 */
export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}

/**
 * Type guard to check if error is a BrowserSupportError
 */
export function isBrowserSupportError(
  error: unknown
): error is BrowserSupportError {
  return error instanceof BrowserSupportError;
}

/**
 * Type guard to check if error is a FileUploadError
 */
export function isFileUploadError(error: unknown): error is FileUploadError {
  return error instanceof FileUploadError;
}

/**
 * Type guard to check if error is an ImageProcessingError
 */
export function isImageProcessingError(
  error: unknown
): error is ImageProcessingError {
  return error instanceof ImageProcessingError;
}

/**
 * Type guard to check if error is a StateTransitionError
 */
export function isStateTransitionError(
  error: unknown
): error is StateTransitionError {
  return error instanceof StateTransitionError;
}

/**
 * Type guard to check if error is a CanvasError
 */
export function isCanvasError(error: unknown): error is CanvasError {
  return error instanceof CanvasError;
}

/**
 * Gets a user-friendly error message from any error
 *
 * @param error - The error to extract message from
 * @returns User-friendly error message
 */
export function getUserErrorMessage(error: unknown): string {
  if (isAppError(error)) {
    return error.userMessage;
  }

  if (error instanceof Error) {
    return "An unexpected error occurred. Please try again.";
  }

  return "Something went wrong. Please refresh the page.";
}

/**
 * Logs error details for debugging
 *
 * @param error - The error to log
 * @param context - Additional context about where error occurred
 */
export function logError(error: unknown, context?: string): void {
  const prefix = context ? `[${context}]` : "";

  if (isAppError(error)) {
    console.error(
      `${prefix} ${error.name} [${error.code}]:`,
      error.message,
      error.cause
    );
  }

  if (error instanceof Error) {
    console.error(`${prefix} ${error.name}:`, error.message, error.stack);
  }

  console.error(`${prefix} Unknown error:`, error);
}
