# Working on Learn Language

Android-first **Expo + React Native + TypeScript** app, **local-first**: all data lives in one on-device
SQLite database, no server. Only what must go online does (e.g. an API the app needs).

| Name | Value |
| --- | --- |
| App name (on the phone) | `Learn Language` |
| Slug (Expo slug, npm name, APK file name) | `learn-language` |
| Deep-link scheme | `learnlanguage` (`learnlanguage://…`) |
| Android package | `com.nicfarandi.learnlanguage` — **never change after the first install** |
| Expo owner | filled in by `eas init` |

> **Status:** repo is empty. If the app isn't scaffolded yet, do **Setup** (bottom of this file) first.

---

## 1. Working rules

### The board: `TODO.md`
- New requests go on the board first, as cards under **To do**, before starting any of them.
- Move a card to **In progress** before starting it.
- When finished, tick it and move it to **Done** with a one-line summary of what shipped.
- A card waiting on me stays in **To do** with a note saying what it's waiting for.

### Pushing
When every card that can be built now is done, commit and push straight to `main` (no branch, no PR).
Cards waiting on me don't hold the push. Every push to `main` runs CI and publishes a new APK as a GitHub
Release — that's how builds reach the phone.

Before pushing:
1. Run `/code-review` on what's going out and fix what it finds (a finding that isn't a bug gets a code
   comment saying why). One round only.
2. Run what CI runs: `npm test`, `npm run lint`, `npm run typecheck`.
3. Add an entry at the top of `src/releases.ts` and bump the version in `app.json`, `package.json` and
   `package-lock.json` to match — **minor** for new features, **patch** for fixes only. A test fails if they
   disagree. Leave `app.config.js` alone (it stamps the build time).

Commit messages: a short summary line, then one bullet per area changed.

### Course content
- The plan lives in `planning/` (goal, course outline, sample unit). Content files go in `content/fr/`.
- **Always generate content with Haiku sub-agents:** the `content-writer` agent in `.claude/agents/`
  (Haiku model), one agent per unit, in course order, since each unit builds on the words of the earlier ones.
- Then check each unit: the content tests must pass, and review the French yourself (spelling, accents,
  gender, agreement, natural phrasing) and fix what's wrong before it ships.

### Checking changes
The web preview can't run the app (expo-sqlite on web needs cross-origin isolation). Verify with tests
(services get a real in-memory SQLite), typecheck, lint, and curl probes of any outside API. Checking on
the phone is mine.

---

## 2. Architecture

**Layering:** screens (`app/`) → hooks (`src/hooks/`) → services (`src/services/`, all SQL) → `src/db/`.
Pure logic goes in `src/utils/` and is tested directly, without a database.

```
app/                      Screens (expo-router). One folder per feature, _layout.tsx for its stack.
  _layout.tsx             Root: providers, initDb(), error boundary
  index.tsx               Home
  settings.tsx
  releases.tsx            Patch notes screen
  <feature>/index.tsx     Feature screens (+ _layout.tsx, detail screens)
src/
  db/client.ts            Opens the DB, runs every schema, adds new columns, runs migrations
  db/<feature>Schema.ts   CREATE TABLE IF NOT EXISTS … + exported table list (for backup)
  db/migrations.ts        One-off data moves/seeds, each guarded by a flag in `settings`
  services/               Data access + side effects (SQL lives here, never in screens)
  hooks/                  React hooks over services (useFocusQuery, useSettings, …)
  utils/                  Pure functions — easiest to test
  components/             Shared UI
  theme.ts                Palettes, spacing, radius, typography, sz(), useStyles
  types.ts                Shared row types
  releases.ts             Patch notes, newest first
modules/                  Local native Expo modules (Kotlin), only if needed
__tests__/                *.test.ts + helpers/ (sqliteDb.ts, jestSetup.ts)
assets/                   icon.png, android-icon-*.png, favicon.png
docs/                     Design notes, formats
.github/workflows/build-apk.yml
```

### Database rules
- Tables are only ever **added to**: `CREATE TABLE IF NOT EXISTS`, new columns via `ADDED_COLUMNS` in
  `client.ts`. **Never drop or rename** a shipped table/column — an update must never lose data.
