import { useState, useEffect, useRef } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuth } from '@/contexts/AuthContext';
import { useLocalizedText } from '@/hooks/useLocalizedText';
import socketService from '@/lib/socket';
import {
  Send,
  ArrowLeft,
  MoreVertical,
  Phone,
  Video,
  Search,
  Plus,
  Store,
  Circle,
} from 'lucide-react';
import type { Chat, Message, User } from '@/types';

// Mock data
const mockChats = [
  {
    id: '1',
    participant: {
      _id: 'u1',
      name: 'TechPro Electronics',
      avatar: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=100&h=100&fit=crop',
      isOnline: true,
    },
    lastMessage: 'Thank you for your interest in our products!',
    lastMessageTime: '10:30 AM',
    unreadCount: 2,
  },
  {
    id: '2',
    participant: {
      _id: 'u2',
      name: 'Global Textiles',
      avatar: 'https://images.unsplash.com/photo-1558171813-4c088753af8f?w=100&h=100&fit=crop',
      isOnline: false,
    },
    lastMessage: 'We can offer a 10% discount for bulk orders.',
    lastMessageTime: 'Yesterday',
    unreadCount: 0,
  },
  {
    id: '3',
    participant: {
      _id: 'u3',
      name: 'Ahmed Mohamed',
      avatar: '',
      isOnline: true,
    },
    lastMessage: 'Can you provide samples before the order?',
    lastMessageTime: 'Yesterday',
    unreadCount: 0,
  },
];

const mockMessages = [
  {
    _id: 'm1',
    sender: { _id: 'other', name: 'TechPro Electronics' },
    content: 'Hello! Thank you for reaching out. How can I help you today?',
    createdAt: '2024-01-28T10:00:00Z',
    isRead: true,
  },
  {
    _id: 'm2',
    sender: { _id: 'me', name: 'Me' },
    content: 'Hi! I\'m interested in your LED monitors. Do you have 27-inch 4K models available?',
    createdAt: '2024-01-28T10:05:00Z',
    isRead: true,
  },
  {
    _id: 'm3',
    sender: { _id: 'other', name: 'TechPro Electronics' },
    content: 'Yes, we have several 27-inch 4K models. Our most popular one is the ProView 4K with HDR support. The MOQ is 20 units and the price ranges from $350-$450 depending on quantity.',
    createdAt: '2024-01-28T10:10:00Z',
    isRead: true,
  },
  {
    _id: 'm4',
    sender: { _id: 'me', name: 'Me' },
    content: 'That sounds great! What\'s the delivery time for an order of 50 units?',
    createdAt: '2024-01-28T10:15:00Z',
    isRead: true,
  },
  {
    _id: 'm5',
    sender: { _id: 'other', name: 'TechPro Electronics' },
    content: 'For 50 units, we can deliver within 7-10 business days. For that quantity, I can offer you our best price of $380 per unit. Would you like me to prepare a formal quotation?',
    createdAt: '2024-01-28T10:20:00Z',
    isRead: true,
  },
  {
    _id: 'm6',
    sender: { _id: 'other', name: 'TechPro Electronics' },
    content: 'Thank you for your interest in our products!',
    createdAt: '2024-01-28T10:30:00Z',
    isRead: false,
  },
];

