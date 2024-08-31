import fs from 'fs/promises';
import path from 'path';
import { GraphQLSchema, IntrospectionQuery } from 'graphql';
import { codegen } from '@graphql-codegen/core';

import * as graphqlTools from '@graphql-tools/utils';
import * as graphqlCodegen from '@graphql-codegen/core';
import { generateOperations, pathExists, writeFile } from '../src/utils';
import { compileTS } from '../src/generateCode/compileTS';
import { generateTypesForApi } from '../src/generateCode/generateTypes';
import { generateTsArtifacts } from '../src/generateCode/generateArtificats';

jest.mock('fs/promises');
jest.mock('path');
jest.mock('graphql');

jest.mock('@graphql-codegen/typescript-graphql-request', () => ({
  plugin: jest.fn(),
}));
jest.mock('@graphql-codegen/typescript-operations', () => ({
  plugin: jest.fn(),
}));
jest.mock('@graphql-codegen/typescript-resolvers', () => ({
  plugin: jest.fn(),
}));
jest.mock('../src/utils');
jest.mock('../src/generateCode/compileTS');
jest.mock('../src/generateCode/generateTypes');
jest.mock('@graphql-tools/utils', () => ({
  printSchemaWithDirectives: jest.fn(),
}));

jest.mock('../src/utils', () => ({
  memoize1: jest.fn(),
  pathExists: jest.fn(),
  generateOperations: jest.fn(),
  writeFile: jest.fn(),
}));

jest.mock('@graphql-codegen/core', () => ({
  codegen: jest.fn(),
  memoize1: jest.fn(),
}));
jest.mock('@graphql-codegen/typescript', () => ({
  plugin: jest.fn(),
}));
jest.mock('@graphql-codegen/typed-document-node', () => ({
  plugin: jest.fn(),
}));

describe('generateTsArtifacts', () => {
  const mockSourceMap = new Map([
    ['source1', 'transformedSchema1'],
    ['source2', 'transformedSchema2'],
  ]);

  const mockUnifiedSchema: Partial<GraphQLSchema> = {
    extensions: {
      sourceMap: mockSourceMap,
    },
  };

  const mockConfig = {
    unifiedSchema: mockUnifiedSchema as GraphQLSchema,
    rawSources: [{} as IntrospectionQuery],
    baseDir: '/base/dir',
    sdkName: 'TestSDK',
    artifactsDirectory: 'artifacts',
    setDepth: 3,
    fileType: 'ts' as 'js' | 'ts',
    toGenerateSchemaFile: true,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (path.join as jest.Mock).mockImplementation((...args) => args.join('/'));
    (path.relative as jest.Mock).mockReturnValue('relative/path');
    (pathExists as jest.Mock).mockResolvedValue(true);
    (graphqlTools.printSchemaWithDirectives as jest.Mock).mockReturnValue(
      'mock SDL',
    );
    (generateOperations as jest.Mock).mockReturnValue([]);
    (graphqlCodegen.codegen as jest.Mock).mockResolvedValue(
      'mock codegen output',
    );
    (generateTypesForApi as jest.Mock).mockResolvedValue({
      identifier: 'mockIdentifier',
      codeAst: 'mock code AST',
    });
    (writeFile as jest.Mock).mockResolvedValue(undefined);
  });

  it('should generate schema file when toGenerateSchemaFile is true', async () => {
    await generateTsArtifacts(mockConfig);
    expect(writeFile).toHaveBeenCalledWith(
      '/base/dir/artifacts/sources/TestSDK/schema.graphql',
      'mock SDL',
    );
  });

  it('should not generate schema file when toGenerateSchemaFile is false', async () => {
    await generateTsArtifacts({ ...mockConfig, toGenerateSchemaFile: false });
    expect(writeFile).not.toHaveBeenCalledWith(
      '/base/dir/artifacts/sources/TestSDK/schema.graphql',
      expect.anything(),
    );
  });

  it('should call codegen with correct parameters', async () => {
    await generateTsArtifacts(mockConfig);
    expect(codegen).toHaveBeenCalledWith(
      expect.objectContaining({
        filename: 'types.ts',
        schemaAst: mockConfig.unifiedSchema,
      }),
    );
  });

  it('should write generated types file', async () => {
    await generateTsArtifacts(mockConfig);

    expect(writeFile).toHaveBeenCalled();
  });

  it('should compile TS to JS when fileType is js', async () => {
    await generateTsArtifacts({ ...mockConfig, fileType: 'js' });
    expect(compileTS).toHaveBeenCalled();
  });

  it('should not compile TS to JS when fileType is ts', async () => {
    await generateTsArtifacts(mockConfig);
    expect(compileTS).not.toHaveBeenCalled();
  });

  it('should delete index.ts when compiling to JS', async () => {
    await generateTsArtifacts({ ...mockConfig, fileType: 'js' });
    expect(fs.unlink).toHaveBeenCalledWith('/base/dir/artifacts/index.ts');
  });

  it('should not perform any operations if tsconfig.json does not exist', async () => {
    (pathExists as jest.Mock).mockResolvedValue(false);
    await generateTsArtifacts(mockConfig);
    expect(compileTS).not.toHaveBeenCalled();
    expect(fs.unlink).not.toHaveBeenCalled();
  });
});
