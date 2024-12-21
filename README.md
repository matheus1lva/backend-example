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

## Endpoints

- `GET /api/meetings`

Retrieves all the meetings for the user. ✅

- `POST /api/meetings`

Create a new meeting with title, date, and participants. ✅

Payload:

```json
{
  "title": "Meeting title",
  "date": "Meeting date",
  "participants": ["Participant 1", "Participant 2", "Participant 3"]
}
```

- `GET /api/meetings/:id`

Retrieve a specific meeting by ID. Include its tasks.

- `PUT /api/meetings/:id/transcript`

Update a meeting with its transcript.

Payload:

```json
{
  "transcript": "Meeting transcript"
}
```

- `POST /api/meetings/:id/summarize`

Generate a summary and action items for a meeting (you can use a mock AI service for this).
Once the AI service returns the action items, you should automatically create the tasks for this meeting.

- `GET /api/tasks`

Returns all the tasks assigned to the user

- `GET /api/meetings/stats`

Return statistics about meetings, such as the total number of meetings, average number of participants, and most frequent participants.
Please follow the data structure defined in the router file.

- (Bonus) `GET /api/dashboard`

Return a summary of the user's meetings, including count and upcoming meetings, task counts by status, and past due tasks. The data structure is also defined in the endpoint file.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## TODO

- add e2e tests leveragig testcontainers
- add infra as code using sst
