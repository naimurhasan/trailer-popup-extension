# Testing Guide

## Running Tests Locally

You can run the test suite locally using Node.js:

```bash
node test.js
```

Or using npm:

```bash
npm test
```

## GitHub Actions

This project uses GitHub Actions to automatically run tests on every push and pull request.

### Setup

The workflow is already configured in [`.github/workflows/test.yml`](.github/workflows/test.yml).

### What Gets Tested

1. **Title Cleaning Function** - Tests the `cleanMovieTitle()` function with 12 different test cases
2. **Manifest Validation** - Ensures `manifest.json` is valid JSON
3. **File Existence** - Checks that all required extension files are present
4. **Multiple Node.js Versions** - Tests on Node.js 18, 20, and 22

### Viewing Test Results

1. Go to your repository on GitHub
2. Click on the **"Actions"** tab
3. You'll see all workflow runs with pass/fail status
4. Click on any run to see detailed logs

### Manual Triggering

You can manually trigger the workflow:

1. Go to **Actions** tab
2. Select **"Test Movie Trailer Extension"** workflow
3. Click **"Run workflow"**
4. Choose the branch and click **"Run workflow"**

### Badge (Optional)

Add this badge to your README to show build status:

```markdown
![Tests](https://github.com/YOUR_USERNAME/YOUR_REPO_NAME/workflows/Test%20Movie%20Trailer%20Extension/badge.svg)
```

Replace `YOUR_USERNAME` and `YOUR_REPO_NAME` with your GitHub username and repository name.

## Test Cases

The test suite covers various scenarios:

- ✅ Messy titles with quality tags
- ✅ Movies with hyphens (Spider-Man, O-Kay)
- ✅ Long dashes as separators
- ✅ Years in parentheses and standalone
- ✅ TV series with season/episode info
- ✅ Movies with subtitles
- ✅ Very long titles
- ✅ Special characters and audio info
- ✅ IMAX, extended editions, etc.

## Adding New Test Cases

Edit [`test.js`](test.js) and add new test cases to the `testCases` array:

```javascript
{
  input: "Your Movie Title (2025) 1080p WEB-DL",
  expected: "Your Movie Title"
}
```

Then run `node test.js` to verify all tests pass.
