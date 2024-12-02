# notify-pr-line-count

🌏 [**한국어**](README.md) | English

GitHub Actions to send a Slack message when pr changes exceed a specific line count

![img1.png](img1.png)

## Usage

1. Set up a secret named `SLACK_BOT_TOKEN` to send the message.

> Go to the Repo > Settings > Secrets > New repository secret

For the value, use a Slack token that starts with `xoxb-`.

2. Create a `.github/workflow/notify-line-count.yml` file:

```yml
name: notify line count

on:
  pull_request:
    types: [opened, reopened]
    
jobs:
  notify:
    runs-on: [ubuntu-latest]
    steps:
      - name: Notify PR LineCount
        uses: naver/notify-pr-line-count@v1.1.0
        with:
          token: ${{ secrets.GITHUB_TOKEN }}
          slackBotToken: ${{ secrets.SLACK_BOT_TOKEN }}
          slackChannelId: "AB8C73KNM"
          maxChanges: "300"
          ext: ".js, .ts"
          glob: "packages/**, !**/node_modules/*"
```

## Inputs

### `token`

**Required** GitHub token

### `slackBotToken`

**Required** Slack bot token to send messages

e.g. `xoxb-798572638592-435243279588-9aCaWNnzVYelK9NzMMqa1yxz`

### `slackChannelId`

**Required** Slack channel ID to receive the message

e.g. `channel`

### `maxChanges`

Line count threshold for sending a message

default: 300

### `ext`

File extensions to check

default: ".js, .ts, .jsx, tsx"

### `glob`

File pattern to check

default: "!**/node_modules/*"

## License
```
Copyright (c) 2023-present NAVER Corp.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
```
