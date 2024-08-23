# Change Log

## [1.12.4] - 2024/08/23

- Addressing security vulnerability from `micromatch` (<https://github.com/advisories/GHSA-952p-6rrq-rcjv>)

## [1.12.2] - 2024/07/29

- Addressing security vulnerability from `fast-xml-parser`

## [1.12.1] - 2024/06/19

- Addressing security vulnerability from `node_modules/braces`

## [1.12.0] - 2024/06/04

- Extension now activates once VS Code is done starting up
- Added settings to allow for generating new classes/interfaces/etc with file-scoped namespaces and whether or not to include using statements.
- More sane CI/CD

## [1.2.0] - 2022/06/19

- Adding project reference tree.
- Code cleanup/refactor

## [1.0.0] - 2022/04/07

- Disallowing project references with circular references
- DevOps infrastructure
- Fixed issue where the extension basically didn't work from v0.6.0 on
- Code cleanup/optimization

## [0.3.2] - 2021/05/15

- Accounts for possibility of multiple `RootNamespace` elements

## [0.2.0] - 2021/05/09

- Adding functionality to manage project references.
- Retargeting when "Add C# Item..." menu option appears.
  - Now, it only appears on `.cs` files, `.csproj` files, and directories. It still shows an error if you attempt to add an item that is not in a C# project directory or subdirectory thereof.

## [0.1.0] - 2021/05/02

- Initial release
