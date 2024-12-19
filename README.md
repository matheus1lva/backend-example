# Fireflies.ai Backend Test

A Node.js backend service for managing meetings, tasks, and transcripts with MongoDB.

## Prerequisites

- Node.js v22
- MongoDB
- Docker (optional)

## Development Setup

### Local Development

1. Clone the repository:

```bash
git clone <repository-url>
cd backend-example
```

2. Install dependencies:

```bash
npm install
```

3. Ensure MongoDB is running locally on the default port (27017)

4. Seed the database with initial data:

```bash
npm run seed
```

5. Start the development server:

```bash
npm start
```

The server will be available at `http://localhost:3000`

## Docker Setup

1. Build the Docker image:

```bash
docker build -t fireflies-backend .
```

2. Run the container:

```bash
docker run -p 3000:3000 -e MONGODB_URI=mongodb://host.docker.internal:27017/fireflies fireflies-backend
```

Note: Use `host.docker.internal` to connect to your local MongoDB from inside the container. If you're using Docker Compose or a different MongoDB setup, adjust the connection string accordingly.

## Project Structure

The project follows a clean architecture pattern with the following structure:

- `/routes` - API route definitions
- `/controllers` - Request handlers
- `/models` - MongoDB schemas
- `/services` - Business logic
- `/middleware` - Custom middleware functions

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request
