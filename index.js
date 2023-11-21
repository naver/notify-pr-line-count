// Notify PR LINE COUNT
// Copyright (c) 2023-present NAVER Corp.
// Apache-2.0

const core = require("@actions/core");
const github = require("@actions/github");
const axios = require("axios");
const {minimatch} = require("minimatch");


const ENCODE_PAIR = {
  "<": "&lt;",
  ">": "&gt;"
};
const encodeText = text => text.replace(/[<>]/g, matched => ENCODE_PAIR[matched]);

const getChangedFiles = async (token) => {
  const context = github.context;

  if (context.payload.pull_request == null) {
    // eslint-disable-next-line no-console
    console.error("Not a pull request. Cannot continue.");
    return;
  }

  const octokit = github.getOctokit(token);
  const {owner, repo, number: pull_number} = context.issue;
  let allFiles = [];
  let page = 1;
  const perPage = 100;

  while (true) {
    const response = await octokit.rest.pulls.listFiles({
      owner,
      repo,
      pull_number,
      per_page: perPage,
      page: page
    });

    allFiles = [...allFiles, ...response.data];

    if (response.data.length < perPage) {
      break;
    }

    page++;
  }

  return allFiles;
};

const filterFiles = (files, validExtensions, patterns) => {
  const negativePatterns = patterns.filter(pattern => pattern.startsWith('!'));
  const positivePatterns = patterns.filter(pattern => !pattern.startsWith('!'));

  return files
    .filter(({filename: file}) => validExtensions.some(ext => file.endsWith(ext)))
    .filter(({filename: file}) =>
      negativePatterns.every(pattern => minimatch(file, pattern)) &&
      positivePatterns.some(pattern => minimatch(file, pattern)));
}

const getChanges = (fileInfo) => {
  return fileInfo.reduce((acc, {changes}) => {
    return acc + changes;
  }, 0);
}

const sendMessage = async ({repoName, title, url, channelId, maxChanges}) => {
  return axios({
    method: "post",
    headers: {
      Authorization: `Bearer ${core.getInput("slackBotToken")}`,
      "Content-Type": "application/json"
    },
    url: "https://slack.com/api/chat.postMessage",
    data: {
      channel: `#${channelId}`,
      blocks: [
        {
          "type": "header",
          "text": {
            "type": "plain_text",
            "text": "PR 리뷰 설명 및 투표"
          }
        },
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `*${repoName}:*\n<${url}|${encodeText(title)}>`
          }
        },
        {
          type: "divider"
        },
        {
          type: "context",
          elements: [
            {
              "type": "mrkdwn",
              "text": `이 PR은 변경 라인이 ${maxChanges} 라인이 넘습니다. 따라서 이해하기 어려울 수 있습니다.\nPR 설명회가 필요하다면 ⭕️, 아니라면 ❌를 눌러주세요.`
            }
          ]
        }
      ]
    }
  });
}


(async () => {
  try {
    core.notice("Task started");
    const {
      context: {
        payload: {
          pull_request: {
            title,
            html_url: prUrl
          },
          repository: {
            full_name: repoName
          }
        }
      }
    } = github;
    const ext = core.getInput("ext").split(",").map(str => str.trim());
    const patterns = core.getInput("glob").split(",").map(str => str.trim())
    const maxChanges = Number.parseInt(core.getInput("maxChanges"));
    const token = core.getInput("token");
    core.info("fetching files...");

    const allFiles = await getChangedFiles(token);
    core.info(`changed files: ${allFiles.map(f => f.filename).join(", ")}`);

    core.info(`filtering files... ext: ${ext} patterns: ${patterns}`);
    const filteredFiles = filterFiles(allFiles, ext, patterns);

    if (filteredFiles.length === 0) {
      core.info("No files were");
    }
    const changes = getChanges(filteredFiles, maxChanges);

    core.info(`total: changes: ${changes}, fileCount: ${filteredFiles.length}`);

    const overMaxChanges = changes > maxChanges;
    const channelId = core.getInput("slackChannelId");

    core.info("over max changes: " + overMaxChanges);

    if (overMaxChanges) {
      core.info("send message to channel: " + channelId);
      await sendMessage({repoName, title, url: prUrl, channelId, maxChanges});
    }

  } catch (error) {
    core.setFailed(error.message);
  }
})();
