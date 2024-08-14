import { join } from 'path';
import { generateSdk } from '../../src/generateCode/generateSDK';
import { deleteFolderIfExists } from '../../src/utils';
import { fetchAndGetUnifiedSchema } from '../../src/fetchSchema';
import { generateTsArtifacts } from '../../src/generateCode/generateArtificats';
import { GraphqlTypescriptParsedConfig } from '../../src/types';

// Mock dependencies
jest.mock('path');
jest.mock('../../src/fetchSchema');
jest.mock('../../src/utils');
jest.mock('../../src/generateCode/generateSDK');

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

  beforeEach(() => {
    jest.clearAllMocks();
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
    const mockSchemaResult = {
      rawSource: 'mock raw source',
      unifiedSchema: 'mock unified schema',
    };
    (fetchAndGetUnifiedSchema as jest.Mock).mockResolvedValue(mockSchemaResult);

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
});
