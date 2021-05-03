# C# Utilities

## Tl;dr

Easily add C# items from the Explorer context menu. New features coming soon...

Right-click -> Add C# Item -> Class (or Interface, etc)

![Adding a New Item](./assets/images/demo.gif)

## To answer the question... "Why?"

This extension is designed to aid in the development of .net projects that use C#.

## Telemetry/Privacy

This extension collects no data from anything. Every release of this extension is from source code publicly available.

I cannot speak on behalf of the packages utilized in this extension (which can be found in the `package.json`).

## Features

### Add C# Item

Add a new C# file from the context menu of the Explorer view in Visual Studio Code. The class/interface/etc is automatically generated and includes the proper namespace.

- _NOTE:_ The namespace is derived from either the `Project -> PropertyGroup -> RootNamespace` element in the `.csproj` file (if specified) or the filename of the `.csproj` file, followed by `.` separations for each subfolder.

![Adding a New Item](./assets/images/demo.gif)
![Adding a New Item](./assets/images/logo.png)

Currently the following types of items are supported:

- Class
- Interface
- Record
- Enum
- Struct

## Requirements

Visual Studio Code v1.55.0 or higher.

## Upcoming Features

- Ability to add new C# projects.
- Ability to manage project references.
- Ability to manage NuGet packages.

## [Known Issues](https://github.com/revrenlove/CSharpUtilities/issues)

- Extension is automatically enabled on startup of Visual Studio Code.
  - Menu options are always available (even in projects that aren't .net).
- Most errors fail silently.

## Release Notes

### 0.1.0

This is the inaugural release of this extension. I'm sure there are bugs, and I've filed several issues so far regarding future plans for this extension.

## [Contributing](https://github.com/revrenlove/CSharpUtilities/blob/main/CONTRIBUTING.md)

Yeah, click that link above...
