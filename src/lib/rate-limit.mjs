const defaultWindowMs = 60_000;
const defaultMaxRequests = 60;

export function createRateLimiter({ windowMs = defaultWindowMs, maxRequests = defaultMaxRequests } = {}) {
  const requests = new Map();

  return function checkLimit(identifier) {
    const now = Date.now();
    const bucket = requests.get(identifier) ?? [];

    const activeRequests = bucket.filter((timestamp) => now - timestamp < windowMs);
    const allowed = activeRequests.length < maxRequests;

    if (allowed) {
      activeRequests.push(now);
      requests.set(identifier, activeRequests);
    }

    const resetAt = activeRequests.length > 0 ? activeRequests[0] + windowMs : now + windowMs;

    return {
      allowed,
      limit: maxRequests,
      remaining: Math.max(0, maxRequests - activeRequests.length),
      resetAt,
      retryAfterSeconds: allowed ? 0 : Math.max(1, Math.ceil((resetAt - now) / 1000)),
    };
  };
}

export function getClientIdentifier(request) {
  const forwardedFor = request.headers.get('x-forwarded-for');

  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim();
  }

  return request.headers.get('x-real-ip') ?? request.headers.get('cf-connecting-ip') ?? 'unknown';
}
