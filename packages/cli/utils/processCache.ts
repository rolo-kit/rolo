// Simple process-level cache utility
// Values are lost when the process exits

class ProcessCache {
  private cache: Record<string, any> = {};

  set(key: string, value: any) {
    this.cache[key] = value;
  }

  get<T = any>(key: string): T | undefined {
    return this.cache[key];
  }

  has(key: string): boolean {
    return Object.prototype.hasOwnProperty.call(this.cache, key);
  }

  delete(key: string) {
    delete this.cache[key];
  }

  clear() {
    this.cache = {};
  }
}

const processCache = new ProcessCache();
export default processCache;
