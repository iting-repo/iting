# Task 14: Code Quality (Semgrep + Trivy + Super-Linter)

## Objective

Implement lightweight, CI-only code quality scanning using Semgrep (SAST), Trivy (container/dependency scanning), and Super-Linter (multi-language linting). These replace SonarQube to save ~2GB+ RAM on the EC2 instance since they run exclusively in GitHub Actions.

## Prerequisites
- Task 13 completed (GitHub Actions pipeline created)

## Why Not SonarQube?

SonarQube requires a dedicated server with minimum 2GB RAM. On our m7i-flex.large (8GB total) with ~15 containers already consuming ~4.9GB, this leaves insufficient headroom. Our alternative approach:

| Tool | Purpose | Runs | RAM on EC2 |
|------|---------|------|------------|
| **Semgrep** | SAST (code vulnerabilities) | GitHub Actions | 0 |
| **Trivy** | Container & dependency scanning | GitHub Actions | 0 |
| **Super-Linter** | Multi-language linting | GitHub Actions | 0 |
| ~~SonarQube~~ | ~~All-in-one~~ | ~~Dedicated server~~ | ~~2GB+~~ |

## Step-by-Step Instructions

### 14.1 Configure Semgrep (SAST)

Create `.semgrep.yml` in the project root:

```yaml
rules:
  - id: iting-custom-rules
    patterns:
      - pattern: |
          $X
    message: "ITing custom rules loaded"
    severity: INFO
```

Create `semgrep.yml` config reference file:

```yaml
# .semgrep.yml - Project-specific Semgrep configuration
# This file tells Semgrep which rules to use

rules:
  # Include default rules
  - id: java-security
    patterns:
      - pattern: System.out.println($X)
    message: "Use logger instead of System.out.println"
    severity: WARNING
    languages: [java]
  
  - id: js-console-log
    patterns:
      - pattern: console.log($X)
    message: "Remove console.log before production"
    severity: WARNING
    languages: [javascript, typescript]
  
  - id: hardcoded-secret-check
    patterns:
      - pattern: |
          $PASSWORD = "..."
    message: "Potential hardcoded password. Use environment variables."
    severity: ERROR
    languages: [java, javascript]
```

The Semgrep scanning is already configured in the CI pipeline (Task 13, Job 3: `security-scan`). It uses:

- **Rulesets**: `p/default`, `p/java`, `p/javascript`, `p/owasp-top-ten`
- **Triggers**: Every push and PR
- **Configuration**: Via `semgrep-action` with auto-detection

### 14.2 Configure Trivy Scanning

Trivy scanning is already configured in the CI pipeline (Task 13, Job 3: `security-scan`). It scans:

- **Filesystem**: Source code dependencies for known vulnerabilities
- **Severity**: Only reports CRITICAL and HIGH findings
- **Output**: SARIF format uploaded to GitHub Security tab

Create `.trivyignore` for acceptable exceptions:

```
# .trivyignore - Known exceptions for Trivy scanning
# Format: CVE-ID

# Example: Accept low-severity findings
# CVE-2023-XXXXX
```

### 14.3 Configure Super-Linter

Super-Linter is configured in the CI pipeline (Task 13, Job 4: `code-quality`). Create `.github/linters` for custom configurations:

```bash
# Create linters directory
mkdir -p .github/linters
```

Create `.github/linters/.eslintrc.json` for frontend:

```json
{
  "env": {
    "browser": true,
    "es2021": true,
    "node": true
  },
  "extends": ["eslint:recommended"],
  "parserOptions": {
    "ecmaVersion": "latest",
    "sourceType": "module"
  },
  "rules": {
    "no-unused-vars": "warn",
    "no-console": "warn"
  }
}
```

Create `.github/linters/sun_checks.xml` for Java checkstyle (if needed):

```xml
<?xml version="1.0"?>
<!DOCTYPE module PUBLIC
    "-//Checkstyle//DTD Checkstyle Configuration 1.3//EN"
    "https://checkstyle.org/dtds/configuration_1_3.dtd">
<module name="Checker">
  <module name="TreeWalker">
    <module name="AvoidStarImport"/>
    <module name="RedundantImport"/>
    <module name="UnusedImports"/>
  </module>
</module>
```

### 14.4 Add Pre-commit Hooks (Optional)

Create `.pre-commit-config.yaml` for local quality checks:

```yaml
repos:
  - repo: https://github.com/pre-commit/pre-commit-hooks
    rev: v4.5.0
    hooks:
      - id: trailing-whitespace
      - id: end-of-file-fixer
      - id: check-yaml
      - id: check-json
      - id: check-added-large-files
        args: ['--maxkb=1000']
      - id: detect-private-key
      - id: no-commit-to-branch
        args: ['--branch', 'main']

  - repo: https://github.com/returntocorp/semgrep
    rev: v1.52.0
    hooks:
      - id: semgrep
        args: ['--config', 'auto', '--error']

  - repo: https://github.com/hadolint/hadolint
    rev: v2.12.0
    hooks:
      - id: hadolint-docker
        files: 'Dockerfile.*'
```

Install pre-commit hooks:

```bash
# Install pre-commit
pip install pre-commit

# Install hooks
pre-commit install

# Run against all files (initial check)
pre-commit run --all-files
```

### 14.5 Add Code Quality Badges to README

```markdown
## Code Quality

[![CI Pipeline](https://github.com/YOUR_ORG/ITing/actions/workflows/ci.yml/badge.svg)](https://github.com/YOUR_ORG/ITing/actions/workflows/ci.yml)
[![Security Scan](https://github.com/YOUR_ORG/ITing/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/YOUR_ORG/ITing/actions/workflows/ci.yml)
[![Code Quality](https://github.com/YOUR_ORG/ITing/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/YOUR_ORG/ITing/actions/workflows/ci.yml)
```

### 14.6 Quality Gate Configuration Summary

| Gate | Tool | Threshold | Action |
|------|------|-----------|--------|
| SAST | Semgrep | Any HIGH/CRITICAL finding | Block PR |
| Container Scan | Trivy | Any CRITICAL CVE | Block deployment |
| Dependency Scan | Trivy | Any CRITICAL CVE | Block deployment |
| Linting | Super-Linter | Any ERROR | Block PR |
| Secret Scanning | Gitleaks | Any finding | Block push |
| Dockerfile | Hadolint | Any DL error | Warning only |

## Verification

```bash
# Trigger CI pipeline
git push origin main

# Check pipeline results
gh run list --limit 1

# Verify security scan results
gh run view --log | grep -i "semgrep\|trivy\|super-linter"

# Check GitHub Security tab for vulnerability reports
# Navigate to: https://github.com/YOUR_ORG/ITing/security

# Verify code quality locally
pre-commit run --all-files
```

## Rollback

```bash
# Remove code quality configurations
rm -rf .github/linters .semgrep.yml .trivyignore .pre-commit-config.yaml

# Remove quality jobs from CI pipeline
# Edit .github/workflows/ci.yml to remove security-scan and code-quality jobs
```

## References

- `.opencode/skills/ci-cd/skills/SKILL.md` - CI/CD pipeline design, DevSecOps section
- `.opencode/skills/ci-cd/skills/references/devsecops.md` - SAST/DAST/SCA tool comparisons
- `.opencode/skills/ci-cd/skills/references/security.md` - Secrets management, supply chain security
- `.opencode/rules/devops-core-principles.instructions.md` - Automation pillar