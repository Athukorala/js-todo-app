import express from 'express';
import helmet from 'helmet';
import mongoose from 'mongoose';
import { fileURLToPath } from 'node:url';
import { existsSync } from 'node:fs';
import { Todo } from './todo.js';

export const app = express();
app.use(helmet());
app.use(express.json({ limit: '16kb' }));

function fields(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) return null;
  const { title, description = '' } = body;
  if (typeof title !== 'string' || !title.trim() || title.trim().length > 120 ||
      typeof description !== 'string' || description.trim().length > 2000) return null;
  return { title: title.trim(), description: description.trim() };
}
app.get('/api/todos', async (_req, res) => {
  res.json(await Todo.find().sort({ createdAt: -1, _id: -1 }));
});
app.post('/api/todos', async (req, res) => {
  const data = fields(req.body);
  if (!data) return res.status(400).json({ error: 'Enter a title (1–120 characters) and a description of up to 2,000 characters.' });
  res.status(201).json(await Todo.create(data));
});
app.param('id', (req, res, next, id) => {
  if (!mongoose.isObjectIdOrHexString(id)) return res.status(400).json({ error: 'Invalid task ID.' });
  next();
});
app.put('/api/todos/:id', async (req, res) => {
  const data = fields(req.body);
  if (!data) return res.status(400).json({ error: 'Enter a title (1–120 characters) and a description of up to 2,000 characters.' });
  const todo = await Todo.findByIdAndUpdate(req.params.id, data, { new: true, runValidators: true });
  if (!todo) return res.status(404).json({ error: 'This task no longer exists. Refresh your list.' });
  res.json(todo);
});
app.patch('/api/todos/:id/done', async (req, res) => {
  // Pipeline update toggles atomically, even when requests arrive concurrently.
  const todo = await Todo.findByIdAndUpdate(req.params.id, [{ $set: { done: { $not: ['$done'] } } }], { new: true });
  if (!todo) return res.status(404).json({ error: 'This task no longer exists. Refresh your list.' });
  res.json(todo);
});
app.delete('/api/todos/:id', async (req, res) => {
  const todo = await Todo.findByIdAndDelete(req.params.id);
  if (!todo) return res.status(404).json({ error: 'This task no longer exists. Refresh your list.' });
  res.status(204).end();
});
app.use('/api', (_req, res) => res.status(404).json({ error: 'API endpoint not found.' }));
const client = fileURLToPath(new URL('../../frontend/dist/', import.meta.url));
if (existsSync(client)) {
  app.use(express.static(client));
  app.get('/{*path}', (_req, res) => res.sendFile(`${client}/index.html`));
}
app.use((err, _req, res, _next) => {
  if (err.type === 'entity.parse.failed') return res.status(400).json({ error: 'Request body must be valid JSON.' });
  if (err.type === 'entity.too.large') return res.status(413).json({ error: 'Request is too large.' });
  console.error(err);
  res.status(500).json({ error: 'Something went wrong while saving your tasks. Please try again.' });
});
