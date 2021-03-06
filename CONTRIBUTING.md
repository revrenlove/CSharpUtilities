# Contributing

This is a work in progress... but for now...

Fork and make a PR.

## Development

- After cloning, but before opening in VSCode, do an `npm install`

- Recommended extensions are... well... recommended.

## Automated Testing

It is recommended to do the development work in an instance of `code-insiders` that way the tests can run in an instance if `code`. [Further Reading...](https://code.visualstudio.com/api/working-with-extensions/testing-extension#tips)

## Repo Git Strategy and CI/CD

`main` -> `dev` -> _feature_

### `main` Branch

This should always reflect the current release version of the extension.

Upon a push to `main`, the minor version is updated (unless the commit message specifies it to be a major version), a release is automatically created in git, the extension is published to the extension marketplace, and the version change commits are merged back into `dev` increasing the minor version.

Pushes to `main` should **ONLY** be done via pull request from `dev` - unless it's a hotfix.

- As it currently stands, there isn't a branch protection rule for this, but in the future there should be.

### `dev` Branch

Upon a push to `dev`, the patch version is updated.

Pushes to `dev` should **ONLY** be done via pull request from the feature branch.

- As it currently stands, there isn't a branch protection rule for this, but in the future there should be.

In the future there will be Actions to create a release (pre-release) and publish (pre-release) to the extension marketplace.

### Feature Branches

These should be based off of the `dev` branch and should start with the issue number it is related to - which implies an issue _will always_ be created for any work.

When work is complete, a pull request into `dev` should be created.

### Versioning

This project uses semantic versioning, with every release having an even number minor version and every pre-release having an odd number minor version, per [Microsoft's recommendation](https://code.visualstudio.com/api/working-with-extensions/publishing-extension#prerelease-extensions).

To manage versions, it is all done by github actions that utilize [gh-action-bump-version](https://github.com/phips28/gh-action-bump-version), and if the process outlined above is followed, it's all taken care of for you.

When incrementing the major version, in the PR commit message the word "MAJOR" needs to appear - that tells it to increase the major version.
