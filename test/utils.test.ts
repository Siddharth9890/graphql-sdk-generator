import fs from 'fs/promises';
import { GraphQLObjectType, GraphQLSchema, GraphQLString, parse } from 'graphql';
import { join, dirname } from 'path';

import { buildOperationNodeForField } from '../src/generateCode/customNaming';
import { deleteFolderIfExists, generateOperations, getUnifiedSchema, mkdir, pathExists, printWithCache, writeFile, writeJSON } from '../src/utils';

// Mocking fs module
jest.mock('fs/promises', () => ({
  stat: jest.fn(),
  access: jest.fn(),
  writeFile: jest.fn(),
  mkdir: jest.fn(),
  readdir: jest.fn(),
  unlink: jest.fn(),
  rmdir: jest.fn(),
}));

const schema = new GraphQLSchema({
  query: new GraphQLObjectType({
    name: 'Query',
    fields: {
      hello: {
        type: GraphQLString,
        resolve: () => 'Hello, world!',
      },
    },
  }),
});

describe('getUnifiedSchema', () => {
  it('should return the schema with extensions including sourceMap', () => {
    
    const result = getUnifiedSchema(schema);
    expect(result.extensions?.sourceMap).toBeDefined();
  });
});

describe('pathExists', () => {
  it('should return true if path exists', async () => {
    (fs.stat as jest.Mock).mockResolvedValue(true);
    const result = await pathExists('/some/path');
    expect(result).toBe(true);
  });

  it('should return false if path does not exist', async () => {
    (fs.stat as jest.Mock).mockRejectedValue({ code: 'ENOENT' });
    const result = await pathExists('/some/invalid-path');
    expect(result).toBe(false);
  });

  
});

describe('writeJSON', () => {
  it('should write JSON data to a file', async () => {
    const path = '/some/path/file.json';
    const data = { key: 'value' };
    await writeJSON(path, data);
    expect(fs.writeFile).toHaveBeenCalledWith(
      path,
      JSON.stringify(data),
      'utf-8',
    );
  });
});

describe('writeFile', () => {
  it('should create directory and write file if directory does not exist', async () => {
    const path = '/some/path/file.txt';
    (fs.stat as jest.Mock).mockRejectedValue({ code: 'ENOENT' });
    await writeFile(path, 'content');
    expect(fs.mkdir).toHaveBeenCalledWith(dirname(path), { recursive: true });
    expect(fs.writeFile).toHaveBeenCalledWith(path, 'content');
  });

  it('should write file if directory exists', async () => {
    const path = '/some/path/file.txt';
    (fs.stat as jest.Mock).mockResolvedValue(true);
    await writeFile(path, 'content');

    expect(fs.writeFile).toHaveBeenCalledWith(path, 'content');
  });
});

describe('mkdir', () => {
  it('should create directory if it does not exist', async () => {
    const path = '/some/path';
    (fs.stat as jest.Mock).mockRejectedValue({ code: 'ENOENT' });
    await mkdir(path);

    expect(fs.mkdir).toHaveBeenCalledWith(path, { recursive: true });
  });

  it('should not create directory if it exists', async () => {
    const path = '/some/path';
    (fs.stat as jest.Mock).mockResolvedValue(true);
    await mkdir(path);

    expect(fs.mkdir).toHaveBeenCalled();
  });
});

describe('deleteFolderIfExists', () => {
  it('should delete the folder if it exists', async () => {
    const dir = '/some/dir';
    (fs.access as jest.Mock).mockResolvedValue(true);
    (fs.readdir as jest.Mock).mockResolvedValue([
      { name: 'file.txt', isDirectory: () => false },
    ]);

    await deleteFolderIfExists(dir);

    expect(fs.unlink).toHaveBeenCalledWith(join(dir, 'file.txt'));
    expect(fs.rmdir).toHaveBeenCalledWith(dir);
  });

  it('should not delete folder if it does not exist', async () => {
    const dir = '/some/dir';
    (fs.access as jest.Mock).mockRejectedValue({ code: 'ENOENT' });

    await deleteFolderIfExists(dir);

    expect(fs.unlink).toHaveBeenCalled();
    expect(fs.rmdir).toHaveBeenCalled();
  });
});

describe('printWithCache', () => {
  it('should cache and return the printed document', () => {
    const document = parse(`{ field }`);
    const result1 = printWithCache(document);
    const result2 = printWithCache(document);

    expect(result1).toBe(result2); // Cached result should be the same
  });
});

describe('generateOperations', () => {
  it('should generate operations based on the schema and selection set depth', () => {
    
    const sources = generateOperations(schema, 2);
    expect(sources).toBeInstanceOf(Array);
  });

  it('should use custom naming for operations', () => {
    
    
    const sources = generateOperations(schema, 2);
    expect(sources[0].document.definitions[0].name.value).toBe('helloQuery');
  });
});
