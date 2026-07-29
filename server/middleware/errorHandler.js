// Central error handling. Translates common Mongoose errors into clean 4xx responses
// and — critically — never leaks internal error details (stack traces, DB messages)
// to the client on 5xx. Full detail is logged server-side instead.

function notFound(req, res) {
  res.status(404).json({ error: 'Not found' });
}

// eslint-disable-next-line no-unused-vars -- 4-arg signature required by Express
function errorHandler(err, req, res, next) {
  // Bad ObjectId / number cast (e.g. /parties/not-a-real-id)
  if (err.name === 'CastError') {
    return res.status(400).json({ error: 'Invalid identifier.' });
  }
  // Schema validation failure — safe to surface the field messages
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({ error: messages.join(' ') || 'Validation failed.' });
  }
  // Duplicate unique key (e.g. email already exists)
  if (err.code === 11000) {
    return res.status(409).json({ error: 'A record with these details already exists.' });
  }

  const status = err.status || err.statusCode || 500;

  if (status >= 500) {
    // Log the real error for operators; return a generic message to the client.
    console.error(`[error] ${req.method} ${req.originalUrl} ->`, err);
    return res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }

  // Deliberate 4xx thrown by our own code (e.g. httpError(400, 'msg')) — message is safe.
  return res.status(status).json({ error: err.message || 'Request failed.' });
}

// Helper to throw an HTTP error with a status code from anywhere in a handler.
function httpError(status, message) {
  const err = new Error(message);
  err.status = status;
  return err;
}

module.exports = { notFound, errorHandler, httpError };
