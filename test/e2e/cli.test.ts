import { exec } from "child_process";
import fs from "fs/promises";
import path from "path";

const runCLI = (
  args: string[]
): Promise<{ stdout: string; stderr: string }> => {
  return new Promise((resolve, reject) => {
    exec(
      `ts-node-dev ./src/index.ts ${args.join(" ")}`,
      (error, stdout, stderr) => {
        if (error) {
          reject({ stdout, stderr });
        } else {
          resolve({ stdout, stderr });
        }
      }
    );
  });
};

describe("CLI Tool E2E Tests", () => {
  const configPath = path.resolve(__dirname, "test-config.json");
  const baseDir = path.resolve(__dirname, "test-dir");

  beforeEach(async () => {
    // Set up initial config file
    await fs.writeFile(
      configPath,
      JSON.stringify(
        {
          url: "http://example.com",
          sdkName: "example-sdk",
          fetchMethod: "GET",
          fileType: "json",
          baseDirectory: baseDir,
        },
        null,
        2
      )
    );

    // Create base directory and some files
    await fs.mkdir(baseDir, { recursive: true });
    await fs.writeFile(path.join(baseDir, "test-file.txt"), "Hello, world!");
  });

//   afterEach(async () => {
//     // Clean up test files and directories
//     await fs.rm(baseDir, { recursive: true, force: true });
//     await fs.unlink(configPath);
//   });

  it("should delete the base directory if it exists", async () => {
    const { stdout, stderr } = await runCLI(["-c", configPath]);
    console.log("stdout:", stdout);
    console.log("stderr:", stderr);

    // Assert the base directory no longer exists
    await expect(fs.access(baseDir)).rejects.toThrow();
  });

//   it("should not delete anything if the base directory does not exist", async () => {
//     // Remove the base directory
//     await fs.rm(baseDir, { recursive: true, force: true });

//     const { stdout, stderr } = await runCLI(["-c", configPath]);
//     console.log("stdout:", stdout);
//     console.log("stderr:", stderr);

//     // Assert the CLI ran without deleting anything
//     await expect(fs.access(baseDir)).rejects.toThrow();
//   });
});
