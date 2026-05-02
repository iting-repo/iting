# Task 01: AWS Infrastructure Setup

## Objective

Provision the AWS infrastructure: VPC, subnets, security groups, EC2 instance (m7i-flex.large with Ubuntu 24.04 LTS), Elastic IP, IAM roles for GitHub Actions OIDC. **Note:** RDS PostgreSQL and S3 already exist and will be configured to work with the new VPC. DNS is managed via Cloudflare (not Route 53).

## Prerequisites

- AWS account with programmatic access (AWS CLI configured)
- Cloudflare account with domain configured (datnhk252iting.dpdns.org → EC2 Elastic IP)
- SSH key pair created in AWS (or import existing)
- AWS CLI v2 installed and configured locally

## Step-by-Step Instructions

### 1.1 Create VPC and Networking

```bash
# Set region
export AWS_REGION=ap-southeast-1

# Create VPC
VPC_ID=$(aws ec2 create-vpc \
  --cidr-block 10.0.0.0/16 \
  --tag-specifications "ResourceType=vpc,Tags=[{Key=Name,Value=iting-vpc}]" \
  --query 'Vpc.VpcId' --output text --region $AWS_REGION)

# Enable DNS hostnames
aws ec2 modify-vpc-attribute --vpc-id $VPC_ID --enable-dns-hostnames --region $AWS_REGION

# Create public subnet (for EC2)
PUBLIC_SUBNET=$(aws ec2 create-subnet \
  --vpc-id $VPC_ID \
  --cidr-block 10.0.1.0/24 \
  --availability-zone ap-southeast-1a \
  --tag-specifications "ResourceType=subnet,Tags=[{Key=Name,Value=iting-public-subnet}]" \
  --query 'Subnet.SubnetId' --output text --region $AWS_REGION)

# Create private subnets (for RDS - need 2 for Multi-AZ option)
PRIVATE_SUBNET_A=$(aws ec2 create-subnet \
  --vpc-id $VPC_ID \
  --cidr-block 10.0.2.0/24 \
  --availability-zone ap-southeast-1a \
  --tag-specifications "ResourceType=subnet,Tags=[{Key=Name,Value=iting-private-subnet-a}]" \
  --query 'Subnet.SubnetId' --output text --region $AWS_REGION)

PRIVATE_SUBNET_B=$(aws ec2 create-subnet \
  --vpc-id $VPC_ID \
  --cidr-block 10.0.3.0/24 \
  --availability-zone ap-southeast-1b \
  --tag-specifications "ResourceType=subnet,Tags=[{Key=Name,Value=iting-private-subnet-b}]" \
  --query 'Subnet.SubnetId' --output text --region $AWS_REGION)

# Create and attach Internet Gateway
IGW_ID=$(aws ec2 create-internet-gateway \
  --tag-specifications "ResourceType=internet-gateway,Tags=[{Key=Name,Value=iting-igw}]" \
  --query 'InternetGateway.InternetGatewayId' --output text --region $AWS_REGION)

aws ec2 attach-internet-gateway --vpc-id $VPC_ID --internet-gateway-id $IGW_ID --region $AWS_REGION

# Create route table for public subnet
PUBLIC_RT=$(aws ec2 create-route-table --vpc-id $VPC_ID \
  --query 'RouteTable.RouteTableId' --output text --region $AWS_REGION)

aws ec2 create-route --route-table-id $PUBLIC_RT \
  --destination-cidr-block 0.0.0.0/0 --gateway-id $IGW_ID --region $AWS_REGION

aws ec2 associate-route-table --route-table-id $PUBLIC_RT \
  --subnet-id $PUBLIC_SUBNET --region $AWS_REGION

# Enable auto-assign public IP for public subnet
aws ec2 modify-subnet-attribute --subnet-id $PUBLIC_SUBNET \
  --map-public-ip-on-launch --region $AWS_REGION

# Create NAT Gateway for private subnets (allows RDS outbound)
EIP_ALLOC=$(aws ec2 allocate-address --domain-name vpc \
  --query 'AllocationId' --output text --region $AWS_REGION)

NAT_GW=$(aws ec2 create-nat-gateway --subnet-id $PUBLIC_SUBNET \
  --allocation-id $EIP_ALLOC \
  --tag-specifications "ResourceType=natgateway,Tags=[{Key=Name,Value=iting-nat}]" \
  --query 'NatGateway.NatGatewayId' --output text --region $AWS_REGION)

echo "Waiting for NAT Gateway to become available..."
aws ec2 wait nat-gateway-available --nat-gateway-ids $NAT_GW --region $AWS_REGION

# Create private route table with NAT Gateway
PRIVATE_RT=$(aws ec2 create-route-table --vpc-id $VPC_ID \
  --query 'RouteTable.RouteTableId' --output text --region $AWS_REGION)

aws ec2 create-route --route-table-id $PRIVATE_RT \
  --destination-cidr-block 0.0.0.0/0 --nat-gateway-id $NAT_GW --region $AWS_REGION

aws ec2 associate-route-table --route-table-id $PRIVATE_RT --subnet-id $PRIVATE_SUBNET_A --region $AWS_REGION
aws ec2 associate-route-table --route-table-id $PRIVATE_RT --subnet-id $PRIVATE_SUBNET_B --region $AWS_REGION

echo "=== VPC and Networking Created ==="
echo "VPC_ID=$VPC_ID"
echo "PUBLIC_SUBNET=$PUBLIC_SUBNET"
echo "PRIVATE_SUBNET_A=$PRIVATE_SUBNET_A"
echo "PRIVATE_SUBNET_B=$PRIVATE_SUBNET_B"
```

