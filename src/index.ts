#!/usr/bin/env node

import fs from "fs/promises";
import path from "path";

import Ajv, { JSONSchemaType } from "ajv";
import { Command } from "commander";

import {
  GraphqlTypescriptInputConfig,
  GraphqlTypescriptParsedConfig,
} from "./types";
import { generateSdk } from "./generateCode/generateSDK";

// take these as arguments
// base directory optionall if not provided will create near to package.json
// change variable name like queryqueryme

const ajv = new Ajv({ useDefaults: true });
const program = new Command();

const schema: JSONSchemaType<GraphqlTypescriptInputConfig> = {
  type: "object",
  properties: {
    baseDirectory: { type: "string", default: "../", nullable: true },
    url: { type: "string" },
    sdkName: { type: "string" },
    fileType: { type: "string" },
    fetchMethod: { type: "string" },
    directoryName: {
      type: "string",
      default: "graphqlTypescriptTypes",
      nullable: true,
    },
    depth: { type: "integer", default: 2, nullable: true },
    debug: { type: "boolean", default: false, nullable: true },
    toGenerateSchemaFile: { type: "boolean", default: true, nullable: true },
    headers: {
      type: "object",
      default: {},
      additionalProperties: { type: "string" },
      nullable: true,
      required: [] as const,
    },
  },
  required: ["url", "sdkName", "fetchMethod", "fileType"],
  additionalProperties: false,
};

const init = async () => {
  try {
    // program
    //   .version("1.0.0")
    //   .description(
    //     "CLI tool that takes a config file, validates it, and performs actions"
    //   )
    //   .requiredOption("-c, --config <path>", "Path to config file")
    //   .parse(process.argv);

    const options = program.opts<{ config: string }>();

    // const configPath = path.resolve(process.cwd(), options.config);
    const configPath = path.resolve(process.cwd(), "./base-config.json");
    let config: GraphqlTypescriptParsedConfig;

    const configFile = await fs.readFile(configPath, "utf-8");
    config = JSON.parse(configFile) as GraphqlTypescriptParsedConfig;

    const validate = ajv.compile(schema);
    const valid = validate(config);

    if (config.debug) {
      console.log("\n\n -----------------------------");
      console.debug("Config values received: ", config);
      console.log("\n\n -----------------------------");
    }

    if (!valid) {
      console.error("Invalid configuration:", validate.errors);
      process.exit(1);
    }

    generateSdk(config);
  } catch (error: any) {
    console.error("Error reading or parsing config file:", error);
    process.exit(1);
  }
};

init();