- One-off data moves live in `migrations.ts`, each behind a `settings` flag so it runs once.
- Each schema file exports its table list (`export const NOTES_TABLES = ['notes']`) for backup/export.

### UI rules
- Colours, spacing and sizes only from `src/theme.ts`. Screens never hard-code colours.
- `light` and `dark` palettes share the same keys (`background, card, border, text, textMuted, primary,
  primaryMuted, danger, success, warning, …`), picked by `useColorScheme()` in `usePalette()`.
- `spacing`, `radius`, `typography` all go through `sz(n)` (scales by screen's shorter side ÷ 400, clamped
  0.85–1.25). Touch targets ≥ 48.
- `useStyles((palette) => StyleSheet.create({...}))`, memoised per palette.

### Patch notes
`src/releases.ts` lists every update, newest first; shown from the version label next to the app title
(`app/releases.tsx`). Installed version/build time: `Constants.expoConfig?.version` and
`Constants.expoConfig?.extra?.builtAt`.

### Never commit
`/android`, `/ios` (generated by the build), signing keys (`*.jks`, `*.keystore`), `.env*.local`.
Native code goes in `modules/` or a config plugin.

### Tests
- Jest runs real SQL against Node's built-in `node:sqlite` (Node ≥ 22.5) via `__tests__/helpers/sqliteDb.ts`.
- Swap the DB with `jest.mock('../src/db/client', () => ({ db: mockDb }))` — the variable must start with
  `mock` for Jest to allow it.
- Use `globalThis`, not Node's `global`.

---

## 3. CI: GitHub → APK

