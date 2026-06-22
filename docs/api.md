# LiftOff API Reference

The LiftOff API is split into two namespaces:

- **`/api/content/`** — public, no authentication required
- **`/api/admin/`** — protected, requires `Authorization: Bearer <ADMIN_PASSWORD>`

---

## Content API

### List learning paths

```
GET /api/content/learning-paths
```

Returns all public learning paths. Supports optional query parameters to filter results.

**Query parameters**

| Parameter | Type | Description |
|-----------|------|-------------|
| `q` | string | Case-insensitive text search across title and description |
| `moduleId` | string | Return only paths that contain the given module ID |

**Example requests**

```
GET /api/content/learning-paths
GET /api/content/learning-paths?q=postman
GET /api/content/learning-paths?moduleId=api-basics
```

**Response**

```json
{
  "learningPaths": [
    {
      "id": "intro-to-postman",
      "title": "Introduction to Postman",
      "description": "...",
      "icon": "🚀",
      "badgeUrl": "https://your-app.vercel.app/api/learning-paths/intro-to-postman/badge",
      "color": "#FF6C37",
      "moduleCount": 2,
      "stepCount": 24,
      "totalPoints": 240
    }
  ],
  "total": 1
}
```

---

### Get a learning path

```
GET /api/content/learning-paths/:id
```

Returns a single learning path with a summary of each module it contains.

**Path parameters**

| Parameter | Description |
|-----------|-------------|
| `id` | Learning path ID (e.g. `intro-to-postman`) |

**Response**

```json
{
  "id": "intro-to-postman",
  "title": "Introduction to Postman",
  "description": "...",
  "icon": "🚀",
  "color": "#FF6C37",
  "modules": [
    {
      "id": "api-basics",
      "title": "API Basics",
      "description": "...",
      "icon": "📡",
      "badgeUrl": "https://your-app.vercel.app/api/modules/api-basics/badge",
      "color": "#06B6D4",
      "lessonCount": 3,
      "stepCount": 12,
      "totalPoints": 120
    }
  ]
}
```

**Error**

```json
{ "error": "Learning path not found" }   // 404
```

---

### List modules

```
GET /api/content/modules
```

Returns all public modules. Supports optional query parameters to filter results.

**Query parameters**

| Parameter | Type | Description |
|-----------|------|-------------|
| `q` | string | Case-insensitive text search across title and description |
| `pathId` | string | Return only modules that belong to the given learning path ID |

**Example requests**

```
GET /api/content/modules
GET /api/content/modules?q=banking
GET /api/content/modules?pathId=intro-to-postman
```

**Response**

```json
{
  "modules": [
    {
      "id": "api-basics",
      "title": "API Basics",
      "description": "...",
      "icon": "📡",
      "badgeUrl": "https://your-app.vercel.app/api/modules/api-basics/badge",
      "color": "#06B6D4",
      "lessonCount": 3,
      "stepCount": 12,
      "totalPoints": 120
    }
  ],
  "total": 1
}
```

---

### Get a module

```
GET /api/content/modules/:id
```

Returns a single module with its full lesson and step structure.

**Path parameters**

| Parameter | Description |
|-----------|-------------|
| `id` | Module ID (e.g. `api-basics`) |

**Response**

```json
{
  "id": "api-basics",
  "title": "API Basics",
  "description": "...",
  "icon": "📡",
  "badgeUrl": "https://your-app.vercel.app/api/modules/api-basics/badge",
  "color": "#06B6D4",
  "lessons": [
    {
      "id": "lesson-1",
      "slug": "getting-started",
      "title": "Getting Started",
      "partNumber": 1,
      "stepCount": 4,
      "totalPoints": 40,
      "steps": [
        {
          "id": "step-1",
          "stepNumber": 1,
          "title": "Create a collection",
          "points": 10,
          "manual": false
        }
      ]
    }
  ]
}
```

**Error**

```json
{ "error": "Module not found" }   // 404
```

---

## Admin API

All admin endpoints require an `Authorization` header with a Bearer token matching the `ADMIN_PASSWORD` environment variable.

```
Authorization: Bearer <ADMIN_PASSWORD>
```

Requests with a missing or incorrect token receive a `401 Unauthorized` response.

---

### Dashboard

```
GET /api/admin/dashboard
```

Returns platform-wide statistics, activity, module completion rates, rank distribution, and the full leaderboard.

**Query parameters**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `days` | number or `"all"` | `30` | Lookback window for the activity timeline. Pass `all` for the full history. Maximum `365`. |

**Example requests**

```
GET /api/admin/dashboard
GET /api/admin/dashboard?days=7
GET /api/admin/dashboard?days=all
```

**Response**

```json
{
  "stats": {
    "totalUsers": 142,
    "totalStepsCompleted": 3891,
    "totalPointsEarned": 38910,
    "totalModulesCompleted": 67
  },
  "activity": [
    { "date": "2026-06-01", "completions": 12 }
  ],
  "moduleStats": [
    {
      "moduleId": "api-basics",
      "title": "API Basics",
      "color": "#06B6D4",
      "icon": "📡",
      "totalSteps": 12,
      "usersStarted": 98,
      "usersCompleted": 45,
      "avgCompletion": 72
    }
  ],
  "rankDistribution": [
    { "rank": "Space Cadet", "count": 60, "color": "#64748B", "badge": "🚀" }
  ],
  "leaderboard": [
    {
      "userId": "abc123",
      "displayName": "Jane",
      "discordUsername": "jane#0001",
      "avatarUrl": "https://...",
      "totalPoints": 980,
      "totalSteps": 98,
      "rank": "Galaxy Brain",
      "rankBadge": "🧠",
      "joinedAt": "2026-01-15T10:00:00Z"
    }
  ]
}
```

---

### Get user

```
GET /api/admin/users/:id
```

Returns a user's profile, point total, rank, per-module progress, and recent activity.

**Path parameters**

| Parameter | Description |
|-----------|-------------|
| `id` | Supabase user UUID |

**Response**

```json
{
  "profile": {
    "id": "abc123",
    "displayName": "Jane",
    "discordUsername": "jane#0001",
    "avatarUrl": "https://...",
    "joinedAt": "2026-01-15T10:00:00Z"
  },
  "stats": {
    "totalPoints": 980,
    "totalSteps": 98,
    "rank": "Galaxy Brain",
    "rankBadge": "🧠",
    "rankBadgeImg": "/ranks/galaxy-brain.png"
  },
  "modules": [
    {
      "moduleId": "api-basics",
      "title": "API Basics",
      "color": "#06B6D4",
      "icon": "📡",
      "totalSteps": 12,
      "completedSteps": 10,
      "steps": [
        {
          "stepId": "step-1",
          "title": "Create a collection",
          "lessonTitle": "Getting Started",
          "points": 10,
          "completed": true,
          "completedAt": "2026-02-01T14:22:00Z"
        }
      ]
    }
  ],
  "recentActivity": [
    {
      "stepId": "step-1",
      "stepTitle": "Create a collection",
      "moduleName": "API Basics",
      "completedAt": "2026-02-01T14:22:00Z",
      "points": 10
    }
  ]
}
```

**Error**

```json
{ "error": "User not found" }   // 404
```
