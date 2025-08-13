# Opening Night - GitHub Copilot Instructions

Opening Night is a full-stack web application that helps users rediscover upcoming and released movies from trailers they liked on YouTube. It features React + TypeScript frontend with Vite, Convex backend/database, and integrations with YouTube API, TMDB, Clerk authentication, and Resend email service.

Always reference these instructions first and fallback to search or bash commands only when you encounter unexpected information that does not match the info here.

## Working Effectively

### Bootstrap and Build Process

- **CRITICAL DEPENDENCY ISSUE**: The repository includes a private FontAwesome kit (`@awesome.me/kit-2f975920ad`) that is NOT available in the public npm registry
  - `npm install` will fail with 404 error on this dependency
  - Build and dev server will fail due to missing imports
  - **Workaround**: Remove the problematic dependency line from package.json and use the FontAwesome fallback created in `src/utils/fontawesome-fallback.ts`
- Install dependencies (after removing problematic FontAwesome kit):
  - `npm install` -- takes 1-2 minutes. NEVER CANCEL. Set timeout to 5+ minutes.
- Build the application:
  - `npm run build` -- takes 5-6 seconds total (3s TypeScript + 2s Vite). NEVER CANCEL. Set timeout to 2+ minutes.
  - Produces optimized bundle in `dist/` directory
  - Build warnings about chunk size >500KB are normal and expected
- Development servers:
  - Frontend only: `npm run dev:frontend` -- starts Vite dev server on http://localhost:5173/
  - Backend only: `npm run dev:backend` -- starts Convex dev mode (requires authentication)
  - Full stack: `npm run dev` -- runs both frontend and backend in parallel
  - Preview built app: `npm run preview` -- serves production build on http://localhost:4173/

### Code Quality and Linting

- **ALWAYS** run code quality checks before committing:
  - `npm run lint` -- runs TypeScript compilation + ESLint. Takes 5 seconds. NEVER CANCEL.
  - `npx prettier --write .` -- fixes code formatting automatically
  - `npx eslint . --ext ts,tsx --fix` -- auto-fixes basic ESLint issues
- **Known lint issues in codebase** (these are existing issues, not caused by your changes):
  - Convex config files missing from TypeScript project (2 errors)
  - Promise handling issues in React components (6 errors)
  - These do not prevent builds or functionality

### Environment Setup Requirements

- **Required external accounts and API keys**:
  - Convex deployment (backend database)
  - Clerk account (authentication)
  - Google Cloud account (YouTube Data API)
  - Resend account (email service)
  - The Movie Database (TMDB) API key
- **Environment variables** (place in `.env.local` file):
  ```
  VITE_CLERK_PUBLISHABLE_KEY=
  ```
- **Convex environment variables** (set via `npx convex env set`):
  ```
  CLERK_CLIENT_SECRET=
  CLERK_JWT_ISSUER_DOMAIN=
  GOOGLE_API_KEY=
  RESEND_API_KEY=
  RESEND_WEBHOOK_SECRET=
  TMDB_API_KEY=
  ```

### Convex Backend Development

- **LIMITATION**: Convex requires authentication or working network access not available in sandboxed environments
- **In normal development**:
  - `npx convex dev` -- sets up local development deployment
  - `npx convex dashboard` -- opens web dashboard for database management
  - `npx convex env set KEY value` -- sets environment variables
  - `npx convex deploy` -- deploys to production
- **Setup process** (when network access is available):
  - Run `npx convex dev` and follow prompts to create account or login
  - Choose local development or cloud deployment
  - Configure environment variables for external services

## Validation

- **ALWAYS** validate builds and functionality after making changes:
  - Run `npm run build` to ensure TypeScript compilation succeeds
  - Start `npm run dev:frontend` and verify the app loads without console errors
  - Test key user flows: authentication, movie loading, UI interactions
  - Run `npm run lint` and fix any NEW linting errors you introduce
  - Run `npx prettier --write .` to ensure consistent formatting

### Manual Testing Scenarios

When making changes, ALWAYS test these core scenarios:

1. **Application startup**: Verify the app loads at http://localhost:5173/ without console errors
2. **UI component rendering**: Check that movies display correctly with icons and styling
3. **FontAwesome icons**: Verify that all icons render properly (bell, trash, comment, etc.)
4. **React component state**: Test interactive elements like buttons and toggles
5. **TypeScript compilation**: Ensure no new type errors are introduced

## Project Structure and Key Files

### Frontend (src/)

- `src/App.tsx` -- Main React application component
- `src/components/` -- All UI components (MovieCard, MovieSection, etc.)
- `src/utils/fontawesome-fallback.ts` -- FontAwesome replacement for missing kit
- `src/utils/dateUtils.ts` -- Date formatting utilities
- `src/index.css` -- Global styles with Tailwind CSS

### Backend (convex/)

- `convex/movies.ts` -- Movie data management and TMDB API integration
- `convex/trailers.ts` -- YouTube trailer processing logic
- `convex/emails.ts` -- Email notifications via Resend
- `convex/youtube.ts` -- YouTube API integration for liked videos
- `convex/schema.ts` -- Database schema definitions
- `convex/auth.config.ts` -- Clerk authentication configuration

### Configuration

- `package.json` -- Dependencies and npm scripts
- `vite.config.ts` -- Vite build configuration
- `eslint.config.js` -- ESLint rules and TypeScript setup
- `tsconfig.*.json` -- TypeScript compiler configuration
- `.prettierrc` -- Code formatting rules (empty = defaults)

## Common Tasks

### Adding New Dependencies

- Use `npm install <package>` for runtime dependencies
- Use `npm install -D <package>` for development dependencies
- **AVOID** adding new FontAwesome packages without testing in builds

### Debugging Build Issues

- Check for missing imports from the FontAwesome kit package
- Verify TypeScript compilation with `tsc --noEmit`
- Use `npm run dev:frontend` to see Vite-specific errors
- Check for missing environment variables in `.env.local`

### Working with Convex Functions

- All functions are in `convex/` directory with `.ts` extensions
- Use `query` for read operations, `mutation` for writes, `action` for external API calls
- Import types from `convex/_generated/api` and `convex/_generated/dataModel`
- Test changes require a working Convex deployment

### FontAwesome Icon Usage

- **NEVER** import from `@awesome.me/kit-2f975920ad/icons` -- this package is not available
- **ALWAYS** use the fallback: `import { byPrefixAndName } from "../utils/fontawesome-fallback"`
- Available icons: bell, trash, comment, times, spinner, envelope, arrows-rotate
- Add new icons to the fallback file if needed

## Build and Development Timing Expectations

| Command                  | Expected Time     | Timeout Setting    |
| ------------------------ | ----------------- | ------------------ |
| `npm install`            | 1-2 minutes       | 5+ minutes         |
| `npm run build`          | 5-6 seconds       | 2+ minutes         |
| `npm run lint`           | 5 seconds         | 2+ minutes         |
| `npm run dev:frontend`   | <1 second startup | N/A (long-running) |
| `npx prettier --write .` | <1 second         | 1 minute           |

**NEVER CANCEL long-running commands** -- builds may take longer on slower machines but should complete within the timeout windows specified above.
