import {
  GraphQLField,
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLString,
  Kind,
  OperationTypeNode,
} from 'graphql';
import {
  buildOperationNodeForField,
  hasCircularRef,
  resetFieldMap,
  resetOperationVariables,
  resolveField,
} from '../../src/generateCode/customNaming';

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
