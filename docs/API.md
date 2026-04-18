# API Documentation

This document describes the API integration used in the Live Football Scores application.

## 🌐 API Provider

**TheSportsDB** - Free Sports Database API
- Website: https://www.thesportsdb.com/
- Documentation: https://www.thesportsdb.com/api.php
- Rate Limit: Free tier (no authentication required)

## 📡 Base URL

```
https://www.thesportsdb.com/api/v1/json/3
```

## 🔑 Endpoints

### 1. Get Next League Events

Retrieves upcoming matches for a specific league.

**Endpoint:** `GET /eventsnextleague.php`

**Parameters:**
- `id` (required): League ID

**Example Request:**
```bash
GET /eventsnextleague.php?id=4328
```

**Response:**
```json
{
  "events": [
    {
      "idEvent": "1234567",
      "strEvent": "Manchester United vs Liverpool",
      "strHomeTeam": "Manchester United",
      "strAwayTeam": "Liverpool",
      "intHomeScore": null,
      "intAwayScore": null,
      "dateEvent": "2026-04-20",
      "strTime": "15:00:00",
      "strStatus": "Not Started"
    }
  ]
}
```

### 2. Get Past League Events

Retrieves past/completed matches for a specific league.

**Endpoint:** `GET /eventspastleague.php`

**Parameters:**
- `id` (required): League ID

**Example Request:**
```bash
GET /eventspastleague.php?id=4328
```

**Response:**
```json
{
  "events": [
    {
      "idEvent": "1234567",
      "strEvent": "Arsenal vs Chelsea",
      "strHomeTeam": "Arsenal",
      "strAwayTeam": "Chelsea",
      "intHomeScore": "2",
      "intAwayScore": "1",
      "dateEvent": "2026-04-15",
      "strTime": "17:30:00",
      "strStatus": "Match Finished"
    }
  ]
}
```

### 3. Lookup Event Details

Retrieves detailed information about a specific match.

**Endpoint:** `GET /lookupevent.php`

**Parameters:**
- `id` (required): Event/Match ID

**Example Request:**
```bash
GET /lookupevent.php?id=1234567
```

**Response:**
```json
{
  "events": [
    {
      "idEvent": "1234567",
      "strEvent": "Manchester United vs Liverpool",
      "strHomeTeam": "Manchester United",
      "strAwayTeam": "Liverpool",
      "intHomeScore": "2",
      "intAwayScore": "2",
      "strHomeGoalDetails": "Player A 23'; Player B 67'",
      "strAwayGoalDetails": "Player C 45'; Player D 89'",
      "strHomeLineupGoalkeeper": "Goalkeeper Name",
      "strHomeLineupDefense": "Defender 1; Defender 2; Defender 3",
      "strHomeLineupMidfield": "Midfielder 1; Midfielder 2",
      "strHomeLineupForward": "Forward 1; Forward 2",
      "intHomeShots": "15",
      "intAwayShots": "12",
      "dateEvent": "2026-04-18",
      "strTime": "15:00:00",
      "strStatus": "Match Finished"
    }
  ]
}
```

## 🏆 League IDs

Common league IDs used in the application:

| League | ID |
|--------|-----|
| English Premier League | 4328 |
| Spanish La Liga | 4335 |
| German Bundesliga | 4331 |
| Italian Serie A | 4332 |
| French Ligue 1 | 4334 |
| UEFA Champions League | 4480 |

## 🔄 Polling Strategy

The application implements auto-polling for live updates:

- **Interval**: 20 seconds
- **Scope**: Dashboard matches only
- **Behavior**: Automatically stops when user navigates away

## ⚠️ Rate Limiting

- Free tier has no official rate limit
- Recommended: Implement caching to reduce API calls
- Be respectful of the free service

## 🛠️ Implementation

### API Client Setup

```typescript
// src/api/client.ts
import axios from 'axios';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 10000,
});

export default apiClient;
```

### Service Layer

```typescript
// src/services/api.ts
import apiClient from '../api/client';

export const fetchUpcomingMatches = async (leagueId: string) => {
  const response = await apiClient.get('/eventsnextleague.php', {
    params: { id: leagueId }
  });
  return response.data.events || [];
};
```

## 📊 Data Models

### Match Type

```typescript
interface Match {
  idEvent: string;
  strEvent: string;
  strHomeTeam: string;
  strAwayTeam: string;
  intHomeScore: string | null;
  intAwayScore: string | null;
  dateEvent: string;
  strTime: string;
  strStatus: string;
}
```

### Match Details Type

```typescript
interface MatchDetails extends Match {
  strHomeGoalDetails: string;
  strAwayGoalDetails: string;
  strHomeLineupGoalkeeper: string;
  strHomeLineupDefense: string;
  strHomeLineupMidfield: string;
  strHomeLineupForward: string;
  intHomeShots: string;
  intAwayShots: string;
  // ... additional fields
}
```

## 🔍 Error Handling

```typescript
try {
  const matches = await fetchUpcomingMatches(leagueId);
} catch (error) {
  if (axios.isAxiosError(error)) {
    if (error.response?.status === 404) {
      // Handle not found
    } else if (error.code === 'ECONNABORTED') {
      // Handle timeout
    }
  }
}
```

## 🚀 Future Enhancements

- [ ] Implement response caching
- [ ] Add request retry logic
- [ ] Support multiple leagues
- [ ] Add team and player endpoints
- [ ] Implement WebSocket for real-time updates

## 📞 Support

For API-related issues:
- Check TheSportsDB documentation
- Open an issue in this repository
- Contact TheSportsDB support

---

Last Updated: April 18, 2026
