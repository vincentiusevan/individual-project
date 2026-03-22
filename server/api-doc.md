# ML Strategy Lab — API Documentation

Base URL: `http://localhost:3000/api`

---

## Authentication

### Register

- **POST** `/api/register`
- **Description:** Register a new user account
- **Request Body:**
  ```json
  {
    "username": "dudut",
    "email": "dudut@mail.com",
    "password": "dudut123"
  }
  ```
- **Response (201):**
  ```json
  {
    "id": 1,
    "username": "dudut",
    "email": "dudut@mail.com"
  }
  ```
- **Errors:**
  - `400` — Validation error (empty fields, invalid email, password < 6 chars, email already exists)

---

### Login

- **POST** `/api/login`
- **Description:** Login with email and password
- **Request Body:**
  ```json
  {
    "email": "dudut@mail.com",
    "password": "dudut123"
  }
  ```
- **Response (200):**
  ```json
  {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR...",
    "username": "dudut",
    "email": "dudut@mail.com",
    "role": "user"
  }
  ```
- **Errors:**
  - `400` — Email and password are required
  - `401` — Invalid email or password

---

### Google Login

- **POST** `/api/google-login`
- **Description:** Login or register via Google OAuth
- **Request Body:**
  ```json
  {
    "googleToken": "google_id_token_from_frontend"
  }
  ```
- **Response (200/201):**
  ```json
  {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR...",
    "username": "Google User",
    "email": "user@gmail.com",
    "role": "user"
  }
  ```
- **Errors:**
  - `400` — Google token is required
  - `500` — Invalid google token

---

### Get Profile

- **GET** `/api/user/profile`
- **Description:** Get current logged-in user profile
- **Headers:** `Authorization: Bearer <access_token>`
- **Response (200):**
  ```json
  {
    "id": 1,
    "username": "dudut",
    "email": "dudut@mail.com",
    "role": "user",
    "googleId": null,
    "avatarUrl": null,
    "createdAt": "2026-03-22T10:00:00.000Z",
    "updatedAt": "2026-03-22T10:00:00.000Z"
  }
  ```
- **Errors:**
  - `401` — Invalid token

---

## Heroes

### Get All Heroes

- **GET** `/api/heroes`
- **Description:** Get all heroes with optional filter and search
- **Query Params (optional):**
  - `role` — Filter by role (e.g., `Marksman`, `Fighter`, `Tank`, `Mage`, `Assassin`, `Support`)
  - `lane` — Filter by lane (e.g., `Gold Lane`, `EXP Lane`, `Mid Lane`, `Roam`, `Jungle`)
  - `search` — Search by hero name (case-insensitive)
- **Example:** `GET /api/heroes?role=Marksman&search=miya`
- **Response (200):**
  ```json
  [
    {
      "id": 1,
      "heroId": 1,
      "name": "Miya",
      "role": "Marksman",
      "specialty": "Finisher/Damage",
      "imageUrl": "https://akmweb.youngjoygame.com/...",
      "lane": "Gold Lane",
      "durability": 10,
      "offense": 70,
      "controlEffect": 40,
      "difficulty": 10,
      "createdAt": "2026-03-22T10:00:00.000Z",
      "updatedAt": "2026-03-22T10:00:00.000Z"
    }
  ]
  ```

---

### Get Hero by ID

- **GET** `/api/heroes/:id`
- **Description:** Get hero detail by database ID
- **Response (200):** Single hero object (same structure as above)
- **Errors:**
  - `404` — Hero not found

---

### Create Hero (Admin)

- **POST** `/api/heroes`
- **Description:** Create a new hero manually
- **Headers:** `Authorization: Bearer <admin_token>`
- **Request Body:**
  ```json
  {
    "heroId": 999,
    "name": "New Hero",
    "role": "Fighter",
    "specialty": "Damage",
    "imageUrl": "https://example.com/hero.png",
    "lane": "EXP Lane",
    "durability": 5,
    "offense": 8,
    "controlEffect": 3,
    "difficulty": 4
  }
  ```
- **Response (201):** Created hero object
- **Errors:**
  - `400` — Validation error
  - `401` — Invalid token
  - `403` — Admin access required

---

### Update Hero (Admin)

- **PUT** `/api/heroes/:id`
- **Description:** Update hero data
- **Headers:** `Authorization: Bearer <admin_token>`
- **Request Body:** Any hero fields to update
- **Response (200):** Updated hero object
- **Errors:**
  - `401` — Invalid token
  - `403` — Admin access required
  - `404` — Hero not found

---

### Delete Hero (Admin)

- **DELETE** `/api/heroes/:id`
- **Description:** Delete a hero
- **Headers:** `Authorization: Bearer <admin_token>`
- **Response (200):**
  ```json
  {
    "message": "Hero Miya has been deleted"
  }
  ```
