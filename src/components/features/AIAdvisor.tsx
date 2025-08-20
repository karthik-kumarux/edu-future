
import { useState } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

// Mock conversation data
const initialMessages = [
  {
    role: "assistant",
    content: "Hello! I'm your AI career advisor. How can I help you today? You can ask me questions about colleges, courses, or career options."
  }
];

// Mock suggested questions
const suggestedQuestions = [
  "What are the best colleges for Computer Science?",
  "How to prepare for engineering entrance exams?",
  "What career options are available after B.Tech?",
  "What skills should I develop for a career in Data Science?"
];

export default function AIAdvisor() {
  const [messages, setMessages] = useState(initialMessages);
  const [userInput, setUserInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const handleSend = async () => {
    if (!userInput.trim()) return;

    // Add user message
    const newMessages = [...messages, { role: "user", content: userInput }];
    setMessages(newMessages);
    setUserInput("");
    
    // Simulate AI typing
    setIsTyping(true);
    
    // Simulate AI response (in a real app, this would be an API call)
    setTimeout(() => {
      setIsTyping(false);
      setMessages([
        ...newMessages,
        {
          role: "assistant",
          content: `Thanks for your question about "${userInput}". This is a simulated response. In the complete application, this would connect to an AI service to provide you with accurate information.`
        }
      ]);
    }, 1500);
  };

  const handleSuggestedQuestion = (question) => {
    setUserInput(question);
    handleSend();
  };

  return (
    <section className="py-16 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">AI Career Advisor</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Get instant answers to your education and career-related questions with our AI-powered assistant.
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <Tabs defaultValue="chat">
            <TabsList className="grid grid-cols-2 mb-8">
              <TabsTrigger value="chat">Chat with AI Advisor</TabsTrigger>
              <TabsTrigger value="assessment">Career Assessment</TabsTrigger>
            </TabsList>
            
            <TabsContent value="chat" className="border border-border bg-card rounded-xl shadow-sm overflow-hidden">
              <div className="h-[500px] flex flex-col">
                {/* Chat header */}
                <div className="p-4 border-b border-border flex items-center">
                  <div className="w-10 h-10 rounded-full bg-education-primary flex items-center justify-center text-white mr-3">
                    AI
                  </div>
                  <div>
                    <h3 className="font-medium">Career Advisor</h3>
                    <p className="text-xs text-muted-foreground">Online | Powered by AI</p>
                  </div>
                </div>
                
                {/* Chat messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.map((message, index) => (
                    <div
                      key={index}
                      className={`flex ${
                        message.role === "user" ? "justify-end" : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-[75%] rounded-2xl px-4 py-3 ${
                          message.role === "user"
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted"
                        }`}
                      >
                        {message.content}
                      </div>
                    </div>
                  ))}
                  
                  {isTyping && (
                    <div className="flex justify-start">
                      <div className="bg-muted rounded-2xl px-4 py-3 flex space-x-1">
                        <div className="w-2 h-2 bg-muted-foreground rounded-full animate-pulse"></div>
                        <div className="w-2 h-2 bg-muted-foreground rounded-full animate-pulse delay-100"></div>
                        <div className="w-2 h-2 bg-muted-foreground rounded-full animate-pulse delay-200"></div>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Suggested questions */}
                {messages.length <= 2 && (
                  <div className="px-4 py-3 border-t border-border">
                    <p className="text-sm text-muted-foreground mb-2">Suggested questions:</p>
                    <div className="flex flex-wrap gap-2">
                      {suggestedQuestions.map((question, index) => (
                        <button
                          key={index}
                          onClick={() => handleSuggestedQuestion(question)}
                          className="text-sm bg-muted hover:bg-muted/80 px-3 py-1.5 rounded-full text-foreground"
                        >
                          {question}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Input area */}
                <div className="p-4 border-t border-border">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Ask a question about colleges, courses, careers..."
                      value={userInput}
                      onChange={(e) => setUserInput(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && handleSend()}
                      className="flex-1"
                    />
                    <Button onClick={handleSend} className="shrink-0">
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="assessment" className="border border-border bg-card rounded-xl shadow-sm p-6">
              <h3 className="text-xl font-semibold mb-4">Career Assessment Tool</h3>
              <p className="text-muted-foreground mb-6">
                Take our comprehensive assessment to discover career paths that match your interests, skills, and personality.
              </p>
              <div className="text-center">
                <Button className="bg-gradient-to-r from-education-primary to-education-secondary border-0">
                  Start Assessment
                </Button>
              </div>
            </TabsContent>
          </Tabs>
          
          <div className="mt-8 text-center text-sm text-muted-foreground">
            <p>AI responses are for guidance only and should not replace professional career counseling.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