export default function ChatPage() {
  const { chatId } = useParams();
  const [searchParams] = useSearchParams();
  const { t } = useTranslation();
  const { user } = useAuth();
  const [selectedChat, setSelectedChat] = useState<string | null>(chatId || null);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState(mockMessages);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Connect to socket
    socketService.connect();

    if (selectedChat) {
      socketService.joinChat(selectedChat);
    }

    const unsubMessage = socketService.onMessage((msg) => {
      setMessages((prev) => [...prev, msg as any]);
    });

    const unsubTyping = socketService.onTyping(() => setIsTyping(true));
    const unsubStopTyping = socketService.onStopTyping(() => setIsTyping(false));

    return () => {
      unsubMessage();
      unsubTyping();
      unsubStopTyping();
      if (selectedChat) {
        socketService.leaveChat(selectedChat);
      }
    };
  }, [selectedChat]);

  const handleSendMessage = () => {
    if (!message.trim() || !selectedChat) return;

    const newMessage = {
      _id: `m${Date.now()}`,
      sender: { _id: 'me', name: 'Me' },
      content: message,
      createdAt: new Date().toISOString(),
      isRead: false,
    };

    setMessages((prev) => [...prev, newMessage]);
    setMessage('');

    // In real app, send via socket
    // socketService.sendMessage({ chatId: selectedChat, senderId: user?._id, content: message });
  };

  const selectedChatData = mockChats.find((c) => c.id === selectedChat);

  return (
    <div className="container py-4 h-[calc(100vh-8rem)]">
      <div className="flex h-full gap-4">
        {/* Chat List */}
        <Card className={`w-full md:w-80 shrink-0 ${selectedChat ? 'hidden md:flex' : 'flex'} flex-col`}>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">{t('chat.title')}</CardTitle>
              <Button size="icon" variant="ghost">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="relative">
              <Search className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search chats..."
                className="ps-10"
              />
            </div>
          </CardHeader>
          <CardContent className="flex-1 overflow-hidden p-0">
            <ScrollArea className="h-full">
              {mockChats.map((chat) => (
                <button
                  key={chat.id}
                  onClick={() => setSelectedChat(chat.id)}
                  className={`w-full flex items-center gap-3 p-4 hover:bg-muted transition-colors text-start ${
                    selectedChat === chat.id ? 'bg-muted' : ''
                  }`}
                >
                  <div className="relative">
                    <Avatar>
                      <AvatarImage src={chat.participant.avatar} />
                      <AvatarFallback>
                        {chat.participant.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    {chat.participant.isOnline && (
                      <Circle className="absolute bottom-0 end-0 h-3 w-3 fill-success text-success" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-medium truncate">{chat.participant.name}</span>
                      <span className="text-xs text-muted-foreground">{chat.lastMessageTime}</span>
                    </div>
                    <p className="text-sm text-muted-foreground truncate">{chat.lastMessage}</p>
                  </div>
                  {chat.unreadCount > 0 && (
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                      {chat.unreadCount}
                    </div>
                  )}
                </button>
              ))}
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Chat Window */}
        {selectedChat ? (
          <Card className={`flex-1 flex flex-col ${!selectedChat ? 'hidden md:flex' : 'flex'}`}>
            {/* Chat Header */}
            <CardHeader className="border-b p-4">
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden"
                  onClick={() => setSelectedChat(null)}
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <Avatar>
                  <AvatarImage src={selectedChatData?.participant.avatar} />
                  <AvatarFallback>
                    {selectedChatData?.participant.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h3 className="font-medium">{selectedChatData?.participant.name}</h3>
                  <p className="text-xs text-muted-foreground">
                    {selectedChatData?.participant.isOnline ? t('chat.online') : t('chat.offline')}
                  </p>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon">
                    <Phone className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon">
                    <Video className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {messages.map((msg) => (
                  <motion.div
                    key={msg._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${msg.sender._id === 'me' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                        msg.sender._id === 'me'
                          ? 'bg-primary text-primary-foreground rounded-br-none'
                          : 'bg-muted rounded-bl-none'
                      }`}
                    >
                      <p className="text-sm">{msg.content}</p>
                      <p className={`text-xs mt-1 ${
                        msg.sender._id === 'me' ? 'text-primary-foreground/70' : 'text-muted-foreground'
                      }`}>
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </motion.div>
                ))}
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-muted rounded-2xl rounded-bl-none px-4 py-2">
                      <p className="text-sm text-muted-foreground">{t('chat.typing')}</p>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Message Input */}
            <div className="border-t p-4">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="flex gap-2"
              >
                <Input
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={t('chat.typeMessage')}
                  className="flex-1"
                />
                <Button type="submit" size="icon" disabled={!message.trim()}>
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </div>
          </Card>
        ) : (
          <Card className="flex-1 hidden md:flex items-center justify-center">
            <div className="text-center text-muted-foreground">
              <Store className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">{t('chat.noChats')}</h3>
              <p className="text-sm">{t('chat.startChat')}</p>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
