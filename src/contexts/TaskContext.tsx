import React, { createContext, useContext, useState, useEffect } from 'react';
import { Task, DayPlan } from '../types';

interface TaskContextType {
  plans: Record<string, DayPlan>;
  startHour: number;
  selectedDate: string;
  setSelectedDate: (date: string) => void;
  addTask: (task: Task) => void;
  deleteTask: (taskId: string) => void;
  toggleTaskCompletion: (taskId: string) => void;
  updateTask: (taskId: string, updates: Partial<Task>) => void;
  deletePlan: (date: string) => void;
  updateStartHour: (hour: number) => void;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export const TaskProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [startHour, setStartHour] = useState<number>(() => {
    const saved = localStorage.getItem('startHour');
    return saved ? parseInt(saved, 10) : 5;
  });
  const [plans, setPlans] = useState<Record<string, DayPlan>>(() => {
    const saved = localStorage.getItem('dailyPlans');
    return saved ? JSON.parse(saved) : {};
  });

  // Set initial selected date to the earliest date with tasks
  useEffect(() => {
    if (!selectedDate && Object.keys(plans).length > 0) {
      const dates = Object.keys(plans).sort();
      setSelectedDate(dates[0]);
    }
  }, [plans, selectedDate]);

  useEffect(() => {
    localStorage.setItem('dailyPlans', JSON.stringify(plans));
  }, [plans]);

  useEffect(() => {
    localStorage.setItem('startHour', startHour.toString());
  }, [startHour]);

  const addTask = (task: Task) => {
    setPlans(prev => ({
      ...prev,
      [task.date]: {
        date: task.date,
        tasks: [...(prev[task.date]?.tasks || []), task]
      }
    }));
    setSelectedDate(task.date);
  };

  const deleteTask = (taskId: string) => {
    setPlans(prev => {
      const newPlans = { ...prev };
      if (selectedDate && newPlans[selectedDate]) {
        const updatedTasks = newPlans[selectedDate].tasks.filter(task => task.id !== taskId);
        if (updatedTasks.length === 0) {
          delete newPlans[selectedDate];
          // Select new date if current date is deleted
          if (Object.keys(newPlans).length > 0) {
            setSelectedDate(Object.keys(newPlans).sort()[0]);
          } else {
            setSelectedDate('');
          }
        } else {
          newPlans[selectedDate] = {
            ...newPlans[selectedDate],
            tasks: updatedTasks
          };
        }
      }
      return newPlans;
    });
  };

  const toggleTaskCompletion = (taskId: string) => {
    setPlans(prev => ({
      ...prev,
      [selectedDate]: {
        ...prev[selectedDate],
        tasks: prev[selectedDate].tasks.map(task =>
          task.id === taskId ? { ...task, completed: !task.completed } : task
        )
      }
    }));
  };

  const updateTask = (taskId: string, updates: Partial<Task>) => {
    setPlans(prev => ({
      ...prev,
      [selectedDate]: {
        ...prev[selectedDate],
        tasks: prev[selectedDate].tasks.map(task =>
          task.id === taskId ? { ...task, ...updates } : task
        )
      }
    }));
  };

  const deletePlan = (date: string) => {
    setPlans(prev => {
      const newPlans = { ...prev };
      delete newPlans[date];
      
      if (selectedDate === date) {
        const remainingDates = Object.keys(newPlans).sort();
        if (remainingDates.length > 0) {
          setSelectedDate(remainingDates[0]);
        } else {
          setSelectedDate('');
        }
      }
      return newPlans;
    });
  };

  const updateStartHour = (hour: number) => {
    setStartHour(hour);
  };

  return (
    <TaskContext.Provider
      value={{
        plans,
        startHour,
        selectedDate,
        setSelectedDate,
        addTask,
        deleteTask,
        toggleTaskCompletion,
        updateTask,
        deletePlan,
        updateStartHour,
      }}
    >
      {children}
    </TaskContext.Provider>
  );
};

export const useTaskContext = () => {
  const context = useContext(TaskContext);
  if (context === undefined) {
    throw new Error('useTaskContext must be used within a TaskProvider');
  }
  return context;
};