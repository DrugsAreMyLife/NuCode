# Mode System Configuration

This document defines the configuration structure for the mode system. When implementing the system, this configuration should be converted to JSON format.

## Configuration Structure

```json
{
  "customModes": [
    {
      "slug": "architect",
      "name": "Software Architect",
      "roleDefinition": "Designs system architecture and patterns",
      "capabilities": ["design", "review", "document"],
      "filePatterns": [
        "docs/architecture/.*\\.md$",
        "docs/design/.*\\.md$"
      ],
      "triggers": [
        "architecture",
        "design",
        "pattern",
        "structure"
      ],
      "handoffTo": ["frontend-dev", "backend-dev", "security"]
    },
    {
      "slug": "frontend-dev",
      "name": "Frontend Developer",
      "roleDefinition": "Implements UI and client-side features",
      "capabilities": ["implement", "test", "debug"],
      "filePatterns": [
        "frontend/.*\\.(ts|js|css|html)$",
        "frontend/tests/.*\\.test\\.(ts|js)$"
      ],
      "triggers": [
        "frontend",
        "ui",
        "interface",
        "component"
      ],
      "handoffTo": ["ui-designer", "tester", "security"]
    },
    {
      "slug": "backend-dev",
      "name": "Backend Developer",
      "roleDefinition": "Implements server-side features",
      "capabilities": ["implement", "test", "debug"],
      "filePatterns": [
        "backend/.*\\.py$",
        "backend/tests/.*\\.py$"
      ],
      "triggers": [
        "backend",
        "api",
        "database",
        "server"
      ],
      "handoffTo": ["dba", "tester", "security"]
    },
    {
      "slug": "security",
      "name": "Security Engineer",
      "roleDefinition": "Implements security features",
      "capabilities": ["secure", "audit", "test"],
      "filePatterns": [
        "security/.*",
        "backend/security/.*",
        "frontend/security/.*"
      ],
      "triggers": [
        "security",
        "auth",
        "encryption",
        "vulnerability"
      ],
      "handoffTo": ["tester", "auditor"]
    },
    {
      "slug": "dba",
      "name": "Database Administrator",
      "roleDefinition": "Manages database architecture",
      "capabilities": ["schema", "optimize", "backup"],
      "filePatterns": [
        "database/.*",
        "backend/models/.*",
        "migrations/.*"
      ],
      "triggers": [
        "database",
        "schema",
        "migration",
        "model"
      ],
      "handoffTo": ["backend-dev", "tester"]
    },
    {
      "slug": "tester",
      "name": "Quality Engineer",
      "roleDefinition": "Implements and runs tests",
      "capabilities": ["test", "verify", "report"],
      "filePatterns": [
        ".*test.*",
        "tests/.*",
        "cypress/.*"
      ],
      "triggers": [
        "test",
        "verify",
        "coverage",
        "quality"
      ],
      "handoffTo": ["auditor", "deployer"]
    },
    {
      "slug": "deployer",
      "name": "DevOps Engineer",
      "roleDefinition": "Manages deployment and infrastructure",
      "capabilities": ["deploy", "configure", "monitor"],
      "filePatterns": [
        "k8s/.*",
        "docker/.*",
        "ci/.*",
        "infrastructure/.*"
      ],
      "triggers": [
        "deploy",
        "infrastructure",
        "kubernetes",
        "docker"
      ],
      "handoffTo": ["monitor", "security"]
    }
  ]
}
```

## Implementation Notes

1. **File Patterns**
   - Use regular expressions to match file paths
   - Patterns should be specific enough to prevent unintended access
   - Consider overlapping patterns for shared responsibilities

2. **Triggers**
   - Keywords that indicate mode relevance
   - Should cover common task descriptions
   - Can overlap between modes for collaborative tasks

3. **Capabilities**
   - Core competencies of each mode
   - Used for task assignment and handoffs
   - Should align with project requirements

4. **Handoff Logic**
   - Define clear paths for task transitions
   - Consider security implications
   - Maintain context during handoffs

## Next Steps

1. Convert this configuration to JSON format
2. Implement mode controller using this structure
3. Add validation for configuration format
4. Test mode transitions and handoffs
5. Document usage patterns and examples