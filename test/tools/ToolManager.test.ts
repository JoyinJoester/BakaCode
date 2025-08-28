import { ToolManager } from '../../src/tools';
import { FileTool } from '../../src/tools/FileTool';
import { Tool } from '../../src/types';

// Mock tool for testing
class MockTool implements Tool {
  name = 'mock';
  description = 'Mock tool for testing';
  schema = {
    type: 'object',
    properties: {
      input: { type: 'string' }
    },
    required: ['input']
  };

  async execute(parameters: Record<string, any>): Promise<any> {
    return { success: true, input: parameters.input };
  }
}

describe('ToolManager', () => {
  let toolManager: ToolManager;

  beforeEach(() => {
    toolManager = new ToolManager();
  });

  describe('constructor', () => {
    it('should register default tools', () => {
      const tools = toolManager.getAvailableTools();
      expect(tools.length).toBeGreaterThan(0);
      
      const toolNames = tools.map(tool => tool.name);
      expect(toolNames).toContain('file');
      expect(toolNames).toContain('shell');
      expect(toolNames).toContain('http');
      expect(toolNames).toContain('websearch');
    });
  });

  describe('registerTool', () => {
    it('should register a new tool', () => {
      const mockTool = new MockTool();
      toolManager.registerTool(mockTool);
      
      const tool = toolManager.getTool('mock');
      expect(tool).toBe(mockTool);
    });
  });

  describe('getTool', () => {
    it('should return tool if exists', () => {
      const fileTool = toolManager.getTool('file');
      expect(fileTool).toBeDefined();
      expect(fileTool!.name).toBe('file');
    });

    it('should return undefined if tool does not exist', () => {
      const tool = toolManager.getTool('nonexistent');
      expect(tool).toBeUndefined();
    });
  });

  describe('getAvailableTools', () => {
    it('should return all registered tools', () => {
      const tools = toolManager.getAvailableTools();
      expect(Array.isArray(tools)).toBe(true);
      expect(tools.length).toBeGreaterThan(0);
    });
  });

  describe('getToolsByNames', () => {
    it('should return tools by names', () => {
      const tools = toolManager.getToolsByNames(['file', 'shell']);
      expect(tools).toHaveLength(2);
      expect(tools[0].name).toBe('file');
      expect(tools[1].name).toBe('shell');
    });

    it('should filter out non-existent tools', () => {
      const tools = toolManager.getToolsByNames(['file', 'nonexistent', 'shell']);
      expect(tools).toHaveLength(2);
      expect(tools.map(t => t.name)).toEqual(['file', 'shell']);
    });
  });

  describe('executeTool', () => {
    it('should execute tool successfully', async () => {
      const mockTool = new MockTool();
      toolManager.registerTool(mockTool);
      
      const result = await toolManager.executeTool('mock', { input: 'test' });
      expect(result.success).toBe(true);
      expect(result.input).toBe('test');
    });

    it('should handle tool execution errors', async () => {
      const errorTool = {
        name: 'error',
        description: 'Error tool',
        schema: {},
        async execute() {
          throw new Error('Tool error');
        }
      };
      
      toolManager.registerTool(errorTool);
      
      const result = await toolManager.executeTool('error', {});
      expect(result.success).toBe(false);
      expect(result.error).toBe('Tool error');
      expect(result.tool).toBe('error');
    });

    it('should throw error for non-existent tool', async () => {
      await expect(toolManager.executeTool('nonexistent', {}))
        .rejects.toThrow('Tool not found: nonexistent');
    });
  });
});