- **Errors:**
  - `401` — Invalid token
  - `403` — Admin access required
  - `404` — Hero not found

---

### Sync Heroes from MLBB Stats API (Admin)

- **POST** `/api/heroes/sync`
- **Description:** Fetch all heroes from MLBB Stats API and sync to local database. Creates new heroes or updates existing ones.
- **Headers:** `Authorization: Bearer <admin_token>`
- **Response (200):**
  ```json
  {
    "message": "Sync complete. 132 heroes synced, 0 failed.",
    "total": 132
  }
  ```
- **Errors:**
  - `400` — No heroes found from MLBB Stats API
  - `401` — Invalid token
  - `403` — Admin access required

---

### Get Hero Counters

- **GET** `/api/heroes/:id/counters`
- **Description:** Get counter, weak-against, and assist data for a hero from MLBB Stats API. Related hero names are resolved from local database.
- **Response (200):**
  ```json
  {
    "hero": {
      "id": 1,
      "heroId": 1,
      "name": "Miya",
      "role": "Marksman"
    },
    "strong": [
      { "heroId": 3, "name": "Saber", "role": "Assassin", "imageUrl": "..." },
      { "heroId": 15, "name": "Eudora", "role": "Mage", "imageUrl": "..." }
    ],
    "weak": [{ "heroId": 52, "name": "Pharsa", "role": "Mage", "imageUrl": "..." }],
    "assist": [{ "heroId": 6, "name": "Tigreal", "role": "Tank", "imageUrl": "..." }]
  }
  ```
- **Errors:**
  - `404` — Hero not found / Counter data not found

---

## Items

### Get All Items

- **GET** `/api/items`
- **Description:** Get all items with optional filter and search
- **Query Params (optional):**
  - `type` — Filter by type (`attack`, `magic`, `defense`, `movement`)
  - `search` — Search by item name (case-insensitive)
- **Example:** `GET /api/items?type=attack&search=blade`
- **Response (200):**
  ```json
  [
    {
      "id": 1,
      "name": "Blade of Despair",
      "type": "attack",
      "price": 3010,
      "imageUrl": null,
      "description": "Highest Physical Attack",
      "passive": "Despair: Dealing damage to non-Minion enemies below 50% HP grants 25% extra Physical Attack for 2s",
      "stats": { "physicalAttack": 160 },
      "createdAt": "2026-03-22T10:00:00.000Z",
      "updatedAt": "2026-03-22T10:00:00.000Z"
    }
  ]
  ```

---

### Get Item by ID

- **GET** `/api/items/:id`
- **Description:** Get item detail by ID
- **Response (200):** Single item object
- **Errors:**
  - `404` — Item not found

---

### Create Item (Admin)

- **POST** `/api/items`
- **Description:** Create a new item
- **Headers:** `Authorization: Bearer <admin_token>`
- **Request Body:**
  ```json
  {
    "name": "New Item",
    "type": "attack",
    "price": 2000,
    "description": "A new item",
    "passive": "Some passive effect",
    "stats": { "physicalAttack": 80 }
  }
  ```
- **Response (201):** Created item object
- **Errors:**
  - `400` — Validation error (name and type required)
  - `401` — Invalid token
  - `403` — Admin access required

---

### Update Item (Admin)

- **PUT** `/api/items/:id`
- **Description:** Update item data
- **Headers:** `Authorization: Bearer <admin_token>`
- **Request Body:** Any item fields to update
- **Response (200):** Updated item object
- **Errors:**
  - `401` — Invalid token
  - `403` — Admin access required
  - `404` — Item not found

---

### Delete Item (Admin)

- **DELETE** `/api/items/:id`
- **Description:** Delete an item
- **Headers:** `Authorization: Bearer <admin_token>`
- **Response (200):**
  ```json
  {
    "message": "Item Blade of Despair has been deleted"
  }
  ```
- **Errors:**
  - `401` — Invalid token
  - `403` — Admin access required
  - `404` — Item not found

---

## AI Strategy (Google Gemini)

### Get Counter Strategy Recommendation

- **POST** `/api/ai/counter-strategy`
- **Description:** Send enemy team composition and get AI-powered counter strategy recommendation including hero picks, item builds, and game strategy.
- **Headers:** `Authorization: Bearer <access_token>`
- **Request Body:**
  ```json
  {
    "enemyHeroIds": [1, 6, 47, 52, 72]
  }
  ```
  > Note: `enemyHeroIds` uses database `id` (not MLBB `heroId`). Max 5 heroes.
- **Response (200):**
  ```json
  {
    "enemyComposition": [
      {
        "id": 1,
        "heroId": 1,
        "name": "Miya",
        "role": "Marksman",
        "imageUrl": "https://..."
      }
    ],
    "recommendation": "**Counter Hero Picks:**\n1. Esmeralda (Tank/Mage) - She thrives against physical damage...\n\n**Item Build Recommendations:**\n...\n\n**Strategy & Game Plan:**\n..."
  }
  ```
