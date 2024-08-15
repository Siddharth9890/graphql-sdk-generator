import { join } from 'path';
import { GraphqlTypescriptParsedConfig } from '../src/types';
import { fetchAndGetUnifiedSchema } from '../src/fetchSchema';
import { deleteFolderIfExists } from '../src/utils';
import { generateSdk } from '../src/generateCode/generateSDK';
import { generateTsArtifacts } from '../src/generateCode/generateArtificats';

// Mock the dependencies
jest.mock('path', () => ({
  join: jest.fn((a, b) => `${a}/${b}`),
}));
jest.mock('../src/fetchSchema');
jest.mock('../src/utils');
jest.mock('../src/generateCode/generateArtificats');

describe('generateSdk', () => {
  const mockConfig: GraphqlTypescriptParsedConfig = {
    baseDirectory: '/base',
    directoryName: 'sdk',
    fileType: 'ts',
    depth: 3,
    sdkName: 'TestSDK',
    toGenerateSchemaFile: true,
    debug: false,
    headers: {},
    url: '',
  };

  const mockSchemaResult = {
    rawSource: 'mock raw source',
    unifiedSchema: 'mock unified schema',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (fetchAndGetUnifiedSchema as jest.Mock).mockResolvedValue(mockSchemaResult);
  });

  it('should call deleteFolderIfExists with correct path', async () => {
    await generateSdk(mockConfig);
    expect(deleteFolderIfExists).toHaveBeenCalledWith('/base/sdk');
  });

  it('should call fetchAndGetUnifiedSchema with config', async () => {
    await generateSdk(mockConfig);
    expect(fetchAndGetUnifiedSchema).toHaveBeenCalledWith(mockConfig);
  });

  it('should call generateTsArtifacts with correct parameters', async () => {
    await generateSdk(mockConfig);

    expect(generateTsArtifacts).toHaveBeenCalledWith({
      baseDir: '/base/sdk',
      artifactsDirectory: 'sdk',
      fileType: 'ts',
      rawSources: ['mock raw source'],
      setDepth: 3,
      unifiedSchema: 'mock unified schema',
      sdkName: 'TestSDK',
      toGenerateSchemaFile: true,
    });
  });

  it('should log error if an exception occurs', async () => {
    const mockError = new Error('Test error');
    (fetchAndGetUnifiedSchema as jest.Mock).mockRejectedValue(mockError);
    console.error = jest.fn();

    await generateSdk(mockConfig);

    expect(console.error).toHaveBeenCalledWith(
      'Error in generateSdk: ',
      mockError,
    );
  });

  it('should not call generateTsArtifacts if an error occurs in deleteFolderIfExists', async () => {
    const mockError = new Error('Delete folder error');
    (deleteFolderIfExists as jest.Mock).mockRejectedValue(mockError);
    console.error = jest.fn();

    await generateSdk(mockConfig);

    expect(generateTsArtifacts).not.toHaveBeenCalled();
    expect(console.error).toHaveBeenCalledWith(
      'Error in generateSdk: ',
      mockError,
    );
  });
});
