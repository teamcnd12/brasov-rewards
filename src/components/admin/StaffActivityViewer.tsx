import { useState, useEffect } from 'react';
import { PlusCircle, MinusCircle, CheckCircle, Loader2, Filter } from 'lucide-react';
import { adminFetch } from '../../lib/adminApi';
import { sr } from '../../locales/sr';

interface ActivityEntry {
  id: number;
  staff_id: string;
  staff_name: string;
  date: string;
  time: string;
  action: 'added_tokens' | 'verified_redemption' | 'removed_tokens';
  customer_name: string;
  details: string;
}

interface StaffOption {
  id: string;
  name: string;
}

export default function StaffActivityViewer() {
  const [activities, setActivities] = useState<ActivityEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStaff, setFilterStaff] = useState<string>('all');
  const [staffOptions, setStaffOptions] = useState<StaffOption[]>([]);

  const fetchActivity = async () => {
    setLoading(true);
    const result = await adminFetch({
      action: 'list-activity',
      ...(filterStaff !== 'all' ? { staffId: filterStaff } : {}),
    });

    if (result.data) {
      setActivities(result.data);

      if (filterStaff === 'all') {
        const uniqueStaff = new Map<string, string>();
        result.data.forEach((a: ActivityEntry) => {
          if (!uniqueStaff.has(a.staff_id)) {
            uniqueStaff.set(a.staff_id, a.staff_name);
          }
        });
        setStaffOptions(
          Array.from(uniqueStaff, ([id, name]) => ({ id, name }))
        );
      }
    }
    setLoading(false);
  };

  useEffect(() => { fetchActivity(); }, [filterStaff]);

  const tokenActions = activities.filter(a => a.action === 'added_tokens');
  const removedActions = activities.filter(a => a.action === 'removed_tokens');
  const redemptionActions = activities.filter(a => a.action === 'verified_redemption');

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-green-50 rounded-xl p-4 border border-green-100">
          <p className="text-xs text-green-600 font-medium mb-1">{sr.admin.dodati_tokeni}</p>
          <p className="text-2xl font-bold text-green-700">{tokenActions.length}</p>
        </div>
        <div className="bg-red-50 rounded-xl p-4 border border-red-100">
          <p className="text-xs text-red-600 font-medium mb-1">{sr.admin.oduzeti_tokeni}</p>
          <p className="text-2xl font-bold text-red-700">{removedActions.length}</p>
        </div>
        <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
          <p className="text-xs text-gray-600 font-medium mb-1">{sr.admin.verifikacije}</p>
          <p className="text-2xl font-bold text-black">{redemptionActions.length}</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Filter className="w-4 h-4 text-gray-400 flex-shrink-0" />
        <select
          value={filterStaff}
          onChange={(e) => setFilterStaff(e.target.value)}
          className="flex-1 bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-black transition-colors"
        >
          <option value="all">{sr.admin.svi_zaposleni}</option>
          {staffOptions.map((s) => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
        </div>
      ) : activities.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">{sr.admin.nema_aktivnosti}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {activities.map((activity) => (
            <div
              key={activity.id}
              className="bg-gray-50 rounded-lg p-4 border-l-4 hover:shadow-md transition-shadow"
              style={{
                borderLeftColor: activity.action === 'added_tokens' ? '#4CAF50' : activity.action === 'removed_tokens' ? '#DC2626' : '#000000',
              }}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2 min-w-0">
                  {activity.action === 'added_tokens' ? (
                    <>
                      <PlusCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                      <span className="text-sm font-semibold text-green-600">{sr.admin.dodati_tokeni}</span>
                    </>
                  ) : activity.action === 'removed_tokens' ? (
                    <>
                      <MinusCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                      <span className="text-sm font-semibold text-red-600">{sr.admin.oduzeti_tokeni}</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-5 h-5 text-black flex-shrink-0" />
                      <span className="text-sm font-semibold text-black">{sr.admin.verifikacija}</span>
                    </>
                  )}
                </div>
                <span className="text-xs text-gray-500 font-mono flex-shrink-0">
                  {activity.time}
                </span>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs px-2 py-0.5 bg-black text-white rounded-full font-medium">
                    {activity.staff_name}
                  </span>
                  <span className="text-xs text-gray-400">
                    {activity.date}
                  </span>
                </div>
                <p className="text-sm font-semibold text-gray-800 break-words">{activity.customer_name}</p>
                <p className="text-sm text-gray-600 break-words">{activity.details}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
