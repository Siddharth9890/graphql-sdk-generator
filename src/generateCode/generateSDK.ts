import { join } from 'path';
import { fetchAndGetUnifiedSchema } from '../fetchSchema';
import { GraphqlTypescriptParsedConfig } from '../types';
import { deleteFolderIfExists } from '../utils';
import { generateTsArtifacts } from './generateArtificats';

export async function generateSdk(config: GraphqlTypescriptParsedConfig) {
  try {
    await deleteFolderIfExists(
      join(config.baseDirectory, config.directoryName),
    );

    const { rawSource, unifiedSchema } = await fetchAndGetUnifiedSchema(config);

    await generateTsArtifacts({
      baseDir: join(config.baseDirectory, config.directoryName),
      artifactsDirectory: config.directoryName,
      fileType: config.fileType,
      rawSources: [rawSource],
      setDepth: config.depth,
      unifiedSchema,
      sdkName: config.sdkName,
      toGenerateSchemaFile: config.toGenerateSchemaFile,
    });
  } catch (error) {
    console.error('Error in generateSdk: ', error);
  }
}
