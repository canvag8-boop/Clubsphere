import React, { useState, useEffect } from 'react';
import { Club } from '../types';
import { apiService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { DynamicIcon } from '../components/DynamicIcon';
import { triggerPointsCelebration } from '../utils/confetti';
import {
  Search,
  Users,
  MapPin,
  Calendar,
  Sparkles,
  Check,
  Plus,
  Loader2,
  ArrowRight,
  Trash2,
  Shield,
} from 'lucide-react';

interface ClubsViewProps {
  onSelectClub: (clubId: string) => void;
  onOpenCreateClub?: () => void;
  onEditClub?: (club: Club) => void;
}

export const ClubsView: React.FC<ClubsViewProps> = ({ onSelectClub, onOpenCreateClub, onEditClub }) => {
  const { user, role, refreshUser } = useAuth();
  const { success, error } = useToast();

  const [clubs, setClubs] = useState<Club[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [joiningClubId, setJoiningClubId] = useState<string | null>(null);
  const [deletingClubId, setDeletingClubId] = useState<string | null>(null);

  const fetchClubs = async () => {
    try {
      setIsLoading(true);
      const res = await apiService.getClubs(user?.id);
      setClubs(res.clubs);
    } catch (err) {
      console.error('Failed to load clubs:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchClubs();
  }, [user]);

  const handleJoinClub = async (e: React.MouseEvent, club: Club) => {
    e.stopPropagation();
    if (!user) {
      error('Please sign in to join clubs');
      return;
    }

    if (role === 'admin') {
      error('Administrators manage clubs and cannot participate as student members.');
      return;
    }

    setJoiningClubId(club.id);
    try {
      const res = await apiService.joinClub(club.id, user.id);
      triggerPointsCelebration();
      success(`Welcome to ${club.name}!`, 'You earned participation points for joining.', res.pointsAwarded || 25);
      await refreshUser();
      await fetchClubs();
    } catch (err: any) {
      error(err.message || 'Error joining club');
    } finally {
      setJoiningClubId(null);
    }
  };

  const handleDeleteClub = async (e: React.MouseEvent, club: Club) => {
    e.stopPropagation();
    if (!confirm(`Are you sure you want to permanently delete "${club.name}" and all its records?`)) {
      return;
    }
    setDeletingClubId(club.id);
    try {
      const res = await apiService.deleteClub(club.id);
      success('Club Deleted', res.message);
      await refreshUser();
      await fetchClubs();
    } catch (err: any) {
      error(err.message || 'Failed to delete club');
    } finally {
      setDeletingClubId(null);
    }
  };

  const categories = ['All', ...Array.from(new Set(clubs.map((c) => c.category)))];

  const filteredClubs = clubs.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || c.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">College Clubs Directory</h1>
          <p className="text-sm text-slate-500 mt-1">
            Discover passionate communities across engineering, sports, music, and the arts.
          </p>
        </div>

        {role === 'admin' && onOpenCreateClub && (
          <button
            onClick={onOpenCreateClub}
            className="px-4 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md shadow-indigo-600/20 flex items-center gap-1.5 shrink-0 self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" /> Register New Club
          </button>
        )}
      </div>

      {/* Search and Category Filters */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search Coding, Robotics, Sports, Music, Photography..."
            className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-navy-900 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Clubs Grid */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center min-h-[350px]">
          <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mb-3" />
          <p className="text-sm font-semibold text-slate-500">Loading clubs directory...</p>
        </div>
      ) : filteredClubs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClubs.map((club) => {
            const isJoining = joiningClubId === club.id;

            return (
              <div
                key={club.id}
                onClick={() => onSelectClub(club.id)}
                className="bg-white rounded-2xl border border-slate-200/80 hover:border-indigo-300 hover:shadow-card transition-all flex flex-col overflow-hidden cursor-pointer group"
              >
                {/* Banner Header */}
                <div className={`p-5 bg-gradient-to-r ${club.banner_gradient || 'from-blue-600 to-indigo-700'} text-white relative`}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-md">
                      <DynamicIcon name={club.logo_icon} className="w-6 h-6 text-white" />
                    </div>

                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-white/20 backdrop-blur-md text-white">
                      {club.category}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-white mt-3 tracking-tight group-hover:underline decoration-white/50">
                    {club.name}
                  </h3>

                  <p className="text-white/80 text-xs mt-1 flex items-center gap-2">
                    <Users className="w-3.5 h-3.5" />
                    <span>{club.member_count} Members</span>
                    {club.upcoming_events_count !== undefined && club.upcoming_events_count > 0 && (
                      <>
                        <span>•</span>
                        <span>{club.upcoming_events_count} Upcoming</span>
                      </>
                    )}
                  </p>
                </div>

                {/* Body */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">{club.description}</p>

                  <div className="space-y-2 pt-2 border-t border-slate-100 text-xs text-slate-500">
                    <div className="flex items-center gap-2 truncate">
                      <Calendar className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                      <span className="truncate">{club.meeting_schedule}</span>
                    </div>
                    <div className="flex items-center gap-2 truncate">
                      <MapPin className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                      <span className="truncate">{club.location}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-slate-500 group-hover:text-indigo-600 flex items-center gap-1 transition-colors">
                        View Details <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                      </span>
                      {role === 'admin' && (
                        <div className="flex items-center gap-1">
                          {onEditClub && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onEditClub(club);
                              }}
                              className="px-2 py-0.5 rounded-lg text-[11px] font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 transition-colors"
                            >
                              Edit
                            </button>
                          )}
                          <button
                            onClick={(e) => handleDeleteClub(e, club)}
                            disabled={deletingClubId === club.id}
                            className="px-2 py-0.5 rounded-lg text-[11px] font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors flex items-center gap-1 disabled:opacity-50"
                            title="Delete Club"
                          >
                            {deletingClubId === club.id ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              <>
                                <Trash2 className="w-3 h-3" /> Delete
                              </>
                            )}
                          </button>
                        </div>
                      )}
                    </div>

                    {role === 'admin' ? (
                      <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                        <Shield className="w-3.5 h-3.5 text-indigo-500" /> Controller
                      </span>
                    ) : club.isMember ? (
                      <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <Check className="w-3.5 h-3.5" /> Joined
                      </span>
                    ) : (
                      <button
                        onClick={(e) => handleJoinClub(e, club)}
                        disabled={isJoining}
                        className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm flex items-center gap-1 transition-all disabled:opacity-50"
                      >
                        {isJoining ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <>
                            Join Club
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 shadow-sm">
          <Search className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">No clubs match your search</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Try adjusting your search query or select another category filter above.
          </p>
        </div>
      )}
    </div>
  );
};
