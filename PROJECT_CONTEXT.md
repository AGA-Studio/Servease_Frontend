# Servease Frontend — Project Context

## Active Branch
- `feature/erik` (central dev branch, merged with develop)

## Stack
- React 19 + TypeScript 6.0
- Vite 8 + Tailwind CSS 4
- react-router-dom v7
- lucide-react (icons)
- motion (animations)
- recharts (dashboard charts)
- Supabase JS client (auth)

## Structure
- `src/screens/auth/` — AuthScreen, ConfirmEmailScreen
- `src/screens/app/` — Dashboard, Home, JobFeed, MyJobs, MyPost, Messages, NewService, Profile, Settings
- `src/screens/admin/` — AdminDashboard, Users, Posts, Logs
- `src/components/` — Sidebar, modals, filters, Toast, tooltips
- `src/router/` — AppRouter + ProtectedRoute + RoleRoute
- `src/context/` — AuthContext
- `src/i18n/` — English + Spanish translations
- `src/api/` — apiClient, messagesApi, userApi
- `src/hooks/` — useChatWebSocket

## Key Routes
- `/auth` — Login/Register
- `/app/messages` — Chat (conversation list + messages)
- `/app/dashboard` — Provider dashboard
- `/app/home` — Main feed

## Messaging Integration
- API base: `/api/mensajeria/`
- WebSocket: `ws://localhost:8000/ws/mensajeria/{id}/?token={jwt}`
- messagesApi.ts: Complete CRUD for conversations + messages
- useChatWebSocket.ts: WS hook with exponential backoff reconnect

## Build
- `npx tsc --noEmit` — 0 errors
- `npx vite build` — OK (2876 modules, 1.4MB bundle)
- Node: 24.16.0 | npm: 11.13.0
