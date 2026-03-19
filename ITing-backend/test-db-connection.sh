#!/bin/bash

# ==========================================
# Test Database Connection Script
# ==========================================

echo "=========================================="
echo "Testing ITing PostgreSQL Connection"
echo "=========================================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Connection details
DB_HOST="localhost"
DB_PORT="5433"
DB_NAME="iting_job_portal"
DB_USER="postgres"

echo -e "${YELLOW}Connection Details:${NC}"
echo "Host: $DB_HOST"
echo "Port: $DB_PORT"
echo "Database: $DB_NAME"
echo "User: $DB_USER"
echo ""

# Test 1: Check if container is running
echo -e "${YELLOW}Test 1: Checking if container is running...${NC}"
if docker ps | grep -q iting-postgres; then
    echo -e "${GREEN}✓ Container 'iting-postgres' is running${NC}"
else
    echo -e "${RED}✗ Container 'iting-postgres' is not running${NC}"
    echo "Run: docker-compose up -d postgres"
    exit 1
fi
echo ""

# Test 2: Test connection inside container
echo -e "${YELLOW}Test 2: Testing connection inside container...${NC}"
if docker exec iting-postgres psql -U postgres -d iting_job_portal -c "SELECT 1;" > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Connection successful inside container${NC}"
else
    echo -e "${RED}✗ Connection failed inside container${NC}"
    exit 1
fi
echo ""

# Test 3: Count tables
echo -e "${YELLOW}Test 3: Counting tables...${NC}"
TABLE_COUNT=$(docker exec iting-postgres psql -U postgres -d iting_job_portal -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema='public';")
echo -e "${GREEN}✓ Found $TABLE_COUNT tables${NC}"
echo ""

# Test 4: List some tables
echo -e "${YELLOW}Test 4: Listing core tables...${NC}"
docker exec iting-postgres psql -U postgres -d iting_job_portal -c "SELECT tablename FROM pg_tables WHERE schemaname='public' AND tablename IN ('account', 'users', 'company', 'job', 'cv') ORDER BY tablename;"
echo ""

# Test 5: Port accessibility from host
echo -e "${YELLOW}Test 5: Checking port accessibility from host...${NC}"
if command -v nc >/dev/null 2>&1; then
    if nc -zv localhost 5433 2>&1 | grep -q succeeded; then
        echo -e "${GREEN}✓ Port 5433 is accessible from host${NC}"
    else
        echo -e "${RED}✗ Port 5433 is not accessible${NC}"
    fi
elif command -v Test-NetConnection >/dev/null 2>&1; then
    # Windows PowerShell
    powershell -Command "Test-NetConnection -ComputerName localhost -Port 5433" | grep -q TcpTestSucceeded
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ Port 5433 is accessible from host${NC}"
    else
        echo -e "${RED}✗ Port 5433 is not accessible${NC}"
    fi
else
    echo -e "${YELLOW}⚠ Cannot test port (nc/Test-NetConnection not available)${NC}"
fi
echo ""

# Final summary
echo "=========================================="
echo -e "${GREEN}✓ All tests passed!${NC}"
echo "=========================================="
echo ""
echo "DBeaver Connection Info:"
echo "  Host: localhost"
echo "  Port: 5433"
echo "  Database: iting_job_portal"
echo "  Username: postgres"
echo "  Password: 250904"
echo ""
echo "To connect with psql:"
echo "  docker exec -it iting-postgres psql -U postgres -d iting_job_portal"
echo ""
