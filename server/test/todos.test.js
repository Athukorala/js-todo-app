import { before, after, beforeEach, test } from 'node:test';
import assert from 'node:assert/strict';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import request from 'supertest';
import { app } from '../src/app.js';
import { Todo } from '../src/todo.js';
let mongo;
before(async () => {
  mongo = await MongoMemoryServer.create();
  await mongoose.connect(mongo.getUri());
});
after(async () => { await mongoose.disconnect(); await mongo?.stop(); });
beforeEach(async () => { await Todo.deleteMany({}); });

test('CRUD persists, edits, toggles twice and deletes a task', async () => {
  assert.deepEqual((await request(app).get('/api/todos').expect(200)).body, []);
  const created = (await request(app).post('/api/todos').send({ title: '  Plan the week  ' }).expect(201)).body;
  assert.equal(created.title, 'Plan the week');
  assert.equal(created.description, '');
  assert.equal(created.done, false);
  assert.ok(created.createdAt);
  // Read from MongoDB independently of the HTTP response.
  assert.equal((await Todo.findById(created._id)).title, 'Plan the week');
  const edited = (await request(app).put(`/api/todos/${created._id}`).send({ title: 'Updated', description: 'Some details', done: true }).expect(200)).body;
  assert.equal(edited.description, 'Some details');
  assert.equal(edited.done, false);
  assert.equal((await request(app).patch(`/api/todos/${created._id}/done`).expect(200)).body.done, true);
  assert.equal((await request(app).patch(`/api/todos/${created._id}/done`).expect(200)).body.done, false);
  assert.equal((await request(app).get('/api/todos')).body[0].title, 'Updated');
  await request(app).delete(`/api/todos/${created._id}`).expect(204);
  assert.equal(await Todo.countDocuments(), 0);
});
test('rejects invalid input without writing records', async () => {
  for (const body of [{}, { title: '   ' }, { title: 3 }, { title: 'x'.repeat(121) }, { title: 'ok', description: null }, { title: 'ok', description: 'x'.repeat(2001) }]) {
    await request(app).post('/api/todos').send(body).expect(400);
  }
  await request(app).post('/api/todos').set('Content-Type', 'application/json').send('{broken').expect(400);
  await request(app).post('/api/todos').send({ title: 'x'.repeat(20000) }).expect(413);
  assert.equal(await Todo.countDocuments(), 0);
});
test('invalid IDs and absent tasks have useful status codes', async () => {
  const missing = new mongoose.Types.ObjectId().toString();
  for (const id of ['bad-id', missing]) {
    const status = id === missing ? 404 : 400;
    await request(app).put(`/api/todos/${id}`).send({ title: 'Valid' }).expect(status);
    await request(app).patch(`/api/todos/${id}/done`).expect(status);
    await request(app).delete(`/api/todos/${id}`).expect(status);
  }
  await request(app).get('/api/unknown').expect(404);
});
test('concurrent toggles do not lose an update', async () => {
  const todo = await Todo.create({ title: 'Concurrent task' });
  await Promise.all(Array.from({ length: 10 }, () => request(app).patch(`/api/todos/${todo.id}/done`).expect(200)));
  assert.equal((await Todo.findById(todo.id)).done, false);
});
test('editing validates fields and preserves existing task on rejection', async () => {
  const todo = await Todo.create({ title: 'Original', description: 'Keep me', done: true });
  await request(app).put(`/api/todos/${todo.id}`).send({ title: '' }).expect(400);
  assert.equal((await Todo.findById(todo.id)).title, 'Original');
  const edited = (await request(app).put(`/api/todos/${todo.id}`).send({ title: 'Changed', description: 'New description' }).expect(200)).body;
  assert.equal(edited.done, true);
});
