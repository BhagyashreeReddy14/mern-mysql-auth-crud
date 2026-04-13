import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getItemsApi, getStatsApi, createItemApi, updateItemApi, deleteItemApi } from '../api/itemApi';

// ─── Status Badge ─────────────────────────────────────────────────────────────
const StatusBadge = ({ status }) => {
  const styles = {
    active: 'bg-green-100 text-green-700',
    pending: 'bg-yellow-100 text-yellow-700',
    completed: 'bg-blue-100 text-blue-700',
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${styles[status] || 'bg-gray-100 text-gray-600'}`}>
      {status}
    </span>
  );
};

// ─── Stat Card ────────────────────────────────────────────────────────────────
const StatCard = ({ label, value, color }) => {
  const colors = {
    indigo: 'bg-indigo-50 text-indigo-600',
    green: 'bg-green-50 text-green-600',
    yellow: 'bg-yellow-50 text-yellow-600',
    blue: 'bg-blue-50 text-blue-600',
  };
  return (
    <div className="card flex items-center gap-4">
      <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-2xl font-bold ${colors[color]}`}>
        {value ?? '—'}
      </div>
      <div>
        <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">{label}</p>
        <p className="text-xl font-bold text-gray-800">{value ?? 0}</p>
      </div>
    </div>
  );
};

// ─── Delete Confirmation Dialog ───────────────────────────────────────────────
const DeleteDialog = ({ item, onConfirm, onCancel, loading }) => (
  <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6">
      <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      </div>
      <h3 className="text-lg font-semibold text-center text-gray-900">Delete Item</h3>
      <p className="text-sm text-gray-500 text-center mt-2">
        Are you sure you want to delete <strong>"{item.title}"</strong>? This action cannot be undone.
      </p>
      <div className="flex gap-3 mt-6">
        <button onClick={onCancel} className="btn-secondary flex-1">Cancel</button>
        <button onClick={onConfirm} disabled={loading} className="btn-danger flex-1">
          {loading ? 'Deleting...' : 'Delete'}
        </button>
      </div>
    </div>
  </div>
);

