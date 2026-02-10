import { useState, useEffect } from 'react';
import { UserPlus, Trash2, AlertCircle, CheckCircle, Loader2, User, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { adminFetch } from '../../lib/adminApi';
import { sr } from '../../locales/sr';

interface StaffMember {
  id: string;
  user_id: string;
  name: string;
  email: string;
  auth_user_id: string | null;
  member_since: string;
}

export default function StaffManagement() {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [creating, setCreating] = useState(false);
  const [removing, setRemoving] = useState<string | null>(null);
  const [confirmRemove, setConfirmRemove] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [staffPassword, setStaffPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const fetchStaff = async () => {
    setLoading(true);
    const result = await adminFetch({ action: 'list-staff' });
    if (result.data) setStaff(result.data);
    setLoading(false);
  };

  useEffect(() => { fetchStaff(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setMessage(null);

    const result = await adminFetch({
      action: 'create-staff',
      name,
      email,
      staffPassword,
    });

    if (result.error) {
      setMessage({ type: 'error', text: result.error });
    } else {
      setMessage({ type: 'success', text: `${name} ${sr.admin.uspesno_kreiran}` });
      setName('');
      setEmail('');
      setStaffPassword('');
      setShowCreateForm(false);
      fetchStaff();
    }
    setCreating(false);
  };

  const handleRemove = async (staffId: string) => {
    setRemoving(staffId);
    setMessage(null);

    const result = await adminFetch({ action: 'remove-staff', staffId });

    if (result.error) {
      setMessage({ type: 'error', text: result.error });
    } else {
      setMessage({ type: 'success', text: sr.admin.uspesno_uklonjen });
      fetchStaff();
    }
    setRemoving(null);
    setConfirmRemove(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {message && (
        <div className={`flex items-center gap-2 p-4 rounded-lg ${
          message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
        }`}>
          {message.type === 'success'
            ? <CheckCircle className="w-5 h-5 flex-shrink-0" />
            : <AlertCircle className="w-5 h-5 flex-shrink-0" />}
          <p className="text-sm font-medium">{message.text}</p>
        </div>
      )}

      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-black">
          {sr.admin.osoblje} ({staff.length})
        </h3>
        <button
          onClick={() => { setShowCreateForm(!showCreateForm); setMessage(null); }}
          className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors text-sm font-semibold min-h-[44px]"
        >
          <UserPlus className="w-4 h-4" />
          {showCreateForm ? sr.common.otkaži : sr.admin.novi_zaposleni}
        </button>
      </div>

      {showCreateForm && (
        <form onSubmit={handleCreate} className="bg-gray-50 rounded-xl p-4 sm:p-6 space-y-4 border border-gray-200">
          <h4 className="font-semibold text-black">{sr.admin.kreiraj_nalog}</h4>

          <div className="space-y-3">
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={sr.admin.ime_prezime}
                required
                className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-black transition-colors"
              />
            </div>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={sr.admin.email_adresa}
                required
                className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-black transition-colors"
              />
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={staffPassword}
                onChange={(e) => setStaffPassword(e.target.value)}
                placeholder={sr.admin.lozinka_min}
                required
                minLength={8}
                className="w-full pl-11 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-black transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={creating}
            className="w-full flex items-center justify-center gap-2 bg-black text-white font-semibold py-3 rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 min-h-[44px]"
          >
            {creating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                {sr.admin.kreiranje}
              </>
            ) : (
              <>
                <UserPlus className="w-4 h-4" />
                {sr.admin.kreiraj}
              </>
            )}
          </button>
        </form>
      )}

      <div className="space-y-3">
        {staff.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">{sr.admin.nema_zaposlenih}</p>
          </div>
        ) : (
          staff.map((member) => (
            <div key={member.id} className="bg-gray-50 rounded-xl p-4 border border-gray-200 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-black truncate">{member.name}</h4>
                    {!member.auth_user_id && (
                      <span className="flex-shrink-0 px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs rounded-full font-medium">
                        {sr.admin.nepovezan}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 truncate">{member.email}</p>
                  <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                    <span>ID: {member.user_id}</span>
                    {member.member_since && <span>Od: {member.member_since}</span>}
                  </div>
                </div>

                {confirmRemove === member.id ? (
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => handleRemove(member.id)}
                      disabled={removing === member.id}
                      className="px-3 py-2 bg-red-600 text-white text-xs font-semibold rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 min-h-[36px]"
                    >
                      {removing === member.id ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : 'Da'}
                    </button>
                    <button
                      onClick={() => setConfirmRemove(null)}
                      className="px-3 py-2 bg-gray-200 text-gray-700 text-xs font-semibold rounded-lg hover:bg-gray-300 transition-colors min-h-[36px]"
                    >
                      Ne
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setConfirmRemove(member.id)}
                    className="flex-shrink-0 p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors min-h-[36px]"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
