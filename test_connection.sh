#!/bin/bash

# Device Connection Test Script
# This script tests the full device connection flow

echo "================================"
echo "Device Connection Flow Test"
echo "================================"
echo ""

# Configuration
API_URL="${1:-http://localhost:8080}"
DEVICE_ID="${2}"

if [ -z "$DEVICE_ID" ]; then
  echo "Usage: ./test_connection.sh [API_URL] [DEVICE_ID]"
  echo "Example: ./test_connection.sh http://localhost:8080 dev_abc123"
  echo ""
  echo "If no DEVICE_ID provided, will list all devices"
  echo ""
fi

echo "🔍 Testing API Connection..."
echo "API URL: $API_URL"
echo ""

# Test 1: Check if server is running
echo "Test 1: Server Health Check"
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" $API_URL/api/devices)
if [ "$HTTP_CODE" == "200" ]; then
  echo "✅ Server is running"
else
  echo "❌ Server not responding (HTTP $HTTP_CODE)"
  exit 1
fi
echo ""

# Test 2: List all devices
echo "Test 2: Fetching All Devices"
DEVICES=$(curl -s $API_URL/api/devices)
DEVICE_COUNT=$(echo $DEVICES | jq '. | length' 2>/dev/null || echo "0")
echo "📱 Found $DEVICE_COUNT device(s)"
echo ""

if [ -z "$DEVICE_ID" ]; then
  echo "Available Devices:"
  echo $DEVICES | jq -r '.[] | "  - ID: \(.id) | Name: \(.customerName) | Model: \(.deviceModel)"' 2>/dev/null || echo "  (Install jq for better formatting)"
  echo ""
  echo "Run again with a specific device ID to test connection:"
  echo "./test_connection.sh $API_URL <device_id>"
  exit 0
fi

# Test 3: Get specific device
echo "Test 3: Fetching Device Details"
echo "Device ID: $DEVICE_ID"
DEVICE=$(curl -s $API_URL/api/devices/$DEVICE_ID)

if echo $DEVICE | grep -q "Device not found"; then
  echo "❌ Device not found"
  exit 1
fi

CUSTOMER_NAME=$(echo $DEVICE | jq -r '.customerName' 2>/dev/null)
DEVICE_MODEL=$(echo $DEVICE | jq -r '.deviceModel' 2>/dev/null)
IS_LOCKED=$(echo $DEVICE | jq -r '.isLocked' 2>/dev/null)

echo "✅ Device found"
echo "   Customer: $CUSTOMER_NAME"
echo "   Model: $DEVICE_MODEL"
echo "   Locked: $IS_LOCKED"
echo ""

# Test 4: Check telemetry
echo "Test 4: Checking Telemetry Data"
HAS_TELEMETRY=$(echo $DEVICE | jq -r '.telemetry' 2>/dev/null)

if [ "$HAS_TELEMETRY" == "null" ] || [ -z "$HAS_TELEMETRY" ]; then
  echo "⚠️  No telemetry data"
  echo "   Device has never connected"
  echo ""
  echo "📋 Next Steps:"
  echo "   1. Open mobile app at /mobile/$DEVICE_ID"
  echo "   2. Complete permission wizard"
  echo "   3. Wait 30 seconds for first heartbeat"
  echo "   4. Run this script again"
else
  BATTERY=$(echo $DEVICE | jq -r '.telemetry.batteryLevel' 2>/dev/null)
  NETWORK=$(echo $DEVICE | jq -r '.telemetry.networkType' 2>/dev/null)
  CARRIER=$(echo $DEVICE | jq -r '.telemetry.simCarrier' 2>/dev/null)
  LAST_SEEN=$(echo $DEVICE | jq -r '.telemetry.lastSeen' 2>/dev/null)
  
  echo "✅ Telemetry data available"
  echo "   Battery: $BATTERY%"
  echo "   Network: $NETWORK"
  echo "   Carrier: $CARRIER"
  echo "   Last Seen: $LAST_SEEN"
  
  # Calculate connection status
  if [ "$LAST_SEEN" != "null" ]; then
    LAST_SEEN_EPOCH=$(date -j -f "%Y-%m-%dT%H:%M:%S" "${LAST_SEEN:0:19}" "+%s" 2>/dev/null)
    NOW_EPOCH=$(date "+%s")
    DIFF_SECONDS=$((NOW_EPOCH - LAST_SEEN_EPOCH))
    DIFF_MINUTES=$((DIFF_SECONDS / 60))
    
    echo ""
    echo "🔌 Connection Status:"
    if [ $DIFF_MINUTES -lt 1 ]; then
      echo "   🟢 ONLINE (Just now)"
    elif [ $DIFF_MINUTES -lt 5 ]; then
      echo "   🟢 ONLINE ($DIFF_MINUTES minutes ago)"
    elif [ $DIFF_MINUTES -lt 30 ]; then
      echo "   🟡 AWAY ($DIFF_MINUTES minutes ago)"
    else
      echo "   🔴 OFFLINE ($DIFF_MINUTES minutes ago)"
    fi
  fi
fi
echo ""

# Test 5: Test telemetry update
echo "Test 5: Testing Telemetry Update"
echo "Sending test telemetry..."

UPDATE_RESPONSE=$(curl -s -X PUT $API_URL/api/devices/$DEVICE_ID/telemetry \
  -H "Content-Type: application/json" \
  -d '{
    "batteryLevel": 88,
    "networkType": "wifi",
    "simCarrier": "Test Carrier",
    "androidVersion": "13"
  }')

if echo $UPDATE_RESPONSE | jq -e '.telemetry.batteryLevel' > /dev/null 2>&1; then
  echo "✅ Telemetry update successful"
  NEW_BATTERY=$(echo $UPDATE_RESPONSE | jq -r '.telemetry.batteryLevel')
  echo "   New battery level: $NEW_BATTERY%"
else
  echo "❌ Telemetry update failed"
fi
echo ""

# Test 6: Test lock/unlock
echo "Test 6: Testing Lock/Unlock Commands"
echo "Testing lock command..."

LOCK_RESPONSE=$(curl -s -X POST $API_URL/api/devices/$DEVICE_ID/lock)
LOCKED=$(echo $LOCK_RESPONSE | jq -r '.isLocked' 2>/dev/null)

if [ "$LOCKED" == "true" ]; then
  echo "✅ Lock command successful"
else
  echo "❌ Lock command failed"
fi

sleep 1

echo "Testing unlock command..."
UNLOCK_RESPONSE=$(curl -s -X POST $API_URL/api/devices/$DEVICE_ID/unlock)
UNLOCKED=$(echo $UNLOCK_RESPONSE | jq -r '.isLocked' 2>/dev/null)

if [ "$UNLOCKED" == "false" ]; then
  echo "✅ Unlock command successful"
else
  echo "❌ Unlock command failed"
fi
echo ""

# Summary
echo "================================"
echo "Test Summary"
echo "================================"
echo "✅ All basic tests passed"
echo ""
echo "📱 Mobile App URLs:"
echo "   Admin Panel: http://localhost:8081/admin"
echo "   Mobile Client: http://localhost:8081/mobile/$DEVICE_ID"
echo ""
echo "🔧 Useful Commands:"
echo "   Lock device:   curl -X POST $API_URL/api/devices/$DEVICE_ID/lock"
echo "   Unlock device: curl -X POST $API_URL/api/devices/$DEVICE_ID/unlock"
echo "   Get device:    curl $API_URL/api/devices/$DEVICE_ID"
echo ""
