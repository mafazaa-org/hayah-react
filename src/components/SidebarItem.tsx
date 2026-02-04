import { useState } from 'react';
import { ChevronDown, ChevronLeft, Folder, Hash, MoreHorizontal, Plus } from 'lucide-react';
import type { NavigationItem } from '../services/folderService';
import { useNavigate } from 'react-router-dom';

interface SidebarItemProps {
  item: NavigationItem;
  depth?: number;
}

export function SidebarItem({ item, depth = 0 }: SidebarItemProps) {
  const [isOpen, setIsOpen] = useState(item.isOpen ?? false); // Default to closed unless specified
  const navigate = useNavigate();

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsOpen(!isOpen);
  };

  const handleClick = () => {
    if (item.type === 'list') {
      navigate(`/dashboard/list/${item.id}`);
    } else {
      setIsOpen(!isOpen);
    }
  };

  // Indentation calc
  const paddingRight = `${depth * 12 + 12}px`; // RTL: paddingRight for nesting

  return (
    <div>
      <div
        onClick={handleClick}
        className="group flex items-center justify-between py-1.5 pr-2 pl-2 text-sm text-slate-400 hover:text-slate-100 hover:bg-slate-800/50 cursor-pointer transition-colors rounded-md mx-2 my-0.5 select-none"
        style={{ paddingRight }}
      >
        <div className="flex items-center gap-2 overflow-hidden">
          {item.type === 'folder' && (
            <button
              onClick={handleToggle}
              className="p-0.5 hover:bg-slate-700 rounded text-slate-500 hover:text-slate-300 transition-colors"
            >
              {isOpen ? <ChevronDown size={14} /> : <ChevronLeft size={14} className="rtl:rotate-180" />}
              {/* Note: In RTL context, ChevronLeft points left (which effectively opens 'inwards' or needs rotation logic depending on preference). 
                    Usually standard ChevronLeft points "end", ChevronDown points "open".
                */}
            </button>
          )}

          <span className={`${item.type === 'folder' ? 'text-blue-400' : 'text-slate-500'}`}>
            {item.type === 'folder' ? <Folder size={16} /> : <Hash size={16} />}
          </span>

          <span className="truncate">{item.name}</span>
        </div>

        {/* Hover Actions (Create/Menu) */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {item.type === 'folder' && (
            <button className="p-1 hover:bg-slate-700 rounded text-slate-500 hover:text-slate-300" title="إضافة">
              <Plus size={12} />
            </button>
          )}
          <button className="p-1 hover:bg-slate-700 rounded text-slate-500 hover:text-slate-300" title="خيارات">
            <MoreHorizontal size={12} />
          </button>
        </div>
      </div>

      {/* Recursive Children */}
      {item.type === 'folder' && isOpen && item.children && (
        <div className="border-r border-slate-800 mr-[19px] ml-0"> {/* RTL: guide line on right */}
          {item.children.map(child => (
            <SidebarItem key={child.id} item={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
}
