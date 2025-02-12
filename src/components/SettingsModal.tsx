import React, { useState } from "react";
import { X, Plus, Minus } from "lucide-react";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  startHour: number;
  onUpdateSettings: (settings: { startHour: number }) => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  startHour,
  onUpdateSettings,
}) => {
  const [tempStartHour, setTempStartHour] = useState(startHour);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSettings({ startHour: tempStartHour });
    onClose();
  };

  const handleHourChange = (increment: number) => {
    setTempStartHour((prev) => {
      const newValue = prev + increment;
      if (newValue >= 0 && newValue <= 23) {
        return newValue;
      }
      return prev;
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">Settings</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Day Start Hour (24-hour format)
            </label>
            <div className="flex items-center space-x-2 justify-center">
              <button
                type="button"
                onClick={() => handleHourChange(-1)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="px-3 py-2 border border-gray-300 rounded-md">
                {tempStartHour}
              </span>
              <button
                type="button"
                onClick={() => handleHourChange(1)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            <p className="mt-1 text-sm text-gray-500">
              This will set when your day starts in the timeline view
            </p>
          </div>

          <button
            type="submit"
            className="w-full bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 transition-colors"
          >
            Save Settings
          </button>
        </form>
      </div>
    </div>
  );
};

export default SettingsModal;