### 1.2 Create Security Groups

```bash
# EC2 Security Group
EC2_SG=$(aws ec2 create-security-group \
  --group-name iting-ec2-sg \
  --description "ITing EC2 Security Group" \
  --vpc-id $VPC_ID \
  --query 'GroupId' --output text --region $AWS_REGION)

# SSH access (restrict to your IP - CHANGE THIS)
MY_IP=$(curl -s https://checkip.amazonaws.com)/32
aws ec2 authorize-security-group-ingress --group-id $EC2_SG \
  --protocol tcp --port 22 --cidr $MY_IP --region $AWS_REGION

# HTTP from anywhere (for Let's Encrypt HTTP-01 challenge)
aws ec2 authorize-security-group-ingress --group-id $EC2_SG \
  --protocol tcp --port 80 --cidr 0.0.0.0/0 --region $AWS_REGION

# HTTPS from anywhere
aws ec2 authorize-security-group-ingress --group-id $EC2_SG \
  --protocol tcp --port 443 --cidr 0.0.0.0/0 --region $AWS_REGION

# RDS Security Group
RDS_SG=$(aws ec2 create-security-group \
  --group-name iting-rds-sg \
  --description "ITing RDS Security Group" \
  --vpc-id $VPC_ID \
  --query 'GroupId' --output text --region $AWS_REGION)

# PostgreSQL access only from EC2 security group
aws ec2 authorize-security-group-ingress --group-id $RDS_SG \
  --protocol tcp --port 5432 --source-group $EC2_SG --region $AWS_REGION

echo "=== Security Groups Created ==="
echo "EC2_SG=$EC2_SG"
echo "RDS_SG=$RDS_SG"
```

### 1.3 Create IAM Role for EC2 (ECR + S3 + CloudWatch + RDS)

The S3 bucket `datn-jobweb` already exists in the AWS account. We'll create an IAM role that grants access to the existing S3 bucket and the existing RDS instance.

```bash
# Trust policy for EC2
cat > /tmp/iting-ec2-trust.json << 'EOF'
{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Principal": {"Service": "ec2.amazonaws.com"},
    "Action": "sts:AssumeRole"
  }]
}
EOF

aws iam create-role --role-name iting-ec2-role \
  --assume-role-policy-document file:///tmp/iting-ec2-trust.json

# Create policy for ECR read, existing S3 bucket, CloudWatch logs, RDS connectivity
# S3 bucket "datn-jobweb" already exists in the project
AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query 'Account' --output text)

cat > /tmp/iting-ec2-policy.json << EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "ecr:GetAuthorizationToken",
        "ecr:BatchCheckLayerAvailability",
        "ecr:GetDownloadUrlForLayer",
        "ecr:BatchGetImage",
        "ecr:PutImage",
        "ecr:InitiateLayerUpload",
        "ecr:UploadLayerPart",
        "ecr:CompleteLayerUpload"
      ],
      "Resource": "*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "s3:GetObject",
        "s3:PutObject",
        "s3:DeleteObject",
        "s3:ListBucket"
      ],
      "Resource": [
        "arn:aws:s3:::datn-jobweb",
        "arn:aws:s3:::datn-jobweb/*"
      ]
    },
    {
      "Effect": "Allow",
      "Action": [
        "logs:CreateLogGroup",
        "logs:CreateLogStream",
        "logs:PutLogEvents"
      ],
      "Resource": "arn:aws:logs:ap-southeast-1:*:*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "rds:DescribeDBInstances",
        "rds:DescribeDBClusters"
      ],
      "Resource": "*"
    }
  ]
}
EOF

aws iam put-role-policy --role-name iting-ec2-role \
  --policy-name iting-ec2-policy \
  --policy-document file:///tmp/iting-ec2-policy.json

# Create instance profile
aws iam create-instance-profile --instance-profile-name iting-ec2-profile
aws iam add-role-to-instance-profile --instance-profile-name iting-ec2-profile \
  --role-name iting-ec2-role

echo "Waiting for IAM role propagation..."
sleep 30

echo "=== IAM Role Created ==="
echo "Role: iting-ec2-role"
echo "Instance Profile: iting-ec2-profile"
echo "S3 bucket access: datn-jobweb (existing)"
```

### 1.4 Create GitHub Actions OIDC Provider (for passwordless deployment)

```bash
# Create OIDC identity provider for GitHub Actions
cat > /tmp/oidc-trust.json << 'EOF'
{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Principal": {
      "Federated": "arn:aws:iam::ACCOUNT_ID:oidc-provider/token.actions.githubusercontent.com"
    },
    "Action": "sts:AssumeRoleWithWebIdentity",
    "Condition": {
      "StringEquals": {
        "token.actions.githubusercontent.com:aud": "sts.amazonaws.com"
      },
      "StringLike": {
        "token.actions.githubusercontent.com:sub": "repo:YOUR_GITHUB_ORG/ITing:*"
      }
    }
  }]
}
EOF

# Replace ACCOUNT_ID and YOUR_GITHUB_ORG
AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query 'Account' --output text)
sed -i "s/ACCOUNT_ID/$AWS_ACCOUNT_ID/g" /tmp/oidc-trust.json
sed -i "s/YOUR_GITHUB_ORG/YOUR_GITHUB_ORG/g" /tmp/oidc-trust.json

# Create OIDC provider (only needs to be done once per AWS account)
aws iam create-open-id-connect-provider \
  --url https://token.actions.githubusercontent.com \
  --client-id-list sts.amazonaws.com \
  --thumbprint-list 6938fd4d98bab03faaad973620fa22c2d2391f70 \
  --region $AWS_REGION 2>/dev/null || echo "OIDC provider may already exist"

# Create GitHub Actions role
aws iam create-role --role-name iting-github-actions \
  --assume-role-policy-document file:///tmp/oidc-trust.json

# Attach ECR + EC2 deployment permissions
cat > /tmp/ga-policy.json << 'EOF'
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "ecr:GetAuthorizationToken",
        "ecr:BatchCheckLayerAvailability",
        "ecr:GetDownloadUrlForLayer",
        "ecr:BatchGetImage",
        "ecr:PutImage",
        "ecr:InitiateLayerUpload",
        "ecr:UploadLayerPart",
        "ecr:CompleteLayerUpload"
      ],
      "Resource": "*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "ssm:SendCommand",
        "ssm:GetCommandInvocation"
      ],
      "Resource": "*"
    }
  ]
}
EOF

aws iam put-role-policy --role-name iting-github-actions \
  --policy-name iting-ga-policy \
  --policy-document file:///tmp/ga-policy.json

echo "=== GitHub Actions OIDC Role Created ==="
echo "GitHub Actions Role ARN: arn:aws:iam::$AWS_ACCOUNT_ID:role/iting-github-actions"
echo ""
echo "Add these GitHub repository secrets:"
echo "  AWS_ROLE_ARN: arn:aws:iam::$AWS_ACCOUNT_ID:role/iting-github-actions"
echo "  AWS_REGION: ap-southeast-1"
echo "  EC2_INSTANCE_ID: <from step 1.5>"
```

### 1.5 Create EC2 Instance (Ubuntu 24.04 LTS)

