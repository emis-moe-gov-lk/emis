# Branch Naming Convention

## Format

```
<area>/<type>/<descriptor>
```

---

## Areas

| Area | Meaning |
|------|---------|
| `fe` | Frontend |
| `be` | Backend |
| `fs` | Fullstack (Frontend + Backend changes) |
| `infra` | Infrastructure |
| `config` | Configuration |
| `wkflw` | GH Actions Workflow | 
| `docs` | Documentation Update |

*use **fs** branch naming sparingly as it triggers different lengthy ci/cd actions. always try to stic to **fe**/**be** area names when branching*
---

## Types

| Type | Meaning |
|------|---------|
| `feat` | New feature |
| `bug` | Bug or issue fix |
| `hotfix` | Urgent production fix |
| `refactor` | Code cleanup, no behavior change |
| `chore` | Maintenance, dependencies, tooling |

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
| `be/fix/ed-45` | Backend bug fix, ticket ED-45 |
| `docs/refactor/frontend-run-local` | Frontend documentation update |
| `infra/chore/update-ansible` | Infrastructure maintenance |
| `be/hotfix/ed-88` | Urgent backend production fix |
| `config/chore/update-env-vars` | Config/environment update |

---

## Exempt Branches

The following branches are exempt from this convention:

- `main`
- `dev`
- `uat`
- `uat-release/*`
- `prod*`

*Exempt main branches are defined in GH Actions variable [EXEMPT_BRANCHES]*
---


## Enforcement

Branch naming is enforced automatically via GitHub Actions on every branch creation. Branches that do not match the convention will be deleted automatically.
