import React from 'react';
import { Calendar, CheckCircle2, Trash2, Menu, Sliders, Plus } from 'lucide-react';
import { DayPlan } from '../types';

interface SidebarProps {
  isOpen: boolean;
  selectedDate: string;
  onDateSelect: (date: string) => void;
  plans: Record<string, DayPlan>;
  onDeletePlan: (date: string) => void;
  onToggleSidebar: () => void;
  onOpenSettings: () => void;
  onAddTask: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  selectedDate,
  onDateSelect,
  plans,
  onDeletePlan,
  onToggleSidebar,
  onOpenSettings,
  onAddTask
}) => {
  const dates = Object.keys(plans).sort();
  const today = new Date().toISOString().split('T')[0];

  return (
    <>
      {/* Overlay for mobile/tablet */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30 xl:hidden"
          onClick={onToggleSidebar}
        />
      )}
      
      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 bottom-0 bg-white shadow-2xl transition-transform duration-300 z-40 
          w-full max-w-[320px] transform flex flex-col
          ${isOpen ? 'translate-x-0' : '-translate-x-full'} 
          xl:translate-x-0 xl:w-64 xl:min-h-[1500px]`}
      >
        {/* Sidebar Header */}
        <div className="flex-shrink-0 bg-white z-10 p-4 border-b">
          <div className="flex items-center justify-between mb-4 md:mb-0">
            <div className="flex items-center space-x-3">
              <Calendar className="w-6 h-6 text-purple-600" />
              <h2 className="text-lg font-bold text-gray-800">Daily Plans</h2>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={onOpenSettings}
                className="p-2 text-gray-600 hover:text-purple-600 transition-colors md:hidden inline"
                title="Settings"
              >
                <Sliders className="w-5 h-5" />
              </button>
              <button
                onClick={onToggleSidebar}
                className="p-2 text-gray-600 hover:text-purple-600 transition-colors xl:hidden"
              >
                <Menu className="w-5 h-5" />
              </button>
            </div>
          </div>
          
          {/* Mobile Add Task Button */}
          <button
            onClick={onAddTask}
            className="md:hidden w-full flex items-center justify-center space-x-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span>Add Task</span>
          </button>
        </div>

        {/* Plans List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {dates.length === 0 ? (
            <div className="text-center text-gray-500 py-4">
              No plans available
            </div>
          ) : (
            dates.map((date) => {
              const plan = plans[date];
              const completedTasks = plan.tasks.filter(t => t.completed).length;
              const totalTasks = plan.tasks.length;
              const isSelected = date === selectedDate;
              const isToday = date === today;

              return (
                <div
                  key={date}
                  className={`relative rounded-lg transition-all duration-200
                    ${isSelected ? 'bg-purple-100 ring-2 ring-purple-400' : 'hover:bg-gray-50'}
                    ${isToday ? 'border-2 border-purple-400' : 'border border-gray-200'}`}
                >
                  <div className="w-full p-3">
                    <div className="flex items-center justify-between mb-1">
                      <div
                        onClick={() => onDateSelect(date)}
                        className="flex-grow font-medium text-gray-900 cursor-pointer"
                      >
                        {new Date(date).toLocaleDateString('en-US', {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </div>
                      <button
                        onClick={() => onDeletePlan(date)}
                        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors ml-2"
                        title="Delete plan"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <div
                      onClick={() => onDateSelect(date)}
                      className="flex items-center text-sm text-gray-600 cursor-pointer"
                    >
                      <CheckCircle2 className="w-4 h-4 mr-1.5" />
                      <span>{completedTasks}/{totalTasks} tasks completed</span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </aside>
    </>
  );
};

export default Sidebar;