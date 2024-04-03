import * as core from "@actions/core";
import * as github from "@actions/github";
import fetch from "node-fetch";
import * as fs from "fs";
import { Version } from "./version.mjs";

async function run() {
    const labelNames = JSON.parse(core.getInput("label-names"));
    const versionString = core.getInput("current-version");
    const version = new Version(versionString);

    version.patch++;

    if (labelNames.includes("major")) {
        version.major++;
        version.minor = 0;
        version.patch = 0;
    }

    if (labelNames.includes("minor")) {
        // VSCode extension releases are always versioned to have an even minor part.
        //  Pre-releases are always odd, but we aren't doing any pre-releases.
        //  This is just a failsafe in case the package.json gets manually modified.
        if (version.minor % 2 == 0) {
            version.minor += 2;
        } else {
            version.minor++;
        }

        version.patch = 0;
    }

    await updatePackageJson(version);
}

// Auxillary functions
async function updatePackageJson(version) {
    const packageJson = await getPackageJson();

    packageJson.version = version.toString();

    const packageJsonAsString = JSON.stringify(packageJson, null, 2);

    await fs.promises.writeFile("./package.json", packageJsonAsString);
}

async function getPackageJson() {
    const owner = github.context.repo.owner;
    const repo = github.context.repo.repo;

    const response = await fetch(
        `https://raw.githubusercontent.com/${owner}/${repo}/main/package.json`
    );

    const packageJson = await response.json();

    return packageJson;
}

await run();
