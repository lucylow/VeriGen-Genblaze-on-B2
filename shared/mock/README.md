# VeriGen Mock Data Framework

This framework provides a complete, production-quality simulation of the VeriGen platform, allowing it to function as a polished enterprise SaaS product even without live APIs, AI providers, or databases.

## Architecture

The mock layer is centralized in `shared/mock` and intercepted at the following points:

1.  **Frontend (TRPC)**: The `mockTrpcLink` in `client/src/lib/mockTrpcLink.ts` intercepts all API calls and returns realistic data from `shared/mock/data.ts`.
2.  **Backend (Database)**: The `server/db.ts` methods check for `DEMO_MODE=true` and return mock records.
3.  **Storage (Backblaze B2)**: The `server/b2Client.ts` methods simulate bucket operations and manifest storage.
4.  **AI Providers**: Simulated with realistic latency, scoring, and local assets.

## Switching to Demo Mode

Demo Mode can be enabled in two ways:

1.  **Environment Variable**: Set `VITE_DEMO_MODE=true` in your `.env` file.
2.  **UI Toggle**: Use the "Demo Mode" switch in the application header. This stores the preference in `localStorage` and reloads the application.

## Key Features

*   **Realistic Workflows**: The generation process simulates multiple stages (pending, generating, scoring, storage) with realistic timing.
*   **Polished Dashboard**: A comprehensive dashboard shows daily requests, success rates, storage usage, and historical trends.
*   **Bundled Assets**: 20+ local SVG assets are bundled in `client/public/mock/` to ensure no broken images during demos.
*   **Type Safety**: All mock data follows the production Drizzle schema and TypeScript interfaces.

## Migration to Production

To replace mocks with production APIs:

1.  Set `VITE_DEMO_MODE=false` in the environment.
2.  Configure real API keys for OpenAI, Anthropic, Google, and Backblaze B2 in the server environment.
3.  Ensure a live MySQL database is connected via `DATABASE_URL`.

The frontend components will continue to work without modification as the response shapes are identical.
