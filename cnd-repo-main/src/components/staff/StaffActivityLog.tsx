import { PlusCircle, MinusCircle, CheckCircle } from 'lucide-react';
import { User } from '../../types';

interface StaffActivityLogProps {
  staffUser: User;
}

export default function StaffActivityLog({ staffUser }: StaffActivityLogProps) {
  const activities = staffUser.activityLog || [];
  const sortedActivities = [...activities].reverse().slice(0, 20);

  if (activities.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">Nema aktivnosti</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-black">Nedavna aktivnost</h3>
      <div className="space-y-3">
        {sortedActivities.map((activity) => (
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
                    <span className="text-sm font-semibold text-green-600">Dodati tokeni</span>
                  </>
                ) : activity.action === 'removed_tokens' ? (
                  <>
                    <MinusCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                    <span className="text-sm font-semibold text-red-600">Oduzeti tokeni</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5 text-black flex-shrink-0" />
                    <span className="text-sm font-semibold text-black">Verifikovano iskorišćenje</span>
                  </>
                )}
              </div>
              <span className="text-xs text-gray-500 font-mono flex-shrink-0">
                {activity.time}
              </span>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-gray-500">
                {new Date(`${activity.date}T${activity.time}`).toLocaleDateString()}
              </p>
              <p className="text-sm font-semibold text-gray-800 break-words">{activity.customerName}</p>
              <p className="text-sm text-gray-600 break-words">{activity.details}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
