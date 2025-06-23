# Disaster Response Coordination Platform

## Assignment Overview

**Duration:** 1 day (8-10 hours)

**Objective:**
Build a backend-heavy MERN stack app for a disaster response platform that aggregates real-time data to aid disaster management. The platform uses Google Gemini API for location extraction and image verification, mapping services for geocoding, Supabase for geospatial queries and caching, and real-time social media monitoring. The frontend is a minimal React interface to test backend functionality. AI tools like Cursor or Windsurf are used to accelerate backend logic.

---

## Features

### Disaster Data Management
- Robust CRUD for disaster records (title, location name, description, tags like “flood,” “earthquake”)
- Ownership and audit trail tracking

### Location Extraction and Geocoding
- Use Google Gemini API to extract location names from disaster descriptions or user inputs
- Convert location names to lat/lng coordinates using Google Maps, Mapbox, or OpenStreetMap

### Real-Time Social Media Monitoring
- Fetch and process social media reports using a mock Twitter API, Twitter API, or Bluesky
- Identify needs, offers, or alerts; update in real-time

### Geospatial Resource Mapping
- Use Supabase geospatial queries to locate affected areas, shelters, and resources based on lat/lng coordinates
- Support queries for nearby resources

### Official Updates Aggregation
- Use Browse Page to fetch updates from government or relief websites (e.g., FEMA, Red Cross)

### Image Verification
- Use Google Gemini API to analyze user-uploaded disaster images for authenticity

### Backend Optimization
- Supabase for data storage and caching API responses (using a dedicated table)
- Geospatial indexes in Supabase for fast location-based queries
- Structured logging (e.g., “Report processed: Flood Alert”)
- Rate limiting and error handling for external APIs

---

## Backend (Node.js, Express.js)

### REST APIs
- **Disasters:**
  - `POST /disasters` — Create disaster
  - `GET /disasters?tag=flood` — List disasters (filter by tag)
  - `PUT /disasters/:id` — Update disaster
  - `DELETE /disasters/:id` — Delete disaster
- **Social Media:**
  - `GET /disasters/:id/social-media` — Get social media reports (mock or real)
- **Resources:**
  - `GET /disasters/:id/resources?lat=...&lon=...` — Geospatial resource lookup
- **Updates:**
  - `GET /disasters/:id/official-updates` — Fetch official updates
- **Verification:**
  - `POST /disasters/:id/verify-image` — Image verification
- **Geocoding:**
  - `POST /geocode` — Extract location with Gemini, convert to lat/lng with mapping service

### Real-Time Updates via WebSockets (Socket.IO)
- Emit `disaster_updated` on create/update/delete
- Emit `social_media_updated` on new social media results
- Broadcast `resources_updated` on new geospatial data

### Authentication
- Mock authentication with hard-coded users (e.g., netrunnerX, reliefAdmin) and roles (admin, contributor)

### Supabase Caching
- Cache table (`key`, `value` [JSONB], `expires_at`) to store social media, mapping service, Browse Page, and Gemini API responses (TTL: 1 hour)
- Cache logic checks `expires_at` before fetching from external APIs

### Geospatial Queries
- Use Supabase/PostgreSQL (e.g., `ST_DWithin` to find resources within 10km)

### Logging
- Log actions in a structured format (e.g., “Resource mapped: Shelter at Manhattan, NYC”)

---

## Database (Supabase)

### Tables
- **disasters:** (id, title, location_name [TEXT], location [GEOGRAPHY], description, tags [TEXT[]], owner_id, created_at, audit_trail [JSONB])
- **reports:** (id, disaster_id, user_id, content, image_url, verification_status, created_at)
- **resources:** (id, disaster_id, name, location_name [TEXT], location [GEOGRAPHY], type, created_at)
- **cache:** (key, value [JSONB], expires_at)

### Indexes
- Geospatial indexes on location columns (e.g., `CREATE INDEX disasters_location_idx ON disasters USING GIST (location)`)
- Indexes on tags (GIN index) and owner_id for efficient filtering
- Audit trails stored as JSONB (e.g., `{ action: "update", user_id: "netrunnerX", timestamp: "2025-06-17T17:16:00Z" }`)

### Example Supabase Query
```js
supabase.from('disasters').select('*')
```

---

## External Service Integrations

