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

## API Documentation

The API documentation is available through Swagger UI at `/api` when the server is running.
You can explore and test all available endpoints through the interactive documentation interface.

## Docker Setup

```bash
docker-compose up -d
```

Services:

- Backend: `localhost:3000`
- MongoDB: `localhost:27017`
- Redis: `localhost:6379`
- Swagger UI: `localhost:3000/api`

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request
