import React, { useState } from 'react';
import { X } from 'lucide-react';
import { Task } from '../types';
import { generateTimeSlots } from '../utils/utils';

interface AddTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (task: Task) => void;
}

const COLORS = [
  '#FF6B6B', // Red
  '#4ECDC4', // Teal
  '#45B7D1', // Blue
  '#96CEB4', // Green
  '#FFEEAD', // Yellow
  '#D4A5A5', // Pink
  '#9B5DE5', // Purple
  '#F15BB5', // Magenta
];

const TIME_SLOTS = generateTimeSlots();

const AddTaskModal: React.FC<AddTaskModalProps> = ({ isOpen, onClose, onAdd }) => {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const [selectedColor, setSelectedColor] = useState(COLORS[0]);
  const [error, setError] = useState<string>('');

  const validateTimeOverlap = (tasks: Task[], newStart: string, newEnd: string): boolean => {
    return tasks.some(task => {
      const taskStart = new Date(`2000-01-01T${task.startTime}`);
      const taskEnd = new Date(`2000-01-01T${task.endTime}`);
      const newTaskStart = new Date(`2000-01-01T${newStart}`);
      const newTaskEnd = new Date(`2000-01-01T${newEnd}`);
      
      return (
        (newTaskStart >= taskStart && newTaskStart < taskEnd) ||
        (newTaskEnd > taskStart && newTaskEnd <= taskEnd) ||
        (newTaskStart <= taskStart && newTaskEnd >= taskEnd)
      );
    });
  };

  const validateDuration = (start: string, end: string): boolean => {
    const startDate = new Date(`2000-01-01T${start}`);
    const endDate = new Date(`2000-01-01T${end}`);
    const durationInMinutes = (endDate.getTime() - startDate.getTime()) / (1000 * 60);
    return durationInMinutes >= 15;
  };

  const handleStartTimeChange = (newStartTime: string) => {
    setStartTime(newStartTime);
    
    // Automatically set end time to be at least 15 minutes after start time
    const startIndex = TIME_SLOTS.indexOf(newStartTime);
    const currentEndIndex = TIME_SLOTS.indexOf(endTime);
    
    if (currentEndIndex <= startIndex) {
      const newEndIndex = Math.min(startIndex + 1, TIME_SLOTS.length - 1);
      setEndTime(TIME_SLOTS[newEndIndex]);
    }
  };

  const handleEndTimeChange = (newEndTime: string) => {
    const startIndex = TIME_SLOTS.indexOf(startTime);
    const endIndex = TIME_SLOTS.indexOf(newEndTime);
    
    if (endIndex <= startIndex) {
      setError('End time must be after start time');
    } else {
      setError('');
      setEndTime(newEndTime);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate time format and range
    const startDate = new Date(`2000-01-01T${startTime}`);
    const endDate = new Date(`2000-01-01T${endTime}`);

    if (endDate <= startDate) {
      setError('End time must be after start time');
      return;
    }

    if (!validateDuration(startTime, endTime)) {
      setError('Task duration must be at least 15 minutes');
      return;
    }

    // Get existing tasks for the selected date
    const existingTasks = JSON.parse(localStorage.getItem('dailyPlans') || '{}')[date]?.tasks || [];
    
    // Check for overlaps
    if (validateTimeOverlap(existingTasks, startTime, endTime)) {
      setError('This time slot overlaps with an existing task');
      return;
    }

    const newTask: Task = {
      id: Date.now().toString(),
      title,
      date,
      startTime,
      endTime,
      completed: false,
      color: selectedColor,
    };

    onAdd(newTask);
    onClose();
    setTitle('');
    setDate(new Date().toISOString().split('T')[0]);
    setStartTime('09:00');
    setEndTime('10:00');
    setError('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">Add New Task</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-red-100 text-red-700 rounded-md text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Task Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Time
              </label>
              <select
                value={startTime}
                onChange={(e) => handleStartTimeChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
              >
                {TIME_SLOTS.map((time) => (
                  <option key={time} value={time}>
                    {time}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Time
              </label>
              <select
                value={endTime}
                onChange={(e) => handleEndTimeChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
              >
                {TIME_SLOTS.map((time) => (
                  <option key={time} value={time}>
                    {time}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Color
            </label>
            <div className="flex space-x-2">
              {COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setSelectedColor(color)}
                  className={`w-8 h-8 rounded-full border-2 ${
                    selectedColor === color ? 'border-gray-600' : 'border-transparent'
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 transition-colors"
          >
            Add Task
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddTaskModal;