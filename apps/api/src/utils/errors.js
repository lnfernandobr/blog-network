export class HttpError extends Error {
  constructor(status, message, details) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

export const NotFound = (msg = 'Not found') => new HttpError(404, msg);
export const BadRequest = (msg, details) => new HttpError(400, msg, details);
export const Unauthorized = (msg = 'Unauthorized') => new HttpError(401, msg);
export const Conflict = (msg) => new HttpError(409, msg);
