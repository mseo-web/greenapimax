import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export const AuthForm: React.FC = () => {
  const { setCredentials } = useAuth();
  const [idInstance, setIdInstance] = useState('');
  const [apiTokenInstance, setApiTokenInstance] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (idInstance.trim() && apiTokenInstance.trim()) {
      setCredentials(idInstance.trim(), apiTokenInstance.trim());
    }
  };

  return (
    <div className="flex items-center justify-center py-12 px-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white dark:bg-gray-dark border border-stroke dark:border-stroke-dark p-8 rounded-xl shadow-one dark:shadow-two w-full max-w-md space-y-5 transition-colors"
      >
        <h2 className="text-2xl font-bold text-black dark:text-white text-center">
          Авторизация GREEN-API
        </h2>
        
        <div>
          <label className="block text-sm font-medium text-black dark:text-white mb-2">
            idInstance
          </label>
          <input
            type="text"
            value={idInstance}
            onChange={(e) => setIdInstance(e.target.value)}
            placeholder="Введите idInstance"
            className="w-full px-4 py-2.5 rounded-md border border-stroke dark:border-stroke-dark bg-transparent text-black dark:text-white focus:outline-none focus:border-primary transition-colors"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-black dark:text-white mb-2">
            apiTokenInstance
          </label>
          <input
            type="password"
            value={apiTokenInstance}
            onChange={(e) => setApiTokenInstance(e.target.value)}
            placeholder="Введите apiTokenInstance"
            className="w-full px-4 py-2.5 rounded-md border border-stroke dark:border-stroke-dark bg-transparent text-black dark:text-white focus:outline-none focus:border-primary transition-colors"
            required
          />
        </div>

        <button
          type="submit"
          className="w-full bg-primary text-white font-medium py-3 rounded-md hover:bg-opacity-90 transition shadow-submit"
        >
          Войти
        </button>
      </form>
    </div>
  );
};