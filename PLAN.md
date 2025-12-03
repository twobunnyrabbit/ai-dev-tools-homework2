# Implementation Plan: Collaborative Coding Interview Platform

## Overview
Real-time collaborative code editor for online interviews with shareable links, WebSocket-based multi-user editing, and syntax highlighting.

**Tech Stack:** Socket.io, Monaco Editor, React Router, Express, In-memory sessions

---

## Phase 1: Backend Foundation ✅
**Goal:** API + WebSocket infrastructure

### Dependencies
- [x] `cd apps/backend && pnpm add socket.io`
- [x] `pnpm add -D @types/socket.io`

### Files to Create
- [x] `src/types/session.types.ts` - TypeScript interfaces (Session, User)
- [x] `src/utils/id-generator.ts` - Session ID generation (crypto.randomBytes)
- [x] `src/services/session.service.ts` - In-memory CRUD (Map-based storage)
- [x] `src/controllers/session.controller.ts` - REST handlers (create, get, getCode)
- [x] `src/routes/session.routes.ts` - Express routes for sessions
- [x] `src/socket/index.ts` - Socket.io server initialization
- [x] `src/socket/handlers/session.handler.ts` - Join/leave event logic
- [x] `src/socket/handlers/code.handler.ts` - Code sync + language change events

### Files to Modify
- [x] `src/index.ts` - Replace app.listen() with httpServer + Socket.io
- [x] `src/routes/api.routes.ts` - Mount session routes
- [x] `openapi.yaml` - Document session endpoints

### API Endpoints to Implement
- [x] `POST /api/sessions` - Create session (body: { language })
- [x] `GET /api/sessions/:id` - Get session metadata
- [x] `GET /api/sessions/:id/code` - Get current code state

### Socket.io Events to Implement
- [x] Client→Server: join-session, code-change, language-change, cursor-move
- [x] Server→Client: session-joined, user-joined, user-left, code-update, language-update, cursor-update, error

### Testing
- [x] Test session creation via API
- [x] Test WebSocket join/leave flow
- [x] Test code-change broadcast to multiple users

---

## Phase 2: Frontend Routing + Basic UI ✅
**Goal:** Navigation structure and session creation

### Dependencies
- [x] `cd apps/frontend && pnpm add react-router-dom`
- [x] `pnpm add -D @types/react-router-dom`

### Files to Create
- [x] `src/types/session.ts` - Frontend types
- [x] `src/lib/api.ts` - HTTP client functions
- [x] `src/router.tsx` - React Router configuration
- [x] `src/pages/HomePage.tsx` - Landing page with language selector + "Create Session"
- [x] `src/pages/SessionPage.tsx` - Collaborative editor page (skeleton)
- [x] `src/pages/SessionNotFoundPage.tsx` - Error page for invalid sessions

### Files to Modify
- [x] `src/App.tsx` - Replace with RouterProvider

### Features to Implement
- [x] HomePage: Language selector dropdown (JavaScript, Python, TypeScript, Go, Java, C++)
- [x] HomePage: "Create Session" button → POST /api/sessions → navigate to /session/:id
- [x] SessionPage: Extract sessionId from URL params
- [x] SessionPage: Fetch session metadata (GET /api/sessions/:id)
- [x] SessionPage: Display shareable link with copy button
- [x] SessionPage: Show loading state while fetching

### Testing
- [x] Navigate from home to session page
- [x] Copy shareable link
- [x] Handle invalid session ID (redirect to error page)

---

## Phase 3: Monaco Editor Integration ✅
**Goal:** Working code editor with syntax highlighting

### Dependencies
- [x] `cd apps/frontend && pnpm add @monaco-editor/react monaco-editor`

### Files to Create
- [x] `src/components/CodeEditor.tsx` - Monaco wrapper component
- [x] `src/components/LanguageSelector.tsx` - Dropdown for language switching
- [x] `src/components/ShareLink.tsx` - Shareable link with copy functionality

### Features to Implement
- [x] CodeEditor: Monaco integration with dark theme
- [x] CodeEditor: Support for javascript, typescript, python, java, go, cpp
- [x] CodeEditor: onChange handler for local state
- [x] LanguageSelector: Dropdown with supported languages
- [x] SessionPage: Integrate CodeEditor + LanguageSelector
- [x] SessionPage: Fetch initial code via GET /api/sessions/:id/code

### Configuration
- [x] Monaco options: minimap, fontSize: 14, wordWrap: on, automaticLayout: true

### Testing
- [x] Type code in editor, verify syntax highlighting
- [x] Change language, verify highlighting updates
- [x] Verify editor persists state on language change

---

## Phase 4: Real-time Collaboration ✅
**Goal:** Multi-user code sync via WebSocket

### Dependencies
- [x] `cd apps/frontend && pnpm add socket.io-client`

### Files to Create
- [x] `src/lib/socket.ts` - Socket.io client instance
- [x] `src/hooks/useSocket.ts` - Connection management hook
- [x] `src/hooks/useCollaboration.ts` - Code sync logic with debouncing

### Files to Modify
- [x] `vite.config.ts` - Add WebSocket proxy for /socket.io

### Features to Implement
- [x] Socket.io client: autoConnect: false, reconnection: true, 5 attempts
- [x] SessionPage: Prompt for username on mount (dialog)
- [x] SessionPage: Connect socket + emit join-session with sessionId + username
- [x] useCollaboration: Debounce code changes (300ms) before emitting
- [x] useCollaboration: Listen for code-update events
- [x] useCollaboration: Update editor on remote changes (preserve cursor if typing)
- [x] SessionPage: Emit leave-session + disconnect on unmount
- [x] Reconnection: On refresh, fetch code state + rejoin session
- [x] SessionPage: Connection status indicator (green/yellow/red)