Every push to `main`: typecheck → lint → test → `expo-doctor` (advisory) → build the APK **on the GitHub
runner** with `eas build --local` (doesn't use free EAS build minutes) → publish as GitHub Release
`build-<n>`. The signing key is stored on EAS and downloaded by CI, so every APK installs over the last.

---

## 4. Setup (one-time)

1. Scaffold: `npx create-expo-app@latest learn-language --template blank-typescript` (or create files by hand).
2. Install: `npx expo install expo-router expo-sqlite expo-constants expo-linking expo-status-bar
   react-native-safe-area-context react-native-screens react-native-gesture-handler expo-build-properties`
   Dev deps: `jest-expo @types/jest eslint eslint-config-expo expo-doctor`.
3. Create the files below, plus `TODO.md`. Then `npm install`; `npm test && npm run lint && npm run typecheck`
   must pass.
4. **On my computer (once):** `npm i -g eas-cli`, `eas login`, `eas init` (writes `projectId` and `owner`
   into `app.json`), then `eas credentials -p android` → *Generate a new keystore*.
5. **GitHub:** add an Expo access token (expo.dev → Account settings → Access tokens) as repo secret
   `EXPO_TOKEN`. Settings → Actions → General → Workflow permissions: **Read and write**.
6. Push to `main`; download the APK from **Releases** on the phone.

### File templates

<details><summary><code>package.json</code> (scripts + jest)</summary>

```json
{
  "name": "learn-language",
  "version": "0.1.0",
  "main": "expo-router/entry",
  "private": true,
  "scripts": {
    "start": "expo start",
    "android": "expo start --android",
    "typecheck": "tsc --noEmit",
    "lint": "eslint .",
    "test": "jest --runInBand",
    "doctor": "expo-doctor"
  },
  "jest": {
    "preset": "jest-expo",
    "testMatch": ["**/__tests__/**/*.test.ts"],
    "setupFiles": ["<rootDir>/__tests__/helpers/jestSetup.ts"]
  }
}
```
</details>

<details><summary><code>app.json</code></summary>

```json
{
  "expo": {
    "name": "Learn Language",
    "slug": "learn-language",
    "scheme": "learnlanguage",
    "version": "0.1.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "userInterfaceStyle": "automatic",
    "android": {
      "package": "com.nicfarandi.learnlanguage",
      "allowBackup": false,
      "adaptiveIcon": {
        "backgroundColor": "#E6F0FE",
        "foregroundImage": "./assets/android-icon-foreground.png",
        "monochromeImage": "./assets/android-icon-monochrome.png"
      },
      "predictiveBackGestureEnabled": true,
      "softwareKeyboardLayoutMode": "resize"
    },
    "web": { "favicon": "./assets/favicon.png" },
    "plugins": [
      "expo-router",
      "expo-sqlite",
      ["expo-build-properties", {
        "android": {
          "minSdkVersion": 26,
          "enableMinifyInReleaseBuilds": true,
          "enableShrinkResourcesInReleaseBuilds": true,
          "buildArchs": ["arm64-v8a"]
        }
      }]
    ],
    "extra": { "router": {}, "eas": { "projectId": "<filled by eas init>" } },
    "owner": "<filled by eas init>"
  }
}
```
`buildArchs: ["arm64-v8a"]` keeps the APK small (every modern phone is arm64).
</details>

<details><summary><code>app.config.js</code> — stamps build time</summary>

```js
module.exports = ({ config }) => ({
  ...config,
  extra: { ...config.extra, builtAt: new Date().toISOString() },
});
```
</details>

<details><summary><code>eas.json</code></summary>

```json
{
  "cli": { "version": ">= 22.0.0", "appVersionSource": "remote" },
  "build": {
    "preview": {
      "distribution": "internal",
      "android": { "buildType": "apk" },
      "channel": "preview"
    },
    "production": {
      "autoIncrement": true,
      "android": { "buildType": "app-bundle" },
      "channel": "production"
    }
  }
}
```
</details>

<details><summary><code>.github/workflows/build-apk.yml</code></summary>

```yaml
name: Build Android APK

on:
  push:
    branches: [main]
  workflow_dispatch: {}

permissions:
  contents: write

jobs:
  build:
    runs-on: ubuntu-latest
    timeout-minutes: 90
    concurrency:
      group: android-apk-${{ github.ref }}
      cancel-in-progress: true
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22   # eas-cli 22 needs Node >= 22; node:sqlite needs >= 22.5
          cache: npm
      - run: npm ci
      - run: npm run typecheck
      - run: npm run lint
      - run: npm test

      # Advisory: expo-doctor checks against what the SDK expects today, so it can go red unprompted.
      - name: Check Expo project (advisory)
        run: npm run doctor
        continue-on-error: true

      - name: Free disk space
        run: |
          sudo rm -rf /usr/share/dotnet /opt/ghc /usr/local/.ghcup /usr/share/swift \
            /usr/local/share/boost /opt/hostedtoolcache/CodeQL || true
          df -h /

      - uses: actions/setup-java@v4
        with:
          distribution: temurin
          java-version: 17

      - uses: expo/expo-github-action@v8
        with:
          eas-version: 22.0.0
          token: ${{ secrets.EXPO_TOKEN }}

      # Built here, not on EAS servers (free EAS builds run out monthly). Same signing key every time.
      - name: Build APK on this runner
        env:
          GRADLE_OPTS: -Dorg.gradle.daemon=false
        run: |
          eas build --platform android --profile preview --local --non-interactive --output learn-language.apk
          test -s learn-language.apk

      # Convenience copy; may fail on artifact quota. The Release is the real output.
      - uses: actions/upload-artifact@v4
        continue-on-error: true
        with:
          name: learn-language-apk
          path: learn-language.apk
          retention-days: 14

      - name: Publish GitHub Release with APK
        uses: softprops/action-gh-release@v2
        with:
          tag_name: build-${{ github.run_number }}
          name: "Build #${{ github.run_number }} (${{ github.sha }})"
          files: learn-language.apk
```
</details>

<details><summary><code>tsconfig.json</code>, <code>eslint.config.js</code>, <code>metro.config.js</code>, <code>.gitignore</code></summary>

```json
{
  "extends": "expo/tsconfig.base",
  "compilerOptions": { "strict": true, "types": ["jest"] }
}
```

```js
// eslint.config.js
const { defineConfig, globalIgnores } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

module.exports = defineConfig([
  ...expoConfig,
  globalIgnores(['dist/**', '.expo/**', 'coverage/**', 'android/**', 'references/**']),
  { rules: { 'react-hooks/exhaustive-deps': 'error', 'no-duplicate-imports': 'error' } },
]);
```

```js
// metro.config.js — inline requires: launch only runs what the first screen needs
const { getDefaultConfig } = require('expo/metro-config');
const config = getDefaultConfig(__dirname);
const getTransformOptions = config.transformer.getTransformOptions;
config.transformer.getTransformOptions = async (...args) => {
  const options = await getTransformOptions(...args);
  return { ...options, transform: { ...options.transform, inlineRequires: true } };
};
module.exports = config;
```

```
# .gitignore — additions to Expo's default
/ios
/android
/references/
*.jks
*.keystore
.env*.local
```
</details>

<details><summary><code>src/db/client.ts</code> + example schema/service</summary>

```ts
// src/db/client.ts
import * as SQLite from 'expo-sqlite';
import { NOTES_SCHEMA } from './notesSchema';
import { runMigrations } from './migrations';

export const db = SQLite.openDatabaseSync('learn-language.db');

const CORE_SCHEMA = `
  CREATE TABLE IF NOT EXISTS settings (key TEXT PRIMARY KEY, value TEXT NOT NULL);
`;

/** Columns added after a table first shipped: [table, column, definition]. Added once if missing. */
const ADDED_COLUMNS: [string, string, string][] = [
  // ['notes', 'pinned', "INTEGER NOT NULL DEFAULT 0"],
];

let initPromise: Promise<void> | null = null;

export function initDb(): Promise<void> {
  initPromise ??= (async () => {
    await db.execAsync('PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON;');
    await db.execAsync(CORE_SCHEMA + NOTES_SCHEMA);
    for (const [table, column, definition] of ADDED_COLUMNS) {
      const cols = await db.getAllAsync<{ name: string }>(`PRAGMA table_info(${table})`);
      if (!cols.some((c) => c.name === column)) {
        await db.execAsync(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
      }
    }
    await runMigrations(db);
  })();
  return initPromise;
}
```

```ts
// src/db/notesSchema.ts
export const NOTES_SCHEMA = `
  CREATE TABLE IF NOT EXISTS notes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    text TEXT NOT NULL,
    created_at TEXT NOT NULL
  );
