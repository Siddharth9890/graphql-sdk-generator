import fs from 'fs/promises';
import path, { join, relative, resolve } from 'path';
import { GraphQLSchema, IntrospectionQuery } from 'graphql';
import ts from 'typescript';
import { codegen } from '@graphql-codegen/core';

import { printSchemaWithDirectives } from '@graphql-tools/utils';
import { generateOperations, pathExists, writeFile } from '../../src/utils';
import { compileTS } from '../../src/generateCode/compileTS';
import { generateTypesForApi } from '../../src/generateCode/generateTypes';
import { generateTsArtifacts } from '../../src/generateCode/generateArtificats';

// Mock modules
jest.mock('fs/promises');
jest.mock('path');
jest.mock('graphql');
jest.mock('@graphql-codegen/core');
jest.mock('@graphql-codegen/typed-document-node');
jest.mock('@graphql-codegen/typescript');
jest.mock('@graphql-codegen/typescript-graphql-request');
jest.mock('@graphql-codegen/typescript-operations');
jest.mock('@graphql-codegen/typescript-resolvers');
jest.mock('../../src/utils');
jest.mock('../../src/generateCode/compileTS');
jest.mock('../../src/generateCode/generateTypes');

// Set up mocks

// Set up mocks
const fsMock = fs as jest.Mocked<typeof fs>;
const pathMock = path as jest.Mocked<typeof path>;
const codegenMock = codegen as jest.MockedFunction<typeof codegen>;
const printSchemaWithDirectivesMock = jest.fn();
const generateOperationsMock = generateOperations as jest.MockedFunction<typeof generateOperations>;
const pathExistsMock = pathExists as jest.MockedFunction<typeof pathExists>;
const writeFileMock = writeFile as jest.MockedFunction<typeof writeFile>;
const compileTSMock = compileTS as jest.MockedFunction<typeof compileTS>;
const generateTypesForApiMock = generateTypesForApi as jest.MockedFunction<typeof generateTypesForApi>;

// Initialize mocks
beforeEach(() => {
  jest.clearAllMocks();

  pathMock.join.mockImplementation(join);
  pathMock.relative.mockImplementation(relative);
  pathMock.resolve.mockImplementation(resolve);

  fsMock.unlink.mockResolvedValue(undefined);
  pathExistsMock.mockResolvedValue(true);

  codegenMock.mockResolvedValue('codegen output');
  printSchemaWithDirectivesMock.mockReturnValue('schema SDL');
  generateOperationsMock.mockReturnValue([]);
  writeFileMock.mockResolvedValue(undefined);

  generateTypesForApiMock.mockResolvedValue({
    identifier: 'id',
    codeAst: 'type MyType = any;',
  });
});

describe('generateTsArtifacts', () => {
  const unifiedSchema = {} as GraphQLSchema;
  const rawSources = [{} as IntrospectionQuery];
  const baseDir = '/base/dir';
  const sdkName = 'MySdk';
  const artifactsDirectory = 'artifacts';
  const setDepth = 2;
  const fileType: 'js' | 'ts' = 'ts';
  const toGenerateSchemaFile = true;

  it('should generate TypeScript artifacts', async () => {
    await generateTsArtifacts({
      unifiedSchema,
      rawSources,
      baseDir,
      sdkName,
      artifactsDirectory,
      setDepth,
      fileType,
      toGenerateSchemaFile,
    });

    // Verify writeFile is called for schema file
    expect(writeFileMock).toHaveBeenCalledWith(
      join(baseDir, artifactsDirectory, `sources/${sdkName}/schema.graphql`),
      'schema SDL'
    );

    // Verify codegen is called
    expect(codegenMock).toHaveBeenCalledWith(expect.objectContaining({
      filename: 'types.ts',
      documents: [],
      config: expect.objectContaining({}),
      schemaAst: unifiedSchema,
    }));

    // Verify that compileTS is called when fileType is 'ts'
    if (fileType === 'ts') {
      expect(compileTSMock).toHaveBeenCalledWith(
        join(baseDir, artifactsDirectory, 'index.ts'),
        ts.ModuleKind.CommonJS,
        [join(baseDir, artifactsDirectory, 'index.js'), join(baseDir, artifactsDirectory, 'index.d.ts')]
      );
    }

    // Verify unlink calls
    expect(fsMock.unlink).toHaveBeenCalledWith(join(baseDir, artifactsDirectory, 'index.js'));
    expect(fsMock.unlink).toHaveBeenCalledWith(join(baseDir, artifactsDirectory, 'index.ts'));
  });

  it('should not compile TypeScript if fileType is js', async () => {
    await generateTsArtifacts({
      unifiedSchema,
      rawSources,
      baseDir,
      sdkName,
      artifactsDirectory,
      setDepth,
      fileType: 'js',
      toGenerateSchemaFile,
    });

    // Verify that compileTS is not called when fileType is 'js'
    expect(compileTSMock).not.toHaveBeenCalled();
  });

  it('should handle case when tsconfig.json does not exist', async () => {
    pathExistsMock.mockResolvedValue(false);

    await generateTsArtifacts({
      unifiedSchema,
      rawSources,
      baseDir,
      sdkName,
      artifactsDirectory,
      setDepth,
      fileType,
      toGenerateSchemaFile,
    });

    // Verify that jobs are not executed when tsconfig.json does not exist
    expect(compileTSMock).not.toHaveBeenCalled();
  });
});
