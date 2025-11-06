'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useQuizStore } from '@/stores/quiz-store'; // クイズストアのインポート - Import quiz store
import { QuizLocation } from '@/types/quiz'; // QuizLocation 型のインポート - Import QuizLocation type
import { MessageCircle, X, Send, Paperclip, RotateCcw, Image as ImageIcon, Camera } from 'lucide-react';

// メッセージインターフェースの定義 - Define message interface
interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  image?: string; // Base64 エンコードされた画像 - Base64 encoded image
  timestamp: Date;
}

// VisualSceneAnalyzer コンポーネントのプロパティ - VisualSceneAnalyzer component props
interface VisualSceneAnalyzerProps {
  isOpen: boolean;
  toggleOpen: () => void;
}

// メインコンポーネント - Main component
const VisualSceneAnalyzer: React.FC<VisualSceneAnalyzerProps> = ({ isOpen, toggleOpen }) => {
  // チャット機能の状態 - State for chat functionality
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState<string>('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [dragActive, setDragActive] = useState<boolean>(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // ローカルストレージから会話履歴を読み込む - Load conversation history from localStorage
  useEffect(() => {
    const savedMessages = localStorage.getItem('visualSceneAnalyzerHistory');
    if (savedMessages) {
      try {
        const parsedMessages = JSON.parse(savedMessages).map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }));
        setMessages(parsedMessages);
      } catch (error) {
        console.error('会話履歴の読み込みエラー:', error); // Error loading conversation history
      }
    }
  }, []);

  // 会話履歴をローカルストレージに保存 - Save conversation history to localStorage
  useEffect(() => {
    localStorage.setItem('visualSceneAnalyzerHistory', JSON.stringify(messages));
  }, [messages]);

  // メッセージの変更時にチャットの下部にスクロール - Scroll to bottom of chat when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // 画像選択の処理 - Handle image selection
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setSelectedImage(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // ドラッグアンドドロップの処理 - Handle drag and drop
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (event) => {
          if (event.target?.result) {
            setSelectedImage(event.target.result as string);
          }
        };
        reader.readAsDataURL(file);
      }
    }
  };

  // AI 応答をフォーマットし、3Dシーンと統合 - Format AI response and integrate with 3D scene
  const processAiResponse = (response: string) => {
    // AI 応答から位置情報の参照を抽出 - Extract location references from AI response
    const locationMap: Record<string, QuizLocation> = {
      'tokyo': QuizLocation.TOKYO,
      'shibuya': QuizLocation.SHIBUYA,
      'shinjuku': QuizLocation.SHINJUKU,
      'asakusa': QuizLocation.ASAKUSA,
      'tokyo tower': QuizLocation.TOKYO,
      'skytree': QuizLocation.TOKYO,
      'harajuku': QuizLocation.TOKYO,
      'ginza': QuizLocation.TOKYO,
      'roppongi': QuizLocation.TOKYO
    };

    // 応答内の位置情報を検索 - Look for location references in the response
    let foundLocation: QuizLocation | null = null;
    Object.entries(locationMap).forEach(([key, location]) => {
      if (response.toLowerCase().includes(key)) {
        foundLocation = location;
      }
    });

    // 一致する位置情報が見つかった場合、カメラを移動 - If matching location found, move camera
    if (foundLocation) {
      // 現在のクイズストアの moveCameraToLocation 関数を使用 - Use the existing quiz store's moveCameraToLocation function
      useQuizStore.getState().moveCameraToLocation(foundLocation, () => {
        console.log(`${foundLocation} にカメラを移動しました`); // Camera moved to location
      });
    }

    return response;
  };

  // Qwen3-VL API にメッセージを送信 - Send message to Qwen3-VL API
  const sendMessage = async () => {
    if ((!inputText && !selectedImage) || isAnalyzing) return;

    // ユーザーメッセージを作成 - Create user message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputText,
      image: selectedImage || undefined,
      timestamp: new Date()
    };

    // ユーザーメッセージをチャットに追加 - Add user message to chat
    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsAnalyzing(true);
    
    // 送信後に選択された画像をクリア - Clear selected image after sending
    const imageToSend = selectedImage;
    setSelectedImage(null);

    try {
      // API 用のメッセージを準備 - Prepare the message for the API
      let prompt = "この画像を分析して、東京のランドマーク、建物、通り、またはその他の特徴的な場所を識別してください。見えるものを説明し、場所に関する情報を提供してください。"; // Analyze this image and identify any Tokyo landmarks, buildings, streets or other notable features. Describe what you see and provide information about the location.
      if (inputText) {
        prompt = inputText;
      }

      // Ollama API へのリクエストを準備 - Prepare the request to the Ollama API
      const requestBody = {
        model: 'qwen3-vl:8b',
        prompt: prompt,
        stream: false,
        images: imageToSend ? [imageToSend.split(',')[1]] : []  // データ URL から base64 を抽出 - Extract base64 from data URL
      };

      // Ollama API を呼び出す - Call the Ollama API
      const response = await fetch('http://localhost:11434/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        throw new Error(`API リクエストがステータス ${response.status} で失敗しました`); // API request failed with status
      }

      const data = await response.json();
      const aiResponse = data.response || 'AI モデルからの応答がありません'; // No response from AI model

      // 応答を処理し、位置情報にカメラを移動させる - Process the response and potentially move camera to location
      const processedResponse = processAiResponse(aiResponse);

      // AI メッセージを作成 - Create AI message
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: processedResponse,
        timestamp: new Date()
      };

      // AI 応答をチャットに追加 - Add AI response to chat
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('AI API 呼び出しエラー:', error); // Error calling AI API
      
      // エラーメッセージをチャットに追加 - Add error message to chat
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: '画像の分析中にエラーが発生しました。もう一度お試しください。', // Sorry, there was an error analyzing your image. Please try again.
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Enter キー押下時の処理（Shift を押さずに改行）- Handle Enter key press for sending messages (without Shift for new line)
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // 会話履歴をクリア - Clear conversation history
  const clearHistory = () => {
    setMessages([]);
    localStorage.removeItem('visualSceneAnalyzerHistory');
  };

  // 画像プレビューエリア - Image preview area
  const ImagePreview = () => {
    if (!selectedImage) return null;
    
    return (
      <div className="p-3 border-t border-gray-700 bg-gray-800">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-300">選択された画像:</span> {/* Selected image: */}
          <button
            onClick={() => setSelectedImage(null)}
            className="text-gray-400 hover:text-white"
          >
            ✕
          </button>
        </div>
        <div className="flex items-center space-x-2">
          <img
            src={selectedImage}
            alt="プレビュー" // Preview
            className="h-16 w-16 object-cover rounded border border-gray-600"
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm truncate text-gray-200">分析用画像が選択されました</p> {/* Image selected for analysis */}
          </div>
        </div>
      </div>
    );
  };

  // メッセージ表示コンポーネント - Message display component
  const MessageDisplay = ({ message }: { message: Message }) => (
    <div
      key={message.id}
      className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
    >
      <div
        className={`max-w-[85%] rounded-xl p-4 ${
          message.role === 'user'
            ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-br-none'
            : 'bg-gradient-to-r from-gray-700 to-gray-600 text-gray-100 rounded-bl-none'
        }`}
      >
        {/* ユーザーメッセージの画像 - User message image */}
        {message.image && (
          <div className="mb-2">
            <img
              src={message.image}
              alt="アップロードされたコンテンツ" // Uploaded content
              className="max-h-40 rounded-lg object-contain border border-gray-500"
            />
          </div>
        )}
        
        {/* メッセージ内容 - Message content */}
        <div className="whitespace-pre-wrap">{message.content}</div>
        
        {/* タイムスタンプ - Timestamp */}
        <div className={`text-xs mt-2 ${message.role === 'user' ? 'text-blue-200' : 'text-gray-400'}`}>
          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* フローティングチャットボタン - Floating chat button */}
      {!isOpen && (
        <button
          onClick={toggleOpen}
          className="fixed bottom-6 right-6 bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white p-4 rounded-full shadow-xl z-50 transition-all duration-300 flex items-center justify-center border-2 border-white group"
          aria-label="ビジュアルシーンアナライザーを開く" // Open Visual Scene Analyzer
        >
          <div className="flex items-center">
            <span className="mr-1.5 text-sm font-semibold">AI</span>
            <div className="bg-white/20 p-1 rounded-full">
              <Camera size={18} className="text-white" />
            </div>
          </div>
        </button>
      )}

      {/* チャットボックス - Expands from button - Chat box that expands from button */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-80 max-w-xs flex flex-col bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden transform transition-all duration-300 ease-in-out">
          {/* チャットヘッダー - Chat header */}
          <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
            <div className="flex items-center space-x-2">
              <div className="w-9 h-9 rounded-full bg-blue-500 flex items-center justify-center">
                <Camera size={16} className="text-white" />
              </div>
              <div>
                <div className="font-semibold text-sm">AI Vision Analyzer</div>
              </div>
            </div>
            <button
              onClick={toggleOpen}
              className="text-white hover:text-gray-200 p-1 rounded-full hover:bg-blue-500 transition-colors"
              aria-label="チャットを閉じる" // Close chat
            >
              <X size={18} />
            </button>
          </div>

          {/* チャットメッセージコンテナ - Chat messages container */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 max-h-80">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center p-4 text-gray-500">
                <div className="mb-3 text-4xl">📷</div>
                <h3 className="text-base font-semibold text-gray-700 mb-1">Visual Scene Analyzer</h3>
                <p className="text-sm text-gray-500 mb-4">
                  Upload an image of Tokyo landmarks to analyze
                </p>
                <div className="grid grid-cols-2 gap-2 max-w-xs w-full">
                  <div className="bg-blue-100 text-blue-800 text-xs font-medium py-1.5 px-2 rounded-lg text-center">Tokyo Tower</div>
                  <div className="bg-blue-100 text-blue-800 text-xs font-medium py-1.5 px-2 rounded-lg text-center">Shibuya</div>
                  <div className="bg-blue-100 text-blue-800 text-xs font-medium py-1.5 px-2 rounded-lg text-center">Shinjuku</div>
                  <div className="bg-blue-100 text-blue-800 text-xs font-medium py-1.5 px-2 rounded-lg text-center">Asakusa</div>
                </div>
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl p-3.5 ${
                      message.role === 'user'
                        ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-br-none'
                        : 'bg-white text-gray-800 border border-gray-200 rounded-bl-none shadow-sm'
                    }`}
                  >
                    <div className="flex items-start">
                      {message.role === 'assistant' && (
                        <div className="flex-shrink-0 mr-2.5">
                          <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
                            <Camera size={12} className="text-blue-600" />
                          </div>
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        {/* 画像 in message (for user only) */}
                        {message.image && (
                          <div className="mb-2 -mt-1.5 -mx-3.5 -mb-1.5 p-2 bg-white/10 rounded-lg">
                            <img
                          src={message.image}
                          alt="アップロードされたコンテンツ" // Uploaded content
                          className="max-h-24 rounded object-cover border border-white/30"
                        />
                      </div>
                        )}
                        
                        {/* メッセージ内容 - Message content */}
                        <div className="text-sm whitespace-pre-wrap">{message.content}</div>
                        
                        {/* タイムスタンプ - Timestamp */}
                        <div className={`text-xs mt-1.5 ${message.role === 'user' ? 'text-blue-100' : 'text-gray-500'}`}>
                          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                      {message.role === 'user' && (
                        <div className="flex-shrink-0 ml-2.5">
                          <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
                            <span className="text-xs font-bold text-blue-600">U</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* 画像プレビューエリア - Image preview area */}
          {selectedImage && (
            <div className="p-3 bg-gray-100 border-t border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-gray-600 font-medium">Selected image:</span> {/* Selected image: */}
                <button
                  onClick={() => setSelectedImage(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X size={14} />
                </button>
              </div>
              <div className="flex items-center space-x-2.5">
                <img
                  src={selectedImage}
                  alt="プレビュー" // Preview
                  className="h-10 w-10 object-cover rounded-lg border border-gray-300"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-700 truncate">Image ready to analyze</p>
                </div>
              </div>
            </div>
          )}

          {/* 入力エリア - Input area */}
          <div className="border-t border-gray-200 p-3 bg-white">
            <div className="flex items-center space-x-2">
              <div className="flex-1 relative">
                <textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Describe the image or ask a question..."
                  className="w-full bg-gray-100 text-gray-800 text-sm border border-gray-300 rounded-xl py-2 pl-3 pr-8 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  rows={2}
                  disabled={isAnalyzing}
                />
                <div className="absolute right-2 top-2 text-gray-400">
                  <span className="text-xs">{inputText.length}/500</span>
                </div>
              </div>
              <button
                onClick={sendMessage}
                disabled={isAnalyzing || (!inputText && !selectedImage)}
                className={`w-9 h-9 flex items-center justify-center rounded-full transition-colors ${
                  isAnalyzing || (!inputText && !selectedImage)
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:from-blue-600 hover:to-indigo-700'
                }`}
              >
                {isAnalyzing ? (
                  <svg className="animate-spin h-3.5 w-3.5 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  <Send size={16} />
                )}
              </button>
            </div>
            <div className="mt-2 flex justify-center">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageChange}
                accept="image/*"
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-gray-500 hover:text-blue-600 p-2 rounded-full hover:bg-gray-100 transition-colors flex items-center"
                aria-label="画像を添付" // Attach image
              >
                <Paperclip size={16} className="rotate-45" />
                <span className="ml-1.5 text-xs text-gray-600">Add image</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default VisualSceneAnalyzer;