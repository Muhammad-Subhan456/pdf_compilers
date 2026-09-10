import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import PdfIcon from './PdfIcon'
import { formatBytes } from '../utils/constants'

export default function FileItem({ file, index, onRemove, onMoveUp, onMoveDown, isFirst, isLast }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: file.id,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <li
      ref={setNodeRef}
      style={style}
      className={[
        'flex items-center gap-3 border-[3px] border-ink bg-white px-3 py-3 shadow-block-sm',
        isDragging ? 'border-pink shadow-block-pink z-10' : '',
      ].join(' ')}
    >
      <span className="flex h-9 w-9 shrink-0 items-center justify-center bg-pink font-pixel text-white">
        {index + 1}
      </span>
      <button
        type="button"
        className="cursor-grab px-1 text-xl leading-none text-ink active:cursor-grabbing"
        aria-label={`Drag to reorder ${file.name}`}
        {...attributes}
        {...listeners}
      >
        ≡
      </button>
      <PdfIcon size={40} />
      <div className="min-w-0 flex-1 text-left">
        <p className="truncate font-semibold">{file.name}</p>
        <p className="text-sm text-blush">
          {formatBytes(file.size)}
          {file.pageCount ? ` • ${file.pageCount} pages` : ''}
        </p>
      </div>
      <div className="flex flex-col">
        <button
          type="button"
          className="px-1 text-xs text-blush disabled:opacity-30"
          onClick={onMoveUp}
          disabled={isFirst}
          aria-label={`Move ${file.name} up`}
        >
          ▲
        </button>
        <button
          type="button"
          className="px-1 text-xs text-blush disabled:opacity-30"
          onClick={onMoveDown}
          disabled={isLast}
          aria-label={`Move ${file.name} down`}
        >
          ▼
        </button>
      </div>
      <button
        type="button"
        className="flex h-8 w-8 items-center justify-center border-[2px] border-ink bg-white text-lg"
        onClick={onRemove}
        aria-label={`Remove ${file.name}`}
      >
        ×
      </button>
    </li>
  )
}
