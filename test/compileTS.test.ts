import ts from 'typescript';
import { normalize } from 'path';
import { compileTS } from '../src/generateCode/compileTS';

jest.mock('typescript', () => ({
  createCompilerHost: jest.fn(),
  createProgram: jest.fn(),
  ScriptTarget: { ESNext: 99 },
  ModuleKind: { CommonJS: 1 },
}));

jest.mock('path', () => ({
  ...jest.requireActual('path'),
  normalize: jest.fn(),
}));

describe('compileTS', () => {
  let createCompilerHostMock: jest.Mock;
  let createProgramMock: jest.Mock;
  let emitMock: jest.Mock;
  let writeFileMock: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();

    writeFileMock = jest.fn();
    createCompilerHostMock = ts.createCompilerHost as jest.Mock;
    createProgramMock = ts.createProgram as jest.Mock;

    const baseHost = ts.createCompilerHost({}) as ts.CompilerHost;
    const mockHost = {
      ...baseHost,
      writeFile: writeFileMock,
    };
    createCompilerHostMock.mockReturnValue(mockHost);

    emitMock = jest.fn();
    createProgramMock.mockReturnValue({
      emit: emitMock,
    } as unknown as ts.Program);
  });

  it('should call program.emit()', () => {
    const tsFilePath = 'src/index.ts';
    const module = ts.ModuleKind.CommonJS;
    const outputFilePaths = ['dist/index.js'];

    compileTS(tsFilePath, module, outputFilePaths);

    expect(emitMock).toHaveBeenCalled();
  });
});

describe('compileTS', () => {
  it('should call host.writeFile when fileName matches an entry in outputFilePaths', () => {
    const tsFilePath = '/path/to/file.ts';
    const module = ts.ModuleKind.CommonJS;
    const outputFilePaths = ['/output/path/file.js'];

    const mockWriteFile = jest.fn();
    const mockHost = ts.createCompilerHost({});
    mockHost.writeFile = mockWriteFile;

    (ts.createCompilerHost as jest.Mock).mockReturnValue(mockHost);
    (normalize as jest.Mock).mockImplementation((path) => path);

    compileTS(tsFilePath, module, outputFilePaths);

    const expectedFileName = '/output/path/file.js';

    mockHost.writeFile(expectedFileName, 'content', false, undefined);

    expect(mockWriteFile).toHaveBeenCalledWith(
      expectedFileName,
      'content',
      false,
      undefined,
    );
  });

  it('should not call host.writeFile when fileName does not match any entry in outputFilePaths', () => {
    const tsFilePath = '/path/to/file.ts';
    const module = ts.ModuleKind.CommonJS;
    const outputFilePaths = ['/output/path/file.js'];

    const mockWriteFile = jest.fn();
    const mockHost = ts.createCompilerHost({});
    mockHost.writeFile = mockWriteFile;

    (ts.createCompilerHost as jest.Mock).mockReturnValue(mockHost);
    (normalize as jest.Mock).mockImplementation((path) => path);

    compileTS(tsFilePath, module, outputFilePaths);

    const nonMatchingFileName = '/output/path/otherFile.js';

    mockHost.writeFile(nonMatchingFileName, 'content', false, undefined);

    expect(mockWriteFile).not.toHaveBeenCalledWith(
      nonMatchingFileName,
      'content',
      false,
      undefined,
    );
  });
});
