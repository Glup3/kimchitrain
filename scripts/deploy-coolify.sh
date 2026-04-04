#!/usr/bin/env bash
set -euo pipefail

TIMEOUT="${TIMEOUT:-300}"
INTERVAL="${INTERVAL:-10}"

DEPLOY_RESPONSE=$(curl -sf \
  -H "Authorization: Bearer $COOLIFY_TOKEN" \
  "${COOLIFY_URL}/api/v1/deploy?uuid=$COOLIFY_APP_UUID")

DEPLOY_UUID=$(echo "$DEPLOY_RESPONSE" | jq -r '.deployments[0].deployment_uuid')
echo "Deployment UUID: $DEPLOY_UUID"

ELAPSED=0

while [ $ELAPSED -lt $TIMEOUT ]; do
  STATUS=$(curl -sf \
    -H "Authorization: Bearer $COOLIFY_TOKEN" \
    "${COOLIFY_URL}/api/v1/deployments/$DEPLOY_UUID" \
    | jq -r '.status')

  echo "Status: $STATUS (${ELAPSED}s elapsed)"

  if [ "$STATUS" = "finished" ]; then
    echo "Deploy succeeded"
    exit 0
  elif [ "$STATUS" = "failed" ] || [ "$STATUS" = "cancelled-by-user" ]; then
    echo "Deploy $STATUS"
    exit 1
  fi

  sleep $INTERVAL
  ELAPSED=$((ELAPSED + INTERVAL))
done

echo "Deploy timed out after $TIMEOUT seconds"
exit 1
