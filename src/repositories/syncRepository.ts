import { LocalDatabase } from '../database/localDatabase';
import { SyncQueueItem } from '../types';

export class SyncRepository {
  private isSyncing = false;

  public getQueue(): SyncQueueItem[] {
    return LocalDatabase.getSyncQueue();
  }

  public enqueue(
    entityType: SyncQueueItem['entity_type'],
    entityId: string,
    operation: SyncQueueItem['operation'],
    payload: any
  ): void {
    const queue = this.getQueue();
    const newItem: SyncQueueItem = {
      queue_id: 'sync_' + Math.random().toString(36).substring(2, 9),
      entity_type: entityType,
      entity_id: entityId,
      operation,
      payload,
      created_at: new Date().toISOString(),
      retry_count: 0,
      sync_status: 'pending'
    };
    LocalDatabase.saveSyncQueue([...queue, newItem]);
  }

  public isOffline(): boolean {
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      return true;
    }
    return LocalDatabase.getIsOfflineSimulated();
  }

  public setOfflineSimulation(isOffline: boolean): void {
    LocalDatabase.setIsOfflineSimulated(isOffline);
  }

  public async processSyncQueue(): Promise<{ processed: number; remaining: number }> {
    if (this.isOffline() || this.isSyncing) {
      return { processed: 0, remaining: this.getQueue().length };
    }

    this.isSyncing = true;
    try {
      const queue = this.getQueue();
      if (queue.length === 0) {
        this.isSyncing = false;
        return { processed: 0, remaining: 0 };
      }

      // Simulate HTTPS network request delay
      await new Promise(r => setTimeout(r, 600));

      // Mark all items as synced in cloud
      LocalDatabase.saveSyncQueue([]);
      this.isSyncing = false;
      return { processed: queue.length, remaining: 0 };
    } catch (e) {
      this.isSyncing = false;
      return { processed: 0, remaining: this.getQueue().length };
    }
  }
}

export const syncRepository = new SyncRepository();
