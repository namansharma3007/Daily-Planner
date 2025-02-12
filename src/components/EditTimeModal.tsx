import React, { useState } from 'react';
import { X, Save } from 'lucide-react';
import { Task } from '../types';
import { generateTimeSlots } from '../utils/utils';

interface EditTimeModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: Task;
  onSave: (taskId: string, updates: Partial<Task>) => void;
}



const TIME_SLOTS = generateTimeSlots();

const EditTimeModal: React.FC<EditTimeModalProps> = ({
  isOpen,
  onClose,
  task,
  onSave,
}) => {
  const [startTime, setStartTime] = useState(task.startTime);
  const [endTime, setEndTime] = useState(task.endTime);
  const [error, setError] = useState<string>('');

  const validateTimeOverlap = (tasks: Task[], newStart: string, newEnd: string): boolean => {
    return tasks.some(existingTask => {
      if (existingTask.id === task.id) return false; // Skip current task
      
      const taskStart = new Date(`2000-01-01T${existingTask.startTime}`);
      const taskEnd = new Date(`2000-01-01T${existingTask.endTime}`);
      const newTaskStart = new Date(`2000-01-01T${newStart}`);
      const newTaskEnd = new Date(`2000-01-01T${newEnd}`);
      
      return (
        (newTaskStart >= taskStart && newTaskStart < taskEnd) ||
        (newTaskEnd > taskStart && newTaskEnd <= taskEnd) ||
        (newTaskStart <= taskStart && newTaskEnd >= taskEnd)
      );
    });
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

    // Get existing tasks for the selected date
    const existingTasks = JSON.parse(localStorage.getItem('dailyPlans') || '{}')[task.date]?.tasks || [];
    
    // Check for overlaps
    if (validateTimeOverlap(existingTasks, startTime, endTime)) {
      setError('This time slot overlaps with an existing task');
      return;
    }

    onSave(task.id, { startTime, endTime });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">Edit Task Time</h2>
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
            <h3 className="font-medium text-gray-700 mb-2">{task.title}</h3>
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

          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
            >
              <Save className="w-4 h-4" />
              <span>Save Changes</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditTimeModal;