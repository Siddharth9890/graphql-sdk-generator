import fs from 'fs/promises';
import path from 'path';
import { Command } from 'commander';
import Ajv from 'ajv';
import { init } from '../../src';
import { GraphqlTypescriptParsedConfig } from '../../src/types';
import { generateSdk } from '../../src/generateCode/generateSDK';

jest.mock('fs/promises');
jest.mock('path');
jest.mock('commander', () => ({
  Command: jest.fn().mockImplementation(() => ({
    version: jest.fn().mockReturnThis(),
    description: jest.fn().mockReturnThis(),
    requiredOption: jest.fn().mockReturnThis(),
    parse: jest.fn().mockReturnThis(),
    opts: jest.fn(),
  })),
}));
jest.mock('ajv');
jest.mock('../../src/generateCode/generateSDK');

describe('init', () => {
  const mockConfig: GraphqlTypescriptParsedConfig = {
    baseDirectory: './',
    url: 'https://example.com/graphql',
    sdkName: 'exampleSdk',
    fileType: 'ts',
    directoryName: 'graphqlTypescriptTypes',
    depth: 2,
    debug: false,
    toGenerateSchemaFile: true,
    headers: {},
  };

  let commandInstance: Command;
  let mockExit: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();

    (fs.readFile as jest.Mock).mockResolvedValue(JSON.stringify(mockConfig));
    (path.resolve as jest.Mock).mockReturnValue('/resolved/path/config.json');
    commandInstance = new Command();
    (commandInstance.opts as jest.Mock).mockReturnValue({
      configPath: '/path/to/config.json',
    });

  });

  it('should read the config file and generate the SDK', async () => {
    const mockAjv = {
      compile: jest.fn().mockReturnValue(jest.fn().mockReturnValue(true)),
    };
    (Ajv as unknown as jest.Mock).mockImplementation(() => mockAjv);

    await init();

    expect(fs.readFile).toHaveBeenCalledWith(
      '/resolved/path/config.json',
      'utf-8',
    );
    expect(mockAjv.compile).toHaveBeenCalled();
    expect(generateSdk).toHaveBeenCalledWith(mockConfig);
  });

  it('should log an error and exit if the config is invalid', async () => {
    const mockAjv = {
      compile: jest.fn().mockReturnValue(jest.fn().mockReturnValue(false)),
    };
    (Ajv as unknown as jest.Mock).mockImplementation(() => mockAjv);
    mockExit = jest.spyOn(process, 'exit').mockReturnValue(undefined as never);

    await expect(init()).rejects.toThrow('process.exit(1) was called');

    expect(console.error).toHaveBeenCalledWith(
      'Invalid configuration:',
      undefined,
    );
  });

  it('should log an error and exit if an exception occurs', async () => {
    (fs.readFile as jest.Mock).mockRejectedValue(new Error('File not found'));
        mockExit = jest
          .spyOn(process, 'exit')
          .mockReturnValue(undefined as never);

    await expect(init()).rejects.toThrow('process.exit(1) was called');

    expect(console.error).toHaveBeenCalledWith(
      'Something went wrong!:',
      expect.any(Error),
    );
  });
});
