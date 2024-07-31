import fs from "fs/promises";
import { dirname as getDirname } from "path";
import { DocumentNode, print } from "graphql";
import {
  mapSchema,
  memoize1,
  buildOperationNodeForField,
  getRootTypeMap,
  parseGraphQLSDL,
} from "@graphql-tools/utils";
import { GraphQLSchema } from "graphql";
import { MakeDirectoryOptions } from "fs";

export function getUnifiedSchema(rawSource: GraphQLSchema): GraphQLSchema {
  let schema = rawSource;

  schema.extensions = schema.extensions || {};
  Object.defineProperty(schema.extensions, "sourceMap", {
    get: () => {
      return {
        get() {
          const nonExecutableSchema = mapSchema(schema);

          return nonExecutableSchema;
        },
      };
    },
  });
  return schema;
}

export async function pathExists(path: string) {
  if (!path) {
    return false;
  }
  try {
    await fs.stat(path);
    return true;
  } catch (e: any) {
    if (e.code === "ENOENT") {
      return false;
    } else {
      throw e;
    }
  }
}

export function writeJSON<T>(
  path: string,
  data: T,
  replacer?: (this: any, key: string, value: any) => any,
  space?: string | number
) {
  const stringified = JSON.stringify(data, replacer, space);
  return writeFile(path, stringified, "utf-8");
}

export const writeFile: typeof fs.writeFile = async (path, ...args) => {
  if (typeof path === "string") {
    const containingDir = getDirname(path);
    if (!(await pathExists(containingDir))) {
      await mkdir(containingDir);
    }
  }
  return fs.writeFile(path, ...args);
};

export async function mkdir(
  path: string,
  options: MakeDirectoryOptions = { recursive: true }
) {
  const ifExists = await pathExists(path);
  if (!ifExists) {
    await fs.mkdir(path, options);
  }
}

export async function deleteFolderIfExists(path: string) {
  try {
    await fs.access(path);
    await fs.rmdir(path, { recursive: true });
    console.log("Folder deleted successfully");
  } catch (err: any) {
    if (err.code !== "ENOENT") {
      console.error(`Error deleting folder: ${err}`);
    }
  }
}

const tempMap = new Map();

export const printWithCache = memoize1(function printWithCache(
  document: DocumentNode
): string {
  const stringifedDocumentJson = JSON.stringify(document);
  let sdl: string = tempMap.get(stringifedDocumentJson);
  if (!sdl) {
    sdl = print(document).trim();
    tempMap.set(stringifedDocumentJson, sdl);
  }
  return sdl;
});

export function generateOperations(
  schema: GraphQLSchema,
  selectionSetDepth: number
): any[] {
  const sources: any[] = [];
  const rootTypeMap = getRootTypeMap(schema);
  for (const [operationType, rootType] of rootTypeMap) {
    const fieldMap = rootType.getFields();
    for (const fieldName in fieldMap) {
      const operationNode = buildOperationNodeForField({
        schema,
        kind: operationType,
        field: fieldName,
        depthLimit: selectionSetDepth,
      });
      const defaultName = `operation_${sources.length}`;
      const virtualFileName = operationNode.name?.value || defaultName;
      const rawSDL = print(operationNode);
      const source = parseGraphQLSDL(`${virtualFileName}.graphql`, rawSDL);
      sources.push(source);
    }
  }
  return sources;
}
