import { InMemoryManager } from './InMemoryManager';
import { FileMemoryManager } from './FileMemoryManager';
import { BaseMemoryManager, MemoryManager } from './BaseMemoryManager';

export class MemoryManagerFactory {
  static createMemoryManager(
    persistent: boolean = false, 
    memoryFile?: string, 
    maxContextLength?: number
  ): MemoryManager {
    if (persistent) {
      return new FileMemoryManager(memoryFile, maxContextLength);
    } else {
      return new InMemoryManager(maxContextLength);
    }
  }
}

export { 
  BaseMemoryManager, 
  MemoryManager, 
  InMemoryManager, 
  FileMemoryManager 
};
