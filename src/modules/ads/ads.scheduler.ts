import { env } from '../../config/env.js';
import { adsService } from './ads.service.js';

class AdsScheduler {
  private intervalId: NodeJS.Timeout | null = null;
  private running = false;

  start() {
    if (!env.GOOGLE_SHEETS_AD_SYNC_ENABLED) {
      console.log('[AdsScheduler] Google Sheet ad sync disabled');
      return;
    }

    if (this.intervalId) {
      console.warn('[AdsScheduler] Google Sheet ad sync already running');
      return;
    }

    console.log(`[AdsScheduler] Starting Google Sheet ad sync every ${env.GOOGLE_SHEETS_AD_SYNC_INTERVAL_MS}ms`);
    void this.syncOnce();
    this.intervalId = setInterval(() => {
      void this.syncOnce();
    }, env.GOOGLE_SHEETS_AD_SYNC_INTERVAL_MS);
  }

  stop() {
    if (!this.intervalId) return;
    clearInterval(this.intervalId);
    this.intervalId = null;
    console.log('[AdsScheduler] Google Sheet ad sync stopped');
  }

  private async syncOnce() {
    if (this.running) {
      console.warn('[AdsScheduler] Previous Google Sheet ad sync still running, skipping this tick');
      return;
    }

    this.running = true;
    try {
      const result = await adsService.syncGoogleSheet();
      console.log(
        `[AdsScheduler] Google Sheet ad sync complete: ${result.recordsImported} imported, ${result.recordsUpdated} updated, ${result.recordsSkipped} skipped`
      );
    } catch (error) {
      console.error('[AdsScheduler] Google Sheet ad sync failed:', error instanceof Error ? error.message : error);
    } finally {
      this.running = false;
    }
  }
}

export const adsScheduler = new AdsScheduler();
