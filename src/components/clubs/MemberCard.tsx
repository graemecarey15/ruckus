import { Link } from 'react-router-dom';
import type { ClubMember } from '@/types';
import { Avatar } from '@/components/ui/Avatar';

interface MemberCardProps {
  member: ClubMember;
  clubId: string;
}

export function MemberCard({ member, clubId }: MemberCardProps) {
  const profile = member.profile;
  if (!profile) return null;

  return (
    <Link
      to={`/club/${clubId}/member/${member.user_id}`}
      className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200 hover:shadow-sm transition-shadow"
    >
      <Avatar
        src={profile.avatar_url}
        name={profile.display_name || profile.username}
        size="md"
      />
      <div className="flex-1 min-w-0">
        <p className="font-medium text-gray-900 truncate">
          {profile.display_name || profile.username}
        </p>
        <p className="text-xs text-gray-500">@{profile.username}</p>
      </div>
      {member.role !== 'member' && (
        <span className="text-xs font-medium text-indigo-600 capitalize">
          {member.role}
        </span>
      )}
    </Link>
  );
}