The EC2 instance uses **Ubuntu Server 24.04 LTS** (`ami-0e7ff22101b84bcff`) for better Docker and tooling compatibility.

```bash
# Use Ubuntu Server 24.04 LTS AMI (HVM, SSD Volume Type)
AMI_ID="ami-0e7ff22101b84bcff"

echo "Using AMI: $AMI_ID (Ubuntu Server 24.04 LTS)"

# Create user-data script for Ubuntu 24.04 initial setup
cat > /tmp/iting-userdata.sh << 'USERDATA'
#!/bin/bash
set -e

# Update system
apt-get update -y
apt-get upgrade -y

# Install Docker
apt-get install -y ca-certificates curl gnupg
install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
chmod a+r /etc/apt/keyrings/docker.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null
apt-get update -y
apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# Start and enable Docker
systemctl enable docker
systemctl start docker
usermod -aG docker ubuntu

# Install Certbot
apt-get install -y certbot python3-certbot-nginx

# Install AWS CLI v2
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "/tmp/awscliv2.zip"
cd /tmp && unzip -o awscliv2.zip && ./aws/install

# Install PostgreSQL client (for database setup and health checks)
apt-get install -y postgresql-client

# Create application directory
mkdir -p /opt/iting/{config,nginx,ssl,monitoring,scripts,backups}
mkdir -p /opt/iting/monitoring/{prometheus,grafana,loki,tempo,alertmanager}
mkdir -p /opt/iting/config/{nginx,redis,kafka,otel}
chown -R ubuntu:ubuntu /opt/iting

# Configure system for Docker
sysctl -w vm.max_map_count=262144
echo "vm.max_map_count=262144" >> /etc/sysctl.d/99-docker.conf

# Increase file descriptor limits
cat > /etc/security/limits.d/iting.conf << 'LIMITS'
ubuntu soft nofile 65536
ubuntu hard nofile 65536
root soft nofile 65536
root hard nofile 65536
LIMITS

# Optimize network
cat > /etc/sysctl.d/99-iting.conf << 'SYSCTL'
net.core.somaxconn=65535
net.ipv4.tcp_max_syn_backlog=65535
net.ipv4.ip_local_port_range=1024 65535
net.ipv4.tcp_tw_reuse=1
net.core.netdev_max_backlog=65535
SYSCTL

sysctl -p /etc/sysctl.d/99-iting.conf
sysctl -p /etc/sysctl.d/99-docker.conf

# Set hostname
hostnamectl set-hostname iting-server

echo "=== ITing EC2 initialization complete ==="
USERDATA

# Launch EC2 instance with Ubuntu 24.04 LTS
INSTANCE_ID=$(aws ec2 run-instances \
  --image-id $AMI_ID \
  --instance-type m7i-flex.large \
  --key-name iting-key-pair \
  --security-group-ids $EC2_SG \
  --subnet-id $PUBLIC_SUBNET \
  --iam-instance-profile Name=iting-ec2-profile \
  --block-device-mappings '[{"DeviceName":"/dev/sda1","Ebs":{"VolumeSize":30,"VolumeType":"gp3","DeleteOnTermination":true}}]' \
  --tag-specifications "ResourceType=instance,Tags=[{Key=Name,Value=iting-server}]" \
  --user-data file:///tmp/iting-userdata.sh \
  --query 'Instances[0].InstanceId' --output text --region $AWS_REGION)

echo "Instance launching: $INSTANCE_ID"

# Wait for instance to be running
echo "Waiting for instance to be running..."
aws ec2 wait instance-running --instance-ids $INSTANCE_ID --region $AWS_REGION

# Wait for user-data to complete (Ubuntu takes ~3-5 min)
echo "Waiting for user-data initialization (this takes 3-5 minutes)..."
sleep 120

# Allocate and associate Elastic IP
EIP_ALLOCATION=$(aws ec2 allocate-address --domain-name vpc \
  --tag-specifications "ResourceType=elastic-ip,Tags=[{Key=Name,Value=iting-eip}]" \
  --query 'AllocationId' --output text --region $AWS_REGION)

aws ec2 associate-address --instance-id $INSTANCE_ID --allocation-id $EIP_ALLOCATION --region $AWS_REGION

# Get public IP
PUBLIC_IP=$(aws ec2 describe-instances --instance-ids $INSTANCE_ID \
  --query 'Reservations[0].Instances[0].PublicIpAddress' --output text --region $AWS_REGION)

echo "=== EC2 Instance Created ==="
echo "Instance ID: $INSTANCE_ID"
echo "Public IP: $PUBLIC_IP"
echo "AMI: Ubuntu Server 24.04 LTS (ami-0e7ff22101b84bcff)"
echo "SSH: ssh -i iting-key-pair.pem ubuntu@$PUBLIC_IP"
echo ""
echo "Save these values for .env:"
echo "  EC2_PUBLIC_IP=$PUBLIC_IP"
echo "  EC2_INSTANCE_ID=$INSTANCE_ID"
```

