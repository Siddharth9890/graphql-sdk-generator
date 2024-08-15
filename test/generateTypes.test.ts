import { codegen } from '@graphql-codegen/core';
import { GraphQLSchema } from 'graphql';
import * as tsBasePlugin from '@graphql-codegen/typescript';
import { generateTypesForApi } from '../src/generateCode/generateTypes';

// Mock the codegen function
jest.mock('@graphql-codegen/core', () => ({
  codegen: jest.fn(),
}));

describe('generateTypesForApi', () => {
  const mockSchema = {} as GraphQLSchema;
  const mockName = 'TestAPI';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should call codegen with correct parameters', async () => {
    (codegen as jest.Mock).mockResolvedValue('mock base types');

    await generateTypesForApi({ schema: mockSchema, name: mockName });

    expect(codegen).toHaveBeenCalledWith({
      filename: 'TestAPI_types.ts',
      documents: [],
      config: {
        skipTypename: true,
        namingConvention: 'keep',
        enumsAsTypes: true,
        ignoreEnumValuesFromSchema: true,
      },
      schemaAst: mockSchema,
      schema: undefined,
      skipDocumentsValidation: true,
      plugins: [
        {
          typescript: {},
        },
      ],
      pluginMap: {
        typescript: tsBasePlugin,
      },
    });
  });

  it('should return the correct identifier and codeAst', async () => {
    (codegen as jest.Mock).mockResolvedValue('mock base types');

    const result = await generateTypesForApi({
      schema: mockSchema,
      name: mockName,
    });

    expect(result).toEqual({
      identifier: 'TestAPITypes',
      codeAst: `
  mock base types
`,
    });
  });

  it('should handle errors from codegen gracefully', async () => {
    const mockError = new Error('Codegen error');
    (codegen as jest.Mock).mockRejectedValue(mockError);

    await expect(
      generateTypesForApi({ schema: mockSchema, name: mockName }),
    ).rejects.toThrow('Codegen error');
  });
});
