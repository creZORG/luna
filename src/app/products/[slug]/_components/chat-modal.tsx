
'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, User, Bot } from 'lucide-react';
import { useState } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface ChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  productName: string;
}

// Placeholder for message type, you would define this based on your data structure
type Message = {
  sender: 'user' | 'bot';
  text: string;
  timestamp: string;
};

export function ChatModal({ isOpen, onClose, productName }: ChatModalProps) {
  const [messages, setMessages] = useState<Message[]>([
    { sender: 'bot', text: `Hi there! I see you're interested in ${productName}. How can I help with your bulk order today?`, timestamp: '10:30 AM' },
    { sender: 'user', text: 'I was hoping to order 500 units. What kind of pricing can you offer?', timestamp: '10:31 AM'},
    { sender: 'bot', text: 'For 500 units, we can definitely offer a good discount. Let me just check the latest rates for you.', timestamp: '10:31 AM'},
  ]);
  const [newMessage, setNewMessage] = useState('');

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const userMessage: Message = {
      sender: 'user',
      text: newMessage,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    // Add user message and a simulated bot reply
    setMessages(prev => [...prev, userMessage]);
    setNewMessage('');

    setTimeout(() => {
        const botReply: Message = {
            sender: 'bot',
            text: 'Thanks for waiting. An operations manager will get back to you shortly with a quote.',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages(prev => [...prev, botReply]);
    }, 1500);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] md:max-w-lg flex flex-col h-[70vh]">
        <DialogHeader>
          <DialogTitle>Chat about {productName}</DialogTitle>
          <DialogDescription>
            Your conversation with the Operations team. Your messages are saved here.
          </DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="flex-grow h-full pr-4 -mr-4">
             <div className="space-y-4 py-4">
                {messages.map((msg, index) => (
                    <div key={index} className={`flex items-end gap-2 ${msg.sender === 'user' ? 'justify-end' : ''}`}>
                        {msg.sender === 'bot' && (
                            <div className="flex-shrink-0 bg-primary text-primary-foreground h-8 w-8 rounded-full flex items-center justify-center">
                                <Bot className="h-5 w-5" />
                            </div>
                        )}
                        <div className={`p-3 rounded-lg max-w-[80%] ${msg.sender === 'user' ? 'bg-muted' : 'bg-secondary text-secondary-foreground'}`}>
                            <p className="text-sm">{msg.text}</p>
                            <p className={`text-xs mt-1 ${msg.sender === 'user' ? 'text-muted-foreground' : 'text-secondary-foreground/70'} text-right`}>{msg.timestamp}</p>
                        </div>
                         {msg.sender === 'user' && (
                            <div className="flex-shrink-0 bg-gray-300 dark:bg-gray-700 text-gray-800 dark:text-gray-200 h-8 w-8 rounded-full flex items-center justify-center">
                                <User className="h-5 w-5" />
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </ScrollArea>

        <form onSubmit={handleSendMessage} className="flex gap-2 border-t pt-4">
          <Input 
            placeholder="Type your message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
          />
          <Button type="submit" size="icon">
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
