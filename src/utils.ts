import fs from "fs/promises";
import { dirname as getDirname, join } from "path";
import { DocumentNode, print } from "graphql";
import {
  mapSchema,
  memoize1,
  getRootTypeMap,
  parseGraphQLSDL,
} from "@graphql-tools/utils";
import { GraphQLSchema } from "graphql";
import { MakeDirectoryOptions } from "fs";
import { buildOperationNodeForField } from "./generateCode/customNaming";

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

export async function deleteFolderIfExists(dir: string): Promise<void> {
  try {
    const pathExists = async (path: string): Promise<boolean> => {
      try {
        await fs.access(path);
        return true;
      } catch {
        return false;
      }
    };

    if (await pathExists(dir)) {
      console.log(`Deleting ${dir}.`);

      const entries = await fs.readdir(dir, { withFileTypes: true });
      const results = await Promise.allSettled(
        entries.map((entry) => {
          const fullPath = join(dir, entry.name);
          if (entry.isDirectory()) {
            return deleteFolderIfExists(fullPath);
          } else {
            return fs.unlink(fullPath);
          }
        })
      );
      for (const result of results) {
        if (result.status === "rejected" && result.reason.code !== "ENOENT") {
          throw result.reason;
        }
      }
      await fs.rmdir(dir);
    } else {
      console.log(`Directory ${dir} does not exist.`);
    }
  } catch (error: any) {
    console.error(`Error deleting folder: ${error}`);
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
