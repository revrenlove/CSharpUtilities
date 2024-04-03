# Contributing

This is a work in progress... but for now...

Fork and make a PR.

## Development

- After cloning, but before opening in VSCode, do an `npm install`

- Recommended extensions are... well... recommended.

## Testing

It is recommended to do the development work in an instance of `code-insiders` that way the tests can run in an instance if `code`. [Further Reading...](https://code.visualstudio.com/api/working-with-extensions/testing-extension#tips)

## Repo Git Strategy and CI/CD

### Versioning

Every push to `main` requires a pull request.

If no labels are applied to the pull request, the patch version will automatically be bumped.

To bump the minor version, apply the `minor` label.

To bump the major version, apply the `major` label.

### Releases

To create a release from a pull request, apply the `release` label to the pull request.

Alternatively, you can trigger the [`Create Release`](https://github.com/revrenlove/CSharpUtilities/actions/workflows/create-release.yml) workflow, and a new release will be created with whatever version is declared in the `package.json` file.

### Publishing

To publish the extension to the VSCode Marketplace, trigger the [`Publish`](https://github.com/revrenlove/CSharpUtilities/actions/workflows/publish.yml) workflow, and select the tagged version you wish to publish. Selecting a branch will cause the workflow to skip publishing.
