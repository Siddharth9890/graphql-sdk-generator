import { deleteFolderIfExists } from "./utils";
import { generateTsArtifacts } from "./generateArtificats";
import path, { join } from "path";
import Ajv, { JSONSchemaType } from "ajv";
import { Command } from "commander";
import { fetchAndGetUnifiedSchema } from "./fetchSchema";

// take these as arguments
// base directory optionall if not provided will create near to package.json
// need schmea.graphql by default true can set to false
// change variable name like queryqueryme

const ajv = new Ajv({ useDefaults: true });
const program = new Command();

export interface Config {
  baseDirectory?: string;
  url: string;
  directoryName?: string;
  sdkName: string;
  depth?: number;
  toGenerateSchemaFile?: boolean;
  fileType: "js" | "ts";
  headers?: Record<string, string>;
  fetchMethod: "GET" | "POST";
}

const schema: JSONSchemaType<Config> = {
  type: "object",
  properties: {
    baseDirectory: { type: "string", default: "", nullable: true },
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
    toGenerateSchemaFile: { type: "boolean", default: true, nullable: true },
    headers: {
      type: "object",
      default: {},
      additionalProperties: { type: "string" },
      nullable: true,
      required: [] as const,
    },
  },
  required: ["url", "sdkName"],
  additionalProperties: false,
};

async function generateSdk({ config }: { config: Config }) {
  try {
    path.resolve();
    await deleteFolderIfExists(join(__dirname, "..", "gatewaySdk"));

    const { rawSource, unifiedSchema } = await fetchAndGetUnifiedSchema({
      config,
    });

    generateTsArtifacts({
      baseDir: join(__dirname, ".."),
      artifactsDirectory: "gatewaySdk",
      fileType: "ts",
      rawSources: [rawSource],
      setDepth: 2,
      unifiedSchema,
      sdkName: "GatewaySDK",
    });
  } catch (error) {
    console.log("Error in generateSdk: ", error);
  }
}

generateSdk();
