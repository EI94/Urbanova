# Interactive Planner for Urbanova OS

## Overview

The Interactive Planner is a Deep-Research style planning system that enables users to review and confirm AI-generated plans before execution. It implements a two-stage protocol: **PLAN** → **CONFIRM** → **RUN**, ensuring user control and validation of all automated actions.

## Protocol Flow

### 1. PLAN Stage

- User submits natural language request
- AI analyzes intent and maps to available tools
- System generates comprehensive plan with:
  - Tool actions and parameters
  - Requirements and missing fields
  - Assumptions and risks
  - Estimated duration and cost
- Plan is stored in `TaskSession` with status `COLLECTING`

### 2. CONFIRM Stage

- System presents "Plan Preview" with:
  - Clear action summary
  - Missing information prompts
  - Risk assessment
  - CTA buttons: [Confirm & Run] [Edit Parameters] [Dry-run] [Cancel]
- User can provide missing information or request modifications
- Session status: `AWAITING_CONFIRM`

### 3. RUN Stage

- Upon confirmation, system executes plan via Tool Runner
- Creates `ToolRun` documents for tracking
- Session status: `RUNNING` → `SUCCEEDED`/`FAILED`
- Completion messages posted to chat with results and links

## Key Components

### InteractivePlanner

- **`draftPlan(input, context)`**: Analyzes user intent and generates execution plan
- **`validatePlan(plan)`**: Validates plan against tool schemas and requirements
- Intent detection for: feasibility analysis, land scanning, design creation, market analysis, document management

### SessionManager

- **`createSession(session)`**: Creates new planning session
- **`applyReply(sessionId, reply)`**: Processes user responses and updates session
- **`updateSessionStatus(sessionId, update)`**: Updates session state
- Firestore integration for persistence

### PlanRenderer

- **`buildPlanPreview(session)`**: Generates chat-friendly plan preview
- **`generateCTAText(session)`**: Creates call-to-action text
- **`generateStatusMessage(session)`**: Provides current status information

### InteractivePlannerFacade

- Unified interface for the entire Interactive Planner system
- **`processRequest(input)`**: Handles new user requests
- **`processReply(sessionId, reply)`**: Processes user responses
- **`getSessionStatus(sessionId)`**: Retrieves current session state

## CTA Protocol

The system recognizes button clicks as slash commands:

- `/plan confirm` → Execute plan
- `/plan edit key:path value:...` → Modify parameters
- `/plan cancel` → Cancel session
- `/plan dryrun` → Simulate execution

## Session States

- **`collecting`**: Gathering missing information
- **`awaiting_confirm`**: Waiting for user confirmation
- **`running`**: Plan execution in progress
- **`succeeded`**: Plan completed successfully
- **`failed`**: Plan execution failed
- **`cancelled`**: User cancelled the plan

## Usage Examples

### Basic Feasibility Analysis

```typescript
import { InteractivePlannerFacade } from '@urbanova/os/interactive';

const facade = new InteractivePlannerFacade(planner, sessionManager, renderer);

// Process new request
const result = await facade.processRequest({
  text: 'Fai una sensitivity analysis sul Progetto A',
  projectId: 'project-123',
  userId: 'user-123',
  workspaceId: 'workspace-123',
  userRole: 'pm',
});

// Process user confirmation
const reply = await facade.processReply(result.session.id, {
  type: 'confirm',
  userId: 'user-123',
  data: {},
});
```

### Multi-turn Planning

```typescript
// User provides missing information
const updateReply = await facade.processReply(sessionId, {
  type: 'provide_value',
  userId: 'user-123',
  data: { deltas: [0.1, 0.2, 0.3] },
});

// System re-renders plan preview
const updatedPreview = updateReply.preview;
```

## Integration Points

### Chat Interface

- Integrates with existing chat system in `packages/agents/src/chatOps.ts`
- Automatically triggers Interactive Planner for complex requests
- Posts completion messages with results and links

### Tool Registry

- Maps user intents to available tools via `@urbanova/toolos`
- Validates tool actions against schemas
- Supports role-based access control

### Data Layer

- Firestore integration for session persistence
- Tool run tracking and status updates
- User activity logging and analytics

## Security Features

- **Role-based Access Control**: Tools require specific user roles
- **Confirmation Gates**: Side-effect actions require explicit user approval
- **Session Isolation**: Users can only access their own sessions
- **Input Validation**: All parameters validated against Zod schemas

## Future Enhancements

- **Background Execution**: Long-running tasks via Cloud Tasks
- **Plan Templates**: Reusable planning patterns
- **Collaborative Planning**: Multi-user session support
- **Advanced Analytics**: Planning success metrics and optimization
- **Integration APIs**: Webhook support for external systems

## Testing

Run the Interactive Planner tests:

```bash
cd packages/os
npm test -- --testPathPattern=interactive.test.ts
```

All tests should pass, covering:

- Plan drafting and validation
- Session management
- Plan rendering
- Facade integration
- Multi-turn conversations

## Architecture Notes

- **Type Safety**: Full TypeScript implementation with Zod validation
- **Modular Design**: Clean separation of concerns between components
- **Extensible**: Easy to add new planning intents and tool mappings
- **Production Ready**: Includes error handling, logging, and monitoring
- **Performance**: Efficient session management and plan validation

## Dependencies

- `@urbanova/types`: Type definitions and Zod schemas
- `@urbanova/toolos`: Tool registry and execution engine
- `zod`: Schema validation and type inference
- `uuid`: Unique identifier generation
- `firebase-admin`: Firestore integration (production)

The Interactive Planner provides a robust foundation for AI-assisted planning while maintaining user control and system transparency.
