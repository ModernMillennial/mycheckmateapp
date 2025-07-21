import { InteractionManager } from 'react-native';

/**
 * Utility for performance monitoring and optimization
 */
class PerformanceMonitor {
  private timers: Record<string, number> = {};
  private thresholds: Record<string, number> = {
    render: 16, // 60fps = ~16ms per frame
    api: 1000, // 1 second for API calls
    animation: 100, // 100ms for animations
    startup: 2000, // 2 seconds for app startup
  };

  /**
   * Start timing an operation
   * @param label - Identifier for the operation
   */
  startTimer(label: string): void {
    this.timers[label] = Date.now();
  }

  /**
   * End timing an operation and get the duration
   * @param label - Identifier for the operation
   * @param category - Category of operation for threshold checking
   * @returns Duration in milliseconds
   */
  endTimer(label: string, category?: keyof typeof this.thresholds): number {
    const start = this.timers[label];
    if (!start) {
      console.warn(`Timer "${label}" was never started`);
      return 0;
    }

    const duration = Date.now() - start;
    delete this.timers[label];

    // Check against threshold if category is provided
    if (category && this.thresholds[category] && duration > this.thresholds[category]) {
      console.warn(`Performance warning: "${label}" took ${duration}ms (threshold: ${this.thresholds[category]}ms)`);
    }

    return duration;
  }

  /**
   * Set a custom threshold for a category
   * @param category - Category name
   * @param threshold - Threshold in milliseconds
   */
  setThreshold(category: string, threshold: number): void {
    this.thresholds[category] = threshold;
  }

  /**
   * Run a function after all interactions and animations have completed
   * @param fn - Function to run
   * @param timeout - Optional timeout in ms
   */
  runAfterInteractions<T>(fn: () => T, timeout?: number): Promise<T> {
    return new Promise((resolve) => {
      InteractionManager.runAfterInteractions(() => {
        const result = fn();
        resolve(result);
      }).then(() => {
        // If a timeout is provided, ensure the function runs after the timeout
        if (timeout) {
          setTimeout(() => {
            const result = fn();
            resolve(result);
          }, timeout);
        }
      });
    });
  }

  /**
   * Debounce a function to prevent excessive calls
   * @param fn - Function to debounce
   * @param delay - Delay in milliseconds
   * @returns Debounced function
   */
  debounce<T extends (...args: any[]) => any>(
    fn: T,
    delay: number
  ): (...args: Parameters<T>) => void {
    let timeoutId: NodeJS.Timeout;
    
    return function(this: any, ...args: Parameters<T>) {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => fn.apply(this, args), delay);
    };
  }

  /**
   * Throttle a function to limit call frequency
   * @param fn - Function to throttle
   * @param limit - Minimum time between calls in milliseconds
   * @returns Throttled function
   */
  throttle<T extends (...args: any[]) => any>(
    fn: T,
    limit: number
  ): (...args: Parameters<T>) => void {
    let lastCall = 0;
    
    return function(this: any, ...args: Parameters<T>) {
      const now = Date.now();
      if (now - lastCall >= limit) {
        lastCall = now;
        fn.apply(this, args);
      }
    };
  }

  /**
   * Batch multiple operations together
   * @param operations - Array of operations to perform
   * @param batchSize - Number of operations per batch
   * @param delay - Delay between batches in milliseconds
   * @returns Promise that resolves when all operations are complete
   */
  async batchOperations<T>(
    operations: (() => Promise<T>)[],
    batchSize: number = 5,
    delay: number = 0
  ): Promise<T[]> {
    const results: T[] = [];
    
    for (let i = 0; i < operations.length; i += batchSize) {
      const batch = operations.slice(i, i + batchSize);
      const batchResults = await Promise.all(batch.map(op => op()));
      results.push(...batchResults);
      
      if (delay > 0 && i + batchSize < operations.length) {
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    return results;
  }

  /**
   * Memoize a function to cache results
   * @param fn - Function to memoize
   * @returns Memoized function
   */
  memoize<T extends (...args: any[]) => any>(fn: T): T {
    const cache = new Map<string, ReturnType<T>>();
    
    return function(this: any, ...args: Parameters<T>): ReturnType<T> {
      const key = JSON.stringify(args);
      
      if (cache.has(key)) {
        return cache.get(key) as ReturnType<T>;
      }
      
      const result = fn.apply(this, args);
      cache.set(key, result);
      return result;
    } as T;
  }
}

export default new PerformanceMonitor();