### 1.6 Configure Existing RDS PostgreSQL

The project already has an RDS PostgreSQL instance running at `iting-db.cbkcwwk8ug43.ap-southeast-1.rds.amazonaws.com`. Instead of creating a new one, we'll configure the security group to allow access from the new EC2 instance and verify connectivity.

```bash
# === Existing RDS Configuration ===
# The project's existing RDS instance:
RDS_ENDPOINT="iting-db.cbkcwwk8ug43.ap-southeast-1.rds.amazonaws.com"
# Original DB credentials from .env:
# DB_NAME=iting_job_portal (or iting_job_portal depending on setup)
# DB_USER=postgres
# DB_PASSWORD=violet250904 (from existing .env - CHANGE IN PRODUCTION)

echo "=== Using Existing RDS PostgreSQL ==="
echo "Endpoint: $RDS_ENDPOINT"
echo "Port: 5432"

# Verify the existing RDS instance is available
aws rds describe-db-instances \
  --query 'DBInstances[?Endpoint.Address==`'$RDS_ENDPOINT'`].{Status:DBInstanceStatus,Engine:Engine,Version:EngineVersion,Class:DBInstanceClass}' \
  --region $AWS_REGION

# Create a new security group rule allowing EC2 access to the existing RDS
# First, find the existing RDS VPC security group
RDS_VPC_SG=$(aws rds describe-db-instances \
  --query 'DBInstances[?Endpoint.Address==`'$RDS_ENDPOINT'`].VpcSecurityGroups[0].VpcSecurityGroupId' \
  --output text --region $AWS_REGION)

echo "RDS Security Group: $RDS_VPC_SG"

# Option A: If the RDS is in the same VPC as the new EC2
# Add the EC2 security group as an allowed source
aws ec2 authorize-security-group-ingress \
  --group-id $RDS_VPC_SG \
  --protocol tcp --port 5432 \
  --source-group $EC2_SG \
  --region $AWS_REGION 2>/dev/null || echo "Rule may already exist"

# Option B: If the RDS is in a different VPC, add the EC2's public IP
# (Only use this if VPC peering is not configured)
# MY_IP=$(curl -s https://checkip.amazonaws.com)/32
# aws ec2 authorize-security-group-ingress \
#   --group-id $RDS_VPC_SG \
#   --protocol tcp --port 5432 \
#   --cidr $MY_IP \
#   --region $AWS_REGION 2>/dev/null || echo "Rule may already exist"

# If the RDS is NOT publicly accessible, you may need to:
# 1. Enable public accessibility temporarily for initial setup, OR
# 2. Set up VPC peering between the old and new VPCs, OR
# 3. Migrate the RDS to the new VPC (recommended for production)

# Check if RDS is publicly accessible
RDS_PUBLIC=$(aws rds describe-db-instances \
  --query 'DBInstances[?Endpoint.Address==`'$RDS_ENDPOINT'`].PubliclyAccessible' \
  --output text --region $AWS_REGION)

echo "RDS Publicly Accessible: $RDS_PUBLIC"

# If not publicly accessible and in a different VPC, enable temporarily:
if [ "$RDS_PUBLIC" = "False" ]; then
  echo "NOTE: RDS is not publicly accessible."
  echo "You may need to:"
  echo "  1. Enable public accessibility for initial setup, OR"
  echo "  2. Set up VPC peering, OR"
  echo "  3. Migrate RDS to the new VPC (recommended)"
  echo ""
  echo "To enable temporarily:"
  echo "  aws rds modify-db-instance --db-instance-identifier <DB_ID> --publicly-accessible --apply-immediately"
fi

# Test connectivity from EC2 (after EC2 is running)
echo ""
echo "=== After EC2 is launched, verify RDS connectivity with: ==="
echo "  psql --host=$RDS_ENDPOINT --username=postgres --dbname=iting_job_portal -c 'SELECT 1;'"
echo ""
echo "=== For production, update these values in .env: ==="
echo "  DB_HOST=$RDS_ENDPOINT"
echo "  DB_PORT=5432"
echo "  DB_NAME=iting_job_portal"
echo "  DB_USERNAME=postgres  (or create a new limited user)"
echo "  DB_PASSWORD=<STRONG_PASSWORD>  (change from default!)"

# IMPORTANT: Create a dedicated application user for production
# This should be done on the RDS instance:
# CREATE USER iting_app WITH ENCRYPTED PASSWORD '<strong-password>';
# GRANT CONNECT ON DATABASE iting_job_portal TO iting_app;
# GRANT ALL PRIVILEGES ON SCHEMA public TO iting_app;
# (See Task 03 for full details)
```

