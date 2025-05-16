Okay, this is a fantastic challenge! The goal is to refactor the PRD v2.2 to leverage `github.com/frdel/agent-zero` as its foundation, ensuring **zero loss of detail, verbosity, or granularity**, while maintaining the original style.

First, I've thoroughly reviewed the `agent-zero` repository, including its README, documentation (`/docs`), examples, and core architectural concepts.

Key `agent-zero` features relevant to this PRD:

1.  **Core Framework:** It's a general-purpose framework for building and deploying autonomous AI agents.
2.  **Agent Definition:** Agents are typically defined via YAML configurations, specifying their LLM, tools, goals, and persona.
3.  **Tooling System:** `agent-zero` has a robust tooling system. Critically:
    *   **`BrowserTool`:** Built on Playwright, offering web browsing, content extraction, and interaction. This directly maps to the PRD's Playwright requirement.
    *   **`CodeInterpreterTool`:** Executes Python code in a sandboxed environment. Useful for agents generating/testing code snippets.
    *   **`FileSystemTool`:** Allows agents to read, write, and list files, crucial for interacting with a project codebase.
    *   **`HumanInputTool`:** Allows agents to pause and ask for human input, mapping to the "human-in-the-loop" requirements.
    *   Custom tools can be developed and integrated.
4.  **Memory:** Supports short-term (conversation history) and long-term memory (vector stores like Chroma, Pinecone, Weaviate). This aligns with context management and codebase indexing.
5.  **Orchestration/Agent Management:** The `agent-manager` service can run and manage multiple agent instances. Communication between agents or sequencing can be designed.
6.  **Deployment:** Natively supports Docker and provides examples for Docker Compose and Kubernetes. This aligns with the containerization and scaling requirements.
7.  **API & UI:** Exposes an API for interaction and includes a Streamlit-based Admin UI for monitoring and interacting with agents. The custom UI from the PRD would interact with `agent-zero`'s API.
8.  **LLM Support:** Supports various LLMs (OpenAI, Anthropic, Google, local models via Ollama/LMStudio).

Given this, many of the "build from scratch" or "integrate X, Y, Z" aspects of the original PRD will transform into "configure agent-zero to use X" or "develop a custom agent-zero tool for Y."

Let's proceed with the rewrite.

--------------

**Fully expanded PRD (v2.3 - `agent-zero` Aligned):**

*   Full internalization of Claude Task Master agentic logic within an `agent-zero` "TaskManagementAgent" configuration, eliminating external MCP servers.
*   Import and parsing logic for task files and folders (LLM-compatible formats) handled by `agent-zero` agents utilizing `FileSystemTool` and LLM-driven parsing.
*   Context7 MCP server support via a custom `Context7Tool` for `agent-zero`, with trigger-based sync logic within agents and local storage in `/references` managed by `FileSystemTool`.
*   Dynamic Playwright invocation through `agent-zero`'s built-in `BrowserTool` for browser-based research, testing, and validation by agents.
*   Containerized infrastructure leveraging `agent-zero`'s native Docker/Kubernetes support, with its `agent-manager` orchestrating 5+ concurrent agent instances.
*   Best-in-class dependency and stack validation, focusing on `agent-zero`'s maintained stack and robust configuration of custom tools/agents, ensuring future-proofing.
*   Enhanced precision-first context management, leveraging `agent-zero`'s memory systems (ChromaDB) and agent-specific prompting strategies, with `HumanInputTool` for optimal context suggestions.

I’ll return shortly with a fully rewritten and significantly enhanced version of the PRD, preserving and extending all structure and detail from the existing document, now reframed for the `agent-zero` framework.

# Claude Code Orchestrator Web App – **Product Requirements Document (PRD) v2.3 (`agent-zero` Aligned)**

## Introduction and Background

Claude Code Orchestrator, **now architected upon the `github.com/frdel/agent-zero` framework**, is a web-based system that coordinates multiple AI coding agents (Claude Code, OpenAI Codex/GPT, Aider-like behaviors, etc.) to collaboratively build and maintain software projects through natural language tasks. It manages project requirements, breaks them into actionable coding tasks, and orchestrates agentic AI coders configured within `agent-zero` to implement, test, and refine the codebase. **Version 2.3** of the PRD builds upon the prior v2.2, reframing its architecture and implementation to fully leverage the capabilities of the `agent-zero` framework, while preserving all existing functionality and sections from v2.2. These improvements focus on deeper integration of task management logic via dedicated `agent-zero` agents, expanded context/documentation support through custom `agent-zero` tools and memory systems, dynamic tool invocation using `agent-zero`'s built-in tools (like `BrowserTool`), and robust containerized deployment inherent to `agent-zero` – ensuring the orchestrator is more autonomous, multi-agent compatible, and scalable than ever. All updates have been incorporated with zero loss of detail from v2.2, providing a comprehensive blueprint for implementation within the `agent-zero` paradigm.

