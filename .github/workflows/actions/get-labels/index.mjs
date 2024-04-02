import * as core from "@actions/core";
import * as github from "@actions/github";

const ocktokit = github.getOctokit(core.getInput("github-token"));

const pullRequestsReturnObject =
    await ocktokit.rest.search.issuesAndPullRequests({
        q: `${github.context.sha} type:pr+repo:${github.context.repo.owner}/${github.context.repo.repo}`,
    });

const labelNames = pullRequestsReturnObject.data.items[0].labels.map(
    (label) => label.name
);

core.setOutput("label-names", labelNames);
