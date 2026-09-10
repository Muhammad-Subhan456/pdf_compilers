import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import FileItem from './FileItem'

export default function FileList({ files, onReorder, onRemove }) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  function handleDragEnd(event) {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIndex = files.findIndex((file) => file.id === active.id)
    const newIndex = files.findIndex((file) => file.id === over.id)
    onReorder(arrayMove(files, oldIndex, newIndex))
  }

  function move(index, direction) {
    const next = index + direction
    if (next < 0 || next >= files.length) return
    onReorder(arrayMove(files, index, next))
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={files.map((file) => file.id)} strategy={verticalListSortingStrategy}>
        <ul className="space-y-3">
          {files.map((file, index) => (
            <FileItem
              key={file.id}
              file={file}
              index={index}
              isFirst={index === 0}
              isLast={index === files.length - 1}
              onRemove={() => onRemove(file.id)}
              onMoveUp={() => move(index, -1)}
              onMoveDown={() => move(index, 1)}
            />
          ))}
        </ul>
      </SortableContext>
    </DndContext>
  )
}
