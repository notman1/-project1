import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, Flag, Search } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

interface Forum {
  id: string;
  title: string;
  status: string;
  created_at: string;
  users: {
    username: string;
  };
}

const AdminPanel = () => {
  const [forums, setForums] = useState<Forum[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const { profile } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!profile?.is_admin) {
      toast.error('Access denied. Admins only.');
      navigate('/');
      return;
    }

    fetchForums();
  }, [profile, searchTerm, statusFilter]);

  const fetchForums = async () => {
    let query = supabase
      .from('forums')
      .select(`
        *,
        users (
          username
        )
      `)
      .order('created_at', { ascending: false });

    if (searchTerm) {
      query = query.ilike('title', `%${searchTerm}%`);
    }

    if (statusFilter !== 'all') {
      query = query.eq('status', statusFilter);
    }

    const { data, error } = await query;
    if (error) console.error('Error fetching forums:', error);
    else setForums(data || []);
  };

  const handleUpdateStatus = async (forumId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('forums')
        .update({ status: newStatus })
        .eq('id', forumId);

      if (error) throw error;

      toast.success('Forum status updated successfully!');
      fetchForums();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  if (!profile?.is_admin) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Shield className="h-8 w-8 text-white" />
        <h1 className="text-3xl font-bold text-white">Admin Panel</h1>
      </div>

      <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 space-y-4">
        <div className="flex space-x-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search forums..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg bg-white/20 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 rounded-lg bg-white/20 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="all">All Status</option>
            <option value="open">Open</option>
            <option value="closed">Closed</option>
            <option value="solved">Solved</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-gray-300 border-b border-white/10">
                <th className="pb-2">Title</th>
                <th className="pb-2">Author</th>
                <th className="pb-2">Created</th>
                <th className="pb-2">Status</th>
                <th className="pb-2">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {forums.map((forum) => (
                <motion.tr
                  key={forum.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-white"
                >
                  <td className="py-3">
                    <a
                      href={`/forum/${forum.id}`}
                      className="hover:text-purple-300 transition"
                    >
                      {forum.title}
                    </a>
                  </td>
                  <td className="py-3">{forum.users?.username}</td>
                  <td className="py-3">
                    {format(new Date(forum.created_at), 'MMM d, yyyy')}
                  </td>
                  <td className="py-3">
                    <span className={`px-2 py-1 rounded text-xs ${
                      forum.status === 'open'
                        ? 'bg-green-500'
                        : forum.status === 'solved'
                        ? 'bg-blue-500'
                        : 'bg-red-500'
                    }`}>
                      {forum.status}
                    </span>
                  </td>
                  <td className="py-3">
                    <div className="relative group">
                      <button className="p-2 hover:bg-white/10 rounded-full transition">
                        <Flag className="h-5 w-5" />
                      </button>
                      <div className="absolute left-0 mt-2 w-48 bg-white rounded-lg shadow-lg invisible group-hover:visible">
                        <button
                          onClick={() => handleUpdateStatus(forum.id, 'open')}
                          className="block w-full text-left px-4 py-2 text-gray-800 hover:bg-gray-100"
                        >
                          Mark as Open
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(forum.id, 'closed')}
                          className="block w-full text-left px-4 py-2 text-gray-800 hover:bg-gray-100"
                        >
                          Mark as Closed
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(forum.id, 'solved')}
                          className="block w-full text-left px-4 py-2 text-gray-800 hover:bg-gray-100"
                        >
                          Mark as Solved
                        </button>
                      </div>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
