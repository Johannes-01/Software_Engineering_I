#!/bin/bash

# Regular expression to match the desired commit message pattern
pattern="^(feature|fix|refactor|chore|docs|style|test) - \[([A-Z]+-[0-9]+)] (.+)$"

if ! [[ "$GIT_COMMIT_MESSAGE" =~ $pattern ]]; then
  echo "Commit message must match the pattern: '$pattern'"
  exit 1
fi