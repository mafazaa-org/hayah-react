import React, { useEffect, useState } from 'react';
import { DragDropContext, Droppable } from '@hello-pangea/dnd';
import type { DropResult } from '@hello-pangea/dnd';
import { useFolderStore } from '../../store/useFolderStore';
import { useListStore } from '../../store/useListStore';
import { DraggableFolder } from './DraggableFolder';
import type { NavigationItem } from '../../services/folderService';
import { FolderContextMenu } from './FolderContextMenu';
import { ListContextMenu } from './ListContextMenu';
import { FolderModals } from './FolderModals';
import { CreateListModal } from '../List/CreateListModal';
import { ListSettingsModal } from '../List/ListSettingsModal';

export function FolderTree() {
  const { tree, fetchTree, isLoading, addItem, updateItemName, deleteItem } = useFolderStore();
  const { openCreateModal, openSettingsModal, duplicateList, archiveList } = useListStore();

  // Local state for context menu and modals (folder only, lists utilize useListStore mostly)
  const [contextMenu, setContextMenu] = useState<{ x: number, y: number, item: NavigationItem } | null>(null);
  const [modalState, setModalState] = useState<{ type: 'create' | 'rename' | 'delete', item?: NavigationItem, parentId?: string | null } | null>(null);

  useEffect(() => {
    fetchTree();
  }, []);

  const onDragEnd = (result: DropResult) => {
    const { source, destination, draggableId } = result;

    if (!destination) return;
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    // Placeholder for move logic
    console.log('Moved', draggableId, 'from', source, 'to', destination);
  };

  const handleContextMenu = (e: React.MouseEvent, item: NavigationItem) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({ x: e.clientX, y: e.clientY, item });
  };

  const handleCreateClick = (e: React.MouseEvent, item: NavigationItem) => {
    e.stopPropagation();
    openCreateModal(item.id);
  };

  const closeContextMenu = () => setContextMenu(null);

  if (isLoading) {
    return <div className="p-4 text-sm text-slate-500 text-center">جاري التحميل...</div>;
  }

  return (
    <>
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="root" type="FOLDER_ITEM">
          {(provided) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="pb-4"
              onClick={closeContextMenu} // Close menu on bg click
            >
              {tree.map((item, index) => (
                <DraggableFolder
                  key={item.id}
                  item={item}
                  index={index}
                  onContextMenu={handleContextMenu}
                  onCreateClick={handleCreateClick}
                />
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      {contextMenu && (
        contextMenu.item.type === 'list' ? (
          <ListContextMenu
            x={contextMenu.x}
            y={contextMenu.y}
            item={contextMenu.item}
            onClose={closeContextMenu}
            onRename={() => { setModalState({ type: 'rename', item: contextMenu.item }); closeContextMenu(); }}
            onDelete={() => { setModalState({ type: 'delete', item: contextMenu.item }); closeContextMenu(); }}
            onDuplicate={() => { duplicateList(contextMenu.item.id, false); closeContextMenu(); }}
            onArchive={() => { archiveList(contextMenu.item.id, true); closeContextMenu(); }}
            onSettings={() => { openSettingsModal(contextMenu.item.id); closeContextMenu(); }}
            onSaveTemplate={() => { console.log('Save template not impl'); closeContextMenu(); }}
          />
        ) : (
          <FolderContextMenu
            x={contextMenu.x}
            y={contextMenu.y}
            item={contextMenu.item}
            onClose={closeContextMenu}
            onRename={() => { setModalState({ type: 'rename', item: contextMenu.item }); closeContextMenu(); }}
            onDelete={() => { setModalState({ type: 'delete', item: contextMenu.item }); closeContextMenu(); }}
            onCreateList={() => { openCreateModal(contextMenu.item.id); closeContextMenu(); }}
          />
        )
      )}

      {/* Modals */}
      <CreateListModal />
      <ListSettingsModal />

      {modalState && (
        <FolderModals
          isOpen={!!modalState}
          type={modalState.type}
          item={modalState.item}
          parentId={modalState.parentId}
          onClose={() => setModalState(null)}
          onConfirm={async (data: { name: string; type: 'folder' | 'list' }) => {
            if (modalState.type === 'create') {
              await addItem(modalState.parentId || null, data.type, data.name);
            } else if (modalState.type === 'rename' && modalState.item) {
              await updateItemName(modalState.item.id, data.name);
            } else if (modalState.type === 'delete' && modalState.item) {
              await deleteItem(modalState.item.id);
            }
            setModalState(null);
          }}
        />
      )}
    </>
  );
}
