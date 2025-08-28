import axios from 'axios';
import { BaseTool } from './BaseTool';

export class HttpTool extends BaseTool {
  public name = 'http';
  public description = 'Make HTTP requests to external APIs';
  public schema = {
    type: 'object',
    properties: {
      method: {
        type: 'string',
        enum: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
        default: 'GET',
        description: 'HTTP method'
      },
      url: {
        type: 'string',
        description: 'The URL to request'
      },
      headers: {
        type: 'object',
        description: 'HTTP headers'
      },
      data: {
        type: 'object',
        description: 'Request body data'
      },
      timeout: {
        type: 'number',
        default: 10000,
        description: 'Request timeout in milliseconds'
      }
    },
    required: ['url']
  };

  async execute(parameters: Record<string, any>): Promise<any> {
    this.validateParameters(parameters);

    const { method = 'GET', url, headers = {}, data, timeout = 10000 } = parameters;

    try {
      // Basic URL validation
      const urlObject = new URL(url);
      
      // Block localhost and private networks for security
      if (urlObject.hostname === 'localhost' || 
          urlObject.hostname === '127.0.0.1' ||
          urlObject.hostname.startsWith('192.168.') ||
          urlObject.hostname.startsWith('10.') ||
          urlObject.hostname.match(/^172\.(1[6-9]|2[0-9]|3[01])\./)) {
        throw new Error('Access to local/private networks is blocked');
      }

      const config: any = {
        method: method.toLowerCase(),
        url,
        headers: {
          'User-Agent': 'BakaCode-Agent/1.0',
          ...headers
        },
        timeout
      };

      if (data && ['POST', 'PUT', 'PATCH'].includes(method.toUpperCase())) {
        config.data = data;
        if (!headers['Content-Type']) {
          config.headers['Content-Type'] = 'application/json';
        }
      }

      const response = await axios(config);

      return {
        success: true,
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
        data: response.data,
        url: response.config.url
      };
    } catch (error: any) {
      if (error.response) {
        return {
          success: false,
          status: error.response.status,
          statusText: error.response.statusText,
          headers: error.response.headers,
          data: error.response.data,
          error: `HTTP ${error.response.status}: ${error.response.statusText}`
        };
      } else {
        return {
          success: false,
          error: error.message
        };
      }
    }
  }
}
