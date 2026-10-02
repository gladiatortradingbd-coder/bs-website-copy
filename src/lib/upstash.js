class UpstashRestClient {
  constructor({ url, token }) {
    this.url = String(url || "").replace(/\/$/, "");
    this.token = token;
  }

  async request(command) {
    const response = await fetch(this.url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.token}`,
      },
      body: JSON.stringify(command),
    });

    const text = await response.text();
    let payload;

    try {
      payload = text ? JSON.parse(text) : {};
    } catch {
      throw new Error(`Upstash response was not valid JSON: ${text.slice(0, 200)}`);
    }

    if (!response.ok || payload?.error) {
      throw new Error(payload?.error || `Upstash request failed with status ${response.status}`);
    }

    return payload?.result;
  }

  async incr(key) {
    return this.request(["INCR", key]);
  }

  async expire(key, seconds) {
    return this.request(["EXPIRE", key, seconds]);
  }
}

let cached = undefined;

export async function getRedis() {
  if (cached !== undefined) return cached;

  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    cached = null;
    return null;
  }

  cached = new UpstashRestClient({ url, token });
  return cached;
}
