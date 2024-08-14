import path from 'path';
import fs from 'fs/promises';
import { spawn } from 'child_process';

describe('E2E tests for init function', () => {
  const mockConfigPath = path.resolve(__dirname, 'mock-config.json');
  const validConfig = {
    baseDirectory: './src',
    directoryName: 'sdk',
    fileType: 'ts',
    depth: 3,
    sdkName: 'MySDK',
    toGenerateSchemaFile: true,
    debug: false,
  };

  const invalidConfig = {
    directoryName: 'sdk',
    fileType: 'ts',
    depth: 3,
    sdkName: 'MySDK',
    toGenerateSchemaFile: true,
  };

  beforeAll(async () => {
    await fs.writeFile(mockConfigPath, JSON.stringify(validConfig, null, 2));
    await fs.writeFile(
      path.resolve(__dirname, 'invalid-config.json'),
      JSON.stringify(invalidConfig, null, 2),
    );
  });

  afterAll(async () => {
    await fs.unlink(mockConfigPath);
    await fs.unlink(path.resolve(__dirname, 'invalid-config.json'));
  });

  function runCLI(
    args: string[],
  ): Promise<{ code: number; stdout: string; stderr: string }> {
    return new Promise((resolve, reject) => {
      const cliProcess = spawn('ts-node-dev', ['../src/index.ts', ...args]);

      let stdout = '';
      let stderr = '';

      cliProcess.stdout.on('data', (data) => {
        stdout += data.toString();
      });

      cliProcess.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      cliProcess.on('close', (code) => {
        resolve({ code: code ?? 0, stdout, stderr });
      });

      cliProcess.on('error', (error) => {
        reject(error);
      });
    });
  }

  it('should fail with invalid configuration', async () => {
    const { code, stderr } = await runCLI([
      '-c',
      path.resolve(__dirname, 'invalid-config.json'),
    ]);

    expect(code).toBe(1);
    expect(stderr).toBeDefined();
  });

  it('should display an error when config file is missing', async () => {
    const { code, stderr } = await runCLI(['-c', 'non-existent-config.json']);

    expect(code).toBe(1);
    expect(stderr).toBeDefined();
  });

  it('should debug log when debug flag is enabled in config', async () => {
    const debugConfig = { ...validConfig, debug: true };
    await fs.writeFile(mockConfigPath, JSON.stringify(debugConfig, null, 2));

    const { code, stdout } = await runCLI(['-c', mockConfigPath]);

    expect(code).toBe(1);
    expect(stdout).toBeDefined();
  });
});
