import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import Modal from '../../components/Modal';
import { UserCog, Plus, Shield, Mail, Lock, User } from 'lucide-react';

export default function AdminSettings() {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const { success, error: showError } = useToast();

  // New admin form
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('admin');

  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/admins');
      if (res.data.success) {
        setAdmins(res.data.admins);
      }
    } catch (err) {
      showError('Failed to load admin accounts.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAdmin = async (e) => {
    e.preventDefault();
    if (!name || !email) {
      showError('Administrator name and official Google email address are required.');
      return;
    }

    setSaving(true);
    try {
      const res = await api.post('/admin/admins', {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
        role,
      });

      if (res.data.success) {
        success('New administrator account created.');
        setIsModalOpen(false);
        setName('');
        setEmail('');
        setPassword('');
        fetchAdmins();
      }
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to create admin.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-accent/15 pb-6">
        <div>
          <div className="text-xs font-bold uppercase tracking-wider text-accent mb-1">Security & Access</div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-dark tracking-tight">Admin Accounts</h1>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="btn-primary py-2.5 px-5 text-xs font-semibold rounded-xl inline-flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>Provision New Admin</span>
        </button>
      </div>

      {/* Admin Table */}
      {loading ? (
        <div className="card h-64 animate-pulse bg-white/70"></div>
      ) : (
        <div className="bg-white rounded-2xl border border-accent/15 shadow-card overflow-hidden">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-background-cream/60 border-b border-accent/15 text-accent font-bold uppercase tracking-wider text-[11px]">
                <th className="py-3.5 px-6">Administrator Name</th>
                <th className="py-3.5 px-4">Email</th>
                <th className="py-3.5 px-4">Role</th>
                <th className="py-3.5 px-6">Created By</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-accent/10">
              {admins.map((adm) => (
                <tr key={adm._id} className="hover:bg-background-cream/30 transition-colors">
                  <td className="py-4 px-6 font-bold text-dark text-sm">{adm.name}</td>
                  <td className="py-4 px-4 text-dark-muted">{adm.email}</td>
                  <td className="py-4 px-4">
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-secondary text-primary uppercase">
                      {adm.role}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-dark-muted">{adm.createdBy || 'system'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Provision Administrator Account"
        maxWidth="max-w-md"
      >
        <form onSubmit={handleCreateAdmin} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-dark mb-1 uppercase tracking-wide">Full Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Marcus Vance"
              className="input-field text-xs"
            />
          </div>

          <div>
            <label className="block font-semibold text-dark mb-1 uppercase tracking-wide">
              Official Admin Google / Gmail Address <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="coordinator@gmail.com"
              className="input-field text-xs"
            />
            <p className="text-[10px] text-dark-muted mt-1">
              Admin must sign in with this exact Google account using Firebase Authentication.
            </p>
          </div>

          <div>
            <label className="block font-semibold text-dark mb-1 uppercase tracking-wide">
              Initial Password (Optional / Fallback)
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Optional secondary password"
              className="input-field text-xs"
            />
          </div>

          <div>
            <label className="block font-semibold text-dark mb-1 uppercase tracking-wide">Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="input-field text-xs"
            >
              <option value="admin">Administrator</option>
              <option value="superadmin">Super Administrator</option>
            </select>
          </div>

          <div className="pt-4 flex items-center justify-end gap-3 border-t border-accent/15">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="btn-outline text-xs py-2 px-4"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="btn-primary text-xs py-2 px-6"
            >
              {saving ? 'Creating...' : 'Provision Admin'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
