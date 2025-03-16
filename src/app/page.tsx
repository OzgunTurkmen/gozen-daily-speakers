"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { IoMdAdd, IoMdClose, IoMdSettings } from "react-icons/io";

export default function Home() {
  const [speakers, setSpeakers] = useState<string[]>([]);
  const [speakerColors, setSpeakerColors] = useState<Record<string, string>>({});
  const [activeSpeakers, setActiveSpeakers] = useState<string[]>([]);
  const [selectedSpeaker, setSelectedSpeaker] = useState<string | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [newSpeaker, setNewSpeaker] = useState("");
  const [rotation, setRotation] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [timerDuration, setTimerDuration] = useState(180); // 3 minutes
  const [timeLeft, setTimeLeft] = useState(timerDuration);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [isGameActive, setIsGameActive] = useState(false);
  const [isTimerComplete, setIsTimerComplete] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);

  // Preset timer durations (in seconds)
  const presetTimes = [
    { label: "1 minute", value: 60 },
    { label: "2 minutes", value: 120 },
    { label: "3 minutes", value: 180 },
    { label: "5 minutes", value: 300 },
    { label: "10 minutes", value: 600 },
  ];

  // Wheel colors - vibrant and modern colors
  const colors = [
    "bg-indigo-500",
    "bg-emerald-500",
    "bg-amber-500",
    "bg-rose-500",
    "bg-violet-500",
    "bg-cyan-500",
    "bg-fuchsia-500",
    "bg-lime-500",
  ];

  // Load data from LocalStorage
  useEffect(() => {
    const savedSpeakers = localStorage.getItem("speakers");
    const savedActiveSpeakers = localStorage.getItem("activeSpeakers");
    const savedTimerDuration = localStorage.getItem("timerDuration");
    const savedGameActive = localStorage.getItem("isGameActive");
    const savedSpeakerColors = localStorage.getItem("speakerColors");
    
    if (savedSpeakers) {
      const parsedSpeakers = JSON.parse(savedSpeakers);
      setSpeakers(parsedSpeakers);
      
      // If there are no active speakers or the list is empty, set all speakers as active
      if (!savedActiveSpeakers || JSON.parse(savedActiveSpeakers).length === 0) {
        setActiveSpeakers(parsedSpeakers);
      } else {
        setActiveSpeakers(JSON.parse(savedActiveSpeakers));
      }
    }
    
    if (savedTimerDuration) {
      const duration = Number(savedTimerDuration);
      setTimerDuration(duration);
      setTimeLeft(duration);
    }

    if (savedGameActive) {
      setIsGameActive(savedGameActive === "true");
    }

    if (savedSpeakerColors) {
      setSpeakerColors(JSON.parse(savedSpeakerColors));
    }
  }, []);

  // Save data to LocalStorage
  useEffect(() => {
    localStorage.setItem("speakers", JSON.stringify(speakers));
  }, [speakers]);

  useEffect(() => {
    localStorage.setItem("activeSpeakers", JSON.stringify(activeSpeakers));
  }, [activeSpeakers]);

  useEffect(() => {
    localStorage.setItem("timerDuration", String(timerDuration));
  }, [timerDuration]);

  useEffect(() => {
    localStorage.setItem("isGameActive", String(isGameActive));
  }, [isGameActive]);

  useEffect(() => {
    localStorage.setItem("speakerColors", JSON.stringify(speakerColors));
  }, [speakerColors]);

  // Timer functionality
  useEffect(() => {
    if (!isTimerRunning) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setIsTimerRunning(false);
          setIsTimerComplete(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isTimerRunning]);

  // Blinking effect for timer completion
  useEffect(() => {
    if (!isTimerComplete) return;
    
    const blinkInterval = setInterval(() => {
      const timerText = document.getElementById('timer-text');
      if (timerText) {
        timerText.classList.toggle('text-rose-600');
        timerText.classList.toggle('text-indigo-600');
      }
    }, 500);
    
    return () => clearInterval(blinkInterval);
  }, [isTimerComplete]);

  // Add speaker
  const handleAddSpeaker = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = newSpeaker.trim();
    
    // Empty name check
    if (!trimmedName) {
      setErrorMessage("Speaker name cannot be empty.");
      setTimeout(() => setErrorMessage(null), 3000);
      return;
    }
    
    // Duplicate name check
    if (speakers.includes(trimmedName)) {
      setErrorMessage("A speaker with this name already exists.");
      setTimeout(() => setErrorMessage(null), 3000);
      return;
    }
    
    // Add speaker
    setSpeakers([...speakers, trimmedName]);
    setActiveSpeakers([...activeSpeakers, trimmedName]);
    
    // Assign color to new speaker
    if (!speakerColors[trimmedName]) {
      const newColors = { ...speakerColors };
      newColors[trimmedName] = colors[Object.keys(speakerColors).length % colors.length];
      setSpeakerColors(newColors);
    }
    
    setNewSpeaker("");
    setErrorMessage(null);
  };

  // Remove speaker
  const handleRemoveSpeaker = (speaker: string) => {
    setSpeakers(speakers.filter(s => s !== speaker));
    setActiveSpeakers(activeSpeakers.filter(s => s !== speaker));
  };

  // Remove speaker from active list
  const removeSpeakerFromActive = () => {
    if (selectedSpeaker) {
      setActiveSpeakers(activeSpeakers.filter(s => s !== selectedSpeaker));
      setSelectedSpeaker(null);
      setIsTimerRunning(false);
      setIsTimerComplete(false);
      setTimeLeft(timerDuration);
    }
  };

  // Reset all speakers to active (reset day)
  const resetDay = () => {
    setActiveSpeakers([...speakers]);
    setSelectedSpeaker(null);
    setIsTimerRunning(false);
    setTimeLeft(timerDuration);
  };

  // Change timer duration
  const handleTimerChange = (newDuration: number) => {
    setTimerDuration(newDuration);
    setTimeLeft(newDuration);
    setIsSettingsOpen(false);
  };

  // Spin wheel
  const spinWheel = () => {
    if (activeSpeakers.length === 0) return;
    
    setIsSpinning(true);
    setSelectedSpeaker(null);
    setIsTimerRunning(false);
    setIsTimerComplete(false);
    setTimeLeft(timerDuration);
    
    // Select random speaker from active speakers
    const randomIndex = Math.floor(Math.random() * activeSpeakers.length);
    const winner = activeSpeakers[randomIndex];
    
    // Calculate wheel rotation angle
    const degreesPerSpeaker = 360 / activeSpeakers.length;
    
    // Calculate angle needed for selected speaker to align with pointer
    const reversedIndex = activeSpeakers.length - randomIndex;
    const targetDegrees = reversedIndex * degreesPerSpeaker;
    
    // Random number of spins (15-20)
    const extraSpins = 15 + Math.floor(Math.random() * 5);
    const totalDegrees = extraSpins * 360 + targetDegrees;
    
    // Rotate wheel
    setRotation(totalDegrees);
    
    // Stop wheel after 3 seconds and show winner
    setTimeout(() => {
      setIsSpinning(false);
      setSelectedSpeaker(winner);
    }, 3000);
  };

  // Start timer
  const startTimer = () => {
    setIsTimerRunning(true);
  };

  // Stop timer
  const stopTimer = () => {
    setIsTimerRunning(false);
  };

  // Reset timer
  const resetTimer = () => {
    setIsTimerRunning(false);
    setTimeLeft(timerDuration);
  };

  // Format time
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Start game
  const startGame = () => {
    setIsGameActive(true);
    setActiveSpeakers([...speakers]);
    setSelectedSpeaker(null);
    setIsTimerRunning(false);
    setTimeLeft(timerDuration);
  };

  // End game
  const endGame = () => {
    setIsGameActive(false);
    setActiveSpeakers([]);
    setSelectedSpeaker(null);
    setIsTimerRunning(false);
    setTimeLeft(timerDuration);
  };

  return (
    <main className="min-h-screen p-8 bg-gradient-to-br from-gray-50 to-indigo-50">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-indigo-800">Wheel of Fortune</h1>
          <div className="flex space-x-4">
            <button
              onClick={() => setIsInfoModalOpen(true)}
              className="flex items-center px-4 py-2 bg-white text-indigo-700 border border-indigo-200 rounded-lg hover:bg-indigo-50 transition-colors duration-200 shadow-md"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              Info
            </button>
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors duration-200 shadow-md"
            >
              <IoMdAdd className="mr-2" /> Add Speaker
            </button>
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="flex items-center px-4 py-2 bg-white text-indigo-700 border border-indigo-200 rounded-lg hover:bg-indigo-50 transition-colors duration-200 shadow-md"
            >
              <IoMdSettings className="mr-2" /> Settings
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Sol Taraf - Çark */}
          <div className="md:col-span-2 flex flex-col items-center justify-center">
            <div className="relative w-[400px] h-[400px]">
              {/* Çark */}
              <div className="absolute inset-0 rounded-full border-8 border-white shadow-xl overflow-hidden bg-white">
                <motion.div
                  className="w-full h-full"
                  animate={{ rotate: rotation }}
                  transition={{ duration: 3, ease: "easeOut" }}
                  style={{ transformOrigin: "center center" }}
                >
                  {isGameActive && activeSpeakers.length > 0 ? (
                    activeSpeakers.map((speaker, index) => {
                      const startAngle = index * (360 / activeSpeakers.length);
                      return (
                        <div
                          key={speaker}
                          className={`absolute w-full h-1/2 ${speakerColors[speaker] || colors[index % colors.length]} border-t border-white`}
                          style={{
                            transform: `rotate(${startAngle}deg)`,
                            transformOrigin: "50% 100%",
                            clipPath: activeSpeakers.length > 1 ? `polygon(
                              50% 100%,
                              ${50 - 50 * Math.tan(Math.PI / activeSpeakers.length)}% 0%,
                              ${50 + 50 * Math.tan(Math.PI / activeSpeakers.length)}% 0%
                            )` : 'none',
                          }}
                        >
                          <div
                            className="absolute w-full text-center"
                            style={{
                              top: '25%',
                              left: '50%',
                              transform: `translateX(-50%) rotate(${-startAngle - (360 / activeSpeakers.length) / 2}deg)`,
                            }}
                          >
                            <span className="text-white font-bold text-sm px-2 py-1 rounded inline-block transform -translate-y-1/2 drop-shadow-md">
                              {speaker}
                            </span>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                      <span className="text-gray-500 font-bold">
                        {!isGameActive 
                          ? "Start Game" 
                          : "Add Speakers"}
                      </span>
                    </div>
                  )}
                </motion.div>
              </div>
              
              {/* Orta nokta */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full shadow-lg z-20 border-4 border-indigo-500"></div>
              
              {/* İşaretçi (üçgen) */}
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-10 h-10 z-30">
                <div className="w-0 h-0 
                              border-t-[30px] border-t-indigo-600
                              border-l-[15px] border-l-transparent
                              border-r-[15px] border-r-transparent
                              filter drop-shadow-lg">
                </div>
              </div>
            </div>
            
            <div className="mt-8 flex flex-col gap-4 items-center">
              {!isGameActive ? (
                <button
                  onClick={startGame}
                  disabled={speakers.length === 0}
                  className="px-8 py-4 bg-emerald-500 text-white text-xl font-bold rounded-lg 
                           hover:bg-emerald-600 disabled:bg-gray-300 disabled:cursor-not-allowed
                           shadow-lg transform hover:scale-105 transition-all duration-200"
                >
                  Start Game
                </button>
              ) : (
                <>
                  <button
                    onClick={spinWheel}
                    disabled={isSpinning || activeSpeakers.length === 0 || selectedSpeaker !== null}
                    className="px-8 py-4 bg-indigo-500 text-white text-xl font-bold rounded-lg 
                             hover:bg-indigo-600 disabled:bg-gray-300 disabled:cursor-not-allowed
                             shadow-lg transform hover:scale-105 transition-all duration-200"
                  >
                    {isSpinning ? "Spinning..." : selectedSpeaker ? "Speaker Selected" : "Spin"}
                  </button>
                  <button
                    onClick={endGame}
                    className="px-8 py-3 bg-rose-500 text-white text-lg font-bold rounded-lg 
                             hover:bg-rose-600 shadow-md transition-all duration-200"
                  >
                    End Game
                  </button>
                </>
              )}
            </div>
          </div>
          
          {/* Sağ Taraf - Timer ve Seçilen Konuşmacı */}
          <div className="bg-white p-6 rounded-xl shadow-xl border border-indigo-100">
            <div className="flex flex-col h-full">
              {/* Timer */}
              <div className="text-center mb-8">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold text-indigo-800">Timer</h2>
                  <button
                    onClick={() => setIsSettingsOpen(true)}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
                  >
                    <IoMdSettings className="text-indigo-600" />
                  </button>
                </div>
                
                {/* Çember Timer */}
                <div className="relative w-48 h-48 mx-auto mb-4">
                  <svg className="w-full h-full" viewBox="0 0 100 100">
                    {/* Gri arka plan çemberi */}
                    <circle
                      cx="50"
                      cy="50"
                      r="45"
                      fill="none"
                      stroke="#e5e7eb"
                      strokeWidth="8"
                    />
                    
                    {/* Renkli ilerleme çemberi */}
                    <circle
                      cx="50"
                      cy="50"
                      r="45"
                      fill="none"
                      stroke={isTimerComplete ? "#ef4444" : isTimerRunning ? "#10b981" : "#6366f1"}
                      strokeWidth="8"
                      strokeDasharray={`${2 * Math.PI * 45}`}
                      strokeDashoffset={`${2 * Math.PI * 45 * (1 - timeLeft / timerDuration)}`}
                      strokeLinecap="round"
                      transform="rotate(-90 50 50)"
                      className={`transition-all duration-1000 ${isTimerComplete ? 'animate-pulse' : ''}`}
                    />
                    
                    {/* Zaman metni */}
                    <text
                      id="timer-text"
                      x="50"
                      y="50"
                      textAnchor="middle"
                      dominantBaseline="middle"
                      className={`text-3xl font-bold ${isTimerComplete ? 'text-rose-600' : ''}`}
                      fill={isTimerComplete ? "#ef4444" : "#1f2937"}
                    >
                      {formatTime(timeLeft)}
                    </text>
                  </svg>
                </div>
                
                <div className="flex gap-2 justify-center">
                  {!isTimerRunning ? (
                    <>
                      <button
                        onClick={startTimer}
                        disabled={!selectedSpeaker || isTimerComplete}
                        className="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors duration-200"
                      >
                        Start
                      </button>
                      {isTimerComplete ? (
                        <button
                          onClick={removeSpeakerFromActive}
                          className="px-4 py-2 bg-rose-500 text-white rounded-lg hover:bg-rose-600 transition-colors duration-200 animate-pulse font-bold"
                        >
                          Remove Speaker
                        </button>
                      ) : (
                        <button
                          onClick={resetTimer}
                          className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors duration-200"
                        >
                          Reset
                        </button>
                      )}
                    </>
                  ) : (
                    <button
                      onClick={stopTimer}
                      className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors duration-200"
                    >
                      Stop
                    </button>
                  )}
                </div>
              </div>
              
              {/* Seçilen Konuşmacı */}
              {selectedSpeaker && !isSpinning && (
                <div className={`text-center p-4 rounded-lg border mb-4 ${
                  isTimerComplete 
                    ? "bg-gradient-to-r from-rose-50 to-amber-50 border-rose-200 animate-pulse" 
                    : "bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-100"
                }`}>
                  <h2 className={`text-xl font-bold mb-2 ${isTimerComplete ? "text-rose-800" : "text-indigo-800"}`}>
                    Selected Speaker
                  </h2>
                  <div className="flex items-center justify-center mb-4">
                    <div 
                      className={`w-6 h-6 rounded-full mr-2 ${speakerColors[selectedSpeaker] || "bg-gray-400"}`}
                    ></div>
                    <div className={`text-2xl font-bold ${isTimerComplete ? "text-rose-700" : "text-indigo-700"}`}>
                      {selectedSpeaker}
                    </div>
                  </div>
                  {isTimerComplete && (
                    <div className="text-rose-600 font-medium mb-3">
                      Time&apos;s up! Remove the speaker or continue.
                    </div>
                  )}
                  <button
                    onClick={removeSpeakerFromActive}
                    className={`px-4 py-2 text-white rounded-lg mb-2 w-full transition-colors duration-200 ${
                      isTimerComplete 
                        ? "bg-rose-500 hover:bg-rose-600 font-bold" 
                        : "bg-red-500 hover:bg-red-600"
                    }`}
                  >
                    Remove Speaker
                  </button>
                </div>
              )}
              
              {/* Aktif konuşmacı sayısı */}
              <div className="mt-auto pt-4 text-center">
                <div className="text-sm font-medium text-indigo-600 mb-2">
                  Active Speakers: {activeSpeakers.length} / {speakers.length}
                </div>
                {isGameActive && activeSpeakers.length < speakers.length && (
                  <button
                    onClick={resetDay}
                    className="px-4 py-2 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 text-sm transition-colors duration-200"
                  >
                    Activate All Speakers
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Konuşmacı Ekleme Modalı */}
      <AnimatePresence>
        {isModalOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black"
              onClick={() => setIsModalOpen(false)}
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 
                       bg-white rounded-lg p-6 shadow-xl w-[500px] max-h-[80vh] overflow-y-auto z-50"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-indigo-800">Speaker Management</h2>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
                >
                  <IoMdClose size={24} className="text-indigo-500" />
                </button>
              </div>

              <form onSubmit={handleAddSpeaker} className="mb-6">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newSpeaker}
                    onChange={(e) => setNewSpeaker(e.target.value)}
                    placeholder="Enter new speaker name..."
                    className="flex-1 p-3 border border-indigo-200 rounded-lg 
                             focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                  <button
                    type="submit"
                    className="px-6 py-3 bg-indigo-500 text-white rounded-lg 
                           hover:bg-indigo-600 transition-colors duration-200 whitespace-nowrap shadow-md"
                  >
                    Add
                  </button>
                </div>
                
                {/* Hata mesajı */}
                <AnimatePresence>
                  {errorMessage && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="mt-2 p-2 bg-rose-50 text-rose-600 rounded-md text-sm font-medium border border-rose-200"
                    >
                      {errorMessage}
                    </motion.div>
                  )}
                </AnimatePresence>
              </form>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold mb-3 text-indigo-700">Speaker List</h3>
                <div className="space-y-2 max-h-[40vh] overflow-y-auto pr-2">
                  {speakers.length === 0 ? (
                    <div className="text-center py-4 text-gray-500">
                      No speakers added yet
                    </div>
                  ) : (
                    speakers.map((speaker) => (
                      <div
                        key={speaker}
                        className="flex justify-between items-center p-3 bg-indigo-50 rounded-lg 
                                 hover:bg-indigo-100 transition-colors duration-200"
                      >
                        <div className="flex items-center">
                          <div 
                            className={`w-4 h-4 rounded-full mr-3 ${speakerColors[speaker] || "bg-gray-400"}`}
                          ></div>
                          <span className="font-medium">{speaker}</span>
                        </div>
                        <button
                          onClick={() => handleRemoveSpeaker(speaker)}
                          className="text-rose-500 hover:text-rose-600 transition-colors duration-200 px-3 py-1"
                        >
                          Delete
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
      
      {/* Timer Ayarları Modalı */}
      <AnimatePresence>
        {isSettingsOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black"
              onClick={() => setIsSettingsOpen(false)}
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 
                       bg-white rounded-lg p-6 shadow-xl w-[400px] max-h-[80vh] overflow-y-auto z-50"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-indigo-800">Timer Settings</h2>
                <button
                  onClick={() => setIsSettingsOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
                >
                  <IoMdClose size={24} className="text-indigo-500" />
                </button>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold mb-3 text-indigo-700">Select Duration</h3>
                <div className="grid grid-cols-2 gap-3">
                  {presetTimes.map((preset) => (
                    <button
                      key={preset.value}
                      onClick={() => handleTimerChange(preset.value)}
                      className={`p-3 rounded-lg border-2 transition-colors duration-200 ${
                        timerDuration === preset.value
                          ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                          : "border-gray-200 hover:border-indigo-300"
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
                
                <div className="mt-6">
                  <h3 className="text-lg font-semibold mb-3 text-indigo-700">Custom Duration (seconds)</h3>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      min="5"
                      max="3600"
                      value={timerDuration}
                      onChange={(e) => setTimerDuration(Number(e.target.value))}
                      className="flex-1 p-3 border border-indigo-200 rounded-lg 
                               focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                    <button
                      onClick={() => handleTimerChange(timerDuration)}
                      className="px-6 py-3 bg-indigo-500 text-white rounded-lg 
                             hover:bg-indigo-600 transition-colors duration-200 whitespace-nowrap shadow-md"
                    >
                      Apply
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
      
      {/* Bilgi Modalı */}
      <AnimatePresence>
        {isInfoModalOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black"
              onClick={() => setIsInfoModalOpen(false)}
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 
                       bg-white rounded-lg p-6 shadow-xl w-[400px] max-h-[80vh] overflow-y-auto z-50"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-indigo-800">Hakkında</h2>
                <button
                  onClick={() => setIsInfoModalOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
                >
                  <IoMdClose size={24} className="text-indigo-500" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="text-gray-700">
                  <p className="mb-4">
                    This application is an interactive tool designed to randomly select speakers in meetings and track their speaking time.
                  </p>
                  <p className="mb-4">
                    You can randomly select speakers using the wheel of fortune and control speaking times with the timer.
                  </p>
                  <div className="bg-indigo-50 p-4 rounded-lg">
                    <p className="text-indigo-800 font-medium text-center">
                      © 2024 Wheel of Fortune<br/>
                      Developed by Özgün Türkmen
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </main>
  );
}