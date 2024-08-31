## How to contribute on package

### Open Development

- All work on the SDK happens directly on GitHub. Both core team members and external contributors send pull requests which go through the same review process.

### Semantic Versioning

- The SDK follows [semantic versioning](https://semver.org/). We release patch versions for critical bugfixes, minor versions for new features or non-essential changes, and major versions for any breaking changes.

- When we make breaking changes, we also introduce deprecation warnings in a minor version so that our users learn about the upcoming changes and migrate their code in advance.

- Every significant change is documented in the [changelog file](https://github.com/Siddharth9890/graphql-sdk-generator/blob/main/docs/CHANGELOG.md).

### Branch Organization

- Make sure to fork the repository before contributing and create the new branch using develop as the base branch.

- Submit all changes directly to the `develop` branch. We use separate branches for development or for upcoming releases. And then after the bug/feature is working we release in main branch.

- Code that lands in `develop` must be compatible with the latest stable release. It may contain additional features, but no breaking changes. We should be able to release a new minor version from the tip of develop at any time.

### Bugs

- **Do not open up a GitHub issue if the bug is a security vulnerability**, and instead refer our [security policy](https://github.com/Siddharth9890/graphql-sdk-generator/blob/main/docs/SECURITY.md).

- **Ensure the bug was not already reported** by searching on GitHub under [Issues](https://github.com/Siddharth9890/graphql-sdk-generator/issues).

- If you're unable to find an open issue addressing the problem, [open a new one](https://github.com/Siddharth9890/graphql-sdk-generator/issues/new). Be sure to include a **title and clear description**, as much relevant information as possible, and a **code sample** demonstrating the expected behavior that is not occurring.

- Once the issue is created you can follow the contributing steps below to start contributing

### **Add a new Feature**

- If you intend to change/add a new feature to the package please discuss with on github issues page. This lets us reach an agreement on your proposal before you put significant effort into it.

- Do not open an PR on GitHub until you have collected positive feedback about the feature from us.

- We will reject pull requests which are not discussed with us regarding feature development.

- Once the issue is created you can follow the contributing steps below to start contributing.

### Contributing Guildeline

- You have Node.js installed at LTS with version 18+ and using pnpm as package manager.
- You have knowldge of git.
- Read the [code base overview](https://github.com/Siddharth9890/graphql-sdk-generator/blob/main/docs/CODE_BASE_OVERVIEW.md) to have a short introduction about how we manage/write code.

### Development Workflow

1. After cloning the repo

2. Install dependencies using pnpm

   ```sh
   pnpm i
   ```

3. Do you changes and then use dev command

   ```sh
   pnpm dev
   ```

4. Run test command to test sdk using jest

   ```sh
   pnpm test
   ```

- We recommend to keep test coverage above 90% this way we make sure that the feature/bug you add don't reduce the test coverage. Also make sure that there are no linting errors as we use prettier and eslint to maintain proper code structure.

Thanks!