`;
export const NOTES_TABLES: readonly string[] = ['notes'];
```

```ts
// src/services/notes.ts
import { db } from '../db/client';

export type Note = { id: number; text: string; created_at: string };

export function listNotes(): Promise<Note[]> {
  return db.getAllAsync<Note>('SELECT * FROM notes ORDER BY id DESC');
}

export async function addNote(text: string): Promise<number> {
  const r = await db.runAsync(
    'INSERT INTO notes (text, created_at) VALUES (?, ?)', text.trim(), new Date().toISOString());
  return r.lastInsertRowId;
}
```
</details>

<details><summary><code>src/hooks/useFocusQuery.ts</code> — reload when a screen regains focus</summary>

```ts
import { useCallback, useRef, useState } from 'react';
import { useFocusEffect } from 'expo-router';

export function useFocusQuery<T>(load: () => Promise<T>, initial: T) {
  const [data, setData] = useState<T>(initial);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const latest = useRef(0);

  const reload = useCallback(async () => {
    const ticket = ++latest.current;
    setLoading(true);
    setError(null);
    try {
      const result = await load();
      if (ticket === latest.current) setData(result);
    } catch (reason) {
      if (ticket === latest.current) setError(reason instanceof Error ? reason.message : String(reason));
    } finally {
      if (ticket === latest.current) setLoading(false);
    }
  }, [load]);

  useFocusEffect(useCallback(() => { void reload(); }, [reload]));
  return { data, loading, error, reload };
}
```
</details>

<details><summary><code>app/_layout.tsx</code> (skeleton)</summary>

