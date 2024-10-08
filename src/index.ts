#!/usr/bin/env node

import fs from 'fs/promises';
import path from 'path';

import Ajv, { JSONSchemaType } from 'ajv';
import { Command } from 'commander';

import {
  GraphqlSDKGeneratorInputConfig,
  GraphqlSDKGeneratorParsedConfig,
} from './types';
import { generateSdk } from './generateCode/generateSDK';

const ajv = new Ajv({ useDefaults: true });
const program = new Command();

const schema: JSONSchemaType<GraphqlSDKGeneratorInputConfig> = {
  type: 'object',
  properties: {
    baseDirectory: { type: 'string', default: './', nullable: true },
    url: { type: 'string' },
    sdkName: { type: 'string' },
    fileType: { type: 'string', pattern: '^(js|ts)$' },
    directoryName: {
      type: 'string',
      default: 'graphqlSDKGenerator',
      nullable: true,
    },
    depth: { type: 'integer', default: 2, nullable: true, minimum: 1 },
    debug: { type: 'boolean', default: false, nullable: true },
    toGenerateSchemaFile: { type: 'boolean', default: true, nullable: true },
    headers: {
      type: 'object',
      default: {},
      additionalProperties: { type: 'string' },
      nullable: true,
      required: [] as const,
    },
  },
  required: ['url', 'sdkName', 'fileType'],
  additionalProperties: false,
};

export const init = async () => {
  try {
    program
      .version('1.0.0')
      .description(
        'GraphQL SDK Generator a CLI tool that generates ready to use SDK using GraphQL Schemas.',
      )
      .requiredOption('-c, --configPath <path>', 'Path to config file')
      .parse(process.argv);

    const options = program.opts<{ configPath: string }>();

    const configPath = path.resolve(process.cwd(), options.configPath);

    const configFile = await fs.readFile(configPath, 'utf-8');
    const config: GraphqlSDKGeneratorParsedConfig = JSON.parse(
      configFile,
    ) as GraphqlSDKGeneratorParsedConfig;

    const validate = ajv.compile(schema);
    const valid = validate(config);

    if (!config.baseDirectory) {
      config.baseDirectory = options.configPath;
    }

    if (config.debug) {
      console.log('\n-----------------------------');
      console.debug('Config values received: ', config);
      console.log('\n-----------------------------');
    }

    if (!valid) {
      console.log('\n-----------------------------');
      console.error('Invalid configuration:', validate.errors);
      console.log('\n-----------------------------');
      return false;
    }

    await generateSdk(config);
    return true;
  } catch (error) {
    console.log('\n-----------------------------');
    console.error('Something went wrong!:', error);
    console.log('\n-----------------------------');
    return false;
  }
};

if (require.main === module) {
  init().then((success) => {
    process.exit(success ? 0 : 1);
  });
}
