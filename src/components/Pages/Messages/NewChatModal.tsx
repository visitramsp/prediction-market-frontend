"use client";

import React, { useState, useCallback, useEffect } from "react";
import { X, Search, Loader2, Users } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useSelector } from "react-redux";
import type { RootState } from "../../store/store";
import apiInstance from "../../service/apiInstance";
import { getFollowing } from "../../service/apiService/user";

interface NewChatModalProps {
  onClose: () => void;
  onSelectUser: (userId: number) => void;
}

interface SearchUser {
  id: number;
  email: string;
  preferences?: { username?: string; imageUrl?: string };
}

interface FollowingItem {
  id: number;
  followingUserId: number;
  following: {
    id?: number;
    username?: string;
    imageUrl?: string;
    email?: string;
  };
}

export default function NewChatModal({ onClose, onSelectUser }: NewChatModalProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [followingUsers, setFollowingUsers] = useState<SearchUser[]>([]);
  const [followingLoading, setFollowingLoading] = useState(true);

  const userId = useSelector(
    (state: RootState) => state.user?.user?.id
  ) as number | undefined;

  // Load followed users on mount
  useEffect(() => {
    if (!userId) {
      setFollowingLoading(false);
      return;
    }
    let cancelled = false;

    (async () => {
      try {
        const res = await getFollowing(userId, 20, 0);
        if (cancelled) return;
        const list: FollowingItem[] = res?.following?.detailList || [];
        const mapped: SearchUser[] = list.map((item) => ({
          id: item.following?.id || item.followingUserId,
          email: item.following?.email || "",
          preferences: {
            username: item.following?.username,
            imageUrl: item.following?.imageUrl,
          },
        }));
        setFollowingUsers(mapped);
      } catch {
        // ignore
      } finally {
        if (!cancelled) setFollowingLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [userId]);

  const handleSearch = useCallback(
    async (q: string) => {
      setQuery(q);
      if (q.trim().length < 2) {
        setResults([]);
        return;
      }
      setLoading(true);
      try {
        const res = await apiInstance.get("/user/search-users", {
          params: { search: q },
        });
        // Backend returns array directly in data field
        const users = Array.isArray(res.data.data) ? res.data.data : (res.data.data?.users || []);
        // Map to SearchUser shape (backend returns username/imageUrl as top-level fields)
        const mapped = users.map((u: Record<string, unknown>) => ({
          id: u.id,
          email: u.email || "",
          preferences: {
            username: u.username || (u.preferences as Record<string, unknown>)?.username,
            imageUrl: u.imageUrl || (u.preferences as Record<string, unknown>)?.imageUrl,
          },
        }));
        setResults(mapped);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const isSearching = query.trim().length >= 2;
  const displayUsers = isSearching ? results : followingUsers;
  const isLoading = isSearching ? loading : followingLoading;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 10 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 10 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          onClick={(e) => e.stopPropagation()}
          className="bg-[#111827]/95 backdrop-blur-xl rounded-2xl w-full max-w-md border border-white/[0.08] overflow-hidden shadow-2xl shadow-black/40"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
            <h3 className="text-white font-semibold font-poppins">New conversation</h3>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={onClose}
              className="p-1.5 rounded-xl hover:bg-white/[0.06] transition-colors"
            >
              <X className="w-5 h-5 text-[#94a3b8]" />
            </motion.button>
          </div>

          {/* Search */}
          <div className="p-4">
            <div className="relative group">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748b] group-focus-within:text-[#8160ee] transition-colors" />
              <input
                type="text"
                value={query}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Search people..."
                autoFocus
                className="w-full bg-white/[0.04] text-white text-sm rounded-xl pl-10 pr-4 py-2.5 border border-white/[0.08] focus:border-[#8160ee]/50 focus:bg-white/[0.06] focus:outline-none focus:ring-1 focus:ring-[#8160ee]/20 placeholder:text-[#4a5568] transition-all duration-200 font-poppins"
              />
            </div>
          </div>

          {/* Section label */}
          {displayUsers.length > 0 && !isLoading && (
            <div className="px-5 py-1.5">
              <p className="text-[11px] font-semibold text-[#4a5568] uppercase tracking-wider font-poppins">
                {isSearching ? "Search Results" : "People you follow"}
              </p>
            </div>
          )}

          {/* Results */}
          <div className="max-h-64 overflow-y-auto">
            {isLoading && (
              <div className="flex justify-center py-6">
                <Loader2 className="w-5 h-5 text-[#8160ee] animate-spin" />
              </div>
            )}
            {!isLoading && displayUsers.length === 0 && isSearching && (
              <p className="text-center text-sm text-[#4a5568] py-6 font-poppins">
                No users found
              </p>
            )}
            {!isLoading && displayUsers.length === 0 && !isSearching && (
              <div className="flex flex-col items-center justify-center py-8 px-6">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#8160ee]/20 to-[#7a48df]/10 flex items-center justify-center mb-3 border border-white/[0.06]">
                  <Users className="w-5 h-5 text-[#8160ee]/60" />
                </div>
                <p className="text-sm text-[#64748b] font-poppins mb-1">No followed users</p>
                <p className="text-xs text-[#4a5568] font-poppins text-center">Follow people to see them here, or search above</p>
              </div>
            )}
            {!isLoading && displayUsers.map((user) => {
              const username =
                user.preferences?.username || user.email.split("@")[0];
              const avatar = user.preferences?.imageUrl;
              return (
                <motion.button
                  key={user.id}
                  whileHover={{ backgroundColor: "rgba(255,255,255,0.03)" }}
                  onClick={() => onSelectUser(user.id)}
                  className="w-full flex items-center gap-3 px-5 py-3 transition-colors text-left"
                >
                  {avatar ? (
                    <img
                      src={avatar}
                      alt={username}
                      className="w-11 h-11 rounded-xl object-cover ring-2 ring-white/[0.06]"
                    />
                  ) : (
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#8160ee]/30 to-[#7a48df]/20 flex items-center justify-center text-sm font-semibold text-white ring-2 ring-white/[0.06]">
                      {username[0]?.toUpperCase()}
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-medium text-white font-poppins">{username}</p>
                    {user.email && (
                      <p className="text-xs text-[#4a5568] font-poppins">{user.email}</p>
                    )}
                  </div>
                </motion.button>
              );
            })}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
