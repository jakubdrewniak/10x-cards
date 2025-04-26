# CI/CD Pipeline Documentation

This project uses GitHub Actions for continuous integration and continuous deployment. The following workflows are configured:

## Pull Request Workflow

**File:** `.github/workflows/pull-request.yml`

This workflow runs on every pull request to the `main` or `master` branch and performs the following checks:

1. **Lint:** Checks code quality using ESLint
2. **Unit Tests:** Runs Vitest unit tests and uploads coverage reports
3. **E2E Tests:** Runs Playwright end-to-end tests with Chromium browser
4. **Build Verification:** Ensures that the application builds correctly

No deployment actions are performed in this workflow.

## CI/CD Pipeline

**File:** `.github/workflows/ci-cd.yml`

This workflow runs on:
- Push to `main` or `master` branch
- Manual trigger (workflow_dispatch)

It includes the following jobs:

1. **Lint:** Checks code quality using ESLint
2. **Unit Tests:** Runs Vitest unit tests and uploads coverage reports
3. **E2E Tests:** Runs Playwright end-to-end tests
4. **Build:** Creates a production build and uploads artifacts
5. **Deploy:** (Optional) Deploys the application to DigitalOcean

### Manual Workflow Trigger

You can manually trigger the CI/CD workflow from the GitHub Actions tab. When manually triggering, you can select the environment to deploy to:
- Production
- Staging

### Required Secrets

For deployment to work properly, the following secrets need to be set in the GitHub repository:

- `DIGITALOCEAN_API_TOKEN`: API token for DigitalOcean authentication
- `DIGITALOCEAN_REGISTRY_NAME`: Name of the DigitalOcean Container Registry

## Docker Configuration

### Dockerfile

The project includes a multi-stage Dockerfile that:
1. Builds the application in a Node.js Alpine container
2. Creates a minimal production image with only the necessary files
3. Configures the environment to run the Astro server

### .dockerignore

The `.dockerignore` file excludes unnecessary files from the Docker build context to improve build performance and reduce image size.

## Local Testing

You can test the CI/CD workflow locally by running the following commands:

```bash
# Lint the code
npm run lint

# Run unit tests
npm test

# Generate coverage report
npm run test:coverage

# Run E2E tests
npm run e2e

# Build the application
npm run build
```

## Adding CI/CD to New Projects

To add this CI/CD configuration to a new project:

1. Copy the workflow files from `.github/workflows/` to your new project
2. Copy the `Dockerfile` and `.dockerignore` files
3. Update the workflow files as needed for your project's specific requirements
4. Set up the required secrets in your GitHub repository
5. Configure your DigitalOcean App Platform or other deployment target 