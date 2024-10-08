![](https://github.com/user-attachments/assets/6e4183f5-4432-4e20-99eb-17f2ce0e0ef7)

# GraphQL SDK Generator

The GraphQL SDK Generator converts GraphQL schemas into JavaScript or TypeScript code, enabling smooth autocomplete and validation for your GraphQL queries.

[![NPM version][npm-image]][npm-url]
[![Run Eslint & Test cases](https://github.com/Siddharth9890/graphql-sdk-generator/actions/workflows/test.yaml/badge.svg)](https://github.com/Siddharth9890/graphql-sdk-generator/actions/workflows/test.yaml)
[![Coverage Status][codecov-image]][codecov-url]

<!-- [![NPM downloads][downloads-image]][downloads-url] -->

Read this [quick start guide](https://docs.siddharth9890.com/graphql-sdk-generator) to generate your client and start writing queries

## Features

- ✅ Type completion & validation for enhanced developer experience
- 🍃 Few runtime dependencies as compared to GraphQL Mesh
- 🐎 Generate client only if schema changes
- 🥃 Supports custom headers for requests
- 🚂  Compatible with both browsers and Node.js, thanks to[graphql-request](https://www.npmjs.com/package/graphql-request)

## Example

1. Install the required package from npm globally recommended

```bash
npm install -g graphql-sdk-generator
```

2. Then will create a config.json file with the following contents.

```json
{
  "url": "your-graphql-endpoint",
  "sdkName": "custom-name",
  "fileType": "ts",
  "debug": true
}
```

3. Run the generator and install additional dependencies required for making requests:

```bash
// use a custom json file path
graphql-sdk-generator -c config.json
npm i @graphql-typed-document-node/core graphql-request
```

4. Use the generated client to write methods and send data:

```typescript
import { GraphQLClient } from 'graphql-request';
import { getSdk } from '../graphqlSDKGenerator/graphqlSDKGenerator';

const initializeSDK = () => {
  // we can set custom headers
  const client = new GraphQLClient('https://your-graphql-url', {
    headers: {},
  });

  return getSdk(client);
};

const main = async () => {
  const sdkInstance = initializeSDK();
  const companies = await sdkInstance.companyQuery();

  // we get autocomplete here both for the arguments && output.
  const user = await sdkInstance.insert_usersMutation({
    objects: { id: 1, name: 'test', rocket: 'spacex' },
  });

  console.log(companies, user);
};

main();
```

## Docs

- All the documententation can be [found here.](https://docs.siddharth9890.com/graphql-sdk-generator)

## Example

- Example repo with config file examples can be [found here](https://github.com/Siddharth9890/space-x-graphql-example)

[Licensed under MIT]().

[npm-image]: https://img.shields.io/npm/v/graphql-sdk-generator
[npm-url]: https://www.npmjs.com/package/graphql-sdk-generator
[downloads-image]: https://img.shields.io/npm/v/graphql-sdk-generator
[downloads-url]: https://www.npmjs.com/package/graphql-sdk-generator
[codecov-image]: https://codecov.io/gh/Siddharth9890/graphql-sdk-generator/graph/badge.svg?token=H6ROEG8C9L
[codecov-url]: https://app.codecov.io/gh/Siddharth9890/graphql-sdk-generator
