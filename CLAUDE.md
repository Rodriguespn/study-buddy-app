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
- User isolation via `user_id` filtering
- Lazy client initialization with Proxy pattern

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
ChatGPT → /mcp endpoint → Express middleware → McpServer
→ Handlers → Supabase DB → Structured response → Frontend widgets
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
Server requires Supabase credentials (optional for development):
- `SUPABASE_URL`: Supabase project URL
- `SUPABASE_ANON_KEY`: Supabase anonymous key

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
- **Supabase**: PostgreSQL database
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
3. **User Isolation**: All database queries filter by `user_id`
4. **Theme Support**: Use `getThemeTokens()` for consistent theming
5. **Temporary User**: Development uses `TEMP_USER_ID = "temp-user-123"` (OAuth pending)

## Recent Changes & Decisions

### Current Version (0.0.1)
- Implemented core flashcard study system
- Added deck categories (`food`, `travel`, `business`, etc.)
- Created `searchDeck` tool for filtered deck retrieval
- Built three MCP widgets for deck management and study sessions
- Established monorepo structure with shared types
- Configured Supabase integration for persistent storage
- Added CI pipeline with testing and formatting checks

### Architecture Decisions
- **Skybridge Framework**: Alpic.ai's framework that abstracts MCP complexity for widget development
- **Zod-First Validation**: Runtime type safety across server boundaries
- **Widget Pattern**: Self-contained components over traditional SPA routing
- **Lazy Database Client**: Proxy pattern for optional Supabase initialization

## Resources & References

### Project Documentation
- **Live Demo**: https://study-buddy-aedacb7d.alpic.live/

### External Resources
- **ChatGPT Apps SDK**: https://platform.openai.com/docs/actions/introduction
- **MCP Protocol**: https://modelcontextprotocol.io/
- **Supabase Docs**: https://supabase.com/docs
- **Skybridge**: https://github.com/alpic-ai/skybridge
