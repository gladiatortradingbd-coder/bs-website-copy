import { setTimeout as delay } from 'node:timers/promises';

const targetUrl = process.argv[2] ?? 'http://localhost:3000/api/contact';
const requests = Number(process.argv[3] ?? 12);
const delayMs = Number(process.argv[4] ?? 100);

async function fireRequest(index) {
  const response = await fetch(targetUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: `Tester ${index}`,
      email: `tester${index}@example.com`,
      message: `Spam test request ${index}`,
    }),
  });

  console.log(`Request ${index}: ${response.status} ${response.statusText}`);
  if (response.headers.has('x-ratelimit-remaining')) {
    console.log(`  remaining: ${response.headers.get('x-ratelimit-remaining')}`);
  }
  if (response.headers.has('retry-after')) {
    console.log(`  retry-after: ${response.headers.get('retry-after')}`);
  }
}

async function main() {
  console.log(`Sending ${requests} requests to ${targetUrl}...`);

  for (let i = 1; i <= requests; i += 1) {
    await fireRequest(i);
    if (i < requests) {
      await delay(delayMs);
    }
  }
}

main().catch((error) => {
  console.error('Spam test failed:', error);
  process.exit(1);
});
