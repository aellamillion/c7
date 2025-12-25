'use client';

import { useState } from 'react';
import ReactMarkdown from 'react-markdown';

export default function Home() {
  const [url, setUrl] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeAction, setActiveAction] = useState('');

  const handleAction = async (action) => {
    if (!url.trim()) {
      setResult('⚠️ Пожалуйста, введите URL статьи');
      return;
    }

    setLoading(true);
    setActiveAction(action);
    setResult('');

    try {
      // Import the server action dynamically or use the one we'll import at the top
      // Note: We need to import it at the top level
      const { parseArticle, translateArticle } = await import('./actions');

      let response;
      if (action === 'translate') {
        response = await translateArticle(url);
      } else {
        // Existing logic for other actions (currently just parsing, but we might want to distinguish later)
        // For now, let's keep the existing flow but if we had specific endpoints for summary/theses we would switch here.
        // Since the prompt only asked for "Translate", I assume the other buttons might just show the parsed text or similar? 
        // Wait, the original code only called parseArticle for ALL buttons. 
        // "3 buttons: «О чем статья?», «Тезисы», «Пост для Telegram»" - checking the code...
        // The original code: const response = await parseArticle(url); 
        // It seems the original code didn't actually implement logical difference for "Summary"/"Theses" yet, just parsed.
        // I will preserve that behavior for the old buttons and add specific behavior for the new one.

        response = await parseArticle(url);
        // If the user clicked specific existing buttons, you might want to process the text differently, 
        // but for now I will strictly follow the request to ADD the translation function.
      }

      if (response.success) {
        // If the response is a string (translation), set it directly
        // If it's an object (parse results), stringify it for display
        const displayResult = typeof response.data === 'string'
          ? response.data
          : JSON.stringify(response.data, null, 2);
        setResult(displayResult);
      } else {
        setResult(`❌ Ошибка: ${response.error}`);
      }
    } catch (err) {
      setResult(`❌ Ошибка приложения: ${err.message}`);
    } finally {
      setLoading(false);
      setActiveAction('');
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-4xl animate-fade-in">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-4 drop-shadow-lg">
            📰 Анализатор Статей
          </h1>
          <p className="text-lg sm:text-xl text-white/90 font-light">
            Получите краткое содержание, тезисы или готовый пост для Telegram
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-white/10 backdrop-blur-lg rounded-3xl shadow-2xl p-6 sm:p-8 lg:p-10 border border-white/20 animate-slide-up">
          {/* URL Input */}
          <div className="mb-8">
            <label htmlFor="url-input" className="block text-white text-sm font-semibold mb-3 uppercase tracking-wide">
              URL англоязычной статьи
            </label>
            <input
              id="url-input"
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com/article"
              className="w-full px-5 py-4 bg-white/20 backdrop-blur-sm border-2 border-white/30 rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-4 focus:ring-white/40 focus:border-white/50 transition-all duration-300 text-base sm:text-lg"
            />
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <button
              onClick={() => handleAction('summary')}
              disabled={loading}
              className="group relative px-6 py-4 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none overflow-hidden"
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                <span className="text-xl">🔍</span>
                <span>О чем статья?</span>
              </span>
              {activeAction === 'summary' && (
                <div className="absolute inset-0 animate-shimmer"></div>
              )}
            </button>

            <button
              onClick={() => handleAction('theses')}
              disabled={loading}
              className="group relative px-6 py-4 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none overflow-hidden"
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                <span className="text-xl">📋</span>
                <span>Тезисы</span>
              </span>
              {activeAction === 'theses' && (
                <div className="absolute inset-0 animate-shimmer"></div>
              )}
            </button>

            <button
              onClick={() => handleAction('telegram')}
              disabled={loading}
              className="group relative px-6 py-4 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none overflow-hidden"
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                <span className="text-xl">✈️</span>
                <span>Пост для Telegram</span>
              </span>
              {activeAction === 'telegram' && (
                <div className="absolute inset-0 animate-shimmer"></div>
              )}
            </button>

            <button
              onClick={() => handleAction('translate')}
              disabled={loading}
              className="group relative px-6 py-4 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none overflow-hidden"
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                <span className="text-xl">🌐</span>
                <span>Перевести</span>
              </span>
              {activeAction === 'translate' && (
                <div className="absolute inset-0 animate-shimmer"></div>
              )}
            </button>
          </div>

          {/* Result Display */}
          {(result || loading) && (
            <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 border border-white/30 min-h-[200px] animate-fade-in">
              <h2 className="text-white text-lg font-semibold mb-4 flex items-center gap-2">
                <span className="text-2xl">📄</span>
                Результат
              </h2>
              {loading ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="w-16 h-16 border-4 border-white/30 border-t-white rounded-full animate-spin mb-4"></div>
                  <p className="text-white/80 text-lg">Обработка...</p>
                </div>
              ) : (
                <div className="text-white/95 leading-relaxed text-base sm:text-lg markdown-container">
                  <ReactMarkdown>{result}</ReactMarkdown>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-white/70 text-sm">
          <p>Создано с использованием Next.js и Tailwind CSS</p>
        </div>
      </div>
    </main>
  );
}

