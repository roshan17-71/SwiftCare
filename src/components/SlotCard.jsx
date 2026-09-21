import { formatTime } from '../utils/time';

export default function SlotCard({ slot, isSelected, onSelect }) {
  return (
    <button
      type="button"
      onClick={() => onSelect(slot)}
      className={`py-3 px-4 rounded-xl border text-sm font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer ${
        isSelected
          ? 'border-blue-600 bg-blue-600 text-white shadow-md ring-2 ring-blue-300 ring-offset-1'
          : 'border-gray-200 bg-white text-gray-800 hover:border-blue-400 hover:bg-blue-50/50'
      }`}
    >
      <span>🕒</span>
      <span>
        {formatTime(slot.start_time)} – {formatTime(slot.end_time)}
      </span>
    </button>
  );
}

