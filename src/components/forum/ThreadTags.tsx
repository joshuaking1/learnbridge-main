// src/components/forum/ThreadTags.tsx
import React from 'react';
import Link from 'next/link';

interface Props {
  tags: string[];
  onClick?: (tag: string) => void;
}

const ThreadTags: React.FC<Props> = ({ tags, onClick }) => {
  if (!tags || tags.length === 0) return null;

  // Define tag color mapping based on common educational categories
  const getTagColor = (tag: string): string => {
    tag = tag.toLowerCase();
    
    // Subject categories
    if (tag.includes('math')) return 'bg-blue-100 text-blue-800';
    if (tag.includes('science') || tag.includes('biology') || tag.includes('chemistry') || tag.includes('physics')) {
      return 'bg-green-100 text-green-800';
    }
    if (tag.includes('english') || tag.includes('literature') || tag.includes('writing')) {
      return 'bg-purple-100 text-purple-800';
    }
    if (tag.includes('history') || tag.includes('social')) {
      return 'bg-yellow-100 text-yellow-800';
    }
    if (tag.includes('art') || tag.includes('music')) {
      return 'bg-pink-100 text-pink-800';
    }
    if (tag.includes('computer') || tag.includes('programming') || tag.includes('coding')) {
      return 'bg-indigo-100 text-indigo-800';
    }
    
    // Grade levels
    if (tag.includes('jhs')) return 'bg-orange-100 text-orange-800';
    if (tag.includes('shs')) return 'bg-red-100 text-red-800';
    
    // Post types
    if (tag.includes('question') || tag.includes('help')) return 'bg-teal-100 text-teal-800';
    if (tag.includes('resource') || tag.includes('material')) return 'bg-cyan-100 text-cyan-800';
    if (tag.includes('discussion')) return 'bg-violet-100 text-violet-800';
    
    // Default color
    return 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="flex flex-wrap gap-2 mt-3">
      {tags.map(tag => {
        // Format the tag for display (capitalize first letter, replace underscores with spaces)
        const formattedTag = tag.charAt(0).toUpperCase() + tag.slice(1).replace(/_/g, ' ');
        const tagColor = getTagColor(tag);
        
        if (onClick) {
          return (
            <button
              key={tag}
              onClick={() => onClick(tag)}
              className={`${tagColor} px-2.5 py-0.5 rounded-full text-xs font-medium hover:opacity-80 transition-opacity`}
            >
              {formattedTag}
            </button>
          );
        }
        
        return (
          <Link 
            key={tag}
            href={`/forum/tag/${tag}`}
          >
            <span className={`${tagColor} px-2.5 py-0.5 rounded-full text-xs font-medium hover:opacity-80 transition-opacity cursor-pointer`}>
              {formattedTag}
            </span>
          </Link>
        );
      })}
    </div>
  );
};

export default ThreadTags;
