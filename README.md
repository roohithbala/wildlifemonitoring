# Wildlife Monitoring and Detection System 🦅

A full-stack wildlife monitoring system with AI-powered image classification, real-time monitoring, and analytics. Built with React (Vite) frontend, Express.js backend, MongoDB storage, and TensorFlow.js models for inference.

Highlights:
- Real-time monitoring via Socket.IO
- Image upload + AI analysis endpoint
- Browser-optimized TensorFlow.js model included
- Docker Compose for easy deployment

---

## Table of Contents
- Quick Start (Docker)
- Local Development
- Environment Variables
- API Reference (health, auth, detections, analytics)
- Real-time (Socket.IO)
- ML Model (TensorFlow.js)
- Database initialization & seeding
- Project Layout
- Troubleshooting
- Contributing & License

---

## Quick Start (Docker, recommended)

Prerequisites:
- Docker & Docker Compose

From the repository root:

1. Build and start everything:
```bash
docker-compose up -d --build
```

2. Services (default ports):
- Frontend (Nginx): http://localhost:3000
- Backend API: http://localhost:5000/api
- MongoDB: mongodb://localhost:27017 (container exposes 27017)

3. View logs:
```bash
docker-compose logs -f
```

4. Stop services:
```bash
docker-compose down
```

Notes:
- The backend container exposes the API at /api (see server routes).
- docker-compose mounts a volume for MongoDB and for backend/uploads (uploaded files persist on host).

---

## Local Development

Backend
1. Install dependencies
```bash
cd backend
npm install
```

2. Recommended start (ensures model load + DB connection):
```bash
# Use startup script which connects to MongoDB and loads the model before starting server
node startup.js
```
Alternatively if you prefer direct start:
```bash
node server.js
```

Frontend
1. Install dependencies
```bash
cd frontend
npm install
```

2. Start dev server (Vite)
```bash
npm run dev
# open http://localhost:5173 (Vite default) — app may be served at this dev port
```

Notes:
- In Docker the frontend is built and served by Nginx on port 3000. For local dev Vite commonly runs on 5173.

---

## Environment Variables

Backend (.env in backend/)

Required (startup.js checks these):
- MONGODB_URI - MongoDB connection string (e.g. mongodb://admin:password@localhost:27017/wildlife-monitoring?authSource=admin)
- JWT_SECRET - JWT signing secret
- PORT - API port (default 5000)

Typical example:
```
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/wildlife-monitoring
JWT_SECRET=super-secret-change-this
JWT_EXPIRE=7d
CLIENT_URL=http://localhost:3000
```

Frontend (.env in frontend/)
```
VITE_API_BASE_URL=http://localhost:5000/api
```

Docker Compose config sets reasonable defaults for local containerized usage (see docker-compose.yml).

---

## API Reference

Base URL (example): http://localhost:5000/api

All responses use JSON and a standard envelope { success, message, data } where applicable.

Health
- GET /api/health
  - Basic health & diagnostics

Example:
```bash
curl http://localhost:5000/api/health
```

Authentication
- POST /api/auth/register
  - Body: { username, email, password, firstName, lastName, organization?, location? }
- POST /api/auth/login
  - Body: { email, password }
- POST /api/auth/verify-token
  - Body: { token }

Register example:
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"alice","email":"alice@example.com","password":"secret123","firstName":"Alice","lastName":"Smith"}'
```

Login example:
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"alice@example.com","password":"secret123"}'
```

Token verify example:
```bash
curl -X POST http://localhost:5000/api/auth/verify-token \
  -H "Content-Type: application/json" \
  -d '{"token":"<JWT_TOKEN_HERE>"}'
```

Detections (requires Authorization: Bearer <token>)
- POST /api/detections/analyze
  - Upload and analyze an image. Accepts multipart/form-data with file field produced by middleware uploadSingle.
  - Optional fields: location (JSON string), metadata (JSON string)

Analyze (file upload) example:
```bash
curl -X POST "http://localhost:5000/api/detections/analyze" \
  -H "Authorization: Bearer <JWT_TOKEN>" \
  -F "image=@/path/to/photo.jpg" \
  -F 'metadata={"timeOfDay":"morning","source":"upload"}'
```

- GET /api/detections
  - List user's detections (paginated depending on implementation)
- GET /api/detections/:id
- PUT /api/detections/:id/verify
- DELETE /api/detections/:id

Analytics (requires Authorization)
- GET /api/analytics/dashboard
- GET /api/analytics/species/:species
- GET /api/analytics/heatmap
- GET /api/analytics/export

Note: There are debug/test routes available:
- GET /api/test/analytics/dashboard — returns sample analytics payload
- POST /api/test/login — returns a mock token & user for quick testing
- POST /api/test/camera-upload — returns a sample camera-detection payload

---

## Real-time (Socket.IO)

Backend exposes a Socket.IO server with the following behaviors:
- Origin is restricted to CLIENT_URL (env) by default.
- Events:
  - Client -> Server: 'join-monitoring' (payload: userId) — join a "user-{userId}" room
  - Server -> Client: custom events you should listen for, e.g. 'detection-completed', 'detection-processing', 'rare-species-detected' (server emits these during workflows)

Client example (browser with socket.io-client):
```javascript
import { io } from "socket.io-client";

const socket = io("http://localhost:5000", { transports: ['websocket'] });

socket.on('connect', () => {
  console.log('connected', socket.id);
  socket.emit('join-monitoring', 'user-123'); // join a room
});

socket.on('detection-completed', (payload) => {
  console.log('detection completed', payload);
});
```

---

## ML Model (TensorFlow.js)

A browser-optimized TFJS model is included at:
ml-model/models/web_optimized/current_model/

Files include:
- model.json, *.bin (weights)
- metadata.json
- wildlife-detector.js — helper class that wraps model loading, preprocessing and prediction

Usage example in browser (wildlife-detector.js expects tf to be loaded):
```html
<script src="https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@latest"></script>
<script src="/ml-model/current_model/wildlife-detector.js"></script>
<script>
  (async () => {
    const detector = new WildlifeDetector();
    const ok = await detector.loadModel('/ml-model/current_model/');
    if (!ok) { console.error('Model failed to load'); return; }
    const imgEl = document.getElementById('photo');
    const result = await detector.predict(imgEl, 5);
    console.log(result.topPrediction);
  })();
</script>
```

Notes:
- The backend also serves the ml-model directory as a static asset (server.js: app.use('/ml-model', express.static('../ml-model'))), so the model is available under /ml-model/... when the backend is running.

---

## Database initialization & seeding

The repository includes a mongo initialization script used by the MongoDB container:
- backend/mongo-init.js
  - Creates collections (users, detections, species)
  - Creates several indexes for performance
  - Inserts sample species records (e.g. African Elephant, Bengal Tiger, etc.)

If you run MongoDB outside Docker, you can manually run mongo-init.js using the mongo shell or replicate the actions using MongoDB tools.

---

## Project Layout (high level)
- backend/ — Express server, routes, models, services, Dockerfile
- frontend/ — React (Vite) frontend, Dockerfile, nginx config
- ml-model/ — TensorFlow.js models and helper scripts
- docker-compose.yml — orchestration (mongodb, backend, frontend)

Key backend entry points:
- server.js — creates Express app, initializes Socket.IO and mounts API routes
- startup.js — convenience startup flow: validates env, connects to MongoDB, loads world model then requires server.js

Important models:
- backend/models/WildlifeDetection.js — advanced schema used for storing detection records including geolocation, confidence, behavior, conservation flags and indexes for geo + time queries

---

## Troubleshooting & Tips

- MongoDB connection errors:
  - Ensure MONGODB_URI is correct and that MongoDB is reachable.
  - If using Docker compose, check the mongodb container logs and that service depends_on is satisfied.

- Model loading failures:
  - startup.js attempts to load model on startup — if model files are missing, startup will fail. Confirm ml-model/models/web_optimized/current_model/* exists.
  - For browser-based model failing to load, open the dev console and inspect fetch errors for metadata.json/model.json.

- CORS / CLIENT_URL:
  - The backend restricts allowed origins via CLIENT_URL. Update env to include your frontend host.

- File uploads:
  - Uploaded images are stored in backend/uploads (mounted in docker-compose). Ensure disk space and permissions are correct.

- Running backend locally:
  - Use node startup.js so the model is loaded before server startup (startup.js performs checks and model load).

---

## Contributing

1. Fork the repo
2. Create a branch: git checkout -b feature/your-feature
3. Commit: git commit -m "Add awesome feature"
4. Push: git push origin feature/your-feature
5. Open a Pull Request

Please include tests and keep changes scoped.

---

## License

This repository is provided under the MIT License (check LICENSE file in the repo). If there is no LICENSE file, please treat repository as "All rights reserved" until a license is added.

---

## Contact / Support

If you find issues or want to contribute:
- Open an issue on the repository
- Provide reproduction steps & logs for problems
- Tag maintainers or send a PR to fix small issues

---

Thanks for checking out the Wildlife Monitoring and Detection System — built to assist conservation, research and real-time monitoring with modern web and ML technologies. Contributions and feedback are welcome!