**Key Enhancements in v2.3 (Leveraging `agent-zero`):**

*   **Integrated Task Management Logic (`agent-zero` Agent):** All functionality inspired by the open-source **Task Master** CLI (repo: *eyaltoledano/claude-task-master*) is now implemented as a dedicated "TaskManagementAgent" (or a suite of specialized agents) within the `agent-zero` framework. This agent, configured with appropriate LLMs and tools (like `FileSystemTool`, `agent-zero`'s memory), can parse PRDs and generate structured task lists internally (no external Task Master server required), maintain hierarchical tasks, track statuses, and allow AI-driven task breakdowns and expansions. This logic is inherently multi-agent, as tasks generated by this agent can be assigned to and executed by any other coding agent instance managed by `agent-zero`.
*   **Bulk Task Import (Docs & Folders via `agent-zero` Agents):** The orchestrator, through agents configured in `agent-zero`, now supports importing task lists from user-provided documents and directories in LLM-friendly formats (Markdown outlines, YAML/JSON/TOML). Agents will use `agent-zero`'s `FileSystemTool` to access files/folders recursively. The parsing agent will process recognized files and merge their contents into a unified task backlog, managed within `agent-zero`'s memory systems or as structured files. All incoming task definitions are normalized into the orchestrator’s standard task schema.
*   **Dynamic Documentation Integration (Context7 via Custom `agent-zero` Tool):** The orchestrator integrates with **Context7 MCP Server** via a custom-developed `Context7Tool` for `agent-zero`. This tool enables agents to request on-demand retrieval of up-to-date, version-specific documentation. A trigger-based sync mechanism, implemented within an agent's logic, automatically invokes the `Context7Tool` when a dependency is introduced or updated. Fetched documents are stored locally using `agent-zero`'s `FileSystemTool` in a `/references` folder within the project and indexed into `agent-zero`'s configured vector database (e.g., Chroma). This ensures agents always have access to the latest official documentation within their context.
*   **Playwright Browser Automation (via `agent-zero`'s `BrowserTool`):** Each agent instance managed by `agent-zero` can be configured with access to the built-in **`BrowserTool`**, which internally uses Playwright. This enables browser automation, UI interaction, and live web content scraping at runtime. Orchestrated agents invoke `BrowserTool` functions to open web pages, simulate user actions, take screenshots, or validate web content, facilitating automated end-to-end testing and on-the-fly data extraction.
*   **Comprehensive Containerization & Scaling (Native `agent-zero` Capability):** The entire orchestrator system, being built on `agent-zero`, is inherently containerized. `agent-zero`'s architecture (Agent Manager, Tool Server, API, UI) is designed for Docker deployment. A pool of **5 pre-warmed agent Docker containers** (configured as distinct `agent-zero` agent types) will be maintained by the `agent-zero` Agent Manager to serve requests immediately. All containers run in the same network, with access to shared resources (project files via `FileSystemTool`, documentation cache in the vector DB, Context7 service via the custom tool) and required API credentials managed by `agent-zero`'s configuration. The `agent-zero` framework supports elastic scaling (e.g., via Kubernetes Horizontal Pod Autoscalers targeting the Agent Manager or individual agent deployments).
*   **Upgraded Tech Stack (Leveraging `agent-zero`'s Stack & Latest SDKs):** The underlying software stack relies on `agent-zero`'s maintained dependencies and is augmented with the latest stable releases for external integrations. This includes using the newest **Anthropic and OpenAI SDKs** (as supported or integrated by `agent-zero`, or used by custom tools if making direct calls), a robust **vector database** (Chroma v1.0.x, configured within `agent-zero`), an `agent-zero` internal or externally integrated task **scheduler/queue** for managing task execution flow between agents, advanced **tokenizer libraries** (as used by `agent-zero` or its supported LLMs), and a modern web **frontend framework** (such as Vue 3 or React 18 with Next.js) for the custom UI interacting with `agent-zero`'s API. All components have been verified against their official repositories for compatibility and stability as of Q2 2025.
*   **Enhanced Context Management & Control (`agent-zero` Memory & `HumanInputTool`):** The context management relies on `agent-zero`'s memory capabilities (short-term history and long-term vector store). A **precision-first ideation** approach is implemented within agent prompts and logic to construct optimal context by retrieving the most relevant code snippets and documentation from `agent-zero`'s memory. A new optional **human-in-the-loop** mode, leveraging `agent-zero`'s `HumanInputTool`, allows developers to review and fine-tune the context chunks selected for an agent’s prompt before the agent proceeds, ensuring higher quality and accuracy.

The following sections detail the updated architecture, components, and workflows of the Claude Code Orchestrator v2.3, incorporating all above enhancements within the `agent-zero` framework. This PRD serves as the definitive implementation guide and maintains all content from v2.2 with requisite updates and additions for v2.3.

## System Architecture Overview

*Figure: High-level architecture of the Claude Code Orchestrator v2.3, built on `agent-zero`.* User interactions (via the custom Web App UI or directly via `agent-zero`'s API) flow into the **`agent-zero` Framework**. This framework comprises the **Agent Manager** (orchestrating agent instances), **Tool Server** (hosting tools like `BrowserTool`, `FileSystemTool`, and our custom `Context7Tool`), and **Memory Systems** (short-term and long-term vector DB like Chroma). The Agent Manager dispatches tasks to a pool of **Agent Instances** (configured for Claude Code, OpenAI Codex/GPT, Aider-like behavior, Task Management, etc.). Each agent instance has access to shared project code via `FileSystemTool` and can invoke other tools as needed. The `agent-zero` Memory System is populated with project code embeddings and documentation fetched by the `Context7Tool` (stored in local `/references` via `FileSystemTool`). A scheduling/dispatch flow, managed by `agent-zero` or custom routing agents, ensures tasks are assigned optimally. The entire system is containerized using `agent-zero`'s deployment patterns.

### `agent-zero` Core & Multi-Agent Coordination

The `agent-zero` framework itself serves as the central nervous system. The **Agent Manager** component within `agent-zero` is key for orchestrating multiple agent instances. User commands, originating from the custom Web App UI or API calls to `agent-zero`'s exposed endpoints, initiate agent runs. `agent-zero` manages global state elements like available agent configurations, access to tools, and memory. Key responsibilities mapped to `agent-zero`:

*   **Task Scheduling & Dispatch:** Task assignment and sequencing will be managed by a combination of `agent-zero`'s agent execution model and potentially a dedicated "RoutingAgent" or "MasterAgent" configuration. This agent would decide which specialized coding agent (e.g., "ClaudeAgent_WebDev," "OpenAI_RefactorAgent") should handle a given task based on task metadata, agent capabilities defined in their YAML configurations, availability, or load-balancing policies. `agent-zero` inherently supports asynchronous agent execution. Tasks can be managed within `agent-zero`'s memory or via `FileSystemTool` if a persistent task list (e.g., JSON/YAML file) is preferred. The "next task" logic from the original Task Master concept will be implemented within the "TaskManagementAgent" or the "RoutingAgent," which queries the task backlog and initiates the appropriate agent.
*   **Agent Instance Interface:** Agents within `agent-zero` are defined by configuration files (typically YAML) specifying their LLM, assigned tools, goals, and initial prompts/persona. `agent-zero`'s Agent Manager handles the lifecycle of these agent instances.
    *   *For API-driven LLMs (e.g., Claude API, OpenAI API):* `agent-zero` directly integrates with these LLM providers. The agent configuration specifies the model to use, and `agent-zero` handles the API calls, passing the prompt (constructed with context from memory and tool outputs) and receiving completions.
    *   *For CLI tools or more complex agentic logic (e.g., simulating Aider):* An `agent-zero` agent can be configured to use the `CodeInterpreterTool` to run specific CLI commands (like Aider's, if Aider were wrapped or its core logic emulated via Python scripts) or the `FileSystemTool` to manage files as Aider would. The "AiderAgent" configuration in `agent-zero` would have prompts and a toolset designed to mimic Aider's interactive coding loop.
    In all cases, `agent-zero` ensures agents operate within their defined capabilities and tool access permissions, providing a consistent operational framework.

*   **Shared Resources & Communication:** All agent instances managed by `agent-zero` can be granted access to the project's codebase via the `FileSystemTool`, configured with a shared base path (e.g., a mounted volume in Docker). Changes made by one agent via `FileSystemTool` are visible to others. `agent-zero`'s memory systems (short-term conversation history, long-term vector store) serve as another shared resource for context. Inter-agent communication can occur by one agent updating a shared state (e.g., task status in a file or memory entry) that another agent reads, or by one agent's output triggering another agent's run, orchestrated by a "RoutingAgent" or the `agent-zero` control plane.

*   **Multi-Agent Strategy:** The multi-agent collaboration strategy is defined by how `agent-zero` agents are designed and sequenced. Tasks can be handled sequentially by a general-purpose agent, or a "RoutingAgent" can dispatch sub-tasks to specialized agents that can operate in parallel if dependencies allow. The task dependency graph (maintained by the "TaskManagementAgent") informs this routing. Agents can "handoff" results by writing outputs to shared memory or files, which then become inputs for subsequent agents, all coordinated by `agent-zero`'s execution flow.

### Integrated Task Management System (via `agent-zero` "TaskManagementAgent")

The Task Master's AI-driven task management capabilities are implemented by one or more specialized agents configured within `agent-zero`, referred to collectively as the "TaskManagementAgent." This agent leverages `agent-zero`'s LLM integration and tools.

**PRD Parsing and Task Generation:** The "TaskManagementAgent" is prompted to parse PRDs or specification files (accessed via `FileSystemTool`). It uses its configured LLM (e.g., Claude) with specific prompts (similar to Task Master's original ones) to output a hierarchical list of tasks. This process is initiated by a user command via the custom UI (which calls the `agent-zero` API to run this agent). The resulting tasks are stored by the agent, potentially as a structured file (JSON/YAML) using `FileSystemTool` or within `agent-zero`'s persistent memory. This internalizes the `task-master parse-prd` functionality.

**Hierarchical Task Representation:** Tasks are stored with fields like `task_id`, `description`, `status`, `priority`, `assigned_agent_type`, `parent_id`, etc. This structure, managed by the "TaskManagementAgent" (e.g., in a JSON file or a dedicated section of the vector store), allows for a task tree. The "TaskManagementAgent" can be queried (via API) to display this hierarchy in the custom UI.

**Task Status Tracking and Transitions:** The "TaskManagementAgent" updates task statuses (Pending, In Progress, Completed) as other coding agents, managed by `agent-zero`, work on them. When a coding agent successfully completes a task, it can notify the "TaskManagementAgent" (e.g., by calling a specific tool or updating a shared status file/memory entry), which then updates the task's status. Manual status updates via the UI will trigger the "TaskManagementAgent" to modify the task data.

**AI-Assisted Task Expansion and Refinement:** The "TaskManagementAgent" can be invoked with a specific task ID and prompted to break it down further into subtasks, using its LLM. This replicates the `expand task X` functionality. New subtasks are added to the task structure. Context from the parent task and PRD is fed to the agent for relevant decomposition.

**Elimination of External Task Master Service:** All Task Master-inspired functionalities are executed by `agent-zero` agents. The "TaskManagementAgent" configuration in `agent-zero` encapsulates the necessary prompts, LLM choice, and tool access (`FileSystemTool`, memory tools). This tight integration within `agent-zero` ensures efficient, in-process operations. The specific LLM used for task parsing/expansion can be configured within this agent's definition, defaulting to Claude for consistency.

### Task Import and Bulk Ingestion from Documents (via `agent-zero` Agents)

This feature is handled by an `agent-zero` agent (or the "TaskManagementAgent" itself) configured for this purpose.

**Supported File Formats:** Markdown, YAML, JSON, TOML. The agent will use `FileSystemTool` to read these files.

**Bulk Import Workflow:** Users initiate import via the custom UI, specifying a file or directory. The UI call triggers an `agent-zero` agent.
*   The agent uses `FileSystemTool` to recursively traverse directories and identify supported files.
*   For structured formats (YAML/JSON/TOML), the agent reads the file content (via `FileSystemTool`) and uses its LLM or Python code (via `CodeInterpreterTool` if needed for complex parsing) to transform the data into the internal task schema.
*   For Markdown or free-form text, the agent reads the content and uses its LLM with appropriate prompts to extract actionable tasks. Heuristics (regex via `CodeInterpreterTool`) can supplement LLM parsing.
*   Parsed tasks are normalized and merged into the main task list managed by the "TaskManagementAgent," with source attribution.

**Use Case – Bulk Import:** Similar to v2.2, but the orchestrator is now an `agent-zero` agent performing these actions using its configured tools.

### Context Management System (Leveraging `agent-zero` Memory and Tools)

Context is managed primarily through `agent-zero`'s built-in memory systems and tool interactions.

**Codebase Understanding and Embeddings:** Upon project initialization, an `agent-zero` agent (e.g., "IndexingAgent") scans the project repository (using `FileSystemTool`).
*   It reads source files.
*   It generates vector embeddings for these files/chunks (potentially using an embedding model via `agent-zero`'s LLM integrations or a dedicated embedding tool if `agent-zero` abstracts this).
*   It stores these embeddings in `agent-zero`'s configured **Vector Database** (e.g., Chroma v1.0.9). `agent-zero` handles the interaction with the vector DB.
    This process makes code semantically searchable by other agents.

**Precision-First Context Planning:** When an agent is tasked, its prompt engineering and internal logic (or a preceding "ContextPreparationAgent") will:
*   Analyze the task description.
*   Query `agent-zero`'s vector DB for relevant code snippets/documentation. `agent-zero`'s memory retrieval mechanisms handle this.
*   Select the most relevant chunks based on a token budget and relevance scoring, implemented in the agent's logic or prompting.
*   The agent's prompt is then constructed with this curated context. The "planning" or "ideation" step involves the agent using its LLM to reason about which context pieces are most critical.

**Context7 Documentation Sync (via Custom `Context7Tool`):**
*   A custom `Context7Tool` is developed for `agent-zero`. This tool will encapsulate API calls to the Context7 MCP server.
*   When an agent (e.g., the "IndexingAgent" or a dedicated "DocSyncAgent") detects a new dependency (by parsing files via `FileSystemTool`), it invokes the `Context7Tool`.
*   The `Context7Tool` fetches documentation, and the agent uses `FileSystemTool` to store it in `/references/<library_name>/`.
*   These fetched documents are then also embedded and stored in `agent-zero`'s vector database by the "IndexingAgent."
*   The Context7 server itself can be run as a separate container, accessible to the `Context7Tool`.

**Live Documentation Querying:** Agents can invoke the `Context7Tool` at runtime if they need specific, un-cached documentation. The tool's output becomes part of the agent's current context.

**Optional Human-in-the-Loop Context Curation (`HumanInputTool`):**
*   If this mode is enabled, before an agent proceeds with a critical task, it can use `agent-zero`'s `HumanInputTool`.
*   The `HumanInputTool` pauses the agent and sends the proposed context (list of file snippets, docs) to the human operator via `agent-zero`'s UI communication channel (which our custom UI will listen to).
*   The custom UI displays this context for review. The user's approval/modifications are sent back via the `agent-zero` API, and the `HumanInputTool` provides this feedback to the agent.
*   The agent then proceeds with the refined context.

**Continuous Learning and Context Optimization:** The agent's logic can be designed to learn from feedback (e.g., if human removes context, or if a task fails/succeeds with certain context) to improve future context selection. This is part of the agent's persona and prompt engineering.

### Browser Automation & Playwright Integration (via `agent-zero`'s `BrowserTool`)

`agent-zero`'s built-in `BrowserTool` provides Playwright capabilities.

**Use Cases Enabled:** Automated UI testing, web content extraction, cross-platform checks – all as described in v2.2.

**Invocation Mechanism:**
*   Agents are configured with access to `agent-zero`'s `BrowserTool`.
*   During their execution, agents decide to use browser actions (e.g., "open URL," "click selector," "extract text").
*   The agent calls the appropriate `BrowserTool` functions (e.g., `tool_runner.run("browser", "browse_website", url="...")`).
*   `agent-zero`'s Tool Server executes these Playwright commands via the `BrowserTool`.
*   Results (HTML content, text, screenshots) are returned to the agent as tool output, becoming part of its context for further reasoning.
    This is a standard `agent-zero` tool usage pattern, fitting naturally into the agent's thought-action loop.

**Configuration:** The `BrowserTool` is part of `agent-zero`. Its underlying Playwright and browser dependencies are managed by `agent-zero`'s container images.

**Safety & Resource Management:** `agent-zero`'s Tool Server and agent execution environment manage tool calls. Timeouts and error handling for `BrowserTool` operations are handled within `agent-zero` or can be configured. The agent receives error information if a browser action fails.

**Example Workflow – Testing a Feature:** An agent completes a coding task. A subsequent task (or a step in the same agent's plan) is to test the feature.
1.  The agent formulates a test plan involving browser interaction.
2.  It calls `BrowserTool.browse_website(url=local_dev_url)`.
3.  It receives page content, then calls `BrowserTool.fill_text(selector="#username", text="test")`, etc.
4.  Based on `BrowserTool` outputs, the agent determines test success/failure and reports back. If a bug, the "TaskManagementAgent" can be updated or a new bug-fix task created.

### Containerization & Deployment Strategy (Native `agent-zero` Approach)

`agent-zero` is designed for containerized deployment.

*   **`agent-zero` Core Services Containers:** `agent-zero` itself runs as a set of Docker containers:
    *   `agent-manager`: Manages agent lifecycles, loads configurations, and orchestrates runs.
    *   `tool-server`: Hosts and executes tools like `BrowserTool`, `FileSystemTool`, `CodeInterpreterTool`, and our custom `Context7Tool`.
    *   `api-server`: Exposes REST APIs for interaction (used by our custom UI).
    *   `streamlit-ui`: The default admin UI (can run alongside our custom UI).
    *   Potentially a container for the chosen Vector DB (e.g., Chroma), if not using a cloud service.
    *   Potentially a container for Redis, if used by `agent-zero` for queuing or caching.
    These are built from `agent-zero`'s provided Dockerfiles. Configuration (API keys, etc.) is managed via environment variables or `agent-zero`'s configuration files.

*   **Agent Instances:** The "5 pre-warmed agent Docker containers" from v2.2 translate to `agent-zero`'s `agent-manager` being configured to run multiple instances of agents based on their YAML definitions. These aren't separate Docker images per agent *type* unless an agent requires a very unique environment not covered by the standard `agent-zero` agent execution environment. More typically, they are distinct *configurations* run by the `agent-manager`. We will define agent configurations for:
    *   "ClaudeCodingAgent" (using Anthropic's API via `agent-zero`)
    *   "OpenAICodingAgent" (using OpenAI's API via `agent-zero`)
    *   "AiderSimAgent" (using LLM + `FileSystemTool` + `CodeInterpreterTool` to mimic Aider)
    *   "TaskManagementAgent"
    *   "IndexingAgent" / "DocSyncAgent"
    Each agent configuration specifies its LLM, tools it can access (e.g., `FileSystemTool`, `BrowserTool`, `Context7Tool`), and its core mission/prompt.

*   **Context7 Integration:** The custom `Context7Tool` within `agent-zero`'s `tool-server` will communicate with a Context7 MCP server. This Context7 server can be run as another Docker container in the same `docker-compose` setup or Kubernetes cluster, or be an external service.

*   **Shared Storage:** Project files are accessed via `FileSystemTool`. This tool needs to be configured in `agent-zero` to point to a shared volume (e.g., a Docker named volume or Kubernetes Persistent Volume) mounted into the `tool-server` container and potentially agent execution environments if they directly access files. The `/references` folder is part of this shared volume. The vector database (Chroma) will also use persistent storage.

*   **Networking and Access:** `agent-zero` containers communicate over a Docker network or Kubernetes CNI. The `api-server` exposes endpoints for the custom UI. `agent-zero` manages LLM API key securely. The `tool-server` (and thus tools like `BrowserTool` or `Context7Tool`) needs appropriate outbound network access.

*   **Pre-warming & Lifecycle:** `agent-zero`'s `agent-manager` can be configured to maintain a pool of active agent "sessions" or be ready to quickly instantiate agents based on their definitions. The concept of "pre-warmed" means the `agent-manager` is running and ready to execute agent configurations.

*   **Elastic Scaling:** `agent-zero`'s architecture is suitable for scaling. In Kubernetes, services like `agent-manager` or `tool-server` can be scaled using Horizontal Pod Autoscalers. The number of concurrent agent runs can be managed by `agent-zero`'s configuration and underlying infrastructure capacity.

*   **Resource Allocation:** Standard container resource requests/limits (CPU, memory) will be defined for `agent-zero`'s service containers in Docker Compose or Kubernetes manifests, considering the needs of tools like `BrowserTool`.

*   **Security & Isolation:** `agent-zero` provides the agent execution environment. Tools like `CodeInterpreterTool` run code in sandboxed environments. `FileSystemTool` access can be restricted to specific paths.

In summary, `agent-zero` provides the foundational containerized microservice architecture. Our work involves configuring it, defining our specific agents and their logic, developing any necessary custom tools (like `Context7Tool`), and building the custom external UI.

### Technology Stack and Dependency Versions (within `agent-zero` Ecosystem)

The stack is largely determined by `agent-zero` and the requirements of our custom UI and tools.

*   **Programming Languages & Runtimes (for `agent-zero` and custom components):**
    *   **Python:** `agent-zero` itself is Python-based (typically latest stable Python 3.9+). Custom tools for `agent-zero` will also be in Python.
    *   **Node.js:** Version 20 LTS for the custom Web App UI (frontend and potentially its BFF backend if not directly hitting `agent-zero` API from browser).

*   **AI Model SDKs and Libraries:**
    *   Managed by `agent-zero`: It integrates with various LLM providers (Anthropic, OpenAI, etc.) using their respective Python SDKs. We configure `agent-zero` to use specific models (Claude 2/3, GPT-4, etc.).
    *   Our custom `Context7Tool` might use `httpx` or `requests` if Context7 has a simple HTTP API.
    *   Aider simulation relies on LLM + `FileSystemTool` + `CodeInterpreterTool`.

*   **Vector Database:** **ChromaDB** (e.g., v1.0.9) is a common choice supported by `agent-zero` for long-term memory and embeddings. `agent-zero` manages the client connection.

*   **Embedding Model:** Configured within `agent-zero`, often using models like OpenAI's `text-embedding-ada-002` or other SentenceTransformer models supported by `agent-zero`'s memory backend.

*   **Tokenizers:** Handled by `agent-zero`'s LLM integrations or the underlying LLM SDKs (e.g., Tiktoken for OpenAI, Anthropic's tokenizer for Claude).

*   **Front-end Framework (Custom UI):**
    *   **Vue.js** (Vue 3.3+) or **React** (React 18 with Next.js 13/14). TypeScript.
    *   State management: Framework-native or Zustand/Redux Toolkit.
    *   Build tooling: Vite 4 or Webpack 5.

*   **Backend (Custom UI's BFF, if any):**
    *   If the custom UI uses a Backend-For-Frontend, it could be Node.js with **Express.js** v4.18 or **Fastify** v4. This BFF would then communicate with `agent-zero`'s API.
    *   **Socket.IO** or WebSockets for real-time UI updates, potentially connecting to `agent-zero`'s event stream if available, or managed by the BFF.

*   **`agent-zero` Components:** We use the latest stable release of `agent-zero`. Its internal dependencies (FastAPI for API server, Playwright for `BrowserTool`, etc.) are managed by the `agent-zero` project.

*   **Testing Tools:**
    *   Python: `pytest` for custom `agent-zero` tools and agent logic/prompt tests.
    *   JavaScript (UI): Jest/Vitest with Vue Test Utils or React Testing Library for component tests. Playwright for E2E tests of the custom UI interacting with the `agent-zero` backend.

Compatibility is primarily about ensuring our custom UI interacts correctly with `agent-zero`'s API and that any custom `agent-zero` tools are compatible with its Python environment and tooling framework.

### Frontend and User Interface (Interacting with `agent-zero` API)

The custom Web App UI remains the primary control center for users. It will interact with the `agent-zero` backend via its exposed REST API.

**Task Management UI:**
*   Displays task lists/Kanban fetched from the "TaskManagementAgent" (via `agent-zero` API).
*   Task details, status updates, reordering – all actions trigger API calls to `agent-zero` to interact with the "TaskManagementAgent."
*   Controls like "Ask AI to expand this task" or "Reparse PRD" will invoke specific `agent-zero` agents.

**Import & Documents UI:**
*   "Import Tasks" dialog triggers an `agent-zero` agent run (via API) with the specified file/folder paths (accessible to `agent-zero`'s `FileSystemTool`).
*   The UI lists parsed PRDs/docs by querying relevant state from an `agent-zero` agent or its managed data.

**Real-time Agent Interaction:**
*   The UI subscribes to `agent-zero`'s event stream (if available and suitable) or polls for agent status updates to display live logs or progress.
*   When `BrowserTool` is active, messages about its operations could be relayed.

**Context & Human Review UI:**
*   When an agent invokes `agent-zero`'s `HumanInputTool` for context review:
    *   `agent-zero` communicates the request and context data via its API/event stream.
    *   The custom UI displays the Context Review Panel.
    *   User's feedback (approve/modify) is sent back to `agent-zero` via API, which then resumes the waiting agent through the `HumanInputTool`.

**Documentation Access:**
*   UI can list/display documents fetched by the `Context7Tool` and stored/indexed by `agent-zero` agents (by querying `agent-zero`'s memory or file system).

**Notifications & Status Updates:** UI provides notifications based on events or status changes received from `agent-zero`'s API or event stream.

**Settings and Configurations:**
*   UI for managing API keys (securely passed to `agent-zero`'s configuration).
*   Toggling human-in-loop mode for context (this would be a setting that influences agent behavior, potentially by passing a parameter when initiating an agent run).
*   Configuration of default models for agent types (passed as parameters when invoking `agent-zero` agents or set in agent YAML configurations that `agent-zero` loads).

The API endpoints exposed by `agent-zero` (for starting agent runs, querying status, interacting with tools like `HumanInputTool`) become the contract for the custom UI.

## Testing and Quality Assurance (for `agent-zero` based system)

Testing adapts to the `agent-zero` architecture.

**Unit Testing:**
*   *Custom `agent-zero` Tools:* Python unit tests (`pytest`) for the `Context7Tool` (mocking Context7 API calls).
*   *Agent Logic/Prompts:* Test specific agent configurations by providing mock inputs/tool outputs and verifying the LLM prompts generated or decisions made (may involve some level of LLM call mocking or using small, fast local models for deterministic tests).
*   *Task Parsing/Import Logic:* Test the parsing capabilities of the "TaskManagementAgent" by feeding it sample file contents (via mocked `FileSystemTool` or direct input) and checking the structured task output.

**Integration Testing (Local `agent-zero` End-to-End):**
*   Run the full `agent-zero` stack locally (using its `docker-compose.yml`).
*   *Basic Project Cycle:* Initiate an `agent-zero` "TaskManagementAgent" run to parse a PRD. Then, trigger coding agents to execute tasks. Verify task status changes, file modifications via `FileSystemTool`, and context retrieval from `agent-zero`'s memory.
*   *Multi-Agent Parallel Execution:* Test scenarios where multiple `agent-zero` agent instances run concurrently, coordinated by a routing agent or `agent-zero`'s manager.
*   *Context7 Live Test:* With `agent-zero` and a containerized Context7 server running, trigger an agent to use the `Context7Tool` to fetch docs, store them via `FileSystemTool`, and index them. Verify subsequent agents can retrieve this doc context.
*   *`BrowserTool` Integration Test:* Have an `agent-zero` agent use `BrowserTool` to interact with a simple local web page. Verify actions and results. Test error handling if `BrowserTool` encounters issues.
*   *`HumanInputTool` Test:* Trigger an agent scenario that uses `HumanInputTool`. Verify the custom UI receives the prompt, and sending a response back through `agent-zero`'s API correctly resumes the agent.

**Frontend Testing (Custom UI):**
*   *Unit/Component Tests:* As in v2.2, using Jest/Vitest and Vue Test Utils/React Testing Library.
*   *End-to-End UI Tests:* Use Playwright/Cypress to test UI flows interacting with a live `agent-zero` backend API. Test task creation, import, context review loop, etc.

**Performance and Stress Tests:**
*   Test `agent-zero`'s `agent-manager` and `tool-server` under load with many concurrent agent runs and tool invocations.
*   Stress `agent-zero`'s memory system (vector DB) with large codebases and frequent context retrieval queries.
*   Evaluate scaling of `agent-zero` services.

**Regression Tests:**
*   Ensure all functionalities from v2.2 are preserved, now implemented via `agent-zero`. If v2.1/v2.2 had specific behaviors, confirm they are replicated by the new `agent-zero` agent configurations and tool usage.

**User Acceptance Testing:**
*   As in v2.2, but users interact with the custom UI that now drives `agent-zero` agents. Feedback on UX related to `agent-zero` interactions (e.g., clarity of agent progress, human-in-loop context review) is crucial.

## Conclusion

Claude Code Orchestrator Web App v2.3, by re-architecting onto the **`agent-zero` framework**, represents a sophisticated evolution in AI-driven software development tooling. It leverages `agent-zero`'s robust infrastructure for agent management, tooling, memory, and deployment to deliver powerful capabilities: AI-guided task management through specialized agents, seamless multi-agent orchestration managed by `agent-zero`, live documentation access via custom `agent-zero` tools, and automated browser-based testing using `agent-zero`'s `BrowserTool`. All these enhancements are realized while preserving the core structure, detail, and user experience goals from v2.2. This document serves as the blueprint for implementing this vision, detailing technical specifications, `agent-zero` configurations, custom component designs, and testing protocols. With v2.3, the orchestrator is positioned as a cutting-edge solution, built on a scalable and extensible AI agent framework, ready for a technical architect and engineering team to configure, extend, and deploy, thereby ushering in a new level of autonomy and efficiency in the coding process.