// ─── Dashboard ────────────────────────────────────────────────────────────────
export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [items, setItems] = useState([]);
  const [stats, setStats] = useState(null);
  const [loadingItems, setLoadingItems] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Add form state
  const [addForm, setAddForm] = useState({ title: '', description: '', status: 'active' });
  const [addLoading, setAddLoading] = useState(false);

  // Edit state
  const [editId, setEditId] = useState(null);
  const [editForm, setEditForm] = useState({ title: '', description: '', status: 'active' });
  const [editLoading, setEditLoading] = useState(false);

  // Delete state
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // ─── Fetch data ─────────────────────────────────────────────────────────────
  const fetchAll = useCallback(async () => {
    setLoadingItems(true);
    try {
      const [itemsRes, statsRes] = await Promise.all([getItemsApi(), getStatsApi()]);
      setItems(itemsRes.data.data);
      setStats(statsRes.data.data);
    } catch {
      setError('Failed to load data');
    } finally {
      setLoadingItems(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const flash = (type, msg) => {
    if (type === 'success') setSuccess(msg);
    else setError(msg);
    setTimeout(() => { setSuccess(''); setError(''); }, 3000);
  };

  // ─── Add item ────────────────────────────────────────────────────────────────
  const handleAdd = async (e) => {
    e.preventDefault();
    if (!addForm.title.trim()) { flash('error', 'Title is required'); return; }

    setAddLoading(true);
    try {
      await createItemApi(addForm);
      setAddForm({ title: '', description: '', status: 'active' });
      flash('success', 'Item created successfully');
      fetchAll();
    } catch (err) {
      flash('error', err.response?.data?.message || 'Failed to create item');
    } finally {
      setAddLoading(false);
    }
  };

  // ─── Edit item ───────────────────────────────────────────────────────────────
  const startEdit = (item) => {
    setEditId(item.id);
    setEditForm({ title: item.title, description: item.description || '', status: item.status });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editForm.title.trim()) { flash('error', 'Title is required'); return; }

    setEditLoading(true);
    try {
      await updateItemApi(editId, editForm);
      setEditId(null);
      flash('success', 'Item updated');
      fetchAll();
    } catch (err) {
      flash('error', err.response?.data?.message || 'Failed to update item');
    } finally {
      setEditLoading(false);
    }
  };

  // ─── Quick status update ─────────────────────────────────────────────────────
  const handleStatusChange = async (item, newStatus) => {
    try {
      await updateItemApi(item.id, { ...item, status: newStatus });
      fetchAll();
    } catch {
      flash('error', 'Failed to update status');
    }
  };

  // ─── Delete item ─────────────────────────────────────────────────────────────
  const handleDelete = async () => {
    setDeleteLoading(true);
    try {
      await deleteItemApi(deleteTarget.id);
      setDeleteTarget(null);
      flash('success', 'Item deleted');
      fetchAll();
    } catch {
      flash('error', 'Failed to delete item');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
            </div>
            <span className="font-semibold text-gray-900">Dashboard</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600 hidden sm:block">
              👋 Hello, <strong>{user?.name}</strong>
            </span>
            <button onClick={handleLogout} className="btn-secondary text-sm py-1.5 px-3">Logout</button>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* Alerts */}
        {error && <div className="alert-error">{error}</div>}
        {success && <div className="alert-success">{success}</div>}

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Total" value={stats?.total} color="indigo" />
          <StatCard label="Active" value={stats?.active} color="green" />
          <StatCard label="Pending" value={stats?.pending} color="yellow" />
          <StatCard label="Completed" value={stats?.completed} color="blue" />
        </div>

        {/* Add Item Form */}
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Add New Item</h2>
          <form onSubmit={handleAdd} className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <input
              type="text"
              placeholder="Title *"
              value={addForm.title}
              onChange={(e) => setAddForm((p) => ({ ...p, title: e.target.value }))}
              className="input-field"
            />
            <input
              type="text"
              placeholder="Description (optional)"
              value={addForm.description}
              onChange={(e) => setAddForm((p) => ({ ...p, description: e.target.value }))}
              className="input-field"
            />
            <select
              value={addForm.status}
              onChange={(e) => setAddForm((p) => ({ ...p, status: e.target.value }))}
              className="input-field"
            >
              <option value="active">Active</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
            </select>
            <button type="submit" disabled={addLoading} className="btn-primary">
              {addLoading ? 'Adding...' : '+ Add Item'}
            </button>
          </form>
        </div>

        {/* Items List */}
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Your Items <span className="text-gray-400 font-normal text-sm">({items.length})</span>
          </h2>

          {loadingItems ? (
            <div className="text-center py-12 text-gray-400">Loading items...</div>
          ) : items.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <p className="text-4xl mb-2">📋</p>
              <p>No items yet. Add one above!</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left py-2 px-3 text-gray-500 font-medium">Title</th>
                    <th className="text-left py-2 px-3 text-gray-500 font-medium hidden md:table-cell">Description</th>
                    <th className="text-left py-2 px-3 text-gray-500 font-medium">Status</th>
                    <th className="text-left py-2 px-3 text-gray-500 font-medium hidden sm:table-cell">Created</th>
                    <th className="text-right py-2 px-3 text-gray-500 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {items.map((item) =>
                    editId === item.id ? (
                      // ─── Inline Edit Row ───────────────────────────────────
                      <tr key={item.id} className="bg-indigo-50">
                        <td className="py-2 px-3">
                          <input
                            value={editForm.title}
                            onChange={(e) => setEditForm((p) => ({ ...p, title: e.target.value }))}
                            className="input-field text-xs py-1"
                          />
                        </td>
                        <td className="py-2 px-3 hidden md:table-cell">
                          <input
                            value={editForm.description}
                            onChange={(e) => setEditForm((p) => ({ ...p, description: e.target.value }))}
                            className="input-field text-xs py-1"
                            placeholder="Description"
                          />
                        </td>
                        <td className="py-2 px-3">
                          <select
                            value={editForm.status}
                            onChange={(e) => setEditForm((p) => ({ ...p, status: e.target.value }))}
                            className="input-field text-xs py-1"
                          >
                            <option value="active">Active</option>
                            <option value="pending">Pending</option>
                            <option value="completed">Completed</option>
                          </select>
                        </td>
                        <td className="py-2 px-3 hidden sm:table-cell" />
                        <td className="py-2 px-3 text-right">
                          <div className="flex gap-2 justify-end">
                            <button onClick={handleUpdate} disabled={editLoading}
                              className="text-xs bg-indigo-600 text-white px-3 py-1 rounded-lg hover:bg-indigo-700 disabled:opacity-50">
                              {editLoading ? 'Saving...' : 'Save'}
                            </button>
                            <button onClick={() => setEditId(null)}
                              className="text-xs bg-gray-200 text-gray-700 px-3 py-1 rounded-lg hover:bg-gray-300">
                              Cancel
                            </button>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      // ─── Normal Row ────────────────────────────────────────
                      <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                        <td className="py-3 px-3 font-medium text-gray-900">{item.title}</td>
                        <td className="py-3 px-3 text-gray-500 hidden md:table-cell max-w-xs truncate">
                          {item.description || <span className="italic text-gray-300">—</span>}
                        </td>
                        <td className="py-3 px-3">
                          <select
                            value={item.status}
                            onChange={(e) => handleStatusChange(item, e.target.value)}
                            className="text-xs border border-gray-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-indigo-400"
                          >
                            <option value="active">Active</option>
                            <option value="pending">Pending</option>
                            <option value="completed">Completed</option>
                          </select>
                        </td>
                        <td className="py-3 px-3 text-gray-400 hidden sm:table-cell text-xs">
                          {new Date(item.created_at).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-3 text-right">
                          <div className="flex gap-2 justify-end">
                            <button onClick={() => startEdit(item)}
                              className="text-xs text-indigo-600 hover:text-indigo-800 font-medium px-2 py-1 hover:bg-indigo-50 rounded">
                              Edit
                            </button>
                            <button onClick={() => setDeleteTarget(item)}
                              className="text-xs text-red-600 hover:text-red-800 font-medium px-2 py-1 hover:bg-red-50 rounded">
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation */}
      {deleteTarget && (
        <DeleteDialog
          item={deleteTarget}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
          loading={deleteLoading}
        />
      )}
    </div>
  );
}
