import app from './app.js';
import { connectDatabase, disconnectDatabase } from './db/connection.js';

const port = Number(process.env.PORT) || 4000;
await connectDatabase();
const server = app.listen(port, () =>
  console.log(`StudyFlow API listening on http://127.0.0.1:${port}/api/v1`)
);
async function shutdown() {
  server.close(async () => {
    await disconnectDatabase();
    process.exit(0);
  });
}
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
