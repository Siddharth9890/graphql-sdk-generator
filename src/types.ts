export interface GraphqlSDKGeneratorInputConfig {
  baseDirectory?: string;
  url: string;
  sdkName: string;
  fileType: 'js' | 'ts';
  directoryName?: string;
  depth?: number;
  toGenerateSchemaFile?: boolean;
  headers?: Record<string, string>;
  debug?: boolean;
}

export interface GraphqlSDKGeneratorParsedConfig {
  baseDirectory: string;
  url: string;
  sdkName: string;
  fileType: 'js' | 'ts';
  directoryName: string;
  depth: number;
  toGenerateSchemaFile: boolean;
  headers: Record<string, string>;
  debug: boolean;
}
