# Fireflies.ai Backend Test

A Node.js backend service for managing meetings, tasks, and transcripts with MongoDB and Redis.

## Prerequisites

- Node.js v22
- MongoDB
- Redis
- Docker (optional)

## Local Development

```bash
git clone <repository-url>
cd backend-example
npm install
npm run seed
npm start
```

## Docker Setup

```bash
docker-compose up -d
```

Services:

- Backend: `localhost:3000`
- MongoDB: `localhost:27017`
- Redis: `localhost:6379`

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request
