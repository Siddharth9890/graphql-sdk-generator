import ts from 'typescript';
import { normalize } from 'path';
import { compileTS } from '../../src/generateCode/compileTS';

// Mock TypeScript functions
jest.mock('typescript', () => ({
  createCompilerHost: jest.fn(),
  createProgram: jest.fn(),
  ScriptTarget: { ESNext: 99 },
  ModuleKind: { CommonJS: 1 },
}));

describe('compileTS', () => {
  let createCompilerHostMock: jest.Mock;
  let createProgramMock: jest.Mock;
  let emitMock: jest.Mock;
  let writeFileMock: jest.Mock;

  beforeEach(() => {
    // Clear previous mocks
    jest.clearAllMocks();

    // Setup the mock implementations
    writeFileMock = jest.fn();
    createCompilerHostMock = ts.createCompilerHost as jest.Mock;
    createProgramMock = ts.createProgram as jest.Mock;

    // Create mock host with a custom writeFile function
    const baseHost = ts.createCompilerHost({}) as ts.CompilerHost;
    const mockHost = {
      ...baseHost,
      writeFile: writeFileMock,
    };
    createCompilerHostMock.mockReturnValue(mockHost);

    // Mock the createProgram function to return a mock program
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

    // Verify that emit is called
    expect(emitMock).toHaveBeenCalled();
  });
});
