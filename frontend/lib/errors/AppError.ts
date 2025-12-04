/**
 * Application error with user and developer messages
 */
export class AppError extends Error {
  public readonly userMessage: string;
  public readonly devMessage: string;
  public readonly statusCode: number;

  constructor(userMessage: string, devMessage?: string, statusCode = 500) {
    super(devMessage || userMessage);
    this.userMessage = userMessage;
    this.devMessage = devMessage || userMessage;
    this.statusCode = statusCode;
    Object.setPrototypeOf(this, AppError.prototype);
  }
}
