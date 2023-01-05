import { ProjectTemplate } from "./projectTemplate";

const projectTemplates: ProjectTemplate[] = [
    {
        friendlyName: 'Console Application',
        shortName: 'console',
        tag: 'Common/Console',
    },
    {
        friendlyName: 'Class library',
        shortName: 'classlib',
        tag: 'Common/Library',
    },
    {
        friendlyName: 'WPF Application',
        shortName: 'wpf',
        tag: 'Common/WPF',
    },
    {
        friendlyName: 'WPF Class library',
        shortName: 'wpflib',
        tag: 'Common/WPF',
    },
    {
        friendlyName: 'WPF Custom Control Library',
        shortName: 'wpfcustomcontrollib',
        tag: 'Common/WPF',
    },
    {
        friendlyName: 'WPF User Control Library',
        shortName: 'wpfusercontrollib',
        tag: 'Common/WPF',
    },
    {
        friendlyName: 'Windows Forms (WinForms) Application',
        shortName: 'winforms',
        tag: 'Common/WinForms',
    },
    {
        friendlyName: 'Windows Forms (WinForms) Class library',
        shortName: 'winformslib',
        tag: 'Common/WinForms',
    },
    {
        friendlyName: 'Worker Service',
        shortName: 'worker',
        tag: 'Common/Worker/Web',
    },
    {
        friendlyName: 'Unit Test Project',
        shortName: 'mstest',
        tag: 'Test/MSTest',
    },
    {
        friendlyName: 'NUnit 3 Test Project',
        shortName: 'nunit',
        tag: 'Test/NUnit',
    },
    {
        friendlyName: 'xUnit Test Project',
        shortName: 'xunit',
        tag: 'Test/xUnit',
    },
    {
        friendlyName: 'Blazor Server App',
        shortName: 'blazorserver',
        tag: 'Web/Blazor',
    },
    {
        friendlyName: 'Blazor WebAssembly App',
        shortName: 'blazorwasm',
        tag: 'Web/Blazor/WebAssembly',
    },
    {
        friendlyName: 'ASP.NET Core Empty',
        shortName: 'web',
        tag: 'Web/Empty',
    },
    {
        friendlyName: 'ASP.NET Core Web App (Model-View-Controller)',
        shortName: 'mvc',
        tag: 'Web/MVC',
    },
    {
        friendlyName: 'ASP.NET Core Web App',
        shortName: 'webapp',
        tag: 'Web/MVC/Razor Pages',
    },
    {
        friendlyName: 'ASP.NET Core Web App',
        shortName: 'razor',
        tag: 'Web/MVC/Razor Pages',
    },
    {
        friendlyName: 'ASP.NET Core with Angular',
        shortName: 'angular',
        tag: 'Web/MVC/SPA',
    },
    {
        friendlyName: 'ASP.NET Core with React.js',
        shortName: 'react',
        tag: 'Web/MVC/SPA',
    },
    {
        friendlyName: 'ASP.NET Core with React.js and Redux',
        shortName: 'reactredux',
        tag: 'Web/MVC/SPA',
    },
    {
        friendlyName: 'Razor Class Library',
        shortName: 'razorclasslib',
        tag: 'Web/Razor/Library/Razor Class Library',
    },
    {
        friendlyName: 'ASP.NET Core Web API',
        shortName: 'webapi',
        tag: 'Web/WebAPI',
    },
    {
        friendlyName: 'ASP.NET Core gRPC Service',
        shortName: 'grpc',
        tag: 'Web/gRPC',
    },
];

export { projectTemplates };