# Branch Naming Convention

## Format

```
<area>/<type>/<descriptor>
```

---

## Areas

### Service Areas

| Area  | Service |
|-------|---------|
| `fe`  | Frontend |
| `be`  | Backend |
| `ms`  | Message Service |
| `is`  | Identity Server (WSO2 IS) |
| `apim` | API Manager (WSO2 APIM) |
| `fs`  | Fullstack (Frontend + Backend) |

*Use `fs` sparingly — it triggers lengthy CI/CD pipelines. Prefer `fe` or `be` where possible.*

### Repo Areas

| Area   | Used for |
|--------|----------|
| `infra` | Infrastructure & deployment (Ansible, Docker stack, scripts) |
| `docs`  | Documentation (README, guides, docs/) |
| `meta`  | Repo-level changes (workflows, CODEOWNERS, .gitignore, AGENTS.md, config files) |

---

## Types

### Service Areas (`fe`, `be`, `ms`, `is`, `apim`, `fs`)

| Type      | Meaning |
|-----------|---------|
| `feat`    | New feature |
| `bug`     | Bug or issue fix |
| `hotfix`  | Urgent production fix |
| `refactor`| Code cleanup, no behavior change |
| `chore`   | Maintenance, dependencies, tooling |

### Infra (`infra`)

| Type      | Meaning |
|-----------|---------|
| `chore`   | Maintenance, tooling |
| `refactor`| Script/code cleanup, no behavior change |
| `bug`     | Bug or issue fix |
| `update`  | Version bumps, deploy config changes |

### Docs (`docs`)

| Type      | Meaning |
|-----------|---------|
| `chore`   | Minor doc maintenance |
| `update`  | Revise existing docs |
| `refactor`| Reorganise documentation structure |

### Meta (`meta`)

| Type      | Meaning |
|-----------|---------|
| `chore`   | Maintenance, tooling |
| `update`  | Revise repo files (CODEOWNERS, .gitignore, etc.) |
| `refactor`| Restructure repo-level config |

---

## Descriptor

- Lowercase letters, numbers, and hyphens only
- Use a ticket ID where applicable (e.g. `ed-45`)
- No spaces, no uppercase, no underscores

---

## Examples

| Branch | Meaning |
|--------|---------|
| `fe/feat/ed-110` | Frontend feature, ticket ED-110 |
| `be/bug/ed-45` | Backend bug fix, ticket ED-45 |
| `ms/refactor/sqs-handler` | Message Service refactor |
| `is/chore/upgrade-wso2` | Identity Server maintenance |
| `apim/hotfix/ed-88` | Urgent APIM production fix |
| `fs/feat/sync-flow` | Fullstack feature |
| `infra/update/docker-stack` | Deploy config update |
| `infra/chore/ansible-update` | Infrastructure maintenance |
| `docs/update/readme-setup` | Update README setup section |
| `meta/update/codeowners` | Update CODEOWNERS |
| `meta/chore/add-agents-md` | Add AGENTS.md |

---

## Exempt Branches

The following branches are exempt from this convention:

- `main`
- `dev`
- `uat`
- `uat-release/*`
- `prod*`

*Exempt branches are defined in the GitHub Actions variable `EXEMPT_BRANCHES`.*

---

## Enforcement

Branch naming is enforced automatically via GitHub Actions on every branch creation. Branches that do not match the convention will be deleted automatically.
