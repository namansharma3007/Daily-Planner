import React, { useState } from 'react';
import { Task } from '../types';
import { CheckCircle2, Circle, Clock, Edit2, Trash2 } from 'lucide-react';
import EditTimeModal from './EditTimeModal';

interface TaskListProps {
  tasks: Task[];
  onToggleComplete: (taskId: string) => void;
  onUpdateTask?: (taskId: string, updates: Partial<Task>) => void;
  onDeleteTask?: (taskId: string) => void;
  startHour: number;
}

const HOUR_HEIGHT = 100;
const HOURS_IN_DAY = 24;

const TaskList: React.FC<TaskListProps> = ({
  tasks,
  onToggleComplete,
  onUpdateTask,
  onDeleteTask,
  startHour
}) => {
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const getTimePosition = (time: string) => {
    const [hours, minutes] = time.split(':').map(Number);
    const totalHours = hours + minutes / 60;
    let adjustedHours = totalHours - startHour;
    if (adjustedHours < 0) adjustedHours += 24;
    return adjustedHours * HOUR_HEIGHT;
  };

  const getTaskHeight = (startTime: string, endTime: string) => {
    let start = getTimePosition(startTime);
    let end = getTimePosition(endTime);
    if (end < start) end += HOURS_IN_DAY * HOUR_HEIGHT;
    return Math.max(end - start, HOUR_HEIGHT / 4);
  };

  const isShortDuration = (startTime: string, endTime: string) => {
    const start = new Date(`2000-01-01T${startTime}`);
    const end = new Date(`2000-01-01T${endTime}`);
    const durationInMinutes = (end.getTime() - start.getTime()) / (1000 * 60);
    return durationInMinutes < 60;
  };

  const isVeryShortDuration = (startTime: string, endTime: string) => {
    const start = new Date(`2000-01-01T${startTime}`);
    const end = new Date(`2000-01-01T${endTime}`);
    const durationInMinutes = (end.getTime() - start.getTime()) / (1000 * 60);
    return durationInMinutes <= 15;
  };

  const timeLabels = Array.from({ length: 25 }, (_, i) => {
    const hour = (startHour + i) % 24;
    return `${hour.toString().padStart(2, '0')}:00`;
  });

  const sortedTasks = [...tasks].sort((a, b) => {
    const aStart = getTimePosition(a.startTime);
    const bStart = getTimePosition(b.startTime);
    if (aStart === bStart) {
      const aHeight = getTaskHeight(a.startTime, a.endTime);
      const bHeight = getTaskHeight(b.startTime, b.endTime);
      return bHeight - aHeight;
    }
    return aStart - bStart;
  });

  const taskGroups = sortedTasks.reduce<Task[][]>((groups, task) => {
    const taskStart = getTimePosition(task.startTime);
    const taskEnd = taskStart + getTaskHeight(task.startTime, task.endTime);
    
    const compatibleGroup = groups.find(group => 
      group.every(existingTask => {
        const existingStart = getTimePosition(existingTask.startTime);
        const existingEnd = existingStart + getTaskHeight(existingTask.startTime, existingTask.endTime);
        return taskStart >= existingEnd || taskEnd <= existingStart;
      })
    );

    if (compatibleGroup) {
      compatibleGroup.push(task);
    } else {
      groups.push([task]);
    }
    return groups;
  }, []);

  return (
    <div className="relative min-h-[2400px]">
      {/* Time labels */}
      <div className="absolute left-0 top-0 bottom-0 w-14 border-r border-gray-200">
        {timeLabels.map((time, index) => (
          <div
            key={`time-${index}`}
            className="absolute left-0 w-full text-xs text-gray-500 text-center pr-2"
            style={{ top: `${index * HOUR_HEIGHT}px` }}
          >
            {time}
          </div>
        ))}
      </div>

      {/* Timeline grid */}
      <div className="absolute left-14 right-0 top-0 bottom-0">
        {timeLabels.map((_, index) => (
          <div
            key={`grid-${index}`}
            className="absolute left-0 right-0 border-t border-gray-100"
            style={{ top: `${index * HOUR_HEIGHT}px` }}
          />
        ))}

        {/* Current time indicator */}
        <div
          className="absolute left-0 right-0 h-0.5 bg-red-400 z-10"
          style={{
            top: `${getTimePosition(new Date().toLocaleTimeString('en-US', {
              hour12: false,
              hour: '2-digit',
              minute: '2-digit'
            }))}px`
          }}
        />

        {/* Tasks */}
        <div className="relative mx-2">
          {taskGroups.map((group, groupIndex) => (
            <div 
              key={groupIndex} 
              className="absolute right-0"
              style={{
                width: `${100 - (groupIndex * 20)}%`,
              }}
            >
              {group.map((task) => {
                const top = getTimePosition(task.startTime);
                const height = getTaskHeight(task.startTime, task.endTime);
                const isShort = isShortDuration(task.startTime, task.endTime);
                const isVeryShort = isVeryShortDuration(task.startTime, task.endTime);

                return (
                  <div
                    key={task.id}
                    className="absolute left-0 right-1 rounded-lg shadow-sm transition-all duration-200 hover:shadow-md group"
                    style={{
                      top: `${top}px`,
                      height: `${height}px`,
                      backgroundColor: `${task.color}20`,
                      borderLeft: `4px solid ${task.color}`
                    }}
                  >
                    <div className={`absolute inset-0 p-2 flex flex-col ${isVeryShort ? 'justify-center' : ''}`}>
                      <div className="flex items-start space-x-2 min-w-0">
                        <button
                          onClick={() => onToggleComplete(task.id)}
                          className="flex-shrink-0 mt-0.5"
                        >
                          {task.completed ? (
                            <CheckCircle2 className="w-4 h-4 text-green-500" />
                          ) : (
                            <Circle className="w-4 h-4 text-gray-400" />
                          )}
                        </button>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2 min-w-0">
                              <h3 className={`font-medium text-sm truncate ${task.completed ? 'text-gray-400 line-through' : 'text-gray-900'}`}>
                                {task.title}
                              </h3>
                              {isShort && (
                                <button
                                  onClick={() => setEditingTask(task)}
                                  className="inline-flex items-center text-xs text-gray-500 hover:text-gray-700 transition-colors"
                                >
                                  <span className="whitespace-nowrap">({task.startTime} - {task.endTime})</span>
                                  <Edit2 className="w-3 h-3 ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                                </button>
                              )}
                            </div>
                            {onDeleteTask && (
                              <button
                                onClick={() => onDeleteTask(task.id)}
                                className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors flex-shrink-0"
                                title="Delete task"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                          {!isShort && (
                            <div className="flex items-center mt-1">
                              <button
                                onClick={() => setEditingTask(task)}
                                className="inline-flex items-center text-xs text-gray-600 hover:bg-gray-50 rounded-lg pr-1.5 py-0.5 transition-colors group"
                              >
                                <Clock className="w-3 h-3 mr-1 flex-shrink-0" />
                                <span className="whitespace-nowrap">{task.startTime} - {task.endTime}</span>
                                <Edit2 className="w-3 h-3 ml-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {editingTask && onUpdateTask && (
        <EditTimeModal
          isOpen={true}
          onClose={() => setEditingTask(null)}
          task={editingTask}
          onSave={onUpdateTask}
        />
      )}
    </div>
  );
};

export default TaskList;