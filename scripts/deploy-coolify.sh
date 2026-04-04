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
  RESPONSE=$(curl -s -w "\n%{http_code}" \
    -H "Authorization: Bearer $COOLIFY_TOKEN" \
    "${COOLIFY_URL}/api/v1/deployments/$DEPLOY_UUID") || true

  HTTP_CODE=$(echo "$RESPONSE" | tail -1)
  BODY=$(echo "$RESPONSE" | sed '$d')
  STATUS=$(echo "$BODY" | jq -r '.status // empty')

  echo "Status: ${STATUS:-pending} (HTTP $HTTP_CODE, ${ELAPSED}s elapsed)"

  if [ "$HTTP_CODE" = "200" ] && [ "$STATUS" = "finished" ]; then
    echo "Deploy succeeded"
    exit 0
  elif [ "$HTTP_CODE" = "200" ] && { [ "$STATUS" = "failed" ] || [ "$STATUS" = "cancelled-by-user" ]; }; then
    echo "Deploy $STATUS"
    exit 1
  fi

  sleep $INTERVAL
  ELAPSED=$((ELAPSED + INTERVAL))
done

echo "Deploy timed out after $TIMEOUT seconds"
exit 1
