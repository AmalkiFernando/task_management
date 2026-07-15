# CI/CD Workflow Explanation

## Overview

This project uses **GitHub Actions** to implement a basic **Continuous Integration (CI)** workflow.

The workflow automatically validates the application whenever code is pushed to the repository or when a pull request is created. This helps ensure that the project remains stable and that new changes do not introduce build or code quality issues.

> **Note:** This project currently implements **Continuous Integration (CI)** only. Continuous Deployment (CD) has not been configured.

---

## Workflow Trigger

The CI workflow is automatically triggered when:

- Code is pushed to the **main** branch
- Code is pushed to the **develop** branch
- A pull request is opened or updated targeting the **main** or **develop** branch

---

## Backend CI Process

The backend job performs the following steps:

1. Checks out the project source code.
2. Sets up the Node.js environment.
3. Installs backend dependencies using npm.
4. Runs ESLint to identify code quality issues.
5. Executes backend tests using Jest.

This ensures that backend code follows coding standards and passes all automated tests before being merged.

---

## Frontend CI Process

The frontend job performs the following steps:

1. Checks out the project source code.
2. Sets up the Node.js environment.
3. Installs frontend dependencies using npm.
4. Runs ESLint to check code quality.
5. Builds the Next.js application to verify that it compiles successfully.

A successful build confirms that the frontend is free from compilation errors.

---

## Workflow Summary

The GitHub Actions workflow includes two independent jobs:

| Job | Purpose |
|------|---------|
| Backend | Install dependencies, lint the code, and run automated tests |
| Frontend | Install dependencies, lint the code, and verify the application builds successfully |

Both jobs run automatically whenever the workflow is triggered.

---

## Benefits

Implementing Continuous Integration provides several advantages:

- Automatically validates every code change.
- Detects coding errors early in the development process.
- Ensures the frontend builds successfully.
- Verifies backend functionality through automated testing.
- Maintains consistent code quality using ESLint.
- Supports collaborative development by validating pull requests before merging.

---

## Workflow File

The CI workflow configuration is located at:

```
.github/workflows/ci.yml
```

---

## Conclusion

The project includes a GitHub Actions-based Continuous Integration pipeline that automatically performs dependency installation, code linting, backend testing, and frontend build validation. This workflow helps maintain application quality and ensures that changes are verified before integration into the main codebase.