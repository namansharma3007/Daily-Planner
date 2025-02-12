import { useState } from 'react';
import { Menu, Calendar, Plus, Sliders } from 'lucide-react';
import TaskList from './components/TaskList';
import Sidebar from './components/Sidebar';
import AddTaskModal from './components/AddTaskModal';
import SettingsModal from './components/SettingsModal';
import { useTaskContext } from './contexts/TaskContext';

function App() {
  const {
    plans,
    startHour,
    selectedDate,
    setSelectedDate,
    addTask,
    deleteTask,
    toggleTaskCompletion,
    updateTask,
    deletePlan,
    updateStartHour
  } = useTaskContext();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const hasPlans = Object.keys(plans).length > 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
      <div className="flex min-h-screen">
        <Sidebar
          isOpen={isSidebarOpen}
          selectedDate={selectedDate}
          onDateSelect={setSelectedDate}
          plans={plans}
          onDeletePlan={deletePlan}
          onToggleSidebar={toggleSidebar}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onAddTask={() => setIsModalOpen(true)}
        />

        <main className={`flex-1 transition-all duration-300 ${isSidebarOpen ? 'lg:ml-64' : ''}`}>
          <div className="max-w-4xl mx-auto px-4 py-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <button
                  onClick={toggleSidebar}
                  className="p-2 bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 xl:hidden"
                >
                  <Menu className="w-5 h-5 text-gray-700" />
                </button>
                <div className="flex items-center space-x-3">
                  <Calendar className="w-6 h-6 sm:w-8 sm:h-8 text-purple-600" />
                  <h1 className="text-lg sm:text-2xl font-bold text-gray-800">
                    {selectedDate ? new Date(selectedDate).toLocaleDateString('en-US', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    }) : 'No Date Selected'}
                  </h1>
                </div>
              </div>
              <div className="hidden md:flex items-center space-x-3">
                <button
                  onClick={() => setIsSettingsOpen(true)}
                  className="flex items-center space-x-2 px-4 py-2 bg-white text-gray-700 rounded-lg shadow-md hover:shadow-lg transition-all duration-300"
                >
                  <Sliders className="w-5 h-5" />
                  <span className="hidden sm:inline">Settings</span>
                </button>
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="flex items-center space-x-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors shadow-md hover:shadow-lg"
                >
                  <Plus className="w-5 h-5" />
                  <span className="hidden sm:inline">Add Task</span>
                </button>
              </div>
            </div>

            {/* Main Content */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              {hasPlans ? (
                selectedDate ? (
                  <TaskList
                    tasks={plans[selectedDate]?.tasks || []}
                    onToggleComplete={toggleTaskCompletion}
                    onUpdateTask={updateTask}
                    onDeleteTask={deleteTask}
                    startHour={startHour}
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <Calendar className="w-16 h-16 text-purple-200 mb-4" />
                    <h2 className="text-xl font-semibold text-gray-700 mb-2">Select a Date</h2>
                    <p className="text-gray-500">Choose a date from the sidebar to view tasks</p>
                  </div>
                )
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Calendar className="w-16 h-16 text-purple-200 mb-4" />
                  <h2 className="text-xl font-semibold text-gray-700 mb-2">No Plans Yet</h2>
                  <p className="text-gray-500 mb-6">Start by adding your first task to create a plan</p>
                  <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center space-x-2 bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors shadow-md hover:shadow-lg"
                  >
                    <Plus className="w-5 h-5" />
                    <span>Add Your First Task</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      <AddTaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAdd={addTask}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        startHour={startHour}
        onUpdateSettings={({ startHour: newStartHour }) => updateStartHour(newStartHour)}
      />
    </div>
  );
}

export default App;