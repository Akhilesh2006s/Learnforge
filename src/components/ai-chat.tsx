import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Loader2, Mic, Image as ImageIcon, Sparkles } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { API_BASE_URL } from "@/lib/api-config";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  type?: "text" | "voice" | "image";
}

interface AIChatProps {
  userId: string;
  context?: {
    studentName?: string;
    currentSubject?: string;
    currentTopic?: string;
    recentTest?: string;
  };
  className?: string;
}

export default function AIChat({ userId, context, className }: AIChatProps) {
  const [message, setMessage] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [localMessages, setLocalMessages] = useState<Message[]>([]);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get chat sessions with auto-refresh
  const { data: sessions, isLoading, refetch } = useQuery({
    queryKey: ["/api/users", userId, "chat-sessions"],
    queryFn: async () => {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_BASE_URL}/api/users/${userId}/chat-sessions`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) {
        throw new Error('Failed to fetch chat sessions');
      }
      return response.json();
    },
    refetchInterval: 2000, // Refresh every 2 seconds to get new messages
  });

  const currentSession = sessions?.[0];
  const sessionMessages: Message[] = (currentSession?.messages as Message[]) || [];

  // Merge local and session messages
  useEffect(() => {
    if (sessionMessages.length > 0) {
      setLocalMessages(sessionMessages);
    }
  }, [sessionMessages]);

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (data: { message: string; context?: any }) => {
      const token = localStorage.getItem('authToken');
      
      // Add user message immediately to local state
      const userMessage: Message = {
        role: 'user',
        content: data.message,
        timestamp: new Date(),
      };
      setLocalMessages(prev => [...prev, userMessage]);

      const response = await fetch(`${API_BASE_URL}/api/ai-chat`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          message: data.message,
          context: {
            ...data.context,
            studentName: context?.studentName || 'Student',
            currentSubject: context?.currentSubject || data.context?.currentSubject,
            currentTopic: context?.currentTopic || data.context?.currentTopic,
          },
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      const result = await response.json();
      
      // Add AI response to local state immediately
      if (result.session?.messages) {
        setLocalMessages(result.session.messages);
      } else if (result.message) {
        const aiMessage: Message = {
          role: 'assistant',
          content: result.message,
          timestamp: new Date(),
        };
        setLocalMessages(prev => [...prev, aiMessage]);
      }

      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users", userId, "chat-sessions"] });
      setMessage("");
      // Refetch to get latest session
      setTimeout(() => refetch(), 500);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to send message. Please try again.",
        variant: "destructive",
      });
      // Remove the user message if sending failed
      setLocalMessages(prev => prev.slice(0, -1));
    },
  });

  // Image analysis mutation
  const analyzeImageMutation = useMutation({
    mutationFn: async (data: { image: string; context?: string }) => {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_BASE_URL}/api/ai-chat/analyze-image`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error('Failed to analyze image');
      }
      return response.json();
    },
    onSuccess: (data) => {
      sendMessageMutation.mutate({
        message: `Please analyze this image: ${data.analysis}`,
        context,
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to analyze image. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [localMessages]);

  const handleSendMessage = () => {
    if (!message.trim() || sendMessageMutation.isPending) return;
    
    const subjectContext = context?.currentSubject || 'General Preparation';
    sendMessageMutation.mutate({ 
      message: message.trim(),
      context: {
        ...context,
        currentSubject: subjectContext,
      }
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      const base64Data = base64.split(",")[1];
      analyzeImageMutation.mutate({
        image: base64Data,
        context: `Subject: ${context?.currentSubject || 'General Preparation'}. Please analyze this educational image and help me understand the concepts.`,
      });
    };
    reader.readAsDataURL(file);
  };

  const handleVoiceInput = () => {
    if (!("webkitSpeechRecognition" in window) && !("SpeechRecognition" in window)) {
      toast({
        title: "Not Supported",
        description: "Speech recognition is not supported in your browser.",
        variant: "destructive",
      });
      return;
    }

    const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-US";

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      if (transcript.trim()) {
        setMessage(transcript);
        setTimeout(() => {
          handleSendMessage();
        }, 100);
      }
    };

    recognition.onerror = () => {
      toast({
        title: "Error",
        description: "Failed to recognize speech. Please try again.",
        variant: "destructive",
      });
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  if (isLoading && localMessages.length === 0) {
    return (
      <Card className={`${className} border-0 shadow-xl`}>
        <CardContent className="flex items-center justify-center h-96">
          <Loader2 className="w-6 h-6 animate-spin text-purple-600" />
        </CardContent>
      </Card>
    );
  }

  const displayMessages = localMessages.length > 0 ? localMessages : sessionMessages;
  const currentSubject = context?.currentSubject || 'General Preparation';

  return (
    <Card className={`${className} border-0 shadow-xl flex flex-col h-[600px]`}>
      {/* Header */}
      <CardHeader className="border-b bg-gradient-to-r from-purple-600 to-pink-600 text-white pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg overflow-hidden border-2 border-white/30">
              <img 
                src="/ROBOT.gif" 
                alt="Vidya AI" 
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
                Vidya AI
                <Sparkles className="w-4 h-4 text-yellow-300" />
              </CardTitle>
              <p className="text-xs text-white/90">Online • {currentSubject}</p>
            </div>
          </div>
        </div>
      </CardHeader>

      {/* Chat Messages */}
      <CardContent className="flex-1 p-0 flex flex-col overflow-hidden">
        <ScrollArea className="flex-1 px-4 py-4">
          <div className="space-y-4">
            {displayMessages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full py-8 text-center">
                <div className="w-16 h-16 rounded-xl overflow-hidden mb-4 border-2 border-purple-200">
                  <img 
                    src="/ROBOT.gif" 
                    alt="Vidya AI" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <p className="text-gray-700 font-medium mb-1">Ask me anything about {currentSubject}!</p>
                <p className="text-gray-500 text-sm">I'm here to help with your studies</p>
              </div>
            ) : (
              displayMessages.map((msg, index) => (
                <div
                  key={index}
                  className={`flex items-start gap-3 ${
                    msg.role === "user" ? "flex-row-reverse" : ""
                  } animate-in fade-in slide-in-from-bottom-2 duration-200`}
                >
                  {/* Avatar */}
                  {msg.role === "assistant" ? (
                    <div className="w-8 h-8 rounded-lg overflow-hidden flex-shrink-0 border border-gray-200">
                      <img 
                        src="/ROBOT.gif" 
                        alt="Vidya AI" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center flex-shrink-0 text-white text-xs font-semibold">
                      {context?.studentName?.charAt(0).toUpperCase() || 'U'}
                    </div>
                  )}
                  
                  {/* Message */}
                  <div className={`flex-1 max-w-[80%] ${msg.role === "user" ? "text-right" : ""}`}>
                    <div
                      className={`inline-block rounded-2xl px-4 py-2.5 shadow-sm ${
                        msg.role === "user"
                          ? "bg-gradient-to-br from-blue-500 to-cyan-500 text-white rounded-tr-sm"
                          : "bg-gray-100 text-gray-800 rounded-tl-sm"
                      }`}
                    >
                      <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                        {msg.content}
                      </p>
                    </div>
                    <span className="text-xs text-gray-400 mt-1 block">
                      {new Date(msg.timestamp).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                </div>
              ))
            )}
            
            {/* Loading Indicator */}
            {sendMessageMutation.isPending && (
              <div className="flex items-start gap-3 animate-in fade-in slide-in-from-bottom-2 duration-200">
                <div className="w-8 h-8 rounded-lg overflow-hidden flex-shrink-0 border border-gray-200">
                  <img 
                    src="/ROBOT.gif" 
                    alt="Vidya AI" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="bg-gray-100 rounded-2xl rounded-tl-sm px-4 py-2.5">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                    <span className="text-xs text-gray-500">Vidya AI is thinking...</span>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Subject Badge */}
        {currentSubject && (
          <div className="px-4 pb-2 border-t border-gray-100 pt-2">
            <Badge className="bg-purple-100 text-purple-700 border-purple-200 text-xs">
              📚 {currentSubject}
            </Badge>
          </div>
        )}

        {/* Input Area */}
        <div className="border-t p-4 bg-gray-50">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 rounded-lg hover:bg-gray-200"
              onClick={handleVoiceInput}
              disabled={isListening || sendMessageMutation.isPending}
              title="Voice input"
            >
              <Mic className={`w-4 h-4 ${isListening ? 'text-red-500 animate-pulse' : ''}`} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 rounded-lg hover:bg-gray-200"
              onClick={() => fileInputRef.current?.click()}
              disabled={sendMessageMutation.isPending}
              title="Upload image"
            >
              <ImageIcon className="w-4 h-4" />
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={`Ask about ${currentSubject}...`}
              className="flex-1 h-10 rounded-lg border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
              disabled={sendMessageMutation.isPending}
            />
            <Button
              onClick={handleSendMessage}
              disabled={!message.trim() || sendMessageMutation.isPending}
              className="h-10 w-10 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-md hover:shadow-lg transition-all"
              size="icon"
            >
              {sendMessageMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