### 1.7 Configure Cloudflare DNS

DNS is managed via Cloudflare (not Route 53). Add A records pointing to the EC2 Elastic IP.

#### Option A: Cloudflare Dashboard (Recommended)

1. Log in to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Select your zone (`dpdns.org` or the subdomain zone)
3. Go to **DNS → Records**
4. Add the following A records:

| Type | Name | Content (IPv4) | TTL | Proxy Status |
|------|------|----------------|-----|--------------|
| A | `datnhk252iting` | `$PUBLIC_IP` | Auto | DNS only (gray cloud) |
| A | `www.datnhk252iting` | `$PUBLIC_IP` | Auto | DNS only (gray cloud) |
| A | `api.datnhk252iting` | `$PUBLIC_IP` | Auto | DNS only (gray cloud) |
| A | `monitor.datnhk252iting` | `$PUBLIC_IP` | Auto | DNS only (gray cloud) |

> **Important**: Set proxy status to **DNS only** (gray cloud), not Proxied (orange cloud). Let's Encrypt HTTP-01 challenge requires direct access to your server. You can enable Cloudflare proxy later after SSL is set up.

#### Option B: Cloudflare API

```bash
# Set variables
CF_API_TOKEN="your-cloudflare-api-token"
CF_ZONE_ID="your-zone-id"
PUBLIC_IP="<from-step-1.5>"

# Create A records via API
for NAME in datnhk252iting www.datnhk252iting api.datnhk252iting monitor.datnhk252iting; do
  curl -s -X POST "https://api.cloudflare.com/client/v4/zones/$CF_ZONE_ID/dns_records" \
    -H "Authorization: Bearer $CF_API_TOKEN" \
    -H "Content-Type: application/json" \
    --data '{
      "type": "A",
      "name": "'$NAME'",
      "content": "'$PUBLIC_IP'",
      "ttl": 1,
      "proxied": false
    }'
done

echo "=== DNS Records Created in Cloudflare ==="
echo "datnhk252iting.dpdns.org        → $PUBLIC_IP"
echo "www.datnhk252iting.dpdns.org     → $PUBLIC_IP"
echo "api.datnhk252iting.dpdns.org     → $PUBLIC_IP"
echo "monitor.datnhk252iting.dpdns.org → $PUBLIC_IP"
```

#### Verify DNS Propagation

```bash
# Wait 1-5 minutes for Cloudflare DNS propagation
dig datnhk252iting.dpdns.org +short
dig api.datnhk252iting.dpdns.org +short
dig monitor.datnhk252iting.dpdns.org +short

# Expected: All should return your EC2 Elastic IP
```

### 1.8 Save Infrastructure Info

On the EC2 instance, save all infrastructure details:

