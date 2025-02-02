import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, X } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

const CreateForum = () => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tag, setTag] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleAddTag = () => {
    if (tag && !tags.includes(tag)) {
      setTags([...tags, tag]);
      setTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(t => t !== tagToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast.error('You must be logged in to create a forum');
      return;
    }

    try {
      const { error } = await supabase
        .from('forums')
        .insert([
          {
            title,
            content,
            tags,
            user_id: user.id,
          },
        ]);

      if (error) throw error;

      toast.success('Forum created successfully!');
      navigate('/');
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl mx-auto"
    >
      <div className="bg-white/10 backdrop-blur-md rounded-lg p-8">
        <h2 className="text-3xl font-bold text-white mb-6">Create New Forum</h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Title
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2 rounded-lg bg-white/20 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Enter forum title"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Content
            </label>
            <textarea
              required
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={6}
              className="w-full px-4 py-2 rounded-lg bg-white/20 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Enter forum content"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Tags
            </label>
            <div className="flex space-x-2">
              <input
                type="text"
                value={tag}
                onChange={(e) => setTag(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                className="flex-1 px-4 py-2 rounded-lg bg-white/20 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Add tags"
              />
              <motion.button
                type="button"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleAddTag}
                className="flex items-center justify-center w-10 h-10 rounded-lg bg-purple-600 text-white hover:bg-purple-700 transition"
              >
                <Plus className="h-5 w-5" />
              </motion.button>
            </div>
            
            <div className="flex flex-wrap gap-2 mt-2">
              {tags.map((t) => (
                <motion.span
                  key={t}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="flex items-center space-x-1 bg-purple-600 text-white px-3 py-1 rounded-full text-sm"
                >
                  <span>{t}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(t)}
                    className="hover:text-red-300 transition"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </motion.span>
              ))}
            </div>
          </div>
          
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition"
          >
            Create Forum
          </motion.button>
        </form>
      </div>
    </motion.div>
  );
};

export default CreateForum;