### Google Gemini API
- **Location Extraction:** Extract location names from descriptions (key from https://aistudio.google.com/app/apikey)
- **Image Verification:** Verify image authenticity (key from https://aistudio.google.com/app/apikey)
- **Cache responses in Supabase cache table**

### Mapping Service (choose one)
- **Google Maps:** Geocoding API (key from https://console.cloud.google.com)
- **Mapbox:** Geocoding API (key from https://www.mapbox.com)
- **OpenStreetMap:** Nominatim for geocoding (https://nominatim.org)

### Social Media
- **Mock Twitter API or Alternative:**
  - If Twitter API access is unavailable, use mock endpoint (`GET /mock-social-media`)
  - If accessible, use Twitter API (free tier) for real-time posts
  - Alternatively, use Bluesky API (https://docs.bsky.app)

### Browse Page
- Fetch official updates from government/relief websites (e.g., FEMA, Red Cross) using a web scraping library (e.g., Cheerio in Node.js)
- Cache responses in Supabase cache table (TTL: 1 hour)

---

## Frontend (React)

- Minimal, beautiful, and responsive React interface
- Form to create/update disasters (title, location name or description, description, tags)
- Form to submit reports (content, image URL)
- Display for disasters, social media reports, resources, and verification statuses
- Real-time updates for social media and resource data via WebSockets
- Fully tests all backend APIs

---

## User Flow

1. **Create Disaster:**
   - Fill out the disaster form (title, location, description, tags)
   - Submit to create a new disaster record
2. **View Disasters:**
   - See a list of all disasters
   - Click a disaster to view details, reports, social media, and resources
3. **Submit Report:**
   - Fill out the report form (content, image URL)
   - Submit to add a report to the selected disaster
4. **View Social Media & Resources:**
   - See real-time social media posts and nearby resources for the selected disaster
5. **Image Verification:**
   - Submit an image URL for verification using Gemini API

---

## API Documentation

### Disasters
- `POST /disasters` — Create disaster
- `GET /disasters?tag=flood` — List disasters (filter by tag)
- `PUT /disasters/:id` — Update disaster
- `DELETE /disasters/:id` — Delete disaster

### Social Media
- `GET /disasters/:id/social-media` — Get social media reports (mock or real)

### Resources
- `GET /disasters/:id/resources?lat=...&lon=...` — Geospatial resource lookup

### Official Updates
- `GET /disasters/:id/official-updates` — Fetch official updates

### Image Verification
- `POST /disasters/:id/verify-image` — Image verification

### Geocoding
- `POST /geocode` — Extract location with Gemini, convert to lat/lng with mapping service

---

## Sample Data

- **Disaster:**
  ```json
  { "title": "NYC Flood", "location_name": "Manhattan, NYC", "description": "Heavy flooding in Manhattan", "tags": ["flood", "urgent"], "owner_id": "netrunnerX" }
  ```
- **Report:**
  ```json
  { "disaster_id": "123", "user_id": "citizen1", "content": "Need food in Lower East Side", "image_url": "http://example.com/flood.jpg", "verification_status": "pending" }
  ```
- **Resource:**
  ```json
  { "disaster_id": "123", "name": "Red Cross Shelter", "location_name": "Lower East Side, NYC", "type": "shelter" }
  ```

---

## Notes
- Use mock data for testing
- Handle API rate limits with Supabase caching and fallback mock responses
- Supabase setup: Create a free project at https://supabase.com, use JavaScript SDK
- Note shortcuts or assumptions in submission (e.g., “Used mock Twitter API due to access limits”)
- Use Cursor/Windsurf aggressively; mention their impact in the submission note

---

## Submission Instructions
- Push code to a GitHub repo (public or shared)
- Deploy frontend (Vercel) and backend (Render); provide live URL
- Submit a zip file with code and a note on how you used Cursor/Windsurf
- Email with repo link, live URL, and zip file by the deadline

---

## Evaluation
- **Functionality (50%)**: APIs, external integrations, WebSockets, and geospatial queries work
- **Backend Complexity (30%)**: Effective use of Supabase caching, geospatial indexes, rate limiting, and error handling
- **External Integrations (15%)**: Creative handling of Gemini location extraction, mapping service geocoding, mock Twitter API or alternatives, and Browse Page
- **Vibe Coding (5%)**: Cursor/Windsurf usage is effective, noted in submission

---

## Vibe Coding
- Used Cursor’s Composer and Windsurf’s Cascade for API routes, Supabase queries, and caching logic
- Example: “Cursor generated WebSocket logic”