### Testing
- [x] Open session in two tabs, edit in one, verify update in other
- [x] Refresh page, verify reconnection to session
- [x] Close one tab, verify no errors in other tab

---

## Phase 5: User Presence ✅
**Goal:** Show connected users + connection status

### Files to Create
- [x] `src/components/UserList.tsx` - Display connected users
- [x] `src/components/ConnectionStatus.tsx` - WebSocket status indicator

### Features to Implement
- [x] UserList: Listen for user-joined, user-left events
- [x] UserList: Display list of usernames
- [x] UserList: Show user count badge
- [x] ConnectionStatus: Display connection state (connected/reconnecting/disconnected)
- [x] ConnectionStatus: Color-coded indicator (green/yellow/red)
- [x] SessionPage: Integrate UserList + ConnectionStatus in header

### Layout
- [x] Header: ShareLink | LanguageSelector | UserList | ConnectionStatus
- [x] Main: CodeEditor (full height)

### Testing
- [x] Join session with multiple users, verify all appear in UserList
- [x] Disconnect internet, verify "Reconnecting" status
- [x] Close one tab, verify user removed from list in other tabs

---

## Phase 6: Polish + Error Handling ✅
**Goal:** Production-ready UX

### Backend Tasks
- [x] `src/services/session-cleanup.service.ts` - TTL-based cleanup (1 hour)
- [x] Session cleanup: setInterval every 10 mins
- [x] Session cleanup: Delete empty sessions after 5 mins
- [x] Integrate cleanup service in src/index.ts
- [x] Graceful shutdown handlers (SIGTERM, SIGINT)

### Frontend Tasks
- [x] `src/components/ErrorBoundary.tsx` - React error boundary
- [x] Loading states: Skeleton loader while fetching session
- [x] Loading states: "Connecting..." for WebSocket
- [x] Loading states: Disabled editor until connected
- [x] Error handling: Session not found → SessionNotFoundPage
- [x] Error handling: Session expired → show message + "Create New" button
- [x] UI: Tailwind styling for all components
- [x] UI: Responsive layout (header stacks on mobile)
- [x] UI: Copy link feedback (toast or "Copied!" text)
- [x] UI: Username dialog styling
- [x] Edge case: Duplicate usernames → append number (John, John-2)
- [x] Edge case: Empty sessionId in URL → redirect to home
- [x] Edge case: WebSocket disconnect → show reconnecting banner

### Testing
- [x] Test all error scenarios
- [x] Verify loading states
- [x] Test on mobile viewport
- [x] Verify session cleanup after 1 hour idle

---

## Phase 7: Testing ✅
**Goal:** Comprehensive test coverage

### Backend Tests
- [x] Session service: Create, get, delete operations
- [x] Session service: Cleanup logic (TTL)
- [x] Socket.io: Join session event flow
- [x] Socket.io: Code-change broadcast to multiple users
- [x] Socket.io: User disconnect handling

### Frontend Tests
- [x] Component: CodeEditor renders and handles changes
- [x] Component: LanguageSelector changes language
- [x] Component: UserList displays users and updates on join/leave
- [x] Component: ShareLink copies to clipboard
- [ ] Integration: SessionPage loads session and connects socket (skipped - covered by component tests)
- [ ] Integration: Router navigation from home to session (skipped - covered by component tests)

### Manual Testing Checklist
- [x] Create session → navigate to session page
- [x] Copy link, open in incognito → join same session
- [x] Edit code in one tab → see update in other tab
- [x] Change language → both tabs update
- [x] Close one tab → other tab shows user left
- [x] Refresh page → reconnect to session
- [x] Idle session for 1 hour → session expires

---

## OpenAPI Spec Updates

```yaml
/api/sessions:
  post:
    summary: Create a new coding session
    requestBody:
      content:
        application/json:
          schema:
            type: object
            properties:
              language:
                type: string
                enum: [javascript, typescript, python, java, go, cpp]
    responses:
      201:
        content:
          application/json:
            schema:
              type: object
              properties:
                sessionId:
                  type: string
                expiresIn:
                  type: number

/api/sessions/{id}:
  get:
    summary: Get session metadata
    parameters:
      - name: id
        in: path
        required: true
        schema:
          type: string
    responses:
      200:
        content:
          application/json:
            schema:
              type: object
              properties:
                sessionId:
                  type: string
                language:
                  type: string
                userCount:
                  type: number
                exists:
                  type: boolean

/api/sessions/{id}/code:
  get:
    summary: Get current code content
    parameters:
      - name: id
        in: path
        required: true
        schema:
          type: string
    responses:
      200:
        content:
          application/json:
            schema:
              type: object
              properties:
                code:
                  type: string
                language:
                  type: string
```

---

## Unresolved Questions

1. **Cursor colors:** Random per user or fixed palette?
2. **Max users:** Unlimited or cap at 10 for performance?
3. **Username dialog:** Modal or inline input?
4. **Copy link feedback:** Toast notification or inline "Copied!"?
5. **Reconnection UX:** Banner or silent retry?

---

## Future Enhancements (Post-MVP)

- Operational Transform for conflict-free editing
- Redis/PostgreSQL for session persistence
- Code execution (Judge0 API or Docker sandbox)
- Text chat alongside editor
- Version history with undo/redo
- Light/dark theme toggle
- Shareable code snippets export
- User authentication and session ownership
