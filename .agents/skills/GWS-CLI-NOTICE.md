# Notice: changes to the Google Workspace CLI skills

The `gws-*` skill directories in this folder are copied from https://github.com/googleworkspace/cli
(Apache License 2.0, see `GWS-CLI-LICENSE`) at commit `cd3697e07eb520056dcf142d0c7439bbb9ba32e9`, directory `skills/`.

Changed from upstream (Apache-2.0 section 4(b) notice): each `SKILL.md` has one added frontmatter line,
`disable-model-invocation: true`, and each skill has an added `agents/openai.yaml` containing only
`policy: allow_implicit_invocation: false`, so the skills run on demand (for example `/gws-gmail`)
instead of being picked automatically. No other file content was changed. Only 19 of the upstream
95 skills are included (the five core services and their helper skills).
