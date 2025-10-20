import { ArrowLeft, Check, Clock, X } from 'lucide-react';
import React from 'react';
import { AppHeader } from '../components/ui/AppHeader';
import { PersistentImage } from '../components/ui/PersistentImage';
import { useAuth } from '../hooks/useAuth';
import { useReceivedFollowRequests } from '../hooks/useFollowRequests';
import { useUserName } from '../hooks/useUserName';

interface FollowRequestManagementPageProps {
  onBackClick?: () => void;
}

export const FollowRequestManagementPage: React.FC<FollowRequestManagementPageProps> = ({
  onBackClick
}) => {
  const { user, userDoc } = useAuth();
  const { requests, loading, approveRequest, rejectRequest } = useReceivedFollowRequests();

  const handleApprove = async (requestId: string) => {
    if (window.confirm('このフォロー申請を承認しますか？')) {
      try {
        await approveRequest(requestId);
      } catch (error) {
        console.error('Error approving request:', error);
        alert('申請の承認に失敗しました');
      }
    }
  };

  const handleReject = async (requestId: string) => {
    if (window.confirm('このフォロー申請を拒否しますか？')) {
      try {
        await rejectRequest(requestId);
      } catch (error) {
        console.error('Error rejecting request:', error);
        alert('申請の拒否に失敗しました');
      }
    }
  };

  return (
    <div className="min-h-screen bg-background container-mobile">
      <AppHeader
        user={userDoc ? { 
          id: user?.uid || '', 
          name: userDoc.displayName || user?.displayName || 'ユーザー', 
          avatar: userDoc.photoURL || user?.photoURL || '', 
          cars: userDoc.cars || [], 
          interestedCars: userDoc.interestedCars || [] 
        } : { 
          id: user?.uid || '', 
          name: user?.displayName || 'ユーザー', 
          avatar: user?.photoURL || '', 
          cars: [], 
          interestedCars: [] 
        }}
        onNotificationClick={() => console.log('Notifications clicked')}
        onProfileClick={() => console.log('Profile clicked')}
        showTitle={true}
        showLogo={true}
        showSettings={false}
        showProfileButton={false}
      />

      <main className="p-4 pb-24">
        {/* ヘッダー */}
        <div className="flex items-center space-x-3 mb-6">
          <button
            onClick={onBackClick}
            className="p-2 rounded-xl bg-surface border border-surface-light hover:scale-95 active:scale-95 transition-transform shadow-sm"
          >
            <ArrowLeft size={20} className="text-text-primary" />
          </button>
          <h1 className="text-lg font-bold text-text-primary">フォロー申請</h1>
        </div>

        {/* 申請一覧 */}
        {loading ? (
          <div className="text-center py-8">
            <div className="text-sm text-gray-400">読み込み中...</div>
          </div>
        ) : requests.length === 0 ? (
          <div className="text-center py-8">
            <Clock size={48} className="text-gray-600 mx-auto mb-4" />
            <div className="text-sm text-gray-400">フォロー申請はありません</div>
          </div>
        ) : (
          <div className="space-y-4">
            {requests.map((request) => (
              <FollowRequestCard
                key={request.id}
                request={request}
                onApprove={() => handleApprove(request.id)}
                onReject={() => handleReject(request.id)}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

interface FollowRequestCardProps {
  request: any; // FollowRequest型
  onApprove: () => void;
  onReject: () => void;
}

const FollowRequestCard: React.FC<FollowRequestCardProps> = ({
  request,
  onApprove,
  onReject
}) => {
  const { displayName, photoURL, loading: userLoading } = useUserName(request.requesterId);

  return (
    <div className="bg-surface rounded-xl p-4 border border-surface-light">
      <div className="flex items-center space-x-3 mb-3">
        <div className="w-12 h-12 rounded-full overflow-hidden flex items-center justify-center bg-primary">
          {photoURL ? (
            <PersistentImage
              src={photoURL}
              alt={displayName || 'ユーザー'}
              className="w-full h-full object-cover"
              loading="eager"
              fallback={
                <span className="text-white text-lg font-bold">
                  {(displayName || 'U').charAt(0).toUpperCase()}
                </span>
              }
            />
          ) : (
            <span className="text-white text-lg font-bold">
              {(displayName || 'U').charAt(0).toUpperCase()}
            </span>
          )}
        </div>
        <div className="flex-1">
          <h3 className="text-base font-bold text-white">
            {userLoading ? '読み込み中...' : displayName || 'ユーザー'}
          </h3>
          <p className="text-sm text-gray-400">
            フォロー申請を送信しました
          </p>
        </div>
      </div>

      {request.message && (
        <div className="mb-3 p-3 bg-surface-light rounded-lg">
          <p className="text-sm text-gray-300">{request.message}</p>
        </div>
      )}

      <div className="flex space-x-2">
        <button
          onClick={onApprove}
          className="flex-1 py-2 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center space-x-2"
        >
          <Check size={16} />
          <span>承認</span>
        </button>
        <button
          onClick={onReject}
          className="flex-1 py-2 px-4 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center space-x-2"
        >
          <X size={16} />
          <span>拒否</span>
        </button>
      </div>
    </div>
  );
};
