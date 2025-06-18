/**
 * Copyright (c) 2025 Cosmo Exploit Group LLC. All Rights Reserved.
 *
 * PROPRIETARY AND CONFIDENTIAL
 *
 * This file is part of the Cosmo Exploit Group LLC Weight Management System.
 * Unauthorized copying of this file, via any medium is strictly prohibited.
 *
 * This file contains proprietary and confidential information of
 * Cosmo Exploit Group LLC and may not be copied, distributed, or used
 * in any way without explicit written permission.
 */

import {
  closestCenter,
  DndContext,
  DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import React, { useState } from 'react';

// Define the item type
interface Item {
  id: string;
  content: string;
}

// Sortable item component
const SortableItem = ({ id, content }: Item) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    padding: '10px',
    margin: '5px 0',
    backgroundColor: 'white',
    border: '1px solid #ddd',
    borderRadius: '4px',
    cursor: 'grab',
    userSelect: 'none' as const,
    position: 'relative' as const,
    zIndex: isDragging ? 1 : 0,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      role="listitem"
      aria-roledescription="sortable item"
      aria-label={`Draggable item ${content}. Press space or enter to lift, arrow keys to move, space or enter to drop.`}
      tabIndex={0}
    >
      <div className="flex items-center">
        <span className="mr-2" aria-hidden="true">
          ☰
        </span>
        <span>{content}</span>
      </div>
    </div>
  );
};

// Props for the DraggableList component
interface DraggableListProps {
  items: Item[];
  onReorder?: (items: Item[]) => void;
}

// Main draggable list component
const DraggableList: React.FC<DraggableListProps> = ({ items: initialItems, onReorder }) => {
  const [items, setItems] = useState<Item[]>(initialItems);

  // Set up sensors for drag detection
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Handle drag end event
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setItems(currentItems => {
        const oldIndex = currentItems.findIndex(item => item.id === active.id);
        const newIndex = currentItems.findIndex(item => item.id === over.id);

        const newItems = arrayMove(currentItems, oldIndex, newIndex);

        // Call the onReorder callback if provided
        if (onReorder) {
          onReorder(newItems);
        }

        return newItems;
      });
    }
  };

  return (
    <div role="region" aria-label="Sortable list" className="draggable-list-container">
      <div className="sr-only" id="drag-instructions">
        Use space or enter to select an item, then use arrow keys to move it, and space or enter
        again to drop it.
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
        accessibility={{
          announcements: {
            onDragStart: ({ active }) => `Picked up item ${active.id}`,
            onDragOver: ({ active, over }) =>
              over ? `Item ${active.id} is over position ${over.id}` : '',
            onDragEnd: ({ active, over }) =>
              over ? `Item ${active.id} was dropped over position ${over.id}` : 'Item was dropped',
            onDragCancel: ({ active }) =>
              `Dragging was cancelled. Item ${active.id} was returned to its starting position`,
          },
        }}
      >
        <SortableContext items={items.map(item => item.id)} strategy={verticalListSortingStrategy}>
          <div role="list" aria-describedby="drag-instructions">
            {items.map((item, _index) => (
              <SortableItem key={item.id} id={item.id} content={item.content} />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
};

export default DraggableList;
