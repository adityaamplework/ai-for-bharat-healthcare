import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Send, Plus, MessageSquare, Loader2, Bot, User } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface Conversation {
  id: number;
  title: string;
  createdAt: string;
}

interface Message {
  id: number;
  conversationId: number;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
}

export default function ChatPage() {
  const queryClient = useQueryClient();
  const scrollRef = useRef<HTMLDivElement>(null);

  const [activeChatId, setActiveChatId] = useState<number | null>(null);
  const [inputMessage, setInputMessage] = useState("");

  // Fetch all conversations for the sidebar
  const { data: conversations = [], isLoading: loadingConversations } =
    useQuery<Conversation[]>({
      queryKey: ["/api/chat/conversations"],
    });

  // Fetch messages for the currently active chat
  const { data: messages = [], isLoading: loadingMessages } = useQuery<
    Message[]
  >({
    queryKey: ["/api/chat/conversations", activeChatId, "messages"],
    enabled: !!activeChatId,
  });

  // Auto-scroll to bottom of messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Set the newest chat as active onload if not already selected
  useEffect(() => {
    if (!activeChatId && conversations.length > 0) {
      setActiveChatId(conversations[0].id);
    }
  }, [conversations, activeChatId]);

  // Create new conversation mutation
  const createChatMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/chat/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: "New AI Chat" }),
      });
      return res.json() as Promise<Conversation>;
    },
    onSuccess: (newChat) => {
      queryClient.invalidateQueries({ queryKey: ["/api/chat/conversations"] });
      setActiveChatId(newChat.id);
    },
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      if (!activeChatId) throw new Error("No active chat");
      const res = await fetch(
        `/api/chat/conversations/${activeChatId}/messages`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content }),
        },
      );
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["/api/chat/conversations", activeChatId, "messages"],
      });
    },
  });

  const handleSendMessage = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputMessage.trim() || !activeChatId || sendMessageMutation.isPending)
      return;

    // Optimistically add user message to the UI before mutation resolves (optional, relying on immediate query invalidate for now)
    sendMessageMutation.mutate(inputMessage.trim());
    setInputMessage("");
  };

  const handleNewChat = () => {
    createChatMutation.mutate();
  };

  return (
    <div className="flex h-[calc(100vh-theme(spacing.16))] w-full gap-4">
      {/* Sidebar - Chat History */}
      <Card className="w-64 md:w-80 flex flex-col rounded-xl overflow-hidden shadow-sm border-muted">
        <div className="p-4 bg-muted/30">
          <Button
            onClick={handleNewChat}
            className="w-full justify-start gap-2 shadow-sm font-semibold"
            disabled={createChatMutation.isPending}
          >
            {createChatMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Plus className="h-4 w-4" />
            )}
            New Chat
          </Button>
        </div>

        <Separator />

        <ScrollArea className="flex-1 p-2">
          {loadingConversations ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              Loading history...
            </div>
          ) : conversations.length === 0 ? (
            <div className="p-4 text-center text-sm text-muted-foreground mt-4">
              No previous conversations.
              <br />
              Click "New Chat" to start!
            </div>
          ) : (
            <div className="flex flex-col gap-1">
              {conversations.map((chat) => (
                <button
                  key={chat.id}
                  onClick={() => setActiveChatId(chat.id)}
                  className={`flex items-center gap-3 px-3 py-3 rounded-lg text-left transition-colors text-sm
                    ${
                      activeChatId === chat.id
                        ? "bg-primary/10 text-primary font-medium"
                        : "hover:bg-muted text-muted-foreground"
                    }`}
                >
                  <MessageSquare
                    className={`h-4 w-4 ${activeChatId === chat.id ? "text-primary" : "text-muted-foreground"}`}
                  />
                  <span className="truncate">{chat.title}</span>
                </button>
              ))}
            </div>
          )}
        </ScrollArea>
      </Card>

      {/* Main Chat Area */}
      <Card className="flex-1 flex flex-col rounded-xl overflow-hidden shadow-sm border-muted">
        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6" ref={scrollRef}>
          {!activeChatId ? (
            <div className="h-full flex flex-col items-center justify-center text-muted-foreground space-y-4">
              <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center">
                <Bot className="h-8 w-8 text-primary" />
              </div>
              <p>Select a conversation or start a new one to begin.</p>
            </div>
          ) : loadingMessages ? (
            <div className="h-full flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary/50" />
            </div>
          ) : messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-muted-foreground space-y-4 max-w-sm mx-auto text-center">
              <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center mb-2">
                <Bot className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-lg font-medium text-foreground">
                Welcome to AyurDiet AI
              </h3>
              <p>
                I am your Ayurvedic AI assistant. Ask me anything about doshas,
                dietary recommendations, or holistic health.
              </p>
            </div>
          ) : (
            <div className="space-y-6 pb-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-4 max-w-3xl ${msg.role === "user" ? "ml-auto" : ""}`}
                >
                  {/* Avatar */}
                  {msg.role === "assistant" && (
                    <div className="h-8 w-8 rounded-full bg-primary/20 flex-shrink-0 flex items-center justify-center mt-1">
                      <Bot className="h-5 w-5 text-primary" />
                    </div>
                  )}

                  <div
                    className={`rounded-2xl px-5 py-3.5 text-sm md:text-base overflow-hidden shadow-sm
                      ${
                        msg.role === "user"
                          ? "bg-primary text-primary-foreground p-4 whitespace-pre-wrap rounded-tr-sm"
                          : "bg-muted/60 text-foreground rounded-tl-sm border border-border prose prose-sm md:prose-base prose-zinc dark:prose-invert max-w-none leading-relaxed"
                      }`}
                  >
                    {msg.role === "assistant" ? (
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {msg.content}
                      </ReactMarkdown>
                    ) : (
                      msg.content
                    )}
                  </div>

                  {/* User Avatar */}
                  {msg.role === "user" && (
                    <div className="h-8 w-8 rounded-full bg-secondary flex-shrink-0 flex items-center justify-center mt-1">
                      <User className="h-5 w-5 text-secondary-foreground" />
                    </div>
                  )}
                </div>
              ))}

              {/* Waiting Indicator */}
              {sendMessageMutation.isPending && (
                <div className="flex gap-4 max-w-3xl">
                  <div className="h-8 w-8 rounded-full bg-primary/20 flex-shrink-0 flex items-center justify-center mt-1">
                    <Bot className="h-5 w-5 text-primary" />
                  </div>
                  <div className="bg-muted/60 text-foreground rounded-2xl rounded-tl-sm px-5 py-4 border border-border flex items-center gap-1.5">
                    <span className="h-2 w-2 bg-primary/40 rounded-full animate-bounce"></span>
                    <span className="h-2 w-2 bg-primary/60 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                    <span className="h-2 w-2 bg-primary/80 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="p-4 bg-background border-t border-muted">
          <form
            onSubmit={handleSendMessage}
            className="flex gap-2 max-w-4xl mx-auto items-end"
          >
            <Input
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder={
                activeChatId
                  ? "Message AyurDiet AI..."
                  : "Select a chat to start messaging"
              }
              className="flex-1 bg-muted/30 border-muted-foreground/20 focus-visible:ring-primary h-12 rounded-xl px-4"
              disabled={!activeChatId || sendMessageMutation.isPending}
            />
            <Button
              type="submit"
              size="icon"
              disabled={
                !inputMessage.trim() ||
                !activeChatId ||
                sendMessageMutation.isPending
              }
              className="h-12 w-12 rounded-xl shadow-md transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <Send className="h-5 w-5" />
            </Button>
          </form>
        </div>
      </Card>
    </div>
  );
}
