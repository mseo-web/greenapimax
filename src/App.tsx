import React from 'react';
import { IoMoonOutline, IoSunnyOutline } from 'react-icons/io5';
import { useTheme } from './context/ThemeContext';
import { useAuth } from './context/AuthContext';
import { AuthForm } from './components/AuthForm';
import { Chat } from './components/Chat';

const App: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const { isAuthenticated, clearCredentials } = useAuth();

  return (
    <div className="min-h-screen bg-white text-dark dark:bg-bg-color-dark dark:text-white transition-colors duration-200">
      <header className="border-b border-stroke dark:border-stroke-dark px-6 py-4 flex justify-between items-center bg-white dark:bg-gray-dark">
        <h1 className="text-xl font-bold text-primary">GREEN-API MAX Chat</h1>
        <div className="flex items-center gap-4">
          <button
            onClick={toggleTheme}
            type="button"
            className="p-2 rounded-lg border border-stroke dark:border-stroke-dark hover:bg-gray-light dark:hover:bg-dark transition-colors"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? (
              <IoSunnyOutline className="w-5 h-5 text-yellow" />
            ) : (
              <IoMoonOutline className="w-5 h-5 text-dark" />
            )}
          </button>
          {isAuthenticated && (
            <button
              onClick={clearCredentials}
              type="button"
              className="text-sm px-3 py-1.5 rounded-md border border-stroke dark:border-stroke-dark hover:bg-red-500/10 text-red-500 transition-colors"
            >
              Выйти
            </button>
          )}
        </div>
      </header>

      <main className="container mx-auto p-4">
        {!isAuthenticated ? <AuthForm /> : <Chat />}
      </main>
    </div>
  );
};

export default App;