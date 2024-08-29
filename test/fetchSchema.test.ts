import {
  GraphQLSchema,
  IntrospectionQuery,
  getIntrospectionQuery,
} from 'graphql';
import { GraphqlSDKGeneratorParsedConfig } from '../src/types';
import { getUnifiedSchema } from '../src/utils';
import { fetchAndGetUnifiedSchema } from '../src/fetchSchema';

jest.mock('graphql');
jest.mock('../src/utils');

const fetchMock = jest.fn();
globalThis.fetch = fetchMock as unknown as typeof fetch;

describe('fetchAndGetUnifiedSchema', () => {
  const mockConfig: GraphqlSDKGeneratorParsedConfig = {
    url: 'https://example.com/graphql',
    headers: { Authorization: 'Bearer token' },
    debug: false,
    sdkName: 'test',
    fileType: 'ts',
    baseDirectory: 'test',
    depth: 2,
    directoryName: 'test',
    toGenerateSchemaFile: true,
  };

  const mockResponse = {
    ok: true,
    status: 200,
    json: jest.fn().mockResolvedValue({ data: {} as IntrospectionQuery }),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch and return unified schema successfully', async () => {
    const mockSchema = {} as GraphQLSchema;
    const mockRawSource = {} as IntrospectionQuery;
    (getUnifiedSchema as jest.Mock).mockReturnValue(mockSchema);
    fetchMock.mockResolvedValue(mockResponse);

    const result = await fetchAndGetUnifiedSchema(mockConfig);

    expect(fetchMock).toHaveBeenCalledWith(mockConfig.url, {
      method: 'POST',
      headers: {
        accept:
          'application/graphql-response+json, application/json, multipart/mixed',
        'content-type': 'application/json',
        ...mockConfig.headers,
      },
      body: JSON.stringify({ query: getIntrospectionQuery() }),
    });

    expect(result).toEqual({
      unifiedSchema: mockSchema,
      rawSource: mockRawSource,
    });
  });

  it('should log debug information if debug is true', async () => {
    const debugConfig = { ...mockConfig, debug: true };
    const mockSchema = {} as GraphQLSchema;
    (getUnifiedSchema as jest.Mock).mockReturnValue(mockSchema);
    fetchMock.mockResolvedValue(mockResponse);

    const consoleLogMock = jest.spyOn(console, 'log').mockImplementation();

    await fetchAndGetUnifiedSchema(debugConfig);

    expect(consoleLogMock).toHaveBeenCalledWith(
      '\n-----------------------------',
    );
    expect(consoleLogMock).toHaveBeenCalledWith(
      `Network Details URL: ${debugConfig.url}`,
    );
    expect(consoleLogMock).toHaveBeenCalledWith('Method: POST');
    expect(consoleLogMock).toHaveBeenCalledWith('Headers:');
    expect(consoleLogMock).toHaveBeenCalledWith(
      'accept: application/graphql-response+json, application/json, multipart/mixed',
    );
    expect(consoleLogMock).toHaveBeenCalledWith(
      'content-type: application/json',
    );
    expect(consoleLogMock).toHaveBeenCalledWith('Authorization: Bearer token');
    expect(consoleLogMock).toHaveBeenCalledWith(
      '\n-----------------------------',
    );
  });

  it('should throw an error for HTTP errors', async () => {
    const errorResponse = { ok: false, status: 500 } as Response;
    fetchMock.mockResolvedValue(errorResponse);

    await expect(fetchAndGetUnifiedSchema(mockConfig)).rejects.toThrow(
      'HTTP error! Status: 500',
    );
  });

  it('should throw an error if JSON parsing fails', async () => {
    const faultyResponse = {
      ok: true,
      status: 200,
      json: jest.fn().mockRejectedValue(new Error('Parsing error')),
    } as unknown as Response;
    fetchMock.mockResolvedValue(faultyResponse);

    await expect(fetchAndGetUnifiedSchema(mockConfig)).rejects.toThrow(
      'Parsing error',
    );
  });
});
