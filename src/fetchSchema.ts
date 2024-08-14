import {
  GraphQLSchema,
  IntrospectionQuery,
  getIntrospectionQuery,
  buildClientSchema,
} from 'graphql';
import { getUnifiedSchema } from './utils';
import { GraphqlTypescriptParsedConfig } from './types';

export async function fetchAndGetUnifiedSchema(
  config: GraphqlTypescriptParsedConfig,
): Promise<{
  unifiedSchema: GraphQLSchema;
  rawSource: IntrospectionQuery;
}> {
  try {
    const defaultHeaders = {
      accept:
        'application/graphql-response+json, application/json, multipart/mixed',
      'content-type': 'application/json',
    };

    const response = await fetch(config.url, {
      method: 'POST',
      headers: { ...defaultHeaders, ...config.headers },
      body: JSON.stringify({ query: getIntrospectionQuery() }),
    });

    if (config.debug) {
      console.log('\n-----------------------------');
      console.log(`URL: ${config.url}`);
      console.log(`Method: POST`);
      console.log('Headers:');
      for (const [key, value] of Object.entries({
        ...defaultHeaders,
        ...config.headers,
      })) {
        console.log(`${key}: ${value}`);
      }
      console.log('\n-----------------------------');
    }

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
