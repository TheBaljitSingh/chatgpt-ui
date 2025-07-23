'use client';

import { useState, useEffect } from 'react';
import { Message } from '@/types';
import { X, Save } from 'lucide-react';
import TextareaAutosize from 'react-textarea-autosize';

interface EditMessageModalProps {
  message: Message;
  onSave: (messageId: string, newContent: string) => void;
  onCancel: () => void;
}

export const EditMessageModal = ({ message, onSave, onCancel, onClose }: EditMessageModalProps) => {
  const [content, setContent] = useState(message.content);

  useEffect(() => {
    setContent(message.content);
  }, [message.content]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (content.trim()) {
      onSave(message.id, content);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-600">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Edit Message
          </h2>
          <button
            onClick={onCancel}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-4">
          <TextareaAutosize
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Edit your message..."
            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            minRows={3}
            maxRows={12}
            autoFocus
          />

          {/* Actions */}
          <div className="flex justify-end gap-2 mt-4">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!content.trim()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              <Save size={16} />
              Save & Regenerate
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};