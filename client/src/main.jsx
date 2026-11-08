import React, { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './style.css';

async function api(path = '', options = {}) {
  const response = await fetch(`/api/todos${path}`, {
    ...options, headers: { 'Content-Type': 'application/json' },
  });
  // DELETE succeeds without a JSON response body.
  if (response.status === 204) return null;
  const data = await response.json().catch(() => null);
  if (!response.ok) throw new Error(data?.error || 'Could not reach your tasks. Please try again.');
  return data;
}

function App() {
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);
  const [busy, setBusy] = useState(new Set());
  const [announcement, setAnnouncement] = useState('');
  const titleInput = useRef(null);
  // A ref blocks repeat clicks immediately, before React renders the disabled button.
  const locks = useRef(new Set());

  async function load() {
    setLoading(true); setError('');
    try { setTodos(await api()); }
    catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }
  useEffect(() => { load(); }, []);
  function reset() { setEditing(null); setTitle(''); setDescription(''); }
  async function save(e) {
    e.preventDefault();
    if (!title.trim() || saving) return;
    setSaving(true); setError('');
    try {
      const todo = await api(editing ? `/${editing}` : '', {
        method: editing ? 'PUT' : 'POST', body: JSON.stringify({ title, description }),
      });
      setTodos(items => editing ? items.map(t => t._id === todo._id ? todo : t) : [todo, ...items]);
      setAnnouncement(editing ? 'Task updated.' : 'Task added.'); reset(); titleInput.current?.focus();
    } catch (e) { setError(e.message); }
    finally { setSaving(false); }
  }
  async function mutate(todo, action) {
    if (locks.current.has(todo._id)) return;
    locks.current.add(todo._id); setBusy(new Set(locks.current)); setError('');
    // Show checkbox changes right away; creates, edits and deletes wait for the API.
    const toggling = action === 'toggle';
    if (toggling) setTodos(items => items.map(t => t._id === todo._id ? { ...t, done: !t.done } : t));
    try {
      const result = await api(`/${todo._id}${toggling ? '/done' : ''}`, { method: toggling ? 'PATCH' : 'DELETE' });
      setTodos(items => toggling ? items.map(t => t._id === todo._id ? result : t) : items.filter(t => t._id !== todo._id));
      if (!toggling && editing === todo._id) reset();
      setAnnouncement(toggling ? 'Task status updated.' : 'Task deleted.');
    } catch (e) {
      // Restore this task without discarding changes to other tasks.
      if (toggling) setTodos(items => items.map(t => t._id === todo._id ? todo : t));
      setError(e.message);
    } finally { locks.current.delete(todo._id); setBusy(new Set(locks.current)); }
  }
  const completed = todos.filter(t => t.done).length;
  const visible = todos.filter(t => (filter === 'All' || (filter === 'Completed' ? t.done : !t.done)) && `${t.title} ${t.description}`.toLowerCase().includes(search.toLowerCase()));
  return <div className="shell">
    <header><a className="brand" href="/" aria-label="Daylist home"><span className="brand-icon">✓</span> daylist<span className="brand-dot">.</span></a><span className="header-note">A LITTLE MORE DONE, EVERY DAY</span></header>
    <main>
      <div className="intro"><span className="eyebrow">YOUR SPACE TO MAKE PROGRESS</span><h1>Small steps.<br/><span>Clearer days.</span></h1><p>Make room for what matters. One task at a time.</p></div>
      <div className="workspace">
        <aside><section className="composer"><div className="section-label"><span className="small-icon">＋</span><h2>{editing ? 'Edit your task' : 'A fresh start'}</h2></div><p className="muted">{editing ? 'A little change of plan? Update it here.' : 'What would you like to get done?'}</p>
          <form onSubmit={save}><label htmlFor="title">Task title <span aria-hidden="true">*</span></label><input id="title" ref={titleInput} value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Plan the week ahead" required maxLength={120} disabled={saving}/><label htmlFor="description">Description <span className="optional">optional</span></label><textarea id="description" value={description} onChange={e => setDescription(e.target.value)} placeholder="Add a few details…" maxLength={2000} rows={4} disabled={saving}/><button className="primary" disabled={saving || !title.trim() || (editing && busy.has(editing))}>{saving ? 'Saving…' : editing ? 'Save changes' : '＋ Add task'}</button>{editing && <button type="button" className="cancel" disabled={saving} onClick={reset}>Cancel editing</button>}</form>
        </section><div className="little-note"><span>✧</span><p>You don’t have to do it all.<br/>Just the next little thing.</p></div></aside>
        <section className="tasks" aria-labelledby="tasks-heading"><div className="tasks-heading"><div><h2 id="tasks-heading">Your tasks <span className="count">{todos.length}</span></h2><p className="muted">{completed ? `${completed} of ${todos.length} complete. Keep it going.` : 'A little focus goes a long way.'}</p></div><span className="progress-number">{todos.length ? Math.round(completed / todos.length * 100) : 0}%<small>COMPLETE</small></span></div><div className="progress" role="progressbar" aria-label="Tasks completed" aria-valuenow={completed} aria-valuemin={0} aria-valuemax={todos.length || 1}><div style={{ width: `${todos.length ? completed / todos.length * 100 : 0}%` }}/></div>
          <div className="tools"><div className="filters" aria-label="Filter tasks">{['All', 'Active', 'Completed'].map(f => <button key={f} aria-pressed={filter === f} className={filter === f ? 'selected' : ''} onClick={() => setFilter(f)}>{f}</button>)}</div><input className="search" type="search" aria-label="Search tasks" placeholder="Search tasks…" value={search} onChange={e => setSearch(e.target.value)}/></div>
          {error && <div role="alert" className="error">{error}<button onClick={load} disabled={loading || busy.size > 0 || saving}>Refresh list</button></div>}
          {loading ? <div className="empty" role="status">Loading your tasks…</div> : visible.length ? <ul className="task-list">{visible.map(todo => <li key={todo._id} className={`task ${todo.done ? 'done' : ''}`}><input type="checkbox" className="checkbox" aria-label={`Mark ${todo.title} ${todo.done ? 'undone' : 'done'}`} checked={todo.done} disabled={busy.has(todo._id) || editing === todo._id} onChange={() => mutate(todo, 'toggle')}/><div className="task-copy"><h3>{todo.title}</h3>{todo.description && <p>{todo.description}</p>}<span className="task-tag">{todo.done ? 'Completed' : 'To do'}</span></div><div className="actions"><button aria-label={`Edit ${todo.title}`} disabled={saving || busy.has(todo._id)} onClick={() => { setEditing(todo._id); setTitle(todo.title); setDescription(todo.description); titleInput.current?.focus(); }}>Edit</button><button className="delete" aria-label={`Delete ${todo.title}`} disabled={saving || busy.has(todo._id)} onClick={() => { if (window.confirm(`Delete “${todo.title}”?`)) mutate(todo, 'delete'); }}>Delete</button></div></li>)}</ul> : <div className="empty"><div className="empty-icon">✓</div><h3>{search ? 'No matching tasks' : filter === 'Completed' ? 'Good things take small steps' : filter === 'Active' && todos.length ? 'All caught up!' : 'A clear page, a fresh start'}</h3><p>{search ? 'Try a different word or clear your search.' : 'Add a task and make a little progress today.'}</p></div>}
          <div className="list-footer"><span>{todos.length - completed} tasks left</span><span>Every small step counts <span aria-hidden="true">↗</span></span></div>
        </section>
      </div>
    </main><footer>MADE FOR A MORE MINDFUL DAY <span aria-hidden="true">✧</span> KEEP IT SIMPLE. KEEP GOING.<small className="developer-credit">Developed by Tharindu Athukorala</small></footer><div className="sr-only" role="status">{announcement}</div>
  </div>;
}
createRoot(document.getElementById('root')).render(<App/>);
