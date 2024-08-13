import { exec } from 'child_process';
import fs from 'fs/promises';
import path from 'path';
import { fetchAndGetUnifiedSchema } from '../../src/fetchSchema';
import { generateTsArtifacts } from '../../src/generateCode/generateArtificats';

const runCLI = (
  args: string[],
): Promise<{ stdout: string; stderr: string }> => {
  return new Promise((resolve, reject) => {
    exec(
      `ts-node-dev ./src/index.ts ${args.join(' ')}`,
      (error, stdout, stderr) => {
        if (error) {
          reject({ stdout, stderr });
        } else {
          resolve({ stdout, stderr });
        }
      },
    );
  });
};

jest.mock('../../src/generateCode/generateSDK.ts', () => ({
  fetchAndGetUnifiedSchema: jest.fn(),
  generateTsArtifacts: jest.fn(),
}));

describe('CLI Tool E2E Tests', () => {
  const configPath = path.resolve(__dirname, 'test-config.json');
  const baseDir = path.resolve(__dirname, 'test-dir');

  beforeEach(async () => {
    await fs.writeFile(
      configPath,
      JSON.stringify(
        {
          url: 'http://example.com',
          sdkName: 'example-sdk',
          fetchMethod: 'POST',
          fileType: 'json',
          baseDirectory: baseDir,
        },
        null,
        2,
      ),
    );

    // Create base directory and some files
    await fs.mkdir(baseDir, { recursive: true });
    await fs.writeFile(path.join(baseDir, 'test-file.txt'), 'Hello, world!');
  });

  afterEach(async () => {
    await fs.rm(baseDir, { recursive: true, force: true });
    await fs.unlink(configPath);
  });

  // it('should delete the base directory if it exists', async () => {
  //   const { stdout, stderr } = await runCLI(['-c', configPath]);
  //   console.log('stdout:', stdout);
  //   console.log('stderr:', stderr);

  //   await expect(fs.access(baseDir)).rejects.toThrow();
  // });

  it('should not delete anything if the base directory does not exist', async () => {
    await fs.rm(baseDir, { recursive: true, force: true });

    await runCLI(['-c', configPath]);

    await expect(fs.access(baseDir)).rejects.toThrow();
  });
});
