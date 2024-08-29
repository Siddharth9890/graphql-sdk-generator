import fs from 'fs/promises';
import path from 'path';
import { generateSdk } from '../src/generateCode/generateSDK';
import { init } from '../src';

jest.mock('fs/promises');
jest.mock('path');
jest.mock('../src/generateCode/generateSDK');
jest.mock('commander', () => ({
  Command: jest.fn().mockImplementation(() => ({
    version: jest.fn().mockReturnThis(),
    description: jest.fn().mockReturnThis(),
    requiredOption: jest.fn().mockReturnThis(),
    parse: jest.fn().mockReturnThis(),
    opts: jest.fn().mockReturnValue({ configPath: './mock-config.json' }),
  })),
}));

describe('Graphql Typescript Types CLI', () => {
  const mockConfig = {
    url: 'http://example.com/graphql',
    sdkName: 'TestSDK',
    fileType: 'ts',
    baseDirectory: './test',
    directoryName: 'generated',
    depth: 3,
    debug: false,
    toGenerateSchemaFile: true,
    headers: { Authorization: 'Bearer token' },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (path.resolve as jest.Mock).mockReturnValue('/mocked/path/config.json');
    (fs.readFile as jest.Mock).mockResolvedValue(JSON.stringify(mockConfig));
    (generateSdk as jest.Mock).mockResolvedValue(undefined);
  });

  it('should read and parse config file correctly', async () => {
    await init();
    expect(fs.readFile).toHaveBeenCalledWith(
      '/mocked/path/config.json',
      'utf-8',
    );
  });

  it('should validate config and call generateSdk with valid config', async () => {
    await init();

    expect(generateSdk).toHaveBeenCalledWith(
      expect.objectContaining(mockConfig),
    );
  });

  it('should return false if config is invalid', async () => {
    const invalidConfig = { ...mockConfig, url: undefined };
    (fs.readFile as jest.Mock).mockResolvedValue(JSON.stringify(invalidConfig));

    const result = await init();
    expect(result).toBe(false);
    expect(generateSdk).not.toHaveBeenCalled();
  });

  it('should use default values for optional fields', async () => {
    const minimalConfig = {
      url: 'http://example.com/graphql',
      sdkName: 'TestSDK',
      fileType: 'ts',
    };
    (fs.readFile as jest.Mock).mockResolvedValue(JSON.stringify(minimalConfig));

    await init();

    expect(generateSdk).toHaveBeenCalledWith({
      ...minimalConfig,
      baseDirectory: './',
      directoryName: 'graphqlSDKGenerator',
      depth: 2,
      debug: false,
      toGenerateSchemaFile: true,
      headers: {},
    });
  });

  it('should log debug information when debug is true', async () => {
    const debugConfig = { ...mockConfig, debug: true };
    (fs.readFile as jest.Mock).mockResolvedValue(JSON.stringify(debugConfig));
    console.debug = jest.fn();

    await init();

    expect(console.debug).toHaveBeenCalledWith(
      'Config values received: ',
      expect.any(Object),
    );
  });

  it('should handle and log errors', async () => {
    (fs.readFile as jest.Mock).mockRejectedValue(new Error('File read error'));
    console.error = jest.fn();

    const result = await init();
    expect(result).toBe(false);
    expect(console.error).toHaveBeenCalledWith(
      'Something went wrong!:',
      expect.any(Error),
    );
  });

  it('should use configPath from command line arguments', async () => {
    (path.resolve as jest.Mock).mockReturnValue(
      '/mocked/path/custom-config.json',
    );

    await init();

    expect(path.resolve).toHaveBeenCalledWith(
      expect.any(String),
      './mock-config.json',
    );
    expect(fs.readFile).toHaveBeenCalledWith(
      '/mocked/path/custom-config.json',
      'utf-8',
    );
  });
});