```bash
ssh -i iting-key-pair.pem ubuntu@$PUBLIC_IP

cat > /opt/iting/infrastructure.env << 'EOF'
# AWS Infrastructure Configuration
# Generated by deploy_plan/01_aws_infrastructure.md
AWS_REGION=ap-southeast-1
VPC_ID=<from-step-1.1>
PUBLIC_SUBNET=<from-step-1.1>
PRIVATE_SUBNET_A=<from-step-1.1>
PRIVATE_SUBNET_B=<from-step-1.1>
EC2_SG=<from-step-1.2>
EC2_INSTANCE_ID=<from-step-1.5>
EC2_PUBLIC_IP=<from-step-1.5>
EC2_AMI=ami-0e7ff22101b84bcff
EC2_OS=ubuntu-24.04
EC2_USER=ubuntu

# Existing RDS (already in project)
RDS_ENDPOINT=iting-db.cbkcwwk8ug43.ap-southeast-1.rds.amazonaws.com
RDS_PORT=5432
RDS_DB_NAME=iting_job_portal
RDS_USERNAME=postgres

# Existing S3 bucket (already in project)
S3_BUCKET=datn-jobweb
S3_REGION=ap-southeast-1

# DNS (Cloudflare)
DNS_PROVIDER=cloudflare
DOMAIN=datnhk252iting.dpdns.org
CF_ZONE_ID=<your-cloudflare-zone-id>
EOF

chmod 600 /opt/iting/infrastructure.env
```

## Verification

```bash
# Verify EC2 is running
aws ec2 describe-instances --instance-ids $INSTANCE_ID \
  --query 'Reservations[0].Instances[0].State.Name' --output text --region $AWS_REGION
# Expected: "running"

# Verify SSH access (wait ~3-5 min for user-data to complete on Ubuntu)
ssh -i iting-key-pair.pem ubuntu@$PUBLIC_IP "docker --version && docker compose version"
# Note: SSH user is 'ubuntu' (not 'ubuntu')

# Verify RDS is accessible (from EC2)
ssh -i iting-key-pair.pem ubuntu@$PUBLIC_IP "sudo apt-get install -y postgresql-client && psql --host=$RDS_ENDPOINT --username=postgres --dbname=iting_job_portal -c 'SELECT 1;'"

# Verify DNS propagation via Cloudflare (may take 1-5 minutes)
dig datnhk252iting.dpdns.org +short
dig api.datnhk252iting.dpdns.org +short
dig monitor.datnhk252iting.dpdns.org +short
# Expected: All should return your EC2 Elastic IP
```

## Rollback

```bash
# Terminate EC2 instance
aws ec2 terminate-instances --instance-ids $INSTANCE_ID --region $AWS_REGION

# NOTE: Do NOT delete the existing RDS instance!
# The RDS at iting-db.cbkcwwk8ug43.ap-southeast-1.rds.amazonaws.com is a pre-existing resource.
# Only remove the security group rule we added:
aws ec2 revoke-security-group-ingress \
  --group-id $RDS_VPC_SG \
  --protocol tcp --port 5432 \
  --source-group $EC2_SG \
  --region $AWS_REGION 2>/dev/null || true

# Release Elastic IP
aws ec2 release-address --allocation-id $EIP_ALLOCATION --region $AWS_REGION

# Delete NAT Gateway (if created)
aws ec2 delete-nat-gateway --nat-gateway-id $NAT_GW --region $AWS_REGION

# Delete Internet Gateway (detach first)
aws ec2 detach-internet-gateway --internet-gateway-id $IGW_ID --vpc-id $VPC_ID --region $AWS_REGION
aws ec2 delete-internet-gateway --internet-gateway-id $IGW_ID --region $AWS_REGION

# Delete VPC (cascades to subnets, route tables, security groups)
aws ec2 delete-vpc --vpc-id $VPC_ID --region $AWS_REGION

# Delete IAM roles
aws iam remove-role-from-instance-profile --instance-profile-name iting-ec2-profile --role-name iting-ec2-role
aws iam delete-instance-profile --instance-profile-name iting-ec2-profile
aws iam delete-role-policy --role-name iting-ec2-role --policy-name iting-ec2-policy
aws iam delete-role --role-name iting-ec2-role
```

## References

- `.opencode/skills/ecs/SKILL.md` - AWS container orchestration patterns
- `.opencode/rules/devops-core-principles.instructions.md` - Infrastructure as Code principles
- `aws_deployment_guide.md` - Existing deployment guide for reference
- `ITing-backend/.env` - Existing RDS endpoint and S3 bucket configuration
- `ITing-backend/.env.production` - Production environment template
- **Existing AWS Resources:**
  - RDS: `iting-db.cbkcwwk8ug43.ap-southeast-1.rds.amazonaws.com` (PostgreSQL)
  - S3 Bucket: `datn-jobweb` (file uploads)
  - AWS Region: `ap-southeast-1`
