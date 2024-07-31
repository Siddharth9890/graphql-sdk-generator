import { normalize } from "path";
import ts from "typescript";

export function compileTS(
  tsFilePath: string,
  module: ts.ModuleKind,
  outputFilePaths: string[]
) {
  const options: ts.CompilerOptions = {
    target: ts.ScriptTarget.ESNext,
    module,
    sourceMap: false,
    inlineSourceMap: false,
    importHelpers: true,
    allowSyntheticDefaultImports: true,
    esModuleInterop: true,
    declaration: true,
  };
  const host = ts.createCompilerHost(options);

  const hostWriteFile = host.writeFile.bind(host);
  host.writeFile = (fileName, ...rest) => {
    if (outputFilePaths.some((f) => normalize(f) === normalize(fileName))) {
      return hostWriteFile(fileName, ...rest);
    }
  };

  const program = ts.createProgram([tsFilePath], options, host);
  program.emit();
}
