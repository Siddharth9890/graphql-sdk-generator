import { codegen } from "@graphql-codegen/core";
import { GraphQLSchema } from "graphql";
import * as tsBasePlugin from "@graphql-codegen/typescript";

export async function generateTypesForApi(options: {
  schema: GraphQLSchema;
  name: string;
}) {
  const config = {
    skipTypename: true,
    namingConvention: "keep",
    enumsAsTypes: true,
    ignoreEnumValuesFromSchema: true,
  };
  const baseTypes = await codegen({
    filename: options.name + "_types.ts",
    documents: [],
    config,
    schemaAst: options.schema,
    schema: undefined as any, // This is not necessary on codegen. Will be removed later
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
  const namespace = `${options.name}Types`;

  const codeAst = `
  ${baseTypes}
`;

  return {
    identifier: namespace,
    codeAst,
  };
}
