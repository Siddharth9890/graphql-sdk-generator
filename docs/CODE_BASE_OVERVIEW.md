## Code Base Overview

This section will give you an overview of the package codebase. We will also discuss in short the tools we use and the implementation.

- If you want to contribute to the package make sure you read this document and the [Contributing Guildelines](https://github.com/Siddharth9890/graphql-sdk-generator/blob/main/docs/CONTRIBUTING.md) before proceeding.

### Top Level Folder Structure

- The src folder has all the classes which a developer will use. The following are the classes which we are using:-

1. generateCode Folder:- Has all methods to generate types using GraphQL.

- The utils file has basic utilities functions like file related operations.

- The tests folder has all the unit test for the above classes. We are using mocking to mock the SDK.

- We are using prettier and eslint to make sure that code format is maintained. Across all the files.
