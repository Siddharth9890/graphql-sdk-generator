export interface GraphqlTypescriptInputConfig {
  baseDirectory?: string;
  url: string;
  sdkName: string;
  fileType: 'js' | 'ts';
  fetchMethod: 'POST';
  directoryName?: string;
  depth?: number;
  toGenerateSchemaFile?: boolean;
  headers?: Record<string, string>;
  debug?: boolean;
}

export interface GraphqlTypescriptParsedConfig {
  baseDirectory: string;
  url: string;
  sdkName: string;
  fileType: 'js' | 'ts';
  fetchMethod: 'POST';
  directoryName: string;
  depth: number;
  toGenerateSchemaFile: boolean;
  headers: Record<string, string>;
  debug: boolean;
}
