// Public, read-only content only. Results live in Next's existing data cache;
// this pool retains promises only while their requests are waiting/running.
export class ContentQueueError extends Error {
  constructor() {
    super('Content request queue is full or timed out');
    this.name = 'ContentQueueError';
  }
}

type Waiter = { start: () => void; timer: ReturnType<typeof setTimeout> };

export class ContentRequestPool {
  private active = 0;
  private readonly waiting: Waiter[] = [];
  private readonly inflight = new Map<string, Promise<unknown>>();

  constructor(
    private readonly concurrency = 4,
    private readonly queueCapacity = 64,
    private readonly queueTimeoutMs = 1000,
  ) {}

  run<T>(key: string, operation: () => Promise<T>): Promise<T> {
    const existing = this.inflight.get(key);
    if (existing) return existing as Promise<T>;
    const result = this.execute(operation);
    this.inflight.set(key, result);
    // Use both handlers instead of an unobserved, rejecting finally() promise.
    void result.then(
      () => this.inflight.delete(key),
      () => this.inflight.delete(key),
    );
    return result;
  }

  private async execute<T>(operation: () => Promise<T>): Promise<T> {
    if (this.active < this.concurrency) {
      this.active++;
    } else {
      if (this.waiting.length >= this.queueCapacity) throw new ContentQueueError();
      await new Promise<void>((resolve, reject) => {
        const waiter: Waiter = {
          start: resolve,
          timer: setTimeout(() => {
            const index = this.waiting.indexOf(waiter);
            if (index !== -1) {
              this.waiting.splice(index, 1);
              reject(new ContentQueueError());
            }
          }, this.queueTimeoutMs),
        };
        this.waiting.push(waiter);
      });
    }
    try {
      return await operation();
    } finally {
      const next = this.waiting.shift();
      if (next) {
        clearTimeout(next.timer);
        next.start(); // Transfer this active slot directly to the oldest waiter.
      } else {
        this.active--;
      }
    }
  }
}

export const contentRequestPool = new ContentRequestPool();
