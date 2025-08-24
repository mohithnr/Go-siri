"use client";
import { useState, useRef, useEffect } from "react";
import { apiFetch } from "@/lib/api";

type Message = {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
};

type CommonProblem = {
  id: string;
  problem: string;
  category: string;
};

type ChatbotResponse = {
  success: boolean;
  response: string;
  language: string;
  timestamp: string;
  note?: string;
};

const COMMON_PROBLEMS: CommonProblem[] = [
  { id: "1", problem: "Cow not eating properly", category: "Nutrition" },
  { id: "2", problem: "Milk production decreased", category: "Production" },
  { id: "3", problem: "Cow showing signs of illness", category: "Health" },
  { id: "4", problem: "Breeding issues", category: "Reproduction" },
  { id: "5", problem: "Mastitis symptoms", category: "Health" },
  { id: "6", problem: "Foot and hoof problems", category: "Health" },
  { id: "7", problem: "Calving difficulties", category: "Reproduction" },
  { id: "8", problem: "Feed management", category: "Nutrition" },
  { id: "9", problem: "Vaccination schedule", category: "Health" },
  { id: "10", problem: "Milk quality issues", category: "Production" },
];

const LANGUAGES = [
  { code: "en", name: "English" },
  { code: "hi", name: "हिंदी (Hindi)" },
  { code: "te", name: "తెలుగు (Telugu)" },
  { code: "ta", name: "தமிழ் (Tamil)" },
  { code: "kn", name: "ಕನ್ನಡ (Kannada)" },
  { code: "ml", name: "മലയാളം (Malayalam)" },
  { code: "bn", name: "বাংলা (Bengali)" },
  { code: "gu", name: "ગુજરાતી (Gujarati)" },
  { code: "mr", name: "मराठी (Marathi)" },
  { code: "pa", name: "ਪੰਜਾਬੀ (Punjabi)" },
];

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "Hello! I'm your dairy farming assistant. I can help you with cow health, breeding, nutrition, and more. Please select your preferred language and let me know how I can help you today!",
      isUser: false,
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("en");
  const [selectedProblem, setSelectedProblem] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [commonProblems, setCommonProblems] = useState<CommonProblem[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Fetch common problems when language changes
  useEffect(() => {
    if (isOpen) {
      fetchCommonProblems();
    }
  }, [selectedLanguage, isOpen]);

  // Initial fetch when chatbot opens
  useEffect(() => {
    if (isOpen && commonProblems.length === 0) {
      fetchCommonProblems();
    }
  }, [isOpen]);

  // Listen for custom event to open chatbot from navigation
  useEffect(() => {
    const handleOpenChatbot = () => {
      console.log('Opening chatbot from navigation button');
      setIsOpen(true);
    };
    document.addEventListener('openChatbot', handleOpenChatbot);
    
    return () => {
      document.removeEventListener('openChatbot', handleOpenChatbot);
    };
  }, []);

  const fetchCommonProblems = async () => {
    try {
      console.log('Fetching common problems for language:', selectedLanguage);
      const response = await apiFetch<{ problems: CommonProblem[], language: string }>(`/chatbot/problems?language=${selectedLanguage}`);
      setCommonProblems(response.problems);
      console.log('Fetched problems:', response.problems);
    } catch (error) {
      console.error('Failed to fetch common problems:', error);
      // Fallback to default problems if API fails
      setCommonProblems(COMMON_PROBLEMS);
    }
  };

  const handleLanguageChange = (newLanguage: string) => {
    console.log('Language changed from', selectedLanguage, 'to', newLanguage);
    setSelectedLanguage(newLanguage);
    setSelectedProblem(""); // Reset selected problem when language changes
  };

  const handleProblemSelect = (problem: string) => {
    console.log('Problem selected:', problem);
    setSelectedProblem(problem);
    setInputText("");
  };

  const handleSendMessage = async () => {
    if (!inputText.trim() && !selectedProblem) return;

    const userMessage = inputText || selectedProblem;
    const newMessage: Message = {
      id: Date.now().toString(),
      text: userMessage,
      isUser: true,
      timestamp: new Date(),
    };

    console.log('User sending message:', {
      message: userMessage,
      language: selectedLanguage,
      timestamp: new Date()
    });

    setMessages(prev => [...prev, newMessage]);
    setInputText("");
    setSelectedProblem("");
    setIsLoading(true);

    try {
      console.log('Sending request to chatbot API...');
      const response = await apiFetch<ChatbotResponse>("/chatbot/query", {
        method: "POST",
        body: JSON.stringify({
          message: userMessage,
          language: selectedLanguage,
        }),
      });

      console.log('Chatbot API response:', response);

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: response.response,
        isUser: false,
        timestamp: new Date(),
      };

      console.log('Adding bot message to chat:', botMessage);
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error("Failed to get AI response:", error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "Sorry, I'm having trouble connecting right now. Please try again later.",
        isUser: false,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <>
      {/* Chatbot Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 bg-gradient-to-r from-blue-700 to-emerald-600 hover:from-blue-800 hover:to-emerald-700 text-white p-4 rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-110"
        aria-label="Open chatbot"
      >
        {isOpen ? (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <div className="flex items-center space-x-1">
            <span className="text-lg">🤖</span>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
        )}
      </button>

      {/* Chatbot Interface */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-40 w-80 sm:w-96 h-[600px] bg-white rounded-xl shadow-2xl border border-gray-200 flex flex-col animate-in slide-in-from-bottom-4 fade-in duration-300">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-700 to-emerald-600 text-white p-4 rounded-t-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-white bg-opacity-20 backdrop-blur-sm rounded-full flex items-center justify-center">
                  <span className="text-2xl">🤖</span>
                </div>
                <div>
                  <h3 className="font-semibold text-white">AI Dairy Assistant</h3>
                  <p className="text-sm text-white text-opacity-80">Powered by Gemini AI</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white hover:text-gray-200 p-1 rounded-lg hover:bg-white hover:bg-opacity-10 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Language and Problem Selection */}
          <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-emerald-50">
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <span className="inline-flex items-center space-x-2">
                    <span>🌍</span>
                    <span>Language / भाषा</span>
                  </span>
                </label>
                <select
                  value={selectedLanguage}
                  onChange={(e) => handleLanguageChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 text-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-white transition-colors"
                >
                  {LANGUAGES.map((lang) => (
                    <option key={lang.code} value={lang.code}>
                      {lang.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <span className="inline-flex items-center space-x-2">
                    <span>🩺</span>
                    <span>Common Problems / सामान्य समस्याएं</span>
                  </span>
                </label>
                <select
                  value={selectedProblem}
                  onChange={(e) => handleProblemSelect(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 text-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-white transition-colors"
                >
                  <option value="">Select a common problem...</option>
                  {commonProblems.map((problem) => (
                    <option key={problem.id} value={problem.problem}>
                      {problem.problem} ({problem.category})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.isUser ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] px-4 py-3 rounded-2xl shadow-sm ${
                    message.isUser
                      ? "bg-gradient-to-r from-blue-700 to-emerald-600 text-white rounded-br-md"
                      : "bg-white text-gray-800 border border-gray-200 rounded-bl-md"
                  }`}
                >
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.text}</p>
                  <p className={`text-xs mt-2 ${
                    message.isUser ? "text-white text-opacity-70" : "text-gray-500"
                  }`}>
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white text-gray-800 max-w-[85%] px-4 py-3 rounded-2xl rounded-bl-md shadow-sm border border-gray-200">
                  <div className="flex items-center space-x-3">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-emerald-600 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
                      <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                    </div>
                    <span className="text-sm text-gray-600 font-medium">AI is thinking...</span>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-gray-200 bg-white">
            <div className="flex space-x-2">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your farming question here..."
                className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm transition-all"
                disabled={isLoading}
              />
              <button
                onClick={handleSendMessage}
                disabled={isLoading || (!inputText.trim() && !selectedProblem)}
                className="px-4 py-3 bg-gradient-to-r from-blue-700 to-emerald-600 hover:from-blue-800 hover:to-emerald-700 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
            <div className="mt-3 p-3 bg-gradient-to-r from-blue-50 to-emerald-50 rounded-lg border border-blue-100">
              <p className="text-xs text-center text-gray-600 leading-relaxed">
                <span className="inline-flex items-center space-x-1">
                  <span>🐄</span>
                  <span>Ask about cow health, breeding, nutrition, or any farming questions</span>
                </span>
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}