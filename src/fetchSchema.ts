import {
  GraphQLSchema,
  IntrospectionQuery,
  getIntrospectionQuery,
  buildClientSchema,
} from "graphql";
import { getUnifiedSchema } from "./utils";
import { Config } from ".";

export async function fetchAndGetUnifiedSchema({
  config,
}: {
  config: Config;
}): Promise<{
  unifiedSchema: GraphQLSchema;
  rawSource: IntrospectionQuery;
}> {
  try {
    const response = await fetch(config.url, {
      method: config.fetchMethod,
      headers: {
        accept:
          "application/graphql-response+json, application/json, multipart/mixed",
        "content-type": "application/json",
      },
      body: JSON.stringify({ query: getIntrospectionQuery() }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();

    const baseSchema = buildClientSchema(data.data, {
      assumeValid: true,
    });

    return {
      unifiedSchema: getUnifiedSchema(baseSchema),
      rawSource: data.data,
    };
  } catch (error) {
    throw error;
  }
}
