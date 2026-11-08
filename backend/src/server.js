import mongoose from 'mongoose';
import { app } from './app.js';

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error('MONGODB_URI is required. Copy backend/.env.example to backend/.env and configure MongoDB.');
  process.exit(1);
}
try {
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
  const server = app.listen(process.env.PORT || 3001, () => console.log(`API listening on port ${process.env.PORT || 3001}`));
  let closing = false;
  async function shutdown() {
    if (closing) return;
    closing = true;
    const timer = setTimeout(() => process.exit(1), 10000).unref();
    server.close(async () => { await mongoose.disconnect(); clearTimeout(timer); process.exit(0); });
  }
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
} catch (error) {
  console.error(`Could not start API: ${error.message}`);
  process.exit(1);
}
