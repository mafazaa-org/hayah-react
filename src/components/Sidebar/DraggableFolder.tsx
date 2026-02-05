import React from 'react';
import { Draggable, Droppable } from '@hello-pangea/dnd';
import { ChevronDown, ChevronLeft, Folder, Hash, MoreHorizontal, Plus } from 'lucide-react';
import type { NavigationItem } from '../../services/folderService';
import { useFolderStore } from '../../store/useFolderStore';
import { useNavigate } from 'react-router-dom';

interface DraggableFolderProps {
  item: NavigationItem;
  index: number;
  depth?: number;
  onContextMenu: (e: React.MouseEvent, item: NavigationItem) => void;
  onCreateClick: (e: React.MouseEvent, item: NavigationItem) => void;
}

export const DraggableFolder: React.FC<DraggableFolderProps> = ({
  item,
  index,
  depth = 0,
  onContextMenu,
  onCreateClick
}) => {
  const navigate = useNavigate();
  const toggleFolder = useFolderStore(state => state.toggleFolder);

  // Use store state for openness, fallback to item.isOpen
  const isOpen = item.isOpen;

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleFolder(item.id, !isOpen);
  };

  const handleClick = () => {
    if (item.type === 'list') {
      navigate(`/dashboard/list/${item.id}`);
    } else {
      toggleFolder(item.id, !isOpen);
    }
  };

  const paddingRight = `${depth * 12 + 12}px`;

  return (
    <Draggable draggableId={item.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          style={{ ...provided.draggableProps.style }} // Essential for dnd positioning
        >
          <div
            onClick={handleClick}
            className={`
              group flex items-center justify-between py-1.5 pr-2 pl-2 mx-2 my-0.5 rounded-md
              text-sm cursor-pointer select-none transition-colors
              ${item.type === 'list' && window.location.pathname.includes(item.id) ? 'bg-blue-500/20 text-blue-100' : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/50'}
              ${snapshot.isDragging ? 'bg-slate-800 shadow-lg opacity-80' : ''}
            `}
            style={{ paddingRight }}
          >
            <div className="flex items-center gap-2 overflow-hidden">
              {/* Toggle chevron only for folders */}
              {item.type === 'folder' ? (
                <button
                  onClick={handleToggle}
                  className="p-0.5 hover:bg-slate-700 rounded text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {isOpen ? <ChevronDown size={14} /> : <ChevronLeft size={14} className="rtl:rotate-180" />}
                </button>
              ) : (
                <span className="w-[18px]" /> // Spacer
              )}

              <span className={`${item.type === 'folder' ? 'text-blue-400' : 'text-slate-500'}`}>
                {item.type === 'folder' ? <Folder size={16} /> : <Hash size={16} />}
              </span>

              <span className="truncate">{item.name}</span>
            </div>

            {/* Hover Actions */}
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              {item.type === 'folder' && (
                <button
                  onClick={(e) => onCreateClick(e, item)}
                  className="p-1 hover:bg-slate-700 rounded text-slate-500 hover:text-slate-300" title="إضافة"
                >
                  <Plus size={12} />
                </button>
              )}
              <button
                onClick={(e) => onContextMenu(e, item)}
                className="p-1 hover:bg-slate-700 rounded text-slate-500 hover:text-slate-300" title="خيارات"
              >
                <MoreHorizontal size={12} />
              </button>
            </div>
          </div>

          {/* Recursive Children (Droppable Zone) */}
          {item.type === 'folder' && isOpen && (
            <Droppable droppableId={item.id} type="FOLDER_ITEM">
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className="border-r border-slate-800 mr-[19px] ml-0"
                >
                  {item.children?.map((child, index) => (
                    <DraggableFolder
                      key={child.id}
                      item={child}
                      index={index}
                      depth={depth + 1}
                      onContextMenu={onContextMenu}
                      onCreateClick={onCreateClick}
                    />
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          )}
        </div>
      )}
    </Draggable>
  );
};
