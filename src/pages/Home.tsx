import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MessageSquarePlus, Search, Tag } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { format } from 'date-fns';

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

const Home = () => {
  const [forums, setForums] = useState<Forum[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    fetchForums();
    fetchTags();
  }, [searchTerm, selectedTags]);

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

    if (selectedTags.length > 0) {
      query = query.contains('tags', selectedTags);
    }

    const { data, error } = await query;
    if (error) console.error('Error fetching forums:', error);
    else setForums(data || []);
  };

  const fetchTags = async () => {
    const { data, error } = await supabase
      .from('forums')
      .select('tags');
    
    if (error) console.error('Error fetching tags:', error);
    else {
      const uniqueTags = Array.from(new Set(data?.flatMap(forum => forum.tags || [])));
      setAvailableTags(uniqueTags);
    }
  };

  const toggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-white">Forums</h1>
        {user && (
          <Link to="/create">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center space-x-2 bg-white text-purple-600 px-4 py-2 rounded-lg hover:bg-purple-50 transition"
            >
              <MessageSquarePlus className="h-5 w-5" />
              <span>Create Forum</span>
            </motion.button>
          </Link>
        )}
      </div>

      <div className="bg-white/10 backdrop-blur-md rounded-lg p-4 space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            placeholder="Search forums..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg bg-white/20 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {availableTags.map(tag => (
            <motion.button
              key={tag}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => toggleTag(tag)}
              className={`flex items-center space-x-1 px-3 py-1 rounded-full text-sm ${
                selectedTags.includes(tag)
                  ? 'bg-purple-600 text-white'
                  : 'bg-white/20 text-white hover:bg-white/30'
              }`}
            >
              <Tag className="h-3 w-3" />
              <span>{tag}</span>
            </motion.button>
          ))}
        </div>
      </div>

      <div className="grid gap-4">
        {forums.map((forum) => (
          <motion.div
            key={forum.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/10 backdrop-blur-md rounded-lg p-6 hover:bg-white/20 transition"
          >
            <Link to={`/forum/${forum.id}`}>
              <div className="space-y-2">
                <div className="flex justify-between items-start">
                  <h2 className="text-xl font-semibold text-white">{forum.title}</h2>
                  <span className={`px-2 py-1 rounded text-xs ${
                    forum.status === 'open'
                      ? 'bg-green-500 text-white'
                      : 'bg-red-500 text-white'
                  }`}>
                    {forum.status}
                  </span>
                </div>
                <p className="text-gray-300 line-clamp-2">{forum.content}</p>
                <div className="flex flex-wrap gap-2">
                  {forum.tags?.map(tag => (
                    <span
                      key={tag}
                      className="bg-white/20 text-white px-2 py-1 rounded-full text-xs"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="flex justify-between items-center text-sm text-gray-300">
                  <span>By {forum.users?.username}</span>
                  <div className="flex items-center space-x-4">
                    <span>{forum.likes_count} likes</span>
                    <span>{format(new Date(forum.created_at), 'MMM d, yyyy')}</span>
                  </div>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Home;
