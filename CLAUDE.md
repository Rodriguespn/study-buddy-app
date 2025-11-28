# Study Buddy App - Project Documentation

## Project Overview

This repository contains a full-stack TypeScript/React application for interactive language learning with ChatGPT integration, including:

1. **Flashcard System**: Interactive flashcard widgets for vocabulary study sessions
2. **MCP Integration**: Model Context Protocol server for ChatGPT Apps SDK
3. **Supabase Backend**: PostgreSQL database for persistent deck storage
4. **Monorepo Architecture**: Three-package workspace with shared types and schemas

The primary audience includes developers building ChatGPT integrations and language learning applications using the Apps SDK and MCP protocol.

## Repository Structure

```
.
├── shared/                        # Shared types and validation schemas
│   └── src/
│       ├── index.ts               # Barrel export
│       ├── types.ts               # TypeScript type definitions
│       └── schemas.ts             # Zod validation schemas
├── server/                        # Express + MCP backend
│   └── src/
│       ├── index.ts               # Express app entry point
│       ├── server.ts              # McpServer configuration
│       ├── handlers.ts            # Tool/widget handler functions
│       ├── middleware.ts          # MCP HTTP transport middleware
│       ├── env.ts                 # Environment variable validation
│       ├── supabase.ts            # Supabase client initialization
│       ├── db/
│       │   └── decks.ts           # Database operations layer
│       └── __tests__/
│           └── handlers.test.ts   # Handler unit tests
├── web/                           # React frontend widgets
│   └── src/
│       ├── widgets/
│       │   ├── listDecks.tsx                     # Display saved decks
│       │   ├── startStudySessionFromDeck.tsx     # Study with saved deck
│       │   ├── startStudySessionFromScratch.tsx  # Ad-hoc study session
│       │   └── shared/
│       │       ├── StudySessionUI.tsx            # Reusable study component
│       │       └── shared-flashcard.ts           # Theme and constants
│       ├── hooks/
│       │   └── useSendFollowUpMessage.ts         # Follow-up messaging hook
│       ├── components/
│       │   └── ui/                               # Reusable UI components
│       └── utils.ts                              # Utility functions
├── .github/
│   └── workflows/
│       └── ci.yml                 # GitHub Actions CI pipeline
├── .claude/                       # Claude AI settings
├── package.json                   # Root workspace configuration
├── pnpm-workspace.yaml            # pnpm workspace definition
├── biome.json                     # Biome formatter/linter config
├── .mcp.json                      # MCP server configuration
├── .nvmrc                         # Node version specification
├── README.md                      # User-facing documentation
└── CLAUDE.md                      # This file
```

## Shared Package (`@study-buddy/shared`)

### Type Definitions
Central location for all shared types used across server and web packages:

- **Language**: Supported languages (`spanish`, `french`, `german`, `italian`, `portuguese`)
- **Difficulty**: Learning levels (`beginner`, `intermediate`, `advanced`)
- **Category**: Topic categories (`food`, `travel`, `business`, `greetings`, `numbers`, `colors`, `animals`, `family`, `weather`, `other`)
- **Flashcard**: Card structure with `word` and `translation`
- **Deck**: Complete deck entity with metadata and cards array

### Zod Schemas
Runtime validation schemas that mirror TypeScript types for type-safe data parsing at MCP boundaries.

## Server Package (`@study-buddy/server`)

### MCP Tools
- **searchDeck**: Search saved decks by language, difficulty, or category filters
- **saveDeck**: Persist new flashcard decks to database

### MCP Widgets
- **listDecks**: Display user's saved decks with interactive UI
- **startStudySessionFromDeck**: Launch study session with a saved deck
- **startStudySessionFromScratch**: Create temporary study session with custom flashcards

### MCP Prompts
- **study-french-beginner**: Preset prompt for French beginner vocabulary session

### Database Layer
- Supabase PostgreSQL backend
- CRUD operations in `db/decks.ts`
- User isolation via `user_id` filtering + Row Level Security (RLS)
- Authenticated Supabase client passes user's JWT for RLS enforcement

### Authentication (`auth.ts`)
- **OAuth 2.1 with Supabase Auth** as identity provider
- **JWT validation** via JWKS endpoint with caching (`jose` library)
- **AsyncLocalStorage** for request-scoped auth context
- **Google OAuth** for user authentication
- **Dynamic Client Registration (DCR)** for MCP clients

### OAuth Endpoints
| Endpoint | Purpose |
|----------|---------|
| `/.well-known/oauth-protected-resource` | RFC 9728 Protected Resource Metadata |
| `/oauth/consent` | Authorization consent UI |
| `/oauth/config.json` | Public Supabase config for consent UI |

## Web Package (`@study-buddy/web`)

### Widget Architecture
Widgets are top-level components mounted by the Skybridge framework:
- Each widget is a self-contained React component
- Widgets communicate via `useSendFollowUpMessage` hook
- Theme-aware styling with OpenAI theme detection

### UI Components
- **Button**: Styled button with variants via CVA
- **Tooltip**: Radix-based tooltip component
- **Spinner**: Loading state indicator

### Study Session Features
- Flip card animations
- Progress tracking
- Difficulty and category metadata display
- Light/dark theme support

## Key Patterns & Conventions

### Monorepo Structure
- **pnpm workspaces** manage package dependencies
- **Shared package** is the single source of truth for types
- **Workspace references** use `workspace:*` protocol

### MCP Protocol Implementation
```
MCP Client (ChatGPT)
       ↓
/.well-known/oauth-protected-resource → Discovers Supabase Auth
       ↓
Supabase OAuth 2.1 (DCR + Google login)
       ↓
/oauth/consent → User approves access
       ↓
Bearer token in Authorization header
       ↓
/mcp endpoint → JWT validation via JWKS
       ↓
AsyncLocalStorage auth context
       ↓
Handlers → Authenticated Supabase client (RLS)
       ↓
Structured response → Frontend widgets
```

