# AI Context & Coding Guidelines - FitnessAtHome Project

## 1. Project Overview
- **Name:** FitnessAtHome
- **Tech Stack:** React Native (Expo), TypeScript, Expo Router (File-based routing).
- **State Management:** Zustand (located in `store/useAppStore.ts`).
- **Backend/Services:** Firebase (`lib/firebase.ts`), Local Storage.
- **Styling:** React Native StyleSheets with a custom theme system (`constants/theme.ts`).
- **Data:** Static JSON data for foods (`data/vietnamese_foods.json`) and workout plans (`data/workout_plan.ts`).

## 2. Project Structure
- `app/`: Contains all screens and routing logic (Expo Router).
  - `(tabs)/`: Main navigation tabs (Home, Diet, Explore, Profile).
- `components/`: Reusable UI components.
- `store/`: Global state management using Zustand.
- `constants/`: Theme colors and global styles.
- `hooks/`: Custom React hooks (Theme, Color scheme).
- `services/` & `notifications/`: Logic for logging and push notifications.

## 3. Coding Standards & Preferences
- **Language:** Always use TypeScript with strict type checking.
- **Components:** Functional components only. Use `const ComponentName: React.FC = () => ...`.
- **Styling:** - Use `Theme` from `constants/theme.ts` for colors and spacing to ensure consistency.
  - Prefer using `ThemedText` and `ThemedView` from `components/` for automatic dark/light mode support.
- **State:** - Use `useAppStore` for global app state (user progress, weight, calories).
  - Use local `useState` for UI-only state (modals, loading states).
- **Icons:** Use `@expo/vector-icons` (Ionicons, MaterialIcons).

## 4. Specific Logic Rules
- **Calorie Tracking:** Logic for calculating remaining calories should refer to `vietnamese_foods.json`.
- **Notifications:** When adding features related to reminders, use `notifications/notificationService.ts`.
- **Navigation:** Use `router` from `expo-router` for navigation, not `react-navigation`.

## 5. Instructions for AI Agent
- **Before coding:** Always check `app/_layout.tsx` for global providers.
- **File Access:** Only modify files related to the specific task. Do not scan `node_modules` or `assets`.
- **Response Format:** If a change requires multiple files, list the plan first.
- **Error Handling:** Always wrap Firebase and Storage calls in try/catch blocks using `LogService.ts`.