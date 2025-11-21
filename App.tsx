import React, { useState, useEffect, useCallback } from 'react';
import { generateGameCards } from './services/geminiService';
import { GameState, GameSettings, CardData, Category, Difficulty, RoundResult } from './types';
import { DEFAULT_SETTINGS, APP_TITLE, FALLBACK_CARDS } from './constants';
import { Card } from './components/Card';
import { Timer } from './components/Timer';
import { GameControls } from './components/GameControls';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(GameState.MENU);
  const [settings, setSettings] = useState<GameSettings>(DEFAULT_SETTINGS);
  const [cards, setCards] = useState<CardData[]>([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(DEFAULT_SETTINGS.duration);
  const [results, setResults] = useState<RoundResult>({ correct: [], skipped: [], totalScore: 0 });
  const [countdown, setCountdown] = useState(3);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  // Track if the current card image has fully loaded
  const [isCardReady, setIsCardReady] = useState(false);

  // --- Game Loop Logic ---

  const startGame = async () => {
    setGameState(GameState.GENERATING);
    setErrorMsg(null);
    try {
      let newCards: CardData[] = [];
      
      try {
        newCards = await generateGameCards(settings.category, settings.difficulty);
      } catch (err) {
        console.warn("API failed, using fallback data", err);
        newCards = FALLBACK_CARDS;
        setErrorMsg("Offline mode: Using default cards.");
      }

      setCards(newCards);
      setResults({ correct: [], skipped: [], totalScore: 0 });
      setCurrentCardIndex(0);
      setIsCardReady(false); // Start false, wait for image
      setTimeLeft(settings.duration);
      setCountdown(3);
      setGameState(GameState.COUNTDOWN);
    } catch (error) {
      setGameState(GameState.ERROR);
      setErrorMsg("Critical error starting game.");
    }
  };

  // Countdown Effect
  useEffect(() => {
    if (gameState === GameState.COUNTDOWN) {
      if (countdown > 0) {
        const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
        return () => clearTimeout(timer);
      } else {
        // Do NOT switch immediately to playing if we want to wait for the first image?
        // Actually, better to switch to PLAYING but pause timer via isCardReady logic.
        setGameState(GameState.PLAYING);
      }
    }
  }, [gameState, countdown]);

  // Game Timer Effect
  useEffect(() => {
    // Timer only ticks if we are playing AND the image is ready
    if (gameState === GameState.PLAYING && isCardReady) {
      if (timeLeft > 0) {
        const timer = setTimeout(() => setTimeLeft(t => t - 1), 1000);
        return () => clearTimeout(timer);
      } else {
        endGame();
      }
    }
  }, [gameState, timeLeft, isCardReady]);

  const endGame = useCallback(() => {
    setGameState(GameState.SUMMARY);
  }, []);

  // --- Gameplay Actions ---

  const handleCorrect = () => {
    if (!isCardReady) return; // Prevent double clicks or clicking while loading
    const currentCard = cards[currentCardIndex];
    const newScore = results.totalScore + 1;
    setResults({
      ...results,
      correct: [...results.correct, currentCard],
      totalScore: newScore
    });
    advanceCard();
  };

  const handlePass = () => {
    if (!isCardReady) return;
    const currentCard = cards[currentCardIndex];
    setResults({
      ...results,
      skipped: [...results.skipped, currentCard]
    });
    advanceCard();
  };

  const advanceCard = () => {
    if (currentCardIndex + 1 < cards.length) {
      setIsCardReady(false); // Immediately pause timer and show loader
      setCurrentCardIndex(prev => prev + 1);
    } else {
      endGame();
    }
  };

  // Callback from Card component when <img onLoad> fires
  const handleCardImageLoaded = useCallback(() => {
    setIsCardReady(true);
  }, []);

  // --- Render Helpers ---

  const renderMenu = () => (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-brand-blue text-white">
      <div className="text-center mb-8">
        <h1 className="text-5xl font-black mb-2 text-brand-yellow drop-shadow-lg">{APP_TITLE}</h1>
        <span className="bg-brand-dark/30 px-3 py-1 rounded-full text-sm font-semibold">English Grammar Game</span>
      </div>
      
      <div className="w-full max-w-md bg-white rounded-3xl p-6 text-brand-dark shadow-2xl">
        <div className="bg-blue-50 rounded-xl p-4 mb-6 border-l-4 border-brand-blue">
            <h3 className="font-bold text-brand-blue mb-1">How to Play</h3>
            <ul className="text-sm text-gray-600 leading-relaxed list-disc pl-4 space-y-1">
                <li>Select a category.</li>
                <li>Hold phone on your forehead.</li>
                <li>Friends see the <strong>Picture</strong> and <strong>Clues</strong>.</li>
                <li>Friends say: "He <strong>is</strong> rich!"</li>
                <li>You ask: "<strong>Am I</strong> Batman?"</li>
            </ul>
        </div>

        <div className="mb-4">
          <label className="block font-bold mb-2 text-gray-700">Select Category</label>
          <div className="grid grid-cols-2 gap-2">
            {Object.values(Category).map((cat) => (
              <button
                key={cat}
                onClick={() => setSettings({ ...settings, category: cat })}
                className={`p-3 rounded-xl text-sm font-bold transition-all shadow-sm border-2 ${
                  settings.category === cat 
                    ? 'bg-brand-blue text-white border-brand-blue ring-2 ring-brand-blue/30' 
                    : 'bg-white text-gray-600 border-gray-100 hover:border-gray-200 hover:bg-gray-50'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-8">
          <label className="block font-bold mb-2 text-gray-700">Difficulty</label>
          <div className="flex gap-2">
            {Object.values(Difficulty).map((d) => (
              <button
                key={d}
                onClick={() => setSettings({ ...settings, difficulty: d })}
                className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all border-2 ${
                  settings.difficulty === d 
                    ? 'bg-brand-yellow text-brand-dark border-brand-yellow' 
                    : 'bg-white text-gray-500 border-gray-100'
                }`}
              >
                {d}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={startGame}
          className="w-full py-4 bg-brand-green text-white text-xl font-black rounded-2xl shadow-xl shadow-green-200 active:scale-95 transition-transform hover:bg-green-500 flex items-center justify-center gap-2"
        >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                <path fillRule="evenodd" d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.991c-1.25.687-2.779-.217-2.779-1.643V5.653z" clipRule="evenodd" />
            </svg>
            PLAY
        </button>
      </div>
    </div>
  );

  const renderGenerating = () => (
    <div className="min-h-screen bg-brand-blue flex flex-col items-center justify-center text-white p-6">
      <div className="relative">
        <div className="animate-spin rounded-full h-20 w-20 border-b-4 border-white mb-6"></div>
        <div className="absolute inset-0 flex items-center justify-center mb-6">
            <span className="text-2xl">🎨</span>
        </div>
      </div>
      <h2 className="text-2xl font-bold">Curating {settings.category}...</h2>
      <p className="text-white/70 mt-2 text-center max-w-xs">Generating cards and clues...</p>
    </div>
  );

  const renderCountdown = () => (
    <div className="min-h-screen bg-brand-yellow flex flex-col items-center justify-center">
      <p className="text-brand-dark font-bold text-xl mb-8 uppercase tracking-widest">Get Ready!</p>
      <div className="text-[12rem] font-black text-brand-dark animate-bounce-short leading-none">
        {countdown === 0 ? 'GO!' : countdown}
      </div>
      <p className="text-brand-dark/50 font-bold mt-8">Place on forehead</p>
    </div>
  );

  const renderPlaying = () => (
    <div className="min-h-screen bg-brand-dark flex flex-col items-center px-4 pt-4 relative overflow-hidden pb-24">
      {errorMsg && (
        <div className="absolute top-0 left-0 w-full bg-brand-red text-white text-xs p-1 text-center z-50">
          {errorMsg}
        </div>
      )}
      
      <Timer timeLeft={timeLeft} totalTime={settings.duration} />
      
      {/* Main Card Area */}
      <div className="flex-1 w-full flex items-center justify-center relative z-10 max-w-md w-full">
        {cards.length > 0 && (
          <Card 
            data={cards[currentCardIndex]} 
            isActive={true} 
            onImageLoad={handleCardImageLoaded}
          />
        )}
      </div>

      {/* Footer Controls - Fixed to bottom via Component */}
      <GameControls 
        onCorrect={handleCorrect} 
        onPass={handlePass} 
        disabled={!isCardReady} // Disable buttons while loading
      />
      
      {/* Status Indicator */}
      {!isCardReady && (
        <div className="absolute bottom-24 left-1/2 transform -translate-x-1/2 bg-black/50 text-white px-4 py-2 rounded-full text-sm font-bold backdrop-blur-sm animate-pulse z-40 whitespace-nowrap">
          Loading next card...
        </div>
      )}
      
      <div className="absolute top-4 left-4 bg-black/20 backdrop-blur-sm rounded-lg p-2 text-white/50 text-xs max-w-[120px] pointer-events-none">
         <span>Card: <strong>{currentCardIndex + 1} / {cards.length}</strong></span>
      </div>
    </div>
  );

  const renderSummary = () => (
    <div className="min-h-screen bg-brand-blue flex flex-col items-center p-6 text-white">
      <h2 className="text-4xl font-black mb-6 mt-8">Round Over!</h2>
      
      <div className="bg-white text-brand-dark rounded-3xl p-6 w-full max-w-lg shadow-2xl mb-6 text-center flex flex-col max-h-[70vh]">
        <p className="text-gray-500 font-bold uppercase text-sm mb-2">Total Score</p>
        <div className="text-8xl font-black text-brand-blue mb-6">{results.totalScore}</div>
        
        <div className="grid grid-cols-2 gap-4 mb-6 shrink-0">
          <div className="bg-green-100 p-3 rounded-xl">
            <div className="text-2xl font-bold text-green-600">{results.correct.length}</div>
            <div className="text-xs text-green-800 font-bold uppercase">Correct</div>
          </div>
          <div className="bg-red-100 p-3 rounded-xl">
            <div className="text-2xl font-bold text-red-600">{results.skipped.length}</div>
            <div className="text-xs text-red-800 font-bold uppercase">Skipped</div>
          </div>
        </div>

        <div className="text-left border-t pt-4 overflow-y-auto flex-1">
          <h3 className="font-bold mb-2 text-gray-400 text-xs uppercase sticky top-0 bg-white pb-2">History</h3>
          <ul className="space-y-3">
            {results.correct.map((c) => (
              <li key={c.id} className="flex items-center gap-3 bg-green-50 p-2 rounded-lg">
                <div className="w-8 h-8 bg-green-200 rounded-full flex items-center justify-center text-green-700 text-xs font-bold">✓</div>
                <div>
                    <span className="font-bold block text-sm">{c.name}</span>
                    <span className="text-xs text-gray-500">{c.hints[0]}</span>
                </div>
              </li>
            ))}
             {results.skipped.map((c) => (
              <li key={c.id} className="flex items-center gap-3 bg-red-50 p-2 rounded-lg opacity-70">
                <div className="w-8 h-8 bg-red-200 rounded-full flex items-center justify-center text-red-700 text-xs font-bold">✗</div>
                <div>
                    <span className="font-bold block text-sm">{c.name}</span>
                    <span className="text-xs text-gray-500">{c.category}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="flex gap-4 w-full max-w-lg shrink-0 safe-area-pb pb-6">
        <button
          onClick={() => setGameState(GameState.MENU)}
          className="flex-1 py-3 bg-white/20 hover:bg-white/30 border-2 border-white rounded-xl font-bold transition"
        >
          Menu
        </button>
        <button
          onClick={startGame}
          className="flex-1 py-3 bg-brand-yellow text-brand-dark hover:bg-yellow-300 rounded-xl font-bold shadow-lg transition"
        >
          Play Again
        </button>
      </div>
    </div>
  );

  return (
    <>
      {gameState === GameState.MENU && renderMenu()}
      {gameState === GameState.GENERATING && renderGenerating()}
      {gameState === GameState.COUNTDOWN && renderCountdown()}
      {gameState === GameState.PLAYING && renderPlaying()}
      {gameState === GameState.SUMMARY && renderSummary()}
      {gameState === GameState.ERROR && (
         <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-red-50">
             <h2 className="text-2xl font-bold text-red-600 mb-2">Oops!</h2>
             <p className="text-gray-700 mb-4 text-center">{errorMsg || "Something went wrong."}</p>
             <button onClick={() => setGameState(GameState.MENU)} className="px-6 py-2 bg-brand-dark text-white rounded-lg">Back to Menu</button>
         </div>
      )}
    </>
  );
};

export default App;