import { env } from '../config/env.js';

class KeepAliveService {
  private intervalId: NodeJS.Timeout | null = null;

  start() {
    if (!env.KEEP_ALIVE_ENABLED || env.NODE_ENV !== 'production') {
      return;
    }

    if (this.intervalId) {
      return;
    }

    const healthUrl = new URL('/health', env.PUBLIC_APP_URL).toString();
    console.log(`[KeepAlive] Pinging ${healthUrl} every ${env.KEEP_ALIVE_INTERVAL_MS}ms`);

    this.intervalId = setInterval(() => {
      void this.ping(healthUrl);
    }, env.KEEP_ALIVE_INTERVAL_MS);
  }

  stop() {
    if (!this.intervalId) return;
    clearInterval(this.intervalId);
    this.intervalId = null;
  }

  private async ping(healthUrl: string) {
    try {
      const response = await fetch(healthUrl);
      if (!response.ok) {
        console.warn(`[KeepAlive] Health ping returned ${response.status}`);
      }
    } catch (error) {
      console.warn('[KeepAlive] Health ping failed:', error instanceof Error ? error.message : error);
    }
  }
}

export const keepAliveService = new KeepAliveService();
