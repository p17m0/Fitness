import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const ServerErrorPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-light px-4">
      <div className="brutal-card max-w-xl w-full text-center space-y-6">
        <div className="inline-flex items-center justify-center w-20 h-20 mb-2 bg-red-100 border-4 border-gray-dark brutal-shadow">
          <AlertTriangle size={36} className="text-red-600" />
        </div>
        <div className="space-y-2">
          <h1 className="brutal-title text-3xl md:text-4xl">Сервер недоступен</h1>
          <p className="font-body text-gray-medium">
            Произошла ошибка на стороне сервера (500) или бэкенд временно недоступен. Попробуйте обновить страницу или вернуться позже.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            className="brutal-button inline-flex items-center justify-center gap-2"
            onClick={() => window.location.reload()}
          >
            <RefreshCw size={18} />
            Обновить
          </button>
          <button
            className="brutal-button inline-flex items-center justify-center gap-2 bg-gray-200 hover:bg-cream"
            onClick={() => navigate('/')}
          >
            <Home size={18} />
            На главную
          </button>
        </div>
      </div>
    </div>
  );
};
