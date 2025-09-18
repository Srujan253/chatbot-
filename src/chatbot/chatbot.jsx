import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TypingLoader } from '../assets/loader';
import systemData from '../data/systemPrompts.json';

const ChatBot = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hello! Welcome, I am Sinchana H S, your AI assistant. How can I help you today?",
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Function to check if the question matches any predefined Q&A
  const findPredefinedAnswer = (userQuestion) => {
    const lowerUserQuestion = userQuestion.toLowerCase().trim();
    
    for (const qa of systemData.qaDatabase) {
      for (const question of qa.questions) {
        if (lowerUserQuestion.includes(question.toLowerCase()) || 
            question.toLowerCase().includes(lowerUserQuestion)) {
          return qa.answer;
        }
      }
    }
    return null;
  };

  const callGeminiAPI = async (message) => {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    
    if (!apiKey) {
      throw new Error('Gemini API key not found in environment variables');
    }

    // Create system prompt with personal information
    const systemPrompt = `${systemData.systemPrompt}

Personal Information:
- Name: ${systemData.personalInfo.name}
- Location: ${systemData.personalInfo.location}
- Education: ${systemData.personalInfo.education}
- Family: Father - ${systemData.personalInfo.family.father}, Mother - ${systemData.personalInfo.family.mother}, Brother - ${systemData.personalInfo.family.brother}
- Physical: Height - ${systemData.personalInfo.physical.height}, Weight - ${systemData.personalInfo.physical.weight}
- Hobbies: ${systemData.personalInfo.hobbies.join(', ')}
- Friends: ${systemData.personalInfo.friends.join(', ')}

Always respond as Sinchana H S with a personal, friendly tone. Keep responses conversational and include personal touches when relevant.`;

    const requestBody = {
      contents: [
        {
          parts: [
            {
              text: `${systemPrompt}\n\nUser: ${message}\nSinchana:`
            }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.3, // Lower temperature for more consistent responses
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 1024,
      },
      safetySettings: [
        {
          category: "HARM_CATEGORY_HARASSMENT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        },
        {
          category: "HARM_CATEGORY_HATE_SPEECH",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        },
        {
          category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        },
        {
          category: "HARM_CATEGORY_DANGEROUS_CONTENT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        }
      ]
    };

    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      const data = await response.json();
      
      if (data.candidates && data.candidates.length > 0 && data.candidates[0].content && data.candidates[0].content.parts && data.candidates[0].content.parts.length > 0) {
        return data.candidates[0].content.parts[0].text;
      } else {
        throw new Error('Unexpected response structure from Gemini API');
      }
    } catch (error) {
      throw error;
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage = {
      id: Date.now(),
      text: inputMessage,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const messageToSend = inputMessage;
    setInputMessage('');
    setIsLoading(true);

    try {
      // First check for predefined answers
      const predefinedAnswer = findPredefinedAnswer(messageToSend);
      
      let botResponse;
      if (predefinedAnswer) {
        // Use predefined answer
        botResponse = predefinedAnswer;
      } else {
        // Use Gemini API for other questions
        botResponse = await callGeminiAPI(messageToSend);
      }
      
      const botMessage = {
        id: Date.now() + 1,
        text: botResponse,
        sender: 'bot',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error calling Gemini API:', error);
      
      let errorMessage = "Sorry, I'm having trouble responding right now. Please try again later.";
      
      if (error.message.includes('API key')) {
        errorMessage = "API key is missing or invalid. Please check your environment configuration.";
      } else if (error.message.includes('403')) {
        errorMessage = "API access forbidden. Please check your API key permissions.";
      } else if (error.message.includes('429')) {
        errorMessage = "Too many requests. Please wait a moment before trying again.";
      } else if (error.message.includes('500')) {
        errorMessage = "Gemini service is temporarily unavailable. Please try again later.";
      } else if (error.message.includes('404')) {
        errorMessage = "Model not found. The API might have been updated.";
      }
      
      const errorMsg = {
        id: Date.now() + 1,
        text: errorMessage,
        sender: 'bot',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (timestamp) => {
    return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex flex-col">
      {/* Header */}
      <motion.header 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/80 backdrop-blur-sm border-b border-gray-200 px-6 py-4 shadow-sm"
      >
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
              S
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Sinchana H S
              </h1>
              <p className="text-sm text-gray-600">AI Assistant</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-gray-600">Online</span>
          </div>
        </div>
      </motion.header>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto px-6 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <AnimatePresence>
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex items-start space-x-3 max-w-3xl ${
                  message.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                }`}>
                  {/* Avatar */}
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0 ${
                    message.sender === 'user' 
                      ? 'bg-gradient-to-r from-green-500 to-blue-500' 
                      : 'bg-gradient-to-r from-blue-600 to-purple-600'
                  }`}>
                    {message.sender === 'user' ? 'U' : 'S'}
                  </div>
                  
                  {/* Message */}
                  <div className={`rounded-2xl px-6 py-4 ${
                    message.sender === 'user'
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                      : 'bg-white shadow-lg border border-gray-100'
                  }`}>
                    <p className={`text-base leading-relaxed whitespace-pre-wrap ${
                      message.sender === 'user' ? 'text-white' : 'text-gray-800'
                    }`}>
                      {message.text}
                    </p>
                    <p className={`text-xs mt-2 ${
                      message.sender === 'user' ? 'text-blue-100' : 'text-gray-500'
                    }`}>
                      {formatTime(message.timestamp)}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Loading indicator */}
          {isLoading && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex justify-start"
            >
              <div className="flex items-start space-x-3 max-w-3xl">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center text-white font-semibold">
                  S
                </div>
                <div className="bg-white shadow-lg border border-gray-100 rounded-2xl px-6 py-4 flex items-center space-x-3">
                  <TypingLoader />
                  <span className="text-sm text-gray-500">Sinchana is typing...</span>
                </div>
              </div>
            </motion.div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/80 backdrop-blur-sm border-t border-gray-200 px-6 py-6"
      >
        <div className="max-w-4xl mx-auto">
          <div className="flex items-end space-x-4">
            <div className="flex-1 relative">
              <textarea
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask Sinchana anything..."
                className="w-full resize-none border border-gray-300 rounded-2xl px-6 py-4 pr-12 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white shadow-sm max-h-32 min-h-[60px]"
                disabled={isLoading}
                rows={1}
                style={{ 
                  height: 'auto',
                  minHeight: '60px',
                }}
                onInput={(e) => {
                  e.target.style.height = 'auto';
                  e.target.style.height = Math.min(e.target.scrollHeight, 128) + 'px';
                }}
              />
            </div>
            
            <motion.button
              onClick={handleSendMessage}
              disabled={isLoading || !inputMessage.trim()}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-400 text-white p-4 rounded-2xl flex items-center justify-center shadow-lg disabled:shadow-none transition-all duration-200"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {isLoading ? (
                <motion.div
                  className="w-6 h-6 border-2 border-white border-t-transparent rounded-full"
                  animate={{ rotate: 360 }}
                  transition={{
                    duration: 1,
                    repeat: Infinity,
                    ease: "linear"
                  }}
                />
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              )}
            </motion.button>
          </div>
          
          <p className="text-xs text-gray-500 mt-3 text-center">
            Press Enter to send • Shift + Enter for new line
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default ChatBot;