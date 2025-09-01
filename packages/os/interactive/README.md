# Interactive Planner - Urbanova OS

## Overview

The Interactive Planner is a core component of Urbanova OS that implements a **two-stage protocol** for executing tool actions: **PLAN → CONFIRM → RUN**. This system provides users with visibility into what actions will be taken before execution, enabling safe exploration and complex workflow orchestration.

## Protocol Flow

### 1. PLAN Stage

- **Input**: User natural language request (e.g., "Fai una sensitivity sul Progetto A")
- **Process**:
  - Analyze intent using NLP
  - Map to appropriate tool actions
  - Generate plan with steps, requirements, assumptions, and risks
  - Validate against tool schemas
- **Output**: Plan preview with missing requirements and CTA buttons

### 2. CONFIRM Stage

- **Input**: User confirmation or parameter updates
- **Process**:
  - Apply user replies to session
  - Update plan parameters
  - Re-validate requirements
  - Generate updated preview
- **Output**: Updated plan or confirmation to proceed

### 3. RUN Stage

- **Input**: User confirmation to execute
- **Process**:
  - Execute tool actions via Tool Runner
  - Track progress and status
  - Handle errors and completion
- **Output**: Results and completion message

## Key Components

### InteractivePlanner

- **`draftPlan()`**: Creates initial plan from user input
- **`validatePlan()`**: Validates plan against tool schemas
- \*\* Intent analysis and tool action mapping

### SessionManager

- **`createSession()`**: Creates new task session
- **`applyReply()`**: Processes user replies and updates session state
- **`updateSessionStatus()`**: Updates session status and metadata
- \*\* Session filtering and statistics

### PlanRenderer

- **`buildPlanPreview()`**: Creates structured preview for chat UI
- **`generatePlanSummary()`**: Human-readable plan summary
- **`generateCTAText()`**: CTA button text for chat
- \*\* Status and progress messages

## CTA Protocol

The system supports slash commands for user interactions:

- **`/plan confirm`** - Confirm and execute plan
- **`/plan edit key:path value:...`** - Edit plan parameters
- **`/plan dryrun`** - Simulate execution without side effects
- **`/plan cancel`** - Cancel the plan

## Session States

- **`collecting`** - Gathering required information
- **`awaiting_confirm`** - Ready for user confirmation
- **`running`** - Executing tool actions
- **`succeeded`** - Completed successfully
- **`failed`** - Failed with error
- **`cancelled`** - Cancelled by user

## Usage Examples

### Basic Plan Creation

```typescript
import { InteractivePlannerFacade } from '@urbanova/os/interactive';

const facade = new InteractivePlannerFacade(planner, sessionManager, renderer);

const result = await facade.processRequest({
  text: 'Fai una sensitivity sul Progetto A',
  userId: 'user-123',
  workspaceId: 'ws-456',
  userRole: 'pm',
});

// result contains session, preview, summary, and CTA text
```

### Processing User Replies

```typescript
const replyResult = await facade.processReply('session-123', {
  type: 'confirm',
  userId: 'user-123',
});

// replyResult contains updated session and next action
```

### Session Management

```typescript
const sessions = await facade.getUserSessions('user-123');
const status = await facade.getSessionStatus('session-123');
```

## Integration Points

### Chat Interface

- Renders plan previews with CTA buttons
- Handles slash command parsing
- Displays progress and completion messages

### Tool Runner

- Executes confirmed plans
- Provides progress updates
- Returns results for completion

### Firestore

- Stores session state
- Persists user replies
- Enables session recovery

## Security Features

- **Role-based access control** for tool actions
- **Confirmation gates** for side-effect operations
- **Session isolation** by user and workspace
- **Input validation** against tool schemas

## Future Enhancements

- **Cloud Tasks integration** for long-running operations
- **Advanced NLP** for better intent recognition
- **Plan templates** for common workflows
- **Collaborative planning** for team sessions
- **Plan versioning** and rollback capabilities

## Testing

Run the test suite to verify functionality:

```bash
npm test -- --testPathPattern=interactive
```

## Architecture Decisions

This implementation follows the decisions outlined in:

- **ADR-0030**: Interactive Planner protocol
- **ADR-0031**: Confirmation gates and dry-run support
- **ADR-0032**: UX contracts for consistent chat interactions
