import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, MessageSquare, Flag } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

interface Reply {
  id: string;
  content: string;
  created_at: string;
  likes_count: number;
  users: {
    username: string;
  };
}

interface Forum {
  id: string;
  title: string;
  content: string;
  status: string;
  tags: string[];
  likes_count: number;
  created_at: string;
  users: {
    username: string;
  };
}

const ForumDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [forum, setForum] = useState<Forum | null>(null);
  const [replies, setReplies] = useState<Reply[]>([]);
  const [newReply, setNewReply] = useState('');
  const { user, profile } = useAuth();

  useEffect(() => {
    fetchForum();
    fetchReplies();
  }, [id]);

  const fetchForum = async () => {
    if (!id) return;
    
    const { data, error } = await supabase
      .from('forums')
      .select(`
        *,
        users (
          username
        )
      `)
      .eq('id', id)
      .single();

    if (error) console.error('Error fetching forum:', error);
    else setForum(data);
  };

  const fetchReplies = async () => {
    if (!id) return;
    
    const { data, error } = await supabase
      .from('replies')
      .select(`
        *,
        users (
          username
        )
      `)
      .eq('forum_id', id)
      .order('created_at', { ascending: true });

    if (error) console.error('Error fetching replies:', error);
    else setReplies(data || []);
  };

  const handleSubmitReply = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error('You must be logged in to reply');
      return;
    }

    try {
      const { error } = await supabase
        .from('replies')
        .insert([
          {
            content: newReply,
            forum_id: id,
            user_id: user.id,
          },
        ]);

      if (error) throw error;

      toast.success('Reply posted successfully!');
      setNewReply('');
      fetchReplies();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleLike = async (targetId: string, targetType: 'forum' | 'reply') => {
    if (!user) {
      toast.error('You must be logged in to like');
      return;
    }

    try {
      const { error } = await supabase
        .from('likes')
        .insert([
          {
            user_id: user.id,
            target_id: targetId,
            target_type: targetType,
          },
        ]);

      if (error) {
        if (error.code === '23505') {
          // Unique violation - user already liked
          await supabase
            .from('likes')
            .delete()
            .match({
              user_id: user.id,
              target_id: targetId,
              target_type: targetType,
            });
        } else throw error;
      }

      if (targetType === 'forum') fetchForum();
      else fetchReplies();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleUpdateStatus = async (newStatus: string) => {
    if (!profile?.is_admin) {
      toast.error('Only admins can update forum status');
      return;
    }

    try {
      const { error } = await supabase
        .from('forums')
        .update({ status: newStatus })
        .eq('id', id);

      if (error) throw error;

      toast.success('Forum status updated successfully!');
      fetchForum();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  if (!forum) return null;

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/10 backdrop-blur-md rounded-lg p-6"
      >
        <div className="space-y-4">
          <div className="flex justify-between items-start">
            <h1 className="text-3xl font-bold text-white">{forum.title}</h1>
            <div className="flex items-center space-x-2">
              <span className={`px-3 py-1 rounded-full text-sm ${
                forum.status === 'open'
                  ? 'bg-green-500 text-white'
                  : 'bg-red-500 text-white'
              }`}>
                {forum.status}
              </span>
              {profile?.is_admin && (
                <div className="relative group">
                  <button
                    className="p-2 hover:bg-white/10 rounded-full transition"
                  >
                    <Flag className="h-5 w-5 text-white" />
                  </button>
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg invisible group-hover:visible">
                    <button
                      onClick={() => handleUpdateStatus('open')}
                      className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                    >
                      Mark as Open
                    </button>
                    <button
                      onClick={() => handleUpdateStatus('closed')}
                      className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                    >
                      Mark as Closed
                    </button>
                    <button
                      onClick={() => handleUpdateStatus('solved')}
                      className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                    >
                      Mark as Solved
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <p className="text-gray-300 whitespace-pre-wrap">{forum.content}</p>
          
          <div className="flex flex-wrap gap-2">
            {forum.tags?.map(tag => (
              <span
                key={tag}
                className="bg-white/20 text-white px-3 py-1 rounded-full text-sm"
              >
                {tag}
              </span>
            ))}
          </div>
          
          <div className="flex justify-between items-center text-sm text-gray-300">
            <span>By {forum.users?.username}</span>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => handleLike(forum.id, 'forum')}
                className="flex items-center space-x-1 hover:text-red-400 transition"
              >
                <Heart className="h-4 w-4" />
                <span>{forum.likes_count}</span>
              </button>
              <span>{format(new Date(forum.created_at), 'MMM d, yyyy')}</span>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="space-y-4">
        <div className="flex items-center space-x-2 text-white">
          <MessageSquare className="h-5 w-5" />
          <h2 className="text-xl font-semibold">Replies</h2>
        </div>

        {user ? (
          <form onSubmit={handleSubmitReply} className="space-y-4">
            <textarea
              value={newReply}
              onChange={(e) => setNewReply(e.target.value)}
              placeholder="Write your reply..."
              rows={4}
              className="w-full px-4 py-2 rounded-lg bg-white/20 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
              required
            />
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition"
            >
              Post Reply
            </motion.button>
          </form>
        ) : (
          <p className="text-white/60">Please log in to reply</p>
        )}

        <div className="space-y-4">
          {replies.map((reply) => (
            <motion.div
              key={reply.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/5 backdrop-blur-md rounded-lg p-4"
            >
              <div className="space-y-2">
                <p className="text-white whitespace-pre-wrap">{reply.content}</p>
                <div className="flex justify-between items-center text-sm text-gray-300">
                  <span>By {reply.users?.username}</span>
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={() => handleLike(reply.id, 'reply')}
                      className="flex items-center space-x-1 hover:text-red-400 transition"
                    >
                      <Heart className="h-4 w-4" />
                      <span>{reply.likes_count}</span>
                    </button>
                    <span>{format(new Date(reply.created_at), 'MMM d, yyyy')}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ForumDetail;