### Code Style
- **Formatter**: Biome (primary), line width 100
- **Quote Style**: Double quotes
- **Semicolons**: Always
- **Indent**: 2 spaces

### Naming Conventions
- **Types**: PascalCase (`Flashcard`, `Deck`)
- **Variables/Functions**: camelCase (`handleListDecks`)
- **Constants**: UPPER_CASE (`TEMP_USER_ID`)
- **Files**: kebab-case or PascalCase based on content

### TypeScript Configuration
- **Target**: ES2022/ESNext
- **Module Resolution**: Bundler mode
- **Strict Mode**: Enabled
- **Path Aliases**: `@/*` → `./src/*`

## Development Workflow

### Prerequisites
- Node.js 24.11.1 (specified in `.nvmrc`)
- pnpm package manager

### Commands
```bash
# Install dependencies
pnpm install

# Build shared package (required first)
pnpm --filter @study-buddy/shared build

# Development mode
pnpm --filter @study-buddy/server dev
pnpm --filter @study-buddy/web dev

# Run tests
pnpm test --run

# Format code
pnpm biome check --write .

# Type checking
pnpm tsc --noEmit
```

### Environment Variables
Server requires the following environment variables:
- `SUPABASE_URL`: Supabase project URL (e.g., `https://xxx.supabase.co`)
- `SUPABASE_ANON_KEY`: Supabase anonymous key
- `MCP_SERVER_URL`: Public URL of MCP server for OAuth audience validation (e.g., `https://study-buddy-aedacb7d.alpic.live`)

## Technology Stack

### Frontend
- **React 19.1.1**: UI framework
- **TypeScript 5.9.3**: Type safety
- **Vite 7.1.11**: Build tool
- **Tailwind CSS 4.1.14**: Utility-first styling
- **Radix UI**: Headless components
- **Skybridge**: Alpic.ai's MCP widget framework

### Backend
- **Express 5.1.0**: HTTP server
- **TypeScript 5.7.2**: Type safety
- **MCP SDK**: Model Context Protocol
- **Supabase**: PostgreSQL database + OAuth 2.1 Auth
- **jose**: JWT/JWKS validation
- **Zod**: Schema validation
- **T3 Env**: Typed environment variables

### Development
- **Biome**: Formatter and linter
- **Vitest**: Testing framework
- **GitHub Actions**: CI/CD

## CI/CD Pipeline

### Automated Checks
1. Build shared package
2. Run Vitest tests
3. Check Biome formatting

### Trigger Events
- Push to `main` branch
- Pull request to `main` branch

## Important Notes for Development

1. **Build Order**: Always build `shared` package before `server` or `web`
2. **Type Safety**: Use Zod schemas for runtime validation at MCP boundaries
3. **User Isolation**: All database queries filter by `user_id` + RLS policies enforce at DB level
4. **Theme Support**: Use `getThemeTokens()` for consistent theming
5. **Auth Context**: Use `getAuthContext()` from `auth.ts` to access authenticated user in handlers

## Recent Changes & Decisions

### Current Version (0.0.1)
- Implemented core flashcard study system
- Added deck categories (`food`, `travel`, `business`, etc.)
- Created `searchDeck` tool for filtered deck retrieval
- Built three MCP widgets for deck management and study sessions
- Established monorepo structure with shared types
- Configured Supabase integration for persistent storage
- Added CI pipeline with testing and formatting checks
- **Implemented OAuth 2.1 authentication** with Supabase Auth as identity provider
- **Added JWT validation** via JWKS with caching
- **Created consent UI** at `/oauth/consent` for user authorization
- **Enabled RLS policies** for database-level user isolation

### Architecture Decisions
- **Skybridge Framework**: Alpic.ai's framework that abstracts MCP complexity for widget development
- **Zod-First Validation**: Runtime type safety across server boundaries
- **Widget Pattern**: Self-contained components over traditional SPA routing
- **AsyncLocalStorage for Auth**: Request-scoped auth context without polluting Express types
- **Supabase as OAuth Provider**: Leverages Supabase Auth's OAuth 2.1 server capabilities with DCR for MCP clients

## Testing OAuth Flow

### Local Development with ngrok
1. Start the server: `pnpm --filter @study-buddy/server dev`
2. Create ngrok tunnel: `ngrok http 3000`
3. Update `MCP_SERVER_URL` in `.env` to ngrok URL
4. Test endpoints:
   - `GET /.well-known/oauth-protected-resource` - Should return authorization server info
   - `GET /oauth/config.json` - Should return Supabase config
   - `GET /oauth/consent` - Should show consent UI (needs `authorization_id` param)
   - `POST /mcp` without token - Should return 401 with `WWW-Authenticate` header

### Supabase Dashboard Configuration Required
1. **Authentication > OAuth Server**: Enable OAuth 2.1, set Authorization Path to `/oauth/consent`
2. **Authentication > OAuth Server**: Enable Dynamic Client Registration
3. **Authentication > Providers**: Ensure Google OAuth is enabled
4. **SQL Editor**: Run RLS policies (see implementation plan)

## Resources & References

### Project Documentation
- **Live Demo**: https://study-buddy-aedacb7d.alpic.live/

### External Resources
- **ChatGPT Apps SDK**: https://platform.openai.com/docs/actions/introduction
- **MCP Protocol**: https://modelcontextprotocol.io/
- **Supabase Docs**: https://supabase.com/docs
- **Supabase OAuth 2.1 Server**: https://supabase.com/docs/guides/auth/oauth-server
- **Skybridge**: https://github.com/alpic-ai/skybridge