```tsx
import { useEffect, useState } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { ErrorBoundaryProps, Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { initDb } from '../src/db/client';

export function ErrorBoundary({ error, retry }: ErrorBoundaryProps) {
  return (
    <View style={{ flex: 1, justifyContent: 'center', padding: 24 }}>
      <Text>Something went wrong: {error.message}</Text>
      <Text onPress={retry}>Try again</Text>
    </View>
  );
}

export default function RootLayout() {
  const [ready, setReady] = useState(false);
  useEffect(() => { void initDb().then(() => setReady(true)); }, []);
  if (!ready) return <ActivityIndicator style={{ flex: 1 }} />;
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <Stack screenOptions={{ headerShown: false }} />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
```
</details>

<details><summary><code>src/releases.ts</code> + its test</summary>

```ts
// src/releases.ts
export type Release = { version: string; released: string; title: string; notes: string[] };

export const RELEASES: readonly Release[] = [
  {
    version: '0.1.0',
    released: '2026-11-27 12:00', // local time, "YYYY-MM-DD HH:mm"
    title: 'First build',
    notes: ['The app opens and keeps its data on the phone.'],
  },
];

export const CURRENT_RELEASE = RELEASES[0];
```

```ts
// __tests__/releases.test.ts
import appJson from '../app.json';
import packageJson from '../package.json';
import { CURRENT_RELEASE, RELEASES } from '../src/releases';

it('patch notes lead with the version the app is built as', () => {
  expect(CURRENT_RELEASE).toBe(RELEASES[0]);
  expect(appJson.expo.version).toBe(CURRENT_RELEASE.version);
  expect(packageJson.version).toBe(CURRENT_RELEASE.version);
});
```
</details>

<details><summary>Test helpers: <code>sqliteDb.ts</code>, <code>jestSetup.ts</code>, example service test</summary>

```ts
// __tests__/helpers/sqliteDb.ts — real SQL, no dependency (Node >= 22.5)
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { DatabaseSync } = require('node:sqlite');
type Param = string | number | null;
const flatten = (p: unknown[]) => (p.length === 1 && Array.isArray(p[0]) ? p[0] : p) as Param[];

export function createTestDb() {
  const mem = new DatabaseSync(':memory:');
  mem.exec('PRAGMA foreign_keys = ON');
  const plain = <T>(row: unknown): T => (row == null ? row : { ...(row as object) }) as T;
  return {
    raw: mem,
    async execAsync(sql: string) { mem.exec(sql); },
    async runAsync(sql: string, ...params: unknown[]) {
      const r = mem.prepare(sql).run(...flatten(params));
      return { lastInsertRowId: Number(r.lastInsertRowid), changes: Number(r.changes) };
    },
    async getAllAsync<T>(sql: string, ...params: unknown[]): Promise<T[]> {
      return mem.prepare(sql).all(...flatten(params)).map((r: unknown) => plain<T>(r));
    },
    async getFirstAsync<T>(sql: string, ...params: unknown[]): Promise<T | null> {
      return plain<T>(mem.prepare(sql).get(...flatten(params)) ?? null);
    },
    async withTransactionAsync(task: () => Promise<void>) {
      mem.exec('BEGIN');
      try { await task(); mem.exec('COMMIT'); } catch (e) { mem.exec('ROLLBACK'); throw e; }
    },
  };
}
```

```ts
// __tests__/helpers/jestSetup.ts
// If using expo-notifications (local only), silence its Expo Go push warning:
// jest.mock('expo-notifications/build/warnOfExpoGoPushUsage', () => ({ warnOfExpoGoPushUsage: () => {} }));
export {};
```

```ts
// __tests__/notes.test.ts
import { createTestDb } from './helpers/sqliteDb';
import { NOTES_SCHEMA } from '../src/db/notesSchema';

const mockDb = createTestDb();
jest.mock('../src/db/client', () => ({ db: mockDb }));
import { addNote, listNotes } from '../src/services/notes';

beforeAll(() => mockDb.execAsync(NOTES_SCHEMA));

it('adds and lists notes', async () => {
  await addNote('  hello ');
  expect((await listNotes())[0].text).toBe('hello');
});
```
</details>

<details><summary><code>TODO.md</code></summary>

```md
# Learn Language board

New ideas land in **To do**, move to **In progress** while built, and finish in **Done** with a one-line
summary. One line per card.

## To do

## In progress

## Done
```
</details>
