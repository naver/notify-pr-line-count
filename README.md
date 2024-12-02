# notify-pr-line-count

🌏 한국어 | [**English**](README.en.md)

PR 변경 사항이 특정 라인 수를 넘으면 Slack으로 메시지를 보내는 Github Actions

![img1.png](img1.png)

## Usage

1. 메시지 전달을 위해 `SLACK_BOT_TOKEN` 이름의 secret을 세팅하세요.

> 세팅할 Repo > Settings > Secrets > New repository secret

이때, Value는 슬랙에서 제공하는 `xoxb-` 형태의 토큰이어야 합니다.

2. `.github/workflow/notify-line-count.yml` 파일을 만드세요:

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

**Required** GitHub에서 제공하는 토큰

### `slackBotToken`

**Required** Slack bot을 통해 메시지를 보내기 위한 토큰

e.g. `xoxb-798572638592-435243279588-9aCaWNnzVYelK9NzMMqa1yxz`

### `slackChannelId`

**Required** 메시지를 받는 Slack 채널 ID

e.g. `channel`

### `maxChanges`

메시지를 보내는 기준이 되는 변경 라인 수

default: 300

### `ext`

검사할 파일 확장자

default: ".js, .ts, .jsx, tsx"

### `glob`

검사할 파일 패턴

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
