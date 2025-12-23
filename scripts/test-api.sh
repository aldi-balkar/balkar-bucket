#!/bin/bash

API_URL="http://202.155.95.166:8000"
API_KEY="sk_live_dev_12345678901234567890123456789012"

echo "========================================="
echo "🧪 Testing Balkar Bucket API"
echo "========================================="
echo ""

# 1. Health Check
echo "1️⃣  Health Check:"
curl -s $API_URL/api/health | jq '.'
echo -e "\n"

# 2. Get Roles
echo "2️⃣  Get All Roles:"
curl -s $API_URL/api/roles \
  -H "X-API-Key: $API_KEY" | jq '.'
echo -e "\n"

# 3. Register User
echo "3️⃣  Register New User:"
REGISTER_RESPONSE=$(curl -s -X POST $API_URL/api/auth/register \
  -H "X-API-Key: $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser_'$(date +%s)'",
    "email": "test_'$(date +%s)'@example.com",
    "password": "Password123!",
    "fullName": "Test User"
  }')
echo $REGISTER_RESPONSE | jq '.'
echo -e "\n"

# Extract email from register response
EMAIL=$(echo $REGISTER_RESPONSE | jq -r '.data.email // .email // empty')

if [ -z "$EMAIL" ]; then
  echo "❌ Registration failed, using fallback email"
  EMAIL="test@example.com"
fi

# 4. Login
echo "4️⃣  Login User:"
LOGIN_RESPONSE=$(curl -s -X POST $API_URL/api/auth/login \
  -H "X-API-Key: $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "'$EMAIL'",
    "password": "Password123!"
  }')
echo $LOGIN_RESPONSE | jq '.'
echo -e "\n"

# Extract token
TOKEN=$(echo $LOGIN_RESPONSE | jq -r '.data.token // .token // empty')

if [ -z "$TOKEN" ] || [ "$TOKEN" == "null" ]; then
  echo "❌ Login failed or no token returned"
  exit 1
fi

echo "✅ Token obtained: ${TOKEN:0:20}..."
echo -e "\n"

# 5. Get User Profile
echo "5️⃣  Get User Profile:"
curl -s $API_URL/api/users/me \
  -H "X-API-Key: $API_KEY" \
  -H "Authorization: Bearer $TOKEN" | jq '.'
echo -e "\n"

# 6. Create Bucket
echo "6️⃣  Create Bucket:"
BUCKET_RESPONSE=$(curl -s -X POST $API_URL/api/buckets \
  -H "X-API-Key: $API_KEY" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "test-bucket-'$(date +%s)'",
    "description": "Test bucket for API testing"
  }')
echo $BUCKET_RESPONSE | jq '.'
echo -e "\n"

# 7. Get All Buckets
echo "7️⃣  Get All Buckets:"
curl -s $API_URL/api/buckets \
  -H "X-API-Key: $API_KEY" \
  -H "Authorization: Bearer $TOKEN" | jq '.'
echo -e "\n"

# 8. Get All Users (admin only)
echo "8️⃣  Get All Users:"
curl -s $API_URL/api/users \
  -H "X-API-Key: $API_KEY" \
  -H "Authorization: Bearer $TOKEN" | jq '.'
echo -e "\n"

echo "========================================="
echo "✅ API Testing Completed!"
echo "========================================="
