'use client';

import { useState } from 'react';
import { Conversation } from '@/types';
import { MessageCircle, Trash2, Edit2, Check, X } from 'lucide-react';

interface ConversationItemProps {
  conversation: Conversation;
  isActive: boolean;
  onSelect: () => void;
  onDelete: () => void;
}

export const ConversationItem = ({
  conversation,
  isActive,
  onSelect,
  onDelete,
}: ConversationItemProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(conversation.title);
  const [showActions, setShowActions] = useState(false);

  const handleSaveEdit = () => {
    // TODO: Implement title update API call
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditTitle(conversation.title);
    setIsEditing(false);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete();
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(true);
  };

  return (
    <div
      className={`
        group relative p-3 rounded-lg cursor-pointer transition-all duration-200
        ${isActive ? 'bg-gray-700 text-white' : 'hover:bg-gray-800 text-gray-300'}
      `}
      onClick={onSelect}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <div className="flex items-center gap-3">
        <MessageCircle size={16} className="text-gray-400 flex-shrink-0" />
        
        {isEditing ? (
          <div className="flex-1 flex items-center gap-2">
            <input
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              className="flex-1 bg-gray-600 text-white px-2 py-1 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSaveEdit();
                if (e.key === 'Escape') handleCancelEdit();
              }}
            />
            <button
              onClick={handleSaveEdit}
              className="p-1 hover:bg-gray-600 rounded"
            >
              <Check size={12} />
            </button>
            <button
              onClick={handleCancelEdit}
              className="p-1 hover:bg-gray-600 rounded"
            >
              <X size={12} />
            </button>
          </div>
        ) : (
          <>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{conversation.title}</p>
              <p className="text-xs text-gray-400 truncate">
                {conversation.messages.length} messages
              </p>
            </div>
            
            {showActions && !isEditing && (
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={handleEdit}
                  className="p-1 hover:bg-gray-600 rounded"
                >
                  <Edit2 size={12} />
                </button>
                <button
                  onClick={handleDelete}
                  className="p-1 hover:bg-gray-600 rounded text-red-400"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};