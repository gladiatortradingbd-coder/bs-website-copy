import { NextResponse } from 'next/server';
import { createRateLimiter, getClientIdentifier } from './lib/rate-limit.mjs';

const rateLimitRules = [
  {
    name: 'auth',
    matcher: (pathname) => pathname.startsWith('/api/auth') || pathname.startsWith('/api/register'),
    windowMs: 60_000,
    maxRequests: 10,
  },
  {
    name: 'contact',
    matcher: (pathname) => pathname.startsWith('/api/contact'),
    windowMs: 60_000,
    maxRequests: 5,
  },
];

const defaultRule = { name: 'default', windowMs: 60_000, maxRequests: 120 };
const limiters = new Map();

function getRateLimitRule(pathname) {
  return rateLimitRules.find(({ matcher }) => matcher(pathname)) ?? defaultRule;
}

function getLimiter(pathname) {
  const rule = getRateLimitRule(pathname);
  const cacheKey = `${rule.name}:${rule.windowMs}:${rule.maxRequests}`;

  if (!limiters.has(cacheKey)) {
    limiters.set(cacheKey, createRateLimiter(rule));
  }

  return limiters.get(cacheKey);
}

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  if (!pathname.startsWith('/api/')) {
    return NextResponse.next();
  }

  const rule = getRateLimitRule(pathname);
  const identifier = getClientIdentifier(request);
  const limiter = getLimiter(pathname);
  const result = limiter(`${rule.name}:${identifier}`);

  if (!result.allowed) {
    return NextResponse.json(
      {
        error: 'Too many requests. Please try again later.',
        retryAfterSeconds: result.retryAfterSeconds,
      },
      {
        status: 429,
        headers: {
          'Retry-After': String(result.retryAfterSeconds),
          'X-RateLimit-Limit': String(result.limit),
          'X-RateLimit-Remaining': String(result.remaining),
          'X-RateLimit-Reset': String(result.resetAt),
        },
      },
    );
  }

  const response = NextResponse.next();
  response.headers.set('X-RateLimit-Limit', String(result.limit));
  response.headers.set('X-RateLimit-Remaining', String(result.remaining));
  response.headers.set('X-RateLimit-Reset', String(result.resetAt));

  return response;
}

export const config = {
  matcher: ['/api/:path*'],
};
