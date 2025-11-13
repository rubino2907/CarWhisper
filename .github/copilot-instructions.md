# Copilot Instructions for Fronthend-CarWhisper (Angular Frontend)

## Project Overview

- This is an Angular 20+ application for a chat dashboard, generated with Angular CLI.
- The main entry point is `src/main.ts` and the root module/component is in `src/app/app.ts`.
- The app is structured with feature pages under `src/app/pages/`, shared dialogs/components under `src/app/shared/`, and services in `src/app/services/`.
- Routing is defined in `src/app/app.routes.ts` and `src/app/pages/*/`.
- Guards (e.g., `auth.guard.ts`) are used for route protection.

## Developer Workflows

- **Start Dev Server:**
  - Use `ng serve` or `npm start` to run locally at `http://localhost:4200/`.
- **Build:**
  - Run `ng build` to compile the app to `dist/`.
- **Unit Tests:**
  - Run `ng test` for Karma-based unit tests.
- **End-to-End Tests:**
  - Run `ng e2e` (framework not included by default).
- **Docker Deployment:**
  - Build with `ng build`, then use the provided `Dockerfile` and `nginx.conf` for containerization.
  - Use `deploy_mac.sh` or `deploy_windows.bat` for one-step build and deploy.

## Conventions & Patterns

- **Component Structure:**
  - Each page/component has its own folder with `.ts`, `.html`, `.css`, and `.spec.ts` files.
- **Services:**
  - API and business logic are handled in `src/app/services/` (e.g., `auth.service.ts`, `chat.service.ts`).
  - HTTP interceptors (e.g., `auth.interceptor.ts`, `token-renew.interceptor.ts`) are used for authentication and token management.
- **Environment Configs:**
  - Use `src/environments/environment.ts` and `environment.prod.ts` for environment-specific settings.
- **Styling:**
  - Global styles in `src/styles.css`, component styles in their respective folders.
- **Testing:**
  - Specs for components/services are in `.spec.ts` files alongside implementation.

## Integration Points

- **External APIs:**
  - Auth and chat features likely integrate with backend APIs via services and interceptors.
- **Docker/Nginx:**
  - Custom `nginx.conf` supports SPA routing (catch-all to `index.html`).
- **Scripts:**
  - Use provided deployment scripts for consistent build/deploy workflow.

## Examples

- To add a new page: create a folder in `src/app/pages/`, add `.ts`, `.html`, `.css`, and update routing.
- To add a new service: add to `src/app/services/`, inject via Angular DI.
- To protect a route: use `auth.guard.ts` in routing config.

## Key Files

- `src/app/app.ts`, `src/app/app.routes.ts`, `src/app/services/`, `src/app/pages/`, `src/app/shared/`, `src/environments/`, `Dockerfile`, `nginx.conf`, `deploy_mac.sh`, `deploy_windows.bat`, `README.md`

---

For more details, see `README.md` and comments in deployment scripts.