- **Errors:**
  - `400` — enemyHeroIds is required / must be non-empty array / max 5 heroes
  - `401` — Invalid token
  - `404` — No heroes found with the given IDs

---

## Saved Strategies

### Get All Strategies

- **GET** `/api/strategies`
- **Description:** Get all saved strategies (public feed) with user info and votes
- **Response (200):**
  ```json
  [
    {
      "id": 1,
      "userId": 1,
      "title": "Counter Ling Team Comp",
      "enemyComp": [1, 6, 47, 52, 72],
      "recommendation": "AI generated strategy text...",
      "itemBuild": null,
      "likes": 5,
      "createdAt": "2026-03-22T10:00:00.000Z",
      "updatedAt": "2026-03-22T10:00:00.000Z",
      "User": {
        "id": 1,
        "username": "dudut",
        "avatarUrl": null
      },
      "Votes": []
    }
  ]
  ```

---

### Save Strategy

- **POST** `/api/strategies`
- **Description:** Save an AI recommendation as a strategy
- **Headers:** `Authorization: Bearer <access_token>`
- **Request Body:**
  ```json
  {
    "title": "Counter Ling Team Comp",
    "enemyComp": [1, 6, 47, 52, 72],
    "recommendation": "AI generated strategy text...",
    "itemBuild": { "hero": "Esmeralda", "items": [1, 2, 3] }
  }
  ```
- **Response (201):** Created strategy object
- **Errors:**
  - `400` — Validation error (title, enemyComp, recommendation required)
  - `401` — Invalid token

---

### Update Strategy

- **PUT** `/api/strategies/:id`
- **Description:** Update strategy title (own strategy only)
- **Headers:** `Authorization: Bearer <access_token>`
- **Request Body:**
  ```json
  {
    "title": "Updated Strategy Title"
  }
  ```
- **Response (200):** Updated strategy object
- **Errors:**
  - `401` — Invalid token
  - `403` — You can only edit your own strategy
  - `404` — Strategy not found

---

### Delete Strategy

- **DELETE** `/api/strategies/:id`
- **Description:** Delete a saved strategy (own strategy only)
- **Headers:** `Authorization: Bearer <access_token>`
- **Response (200):**
  ```json
  {
    "message": "Strategy deleted successfully"
  }
  ```
- **Errors:**
  - `401` — Invalid token
  - `403` — You can only delete your own strategy
  - `404` — Strategy not found

---

## Votes

### Vote on Strategy

- **POST** `/api/strategies/:id/vote`
- **Description:** Upvote or downvote a strategy. If already voted, can change vote direction.
- **Headers:** `Authorization: Bearer <access_token>`
- **Request Body:**
  ```json
  {
    "type": "up"
  }
  ```
  > `type` must be `"up"` or `"down"`
- **Response (200):**
  ```json
  {
    "message": "Vote recorded",
    "likes": 1
  }
  ```
- **Errors:**
  - `400` — Vote type must be "up" or "down" / Already voted same way
  - `401` — Invalid token
  - `404` — Strategy not found

---

### Remove Vote

- **DELETE** `/api/strategies/:id/vote`
- **Description:** Remove your vote from a strategy
- **Headers:** `Authorization: Bearer <access_token>`
- **Response (200):**
  ```json
  {
    "message": "Vote removed",
    "likes": 0
  }
  ```
- **Errors:**
  - `401` — Invalid token
  - `404` — Vote not found

---

## Error Response Format

All errors follow this format:

```json
{
  "message": "Error description"
}
```

For validation errors, `message` can be an array:

```json
{
  "message": ["Email is required", "Password is required"]
}
```

## Common Status Codes

| Code | Description                          |
| ---- | ------------------------------------ |
| 200  | Success                              |
| 201  | Created                              |
| 400  | Bad Request / Validation Error       |
| 401  | Unauthorized (invalid/missing token) |
| 403  | Forbidden (insufficient role)        |
| 404  | Not Found                            |
| 500  | Internal Server Error                |

---

## Third Party APIs

| API                                                     | Usage                                       |
| ------------------------------------------------------- | ------------------------------------------- |
| **Google Gemini AI** (`gemini-2.5-flash`)               | AI-powered counter strategy recommendations |
| **MLBB Stats API** (`https://mlbb-stats.rone.dev/api/`) | Hero data, stats, counter relationships     |

---

## Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js v5
- **ORM:** Sequelize v6
- **Database:** PostgreSQL
- **Auth:** JWT + Google OAuth (google-auth-library)
- **AI:** Google Generative AI (@google/generative-ai)
- **Testing:** Jest + Supertest (97% coverage)
