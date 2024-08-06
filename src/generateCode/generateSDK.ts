import { join } from "path";
import { fetchAndGetUnifiedSchema } from "../fetchSchema";
import { GraphqlTypescriptParsedConfig } from "../types";
import { deleteFolderIfExists } from "../utils";
import { generateTsArtifacts } from "./generateArtificats";

export async function generateSdk(config: GraphqlTypescriptParsedConfig) {
  try {
    await deleteFolderIfExists(join(process.cwd(), config.baseDirectory));

    const { rawSource, unifiedSchema } = await fetchAndGetUnifiedSchema(config);

    generateTsArtifacts({
      baseDir: join(process.cwd(), config.baseDirectory),
      artifactsDirectory: config.directoryName,
      fileType: config.fileType,
      rawSources: [rawSource],
      setDepth: config.depth,
      unifiedSchema,
      sdkName: config.sdkName,
    });
  } catch (error) {
    console.error("Error in generateSdk: ", error);
  }
}
