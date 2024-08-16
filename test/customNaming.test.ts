import {
  GraphQLArgument,
  GraphQLField,
  GraphQLInterfaceType,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLString,
  GraphQLUnionType,
  Kind,
  OperationTypeNode,
} from 'graphql';
import {
  buildOperationNodeForField,
  hasCircularRef,
  resetFieldMap,
  resolveField,
  resolveSelectionSet,
  resolveVariable,
} from '../src/generateCode/customNaming';

describe('resolveVariable', () => {
  it('should resolve a simple variable', () => {
    const mockArg: GraphQLArgument = {
      name: 'testArg',
      type: GraphQLString,
      defaultValue: undefined,
      astNode: undefined,
      extensions: {},
      description: '',
      deprecationReason: '',
    };

    const result = resolveVariable(mockArg);

    expect(result).toEqual({
      kind: Kind.VARIABLE_DEFINITION,
      variable: {
        kind: Kind.VARIABLE,
        name: { kind: Kind.NAME, value: 'testArg' },
      },
      type: {
        kind: Kind.NAMED_TYPE,
        name: { kind: Kind.NAME, value: 'String' },
      },
    });
  });

  it('should resolve a non-null variable', () => {
    const mockArg: GraphQLArgument = {
      name: 'testArg',
      type: new GraphQLNonNull(GraphQLString),
      defaultValue: undefined,
      astNode: undefined,
      extensions: {},
      description: '',
      deprecationReason: '',
    };

    const result = resolveVariable(mockArg);

    expect(result).toEqual({
      kind: Kind.VARIABLE_DEFINITION,
      variable: {
        kind: Kind.VARIABLE,
        name: { kind: Kind.NAME, value: 'testArg' },
      },
      type: {
        kind: Kind.NON_NULL_TYPE,
        type: {
          kind: Kind.NAMED_TYPE,
          name: { kind: Kind.NAME, value: 'String' },
        },
      },
    });
  });
});

describe('resolveSelectionSet', () => {
  const mockType = new GraphQLObjectType({
    name: 'MockType',
    fields: {
      id: { type: GraphQLString },
      name: { type: GraphQLString },
    },
  });

  const mockUnionType = new GraphQLUnionType({
    name: 'MockUnion',
    types: [mockType],
  });

  const mockInterfaceType = new GraphQLInterfaceType({
    name: 'MockInterface',
    fields: {
      id: { type: GraphQLString },
    },
  });

  const mockSchema = new GraphQLSchema({
    types: [mockType, mockUnionType, mockInterfaceType],
  });

  beforeEach(() => {
    resetFieldMap();
  });

  it('should return a selection set for a union type', () => {
    const result = resolveSelectionSet({
      parent: mockUnionType,
      type: mockUnionType,
      models: [],
      path: [],
      ancestors: [],
      ignore: [],
      depthLimit: 1,
      circularReferenceDepth: 1,
      schema: mockSchema,
      depth: 0,
      selectedFields: true,
      rootTypeNames: new Set(),
    });

    expect(result).toMatchObject({
      kind: Kind.SELECTION_SET,
      selections: expect.any(Array),
    });
  });

  it('should return a selection set for an interface type', () => {
    const result = resolveSelectionSet({
      parent: mockInterfaceType,
      type: mockInterfaceType,
      models: [],
      path: [],
      ancestors: [],
      ignore: [],
      depthLimit: 1,
      circularReferenceDepth: 1,
      schema: mockSchema,
      depth: 0,
      selectedFields: true,
      rootTypeNames: new Set(),
    });

    expect(result).toMatchObject({
      kind: Kind.SELECTION_SET,
      selections: expect.any(Array),
    });
  });

  it('should return undefined for a scalar type if depth limit is exceeded', () => {
    const result = resolveSelectionSet({
      parent: mockType,
      type: mockType,
      models: [],
      path: [],
      ancestors: [],
      ignore: [],
      depthLimit: 0,
      circularReferenceDepth: 1,
      schema: mockSchema,
      depth: 1,
      selectedFields: true,
      rootTypeNames: new Set(),
    });

    expect(result).toBeUndefined();
  });
});

describe('buildOperationNodeForField', () => {
  const mockSchema = new GraphQLSchema({
    query: new GraphQLObjectType({
      name: 'Query',
      fields: {
        hello: {
          type: GraphQLString,
        },
      },
    }),
  });

  it('should build an operation node with default settings', () => {
    const operationNode = buildOperationNodeForField({
      schema: mockSchema,
      kind: OperationTypeNode.QUERY,
      field: 'hello',
      models: [],
    });

    expect(operationNode.kind).toBe(Kind.OPERATION_DEFINITION);
    expect(operationNode.operation).toBe('query');
    expect(operationNode.selectionSet.selections.length).toBe(1);
    expect(operationNode.selectionSet.selections[0].kind).toBe(Kind.FIELD);
    expect((operationNode.selectionSet.selections[0] as any).name.value).toBe(
      'hello',
    );
  });
});

describe('resolveField', () => {
  const mockField: GraphQLField<any, any> = {
    name: 'hello',
    type: GraphQLString,
    args: [],
    resolve: () => 'Hello, world!',
    subscribe: undefined,
    deprecationReason: undefined,
    description: undefined,
    astNode: undefined,
    extensions: {},
  };

  it('should resolve a field and return a field node', () => {
    const fieldNode = resolveField({
      type: new GraphQLObjectType({
        name: 'Query',
        fields: {
          hello: {
            type: GraphQLString,
          },
        },
      }),
      field: mockField,
      models: [],
      path: [],
      ancestors: [],
      ignore: [],
      depthLimit: 5,
      circularReferenceDepth: 1,
      schema: new GraphQLSchema({}),
      depth: 0,
      selectedFields: true,
      rootTypeNames: new Set(),
    });

    expect(fieldNode.kind).toBe(Kind.FIELD);
  });
});

describe('hasCircularRef', () => {
  const mockType = new GraphQLObjectType({
    name: 'TestType',
    fields: {
      testField: {
        type: GraphQLString,
      },
    },
  });

  it('should return false if there is no circular reference', () => {
    const result = hasCircularRef([mockType], { depth: 1 });
    expect(result).toBe(false);
  });

  it('should return true if there is a circular reference', () => {
    const result = hasCircularRef([mockType, mockType], { depth: 1 });
    expect(result).toBe(true);
  });
});
