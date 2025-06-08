
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageSquare, Book, HelpCircle, Send, Bot, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Support = () => {
  const [chatMessages, setChatMessages] = useState([
    { id: 1, sender: "bot", message: "Hello! I'm your AI assistant. How can I help you today?", time: "10:00 AM" },
  ]);
  const [newMessage, setNewMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const { toast } = useToast();

  const faqItems = [
    {
      question: "How do I create a new token?",
      answer: "Go to the Create page, fill in your token details, set the bonding curve parameters, and deploy to your chosen blockchain. The process is automated and takes just a few minutes."
    },
    {
      question: "What is a bonding curve?",
      answer: "A bonding curve is a smart contract that automatically determines token price based on supply. As more tokens are bought, the price increases, ensuring fair price discovery."
    },
    {
      question: "How do I bridge tokens between chains?",
      answer: "Use our Bridge feature to transfer tokens between supported networks. Connect your wallet, select source and destination chains, enter the amount, and confirm the transaction."
    },
    {
      question: "What are STEX points and how do I earn them?",
      answer: "STEX points are reward tokens earned through platform activities like trading, referring friends, and daily GM messages. They can be used for governance and platform benefits."
    },
    {
      question: "Is my wallet secure on Scryptex?",
      answer: "Yes, we use industry-standard security practices. We never store your private keys, and all transactions are processed through secure smart contracts."
    },
  ];

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    const userMessage = {
      id: chatMessages.length + 1,
      sender: "user",
      message: newMessage,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setChatMessages(prev => [...prev, userMessage]);
    setNewMessage("");
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const botResponse = {
        id: chatMessages.length + 2,
        sender: "bot",
        message: generateAIResponse(newMessage),
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setChatMessages(prev => [...prev, botResponse]);
      setIsTyping(false);
    }, 2000);
  };

  const generateAIResponse = (userMessage: string) => {
    const responses = [
      "I understand your question about " + userMessage.toLowerCase() + ". Let me help you with that. You can find detailed information in our documentation or feel free to ask for more specific guidance.",
      "That's a great question! Based on what you're asking about " + userMessage.toLowerCase() + ", I'd recommend checking our step-by-step guides. Would you like me to walk you through the process?",
      "Thanks for reaching out! For issues related to " + userMessage.toLowerCase() + ", our support team typically recommends these steps. Let me know if you need more detailed assistance.",
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  };

  const submitTicket = () => {
    toast({
      title: "Ticket Submitted",
      description: "Your support ticket has been submitted. We'll get back to you within 24 hours.",
    });
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-6xl">
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-text-primary">Help & Support</h1>
          <p className="text-text-secondary">Get help with AI chat, browse FAQs, or submit a support ticket</p>
        </div>

        <Tabs defaultValue="chat" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="chat" className="flex items-center space-x-2">
              <MessageSquare size={16} />
              <span>AI Chat</span>
            </TabsTrigger>
            <TabsTrigger value="faq" className="flex items-center space-x-2">
              <HelpCircle size={16} />
              <span>FAQ</span>
            </TabsTrigger>
            <TabsTrigger value="ticket" className="flex items-center space-x-2">
              <Book size={16} />
              <span>Support Ticket</span>
            </TabsTrigger>
          </TabsList>

          {/* AI Chat */}
          <TabsContent value="chat">
            <Card className="trading-card">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Bot className="text-primary" />
                  <span>AI Assistant</span>
                  <Badge variant="outline" className="text-success">Online</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Chat Messages */}
                  <div className="h-96 overflow-y-auto space-y-3 p-4 bg-bg-tertiary rounded-lg">
                    {chatMessages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                            msg.sender === "user"
                              ? "bg-primary text-white"
                              : "bg-bg-secondary text-text-primary"
                          }`}
                        >
                          <div className="flex items-start space-x-2">
                            {msg.sender === "bot" && <Bot size={16} className="mt-1 text-primary" />}
                            {msg.sender === "user" && <User size={16} className="mt-1" />}
                            <div>
                              <p className="text-sm">{msg.message}</p>
                              <p className="text-xs opacity-70 mt-1">{msg.time}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                    {isTyping && (
                      <div className="flex justify-start">
                        <div className="max-w-xs lg:max-w-md px-4 py-2 rounded-lg bg-bg-secondary">
                          <div className="flex items-center space-x-2">
                            <Bot size={16} className="text-primary" />
                            <div className="flex space-x-1">
                              <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
                              <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
                              <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Message Input */}
                  <div className="flex space-x-2">
                    <Input
                      placeholder="Type your message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                      className="flex-1"
                    />
                    <Button onClick={sendMessage} className="button-primary">
                      <Send size={16} />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* FAQ */}
          <TabsContent value="faq">
            <Card className="trading-card">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <HelpCircle className="text-warning" />
                  <span>Frequently Asked Questions</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {faqItems.map((item, index) => (
                    <div key={index} className="border border-bg-tertiary rounded-lg p-4">
                      <h3 className="font-medium text-text-primary mb-2">{item.question}</h3>
                      <p className="text-sm text-text-secondary">{item.answer}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Support Ticket */}
          <TabsContent value="ticket">
            <Card className="trading-card">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Book className="text-accent" />
                  <span>Submit Support Ticket</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Subject</label>
                      <Input placeholder="Brief description of your issue" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Priority</label>
                      <select className="w-full px-3 py-2 bg-bg-tertiary border border-bg-tertiary rounded-md">
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                        <option value="urgent">Urgent</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Category</label>
                    <select className="w-full px-3 py-2 bg-bg-tertiary border border-bg-tertiary rounded-md">
                      <option value="technical">Technical Issue</option>
                      <option value="account">Account Support</option>
                      <option value="trading">Trading Help</option>
                      <option value="billing">Billing Question</option>
                      <option value="feature">Feature Request</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Description</label>
                    <Textarea
                      placeholder="Please provide detailed information about your issue..."
                      className="min-h-32"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Email</label>
                    <Input type="email" placeholder="your.email@example.com" />
                  </div>

                  <Button onClick={submitTicket} className="button-primary w-full">
                    Submit Ticket
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Support;
