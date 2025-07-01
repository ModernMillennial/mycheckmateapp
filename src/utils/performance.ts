import logger from './logger';

// Performance monitoring and optimization utilities
export class PerformanceManager {
  private static timers: Map<string, number> = new Map();

  // Measure operation performance
  static startTimer(operation: string): void {
    this.timers.set(operation, Date.now());
  }

  static endTimer(operation: string): number {
    const startTime = this.timers.get(operation);
    if (!startTime) {
      logger.warn(`Timer not found for operation: ${operation}`);
      return 0;
    }

    const duration = Date.now() - startTime;
    this.timers.delete(operation);
    
    // Log slow operations
    if (duration > 2000) {
      logger.warn(`Slow operation detected: ${operation} took ${duration}ms`);
    } else {
      logger.debug(`Operation ${operation} completed in ${duration}ms`);
    }

    return duration;
  }

  // Debounce function for performance
  static debounce<T extends (...args: any[]) => void>(
    func: T,
    wait: number
  ): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout;
    
    return (...args: Parameters<T>) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  }

  // Throttle function for performance
  static throttle<T extends (...args: any[]) => void>(
    func: T,
    limit: number
  ): (...args: Parameters<T>) => void {
    let inThrottle: boolean;
    
    return (...args: Parameters<T>) => {
      if (!inThrottle) {
        func(...args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }

  // Memory monitoring (for development)
  static logMemoryUsage(operation: string): void {
    if (process.env.EXPO_PUBLIC_APP_ENV !== 'production') {
      // @ts-ignore - performance is available in React Native
      if (global.performance && global.performance.memory) {
        // @ts-ignore
        const memory = global.performance.memory;
        logger.debug(`Memory usage after ${operation}:`, {
          used: Math.round(memory.usedJSHeapSize / 1048576) + ' MB',
          total: Math.round(memory.totalJSHeapSize / 1048576) + ' MB',
        });
      }
    }
  }

  // Batch process large arrays for better performance
  static async processInBatches<T, R>(
    items: T[],
    batchSize: number,
    processor: (batch: T[]) => Promise<R[]>
  ): Promise<R[]> {
    const results: R[] = [];
    
    for (let i = 0; i < items.length; i += batchSize) {
      const batch = items.slice(i, i + batchSize);
      const batchResults = await processor(batch);
      results.push(...batchResults);
      
      // Allow other tasks to run between batches
      await new Promise(resolve => setTimeout(resolve, 0));
    }
    
    return results;
  }
}

// HOC for measuring component render performance
export function withPerformanceMonitoring<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  componentName: string
) {
  return (props: P) => {
    React.useEffect(() => {
      PerformanceManager.startTimer(`${componentName}_mount`);
      return () => {
        PerformanceManager.endTimer(`${componentName}_mount`);
      };
    }, []);

    return React.createElement(WrappedComponent, props);
  };
}

export default PerformanceManager;