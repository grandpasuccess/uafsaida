#!/bin/bash
# UAFSAIDA — Post-Deploy Smoke Test
# Run this after every deployment to verify the system is healthy

set -e

BASE_URL=${1:-"http://localhost:3000"}
echo "Running smoke tests against $BASE_URL..."

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

fail() { echo -e "${RED}FAIL: $1${NC}"; exit 1; }
pass() { echo -e "${GREEN}PASS: $1${NC}"; }

# Test 1: Health check
echo -n "Health check... "
RESPONSE=$(curl -s "$BASE_URL/api/health")
echo "$RESPONSE" | grep -q '"status":"ok"' && pass "health" || fail "health"

# Test 2: Auth guard on memory endpoint
echo -n "Auth guard on /api/projects... "
STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/api/projects")
[ "$STATUS" = "401" ] || [ "$STATUS" = "307" ] && pass "auth guard (status $STATUS)" || fail "auth guard (status $STATUS)"

# Test 3: Login page accessible
echo -n "Login page... "
STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/login")
[ "$STATUS" = "200" ] && pass "login page" || fail "login page (status $STATUS)"

# Test 4: Workspace page accessible
echo -n "Workspace page... "
STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/workspace")
[ "$STATUS" = "200" ] || [ "$STATUS" = "307" ] && pass "workspace page" || fail "workspace page (status $STATUS)"

# Test 5: Database status endpoint
echo -n "Database status... "
RESPONSE=$(curl -s "$BASE_URL/api/system/db-status")
echo "$RESPONSE" | grep -q '"status"' && pass "db status" || fail "db status"

echo ""
echo -e "${GREEN}All smoke tests passed!${NC}"
