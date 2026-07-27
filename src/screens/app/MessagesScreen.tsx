import React, { useEffect, useRef, useState } from "react";
import {
  Search,
  Paperclip,
  Send,
  MoreVertical,
  Star,
  Paintbrush,
  Clock,
  User,
  ArrowLeft,
  CheckCheck,
  MessageCircle,
  Loader2,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useI18n } from "../../i18n";
import { useThemeMode } from "../../theme/useThemeMode";

interface Message {
  id: string;
  sender: "user" | "other";
  senderName: string;
  senderAvatar: string;
  text: string;
  time: string;
}

interface Chat {
  id: string;
  name: string;
  avatar: string;
  profession: string;
  lastMessagePreview: string;
  timeAgo: string;
}

const mockChats: Chat[] = [
  {
    id: "1",
    name: "Sara Jimenez",
    avatar: "https://i.pravatar.cc/150?img=47",
    profession: "Interior Painter",
    lastMessagePreview: "I'm on my way now. I'll be...",
    timeAgo: "Now",
  },
  {
    id: "2",
    name: "Juan Orozco",
    avatar: "https://i.pravatar.cc/150?img=12",
    profession: "Locksmith",
    lastMessagePreview: "I'm on my way now. I'll be...",
    timeAgo: "2h ago",
  },
  {
    id: "3",
    name: "Perla Gutierrez",
    avatar: "https://i.pravatar.cc/150?img=32",
    profession: "Designer",
    lastMessagePreview: "I'm on my way now. I'll be...",
    timeAgo: "2d ago",
  },
];

const initialMessages: Message[] = [
  {
    id: "1",
    sender: "other",
    senderName: "Sara Jimenez",
    senderAvatar: "https://i.pravatar.cc/150?img=47",
    text: "Hello! I've received your request. I'm finishing up a nearby job and will be heading your way in about 5 minutes.",
    time: "10:16 a.m.",
  },
  {
    id: "2",
    sender: "user",
    senderName: "You",
    senderAvatar: "https://i.pravatar.cc/150?img=68",
    text: "Perfect. Thank you! I'll be waiting at the main entrance. The gate code is #4412 if the barrier is down",
    time: "10:18 a.m.",
  },
  {
    id: "3",
    sender: "other",
    senderName: "Sara Jimenez",
    senderAvatar: "https://i.pravatar.cc/150?img=47",
    text: "I'm on my way now. I'll be there in 15 minutes. See you shortly",
    time: "10:25 a.m.",
  },
];

const MessagesScreen: React.FC = () => {
  const { t } = useI18n();
  const d = t("messagesscreen");
  const { isDark } = useThemeMode();

  const [chatsLoading, setChatsLoading] = useState<boolean>(true);
  const [messagesLoading, setMessagesLoading] = useState<boolean>(true);
  const [userInfoLoading, setUserInfoLoading] = useState<boolean>(true);
  const [selectedChatId, setSelectedChatId] = useState<string>("");
  const [rightPanelOpen, setRightPanelOpen] = useState<boolean>(false);
  const [messageText, setMessageText] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [searchLoading, setSearchLoading] = useState<boolean>(false);
  const [filteredChats, setFilteredChats] = useState<Chat[]>(mockChats);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const [prevChatId, setPrevChatId] = useState(selectedChatId);
  const [prevSearchQuery, setPrevSearchQuery] = useState(searchQuery);
  const [isMobile, setIsMobile] = useState<boolean>(() => window.matchMedia("(max-width: 1023px)").matches);

  useEffect(() => {
    const mql = window.matchMedia("(max-width: 1023px)");
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, []);

  if (prevChatId !== selectedChatId) {
    setPrevChatId(selectedChatId);
    setMessagesLoading(true);
    setUserInfoLoading(true);
    setMessages([]);
  }

  if (prevSearchQuery !== searchQuery) {
    setPrevSearchQuery(searchQuery);
    setSearchLoading(true);
  }

  useEffect(() => {
    const timer = setTimeout(() => setChatsLoading(false), 400);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!selectedChatId) return;

    const messagesTimer = setTimeout(() => {
      setMessages(initialMessages);
      setMessagesLoading(false);
    }, 350);
    const userInfoTimer = setTimeout(() => setUserInfoLoading(false), 300);

    return () => {
      clearTimeout(messagesTimer);
      clearTimeout(userInfoTimer);
    };
  }, [selectedChatId]);

  useEffect(() => {
    if (messagesLoading) return;
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, messagesLoading]);

  useEffect(() => {
    const query = searchQuery.trim().toLowerCase();
    const timer = setTimeout(() => {
      setFilteredChats(
        query
          ? mockChats.filter(
              (c) => c.name.toLowerCase().includes(query) || c.profession.toLowerCase().includes(query)
            )
          : mockChats
      );
      setSearchLoading(false);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!messageText.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      sender: "user",
      senderName: "You",
      senderAvatar: "https://i.pravatar.cc/150?img=68",
      text: messageText,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, newMessage]);
    setMessageText("");
  };

  const currentChat = mockChats.find((c) => c.id === selectedChatId);

  const userInfoContent = userInfoLoading ? (
    <div className="w-full flex flex-col items-center animate-pulse">
      <div className="w-28 h-28 rounded-full bg-[var(--msg-input)] mb-4" />
      <div className="h-4 w-32 rounded bg-[var(--msg-input)] mb-2" />
      <div className="h-3 w-24 rounded bg-[var(--msg-input)] mb-10" />
      <div className="w-full space-y-6 flex-1">
        <div className="h-2.5 w-28 rounded bg-[var(--msg-input)]" />
        <div className="flex items-start gap-3.5">
          <div className="w-8 h-8 rounded-lg bg-[var(--msg-input)] flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-3 w-3/4 rounded bg-[var(--msg-input)]" />
            <div className="h-2.5 w-1/2 rounded bg-[var(--msg-input)]" />
          </div>
        </div>
        <div className="flex items-start gap-3.5">
          <div className="w-8 h-8 rounded-lg bg-[var(--msg-input)] flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-3 w-3/4 rounded bg-[var(--msg-input)]" />
            <div className="h-2.5 w-1/2 rounded bg-[var(--msg-input)]" />
          </div>
        </div>
      </div>
      <div className="w-full h-11 rounded-xl bg-[var(--msg-input)] mt-auto" />
    </div>
  ) : (
    currentChat && (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className="w-full flex flex-col items-center flex-1"
      >
        <img src={currentChat.avatar} alt={currentChat.name} className="w-28 h-28 rounded-full object-cover mb-4 shadow-sm" />
        <h3 className="font-bold text-lg text-[var(--msg-text)] truncate">{currentChat.name}</h3>
        <p className="text-sm text-[var(--msg-text-muted)] mb-4 truncate">{currentChat.profession}</p>

        <div className="flex items-center gap-1.5 text-xs text-[var(--msg-text)] mb-10">
          <Star className="w-4 h-4 fill-[#2EBCCC] text-[#2EBCCC]" />
          <span className="font-bold text-[#2EBCCC]">4.9</span>
          <span className="text-[var(--msg-text-muted)]">(124 {d.reviews})</span>
        </div>

        <div className="w-full space-y-6 mb-8 flex-1">
          <span className="text-[11px] font-bold tracking-wider text-[var(--msg-text-muted)] uppercase">
            {d.serviceDetails}
          </span>

          <div className="flex items-start gap-3.5">
            <div className="p-2 bg-[#2EBCCC]/10 rounded-lg text-[#2EBCCC] flex-shrink-0 mt-0.5">
              <Paintbrush className="w-4 h-4 stroke-[2]" />
            </div>
            <div>
              <p className="text-sm font-bold text-[var(--msg-text)]">Home Paint Renovation</p>
              <p className="text-xs text-[var(--msg-text-muted)] mt-0.5">Main entrance</p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="p-2 bg-[#2EBCCC]/10 rounded-lg text-[#2EBCCC] flex-shrink-0 mt-0.5">
              <Clock className="w-4 h-4 stroke-[2]" />
            </div>
            <div>
              <p className="text-sm font-bold text-[var(--msg-text)]">{d.timePosted}</p>
              <p className="text-xs text-[var(--msg-text-muted)] mt-0.5">2h ago ASAP</p>
            </div>
          </div>
        </div>

        <button className="w-full mt-auto py-3.5 bg-[#2EBCCC] hover:bg-[#239aaa] text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition shadow-md">
          <span>{d.seeProfile}</span>
          <User className="w-4 h-4" />
        </button>
      </motion.div>
    )
  );

  return (
    <>
      <style>{`
        .msg-root {
          --msg-bg: ${isDark ? "#151c38" : "#F9FAFB"};
          --msg-card: ${isDark ? "#1e2d5e" : "#ffffff"};
          --msg-input: ${isDark ? "#273570" : "#F8FAFB"};
          --msg-text: ${isDark ? "#ffffff" : "#0f172a"};
          --msg-text-muted: ${isDark ? "#94a3b8" : "#64748b"};
          --msg-border: ${isDark ? "#273570" : "#f1f5f9"};
          --msg-chat-bubble: ${isDark ? "#273570" : "#ffffff"};
        }
      `}</style>

      <div className="msg-root page-enter flex h-full w-full bg-[var(--msg-bg)] text-[var(--msg-text)] font-sans overflow-hidden">
        <div
          className={`w-full lg:w-[340px] bg-[var(--msg-card)] border-r border-[var(--msg-border)] flex flex-col z-10 ${
            selectedChatId ? "hidden lg:flex" : "flex"
          }`}
        >
          <div className="p-5 border-b border-[var(--msg-border)]">
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 grid place-items-center">
                <AnimatePresence initial={false} mode="wait">
                  {searchLoading ? (
                    <motion.div
                      key="loading"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.15, ease: "easeOut" }}
                    >
                      <Loader2 className="h-4 w-4 text-[#2EBCCC] animate-spin" />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="idle"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.15, ease: "easeOut" }}
                    >
                      <Search className="h-4 w-4 text-[var(--msg-text-muted)]" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={d.search}
                className="w-full pl-10 pr-9 py-3 bg-[var(--msg-input)] text-sm rounded-full outline-none focus:ring-1 focus:ring-[#2EBCCC] text-[var(--msg-text)] placeholder-[var(--msg-text-muted)] transition border-0"
              />
              <AnimatePresence>
                {searchQuery && (
                  <motion.button
                    type="button"
                    key="clear"
                    initial={{ opacity: 0, scale: 0.85 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.85 }}
                    transition={{ duration: 0.15, ease: "easeOut" }}
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 grid place-items-center rounded-full text-[var(--msg-text-muted)] hover:text-[var(--msg-text)] hover:bg-[var(--msg-border)] active:scale-90 transition-[background-color,color,transform] duration-150"
                  >
                    <X className="h-3.5 w-3.5" />
                  </motion.button>
                )}
              </AnimatePresence>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {chatsLoading ? (
              <div className="px-3 py-2 space-y-1">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3.5 py-4 pr-4 pl-1">
                    <div className="w-12 h-12 rounded-full bg-[var(--msg-input)] animate-pulse flex-shrink-0" />
                    <div className="flex-1 min-w-0 space-y-2">
                      <div className="h-3 w-2/3 rounded bg-[var(--msg-input)] animate-pulse" />
                      <div className="h-2.5 w-1/3 rounded bg-[var(--msg-input)] animate-pulse" />
                      <div className="h-2.5 w-4/5 rounded bg-[var(--msg-input)] animate-pulse" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredChats.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.18, ease: "easeOut" }}
                className="flex flex-col items-center justify-center gap-2 text-center px-8 py-16"
              >
                <Search className="w-6 h-6 text-[var(--msg-text-muted)]" />
                <p className="text-sm text-[var(--msg-text-muted)]">{d.noResults}</p>
              </motion.div>
            ) : (
              <AnimatePresence initial={false}>
                {filteredChats.map((chat, i) => {
                  const isSelected = selectedChatId === chat.id;
                  return (
                    <motion.div
                      key={chat.id}
                      layout
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{ duration: 0.18, delay: i * 0.03, ease: "easeOut" }}
                      onClick={() => setSelectedChatId(chat.id)}
                      className={`flex items-center gap-3.5 py-4 pr-4 pl-3 cursor-pointer transition-colors border-l-4 ${
                        isSelected ? "bg-[#2EBCCC]/[0.1] border-[#2EBCCC]" : "border-transparent hover:bg-[var(--msg-input)]"
                      }`}
                    >
                      <img src={chat.avatar} alt={chat.name} className="w-12 h-12 rounded-full object-cover flex-shrink-0 ml-1" />
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-baseline gap-1 mb-0.5">
                          <h4 className="font-bold text-sm text-[var(--msg-text)] truncate">{chat.name}</h4>
                          <span className={`text-[11px] ${isSelected ? "text-[#2EBCCC] font-bold" : "text-[var(--msg-text-muted)]"}`}>
                            {chat.timeAgo}
                          </span>
                        </div>
                        <p className="text-xs text-[var(--msg-text-muted)] truncate">{chat.profession}</p>
                        <p className="text-xs text-[var(--msg-text-muted)] opacity-80 truncate mt-1">{chat.lastMessagePreview}</p>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            )}
          </div>
        </div>

        <div className={`flex-1 flex flex-col bg-[var(--msg-bg)] ${!selectedChatId ? "hidden lg:flex" : "flex"}`}>
        {!currentChat ? (
          <div className="page-enter flex-1 flex flex-col items-center justify-center gap-3 text-center px-8">
            <div className="w-16 h-16 rounded-full bg-[#2EBCCC]/10 flex items-center justify-center text-[#2EBCCC] mb-2">
              <MessageCircle className="w-7 h-7" />
            </div>
            <h3 className="font-bold text-base text-[var(--msg-text)]">{d.selectChatTitle}</h3>
            <p className="text-sm text-[var(--msg-text-muted)] max-w-xs">{d.selectChatSubtitle}</p>
          </div>
        ) : (
          <motion.div
            key={currentChat.id}
            initial={isMobile ? { transform: "translateX(100%)" } : { opacity: 0, transform: "translateY(12px)" }}
            animate={{ opacity: 1, transform: isMobile ? "translateX(0%)" : "translateY(0px)" }}
            transition={
              isMobile
                ? { duration: 0.32, ease: [0.32, 0.72, 0, 1] }
                : { duration: 0.35, ease: [0.4, 0, 0.2, 1] }
            }
            className="flex-1 flex flex-col min-h-0"
          >
          <div className="h-[84px] px-8 bg-[var(--msg-card)] border-b border-[var(--msg-border)] flex items-center justify-between z-10">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSelectedChatId("")}
                className="lg:hidden p-1.5 rounded-lg text-[var(--msg-text-muted)] hover:bg-[var(--msg-input)]"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <img src={currentChat.avatar} alt={currentChat.name} className="w-12 h-12 rounded-full object-cover" />
              <div>
                <h3 className="font-bold text-base text-[var(--msg-text)] leading-none mb-1.5">{currentChat.name}</h3>
                <p className="text-xs text-[var(--msg-text-muted)]">{currentChat.profession}</p>
              </div>
            </div>
            <button
              onClick={() => setRightPanelOpen((prev) => !prev)}
              aria-pressed={rightPanelOpen}
              className={`p-2 rounded-full transition-[background-color,color,transform] duration-150 ease-out active:scale-[0.95] hidden xl:inline-flex ${
                rightPanelOpen
                  ? "text-[#2EBCCC] bg-[#2EBCCC]/10"
                  : "text-[var(--msg-text-muted)] hover:text-[var(--msg-text)] hover:bg-[var(--msg-input)]"
              }`}
            >
              <MoreVertical className="w-5 h-5" />
            </button>
            <button
              onClick={() => setRightPanelOpen((prev) => !prev)}
              aria-pressed={rightPanelOpen}
              className={`p-2 rounded-full transition-[background-color,color,transform] duration-150 ease-out active:scale-[0.95] xl:hidden ${
                rightPanelOpen
                  ? "text-[#2EBCCC] bg-[#2EBCCC]/10"
                  : "text-[var(--msg-text-muted)] hover:text-[var(--msg-text)] hover:bg-[var(--msg-input)]"
              }`}
            >
              <MoreVertical className="w-5 h-5" />
            </button>
          </div>

          <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-8 space-y-6">
            {messagesLoading ? (
              <div className="space-y-6">
                {[false, true, false].map((isUser, i) => (
                  <div
                    key={i}
                    className={`flex items-end gap-3 max-w-[90%] xl:max-w-[75%] ${isUser ? "ml-auto flex-row-reverse" : ""}`}
                  >
                    <div className="w-9 h-9 rounded-full bg-[var(--msg-input)] animate-pulse flex-shrink-0 mb-1" />
                    <div className={`h-16 w-56 rounded-2xl bg-[var(--msg-input)] animate-pulse ${isUser ? "rounded-br-sm" : "rounded-bl-sm"}`} />
                  </div>
                ))}
              </div>
            ) : (
              <>
                <div className="flex justify-center mb-2">
                  <span className="px-5 py-2 bg-[var(--msg-card)] text-[var(--msg-text-muted)] text-[10px] font-bold tracking-wider rounded-full uppercase border border-[var(--msg-border)]">
                    {d.serviceConfirmed} • 10:14 a.m.
                  </span>
                </div>

                <AnimatePresence initial={false}>
                  {messages.map((msg) => {
                    const isUser = msg.sender === "user";
                    return (
                      <motion.div
                        key={msg.id}
                        layout
                        initial={{ opacity: 0, y: 10, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                        className={`flex items-end gap-3 max-w-[90%] xl:max-w-[75%] ${isUser ? "ml-auto flex-row-reverse" : ""}`}
                      >
                        <img
                          src={msg.senderAvatar}
                          alt={msg.senderName}
                          className="w-9 h-9 rounded-full object-cover flex-shrink-0 mb-5 shadow-sm"
                        />

                        <div className={`flex flex-col gap-1.5 ${isUser ? "items-end" : "items-start"}`}>
                          <span className="text-[11px] font-semibold text-[var(--msg-text-muted)] px-1">
                            {isUser ? d.you : `${msg.senderName} • ${currentChat.profession}`}
                          </span>

                          <div
                            className={`px-5 py-3.5 rounded-2xl text-sm leading-relaxed shadow-sm ${
                              isUser
                                ? "bg-[#2EBCCC] text-white rounded-br-sm"
                                : "bg-[var(--msg-chat-bubble)] text-[var(--msg-text)] rounded-bl-sm border border-[var(--msg-border)]"
                            }`}
                          >
                            {msg.text}
                          </div>

                          <div className="flex items-center gap-1.5 text-[10px] text-[var(--msg-text-muted)] px-1">
                            <span>{msg.time}</span>
                            {isUser && <CheckCheck className="w-4 h-4 text-[#2EBCCC]" />}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          <form
            onSubmit={handleSendMessage}
            className="p-4 px-6 bg-[var(--msg-card)] border-t border-[var(--msg-border)] flex items-center gap-3 z-10"
          >
            <button
              type="button"
              className="p-2.5 text-[var(--msg-text-muted)] hover:text-[var(--msg-text)] hover:bg-[var(--msg-input)] rounded-full transition"
            >
              <Paperclip className="w-6 h-6 stroke-[1.5]" />
            </button>

            <input
              type="text"
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              placeholder={d.typePlaceholder}
              className="flex-1 bg-[var(--msg-input)] text-[var(--msg-text)] px-5 py-3.5 rounded-full text-sm outline-none focus:ring-1 focus:ring-[#2EBCCC] border-0 placeholder-[var(--msg-text-muted)]"
            />

            <button
              type="submit"
              disabled={!messageText.trim()}
              className="p-3.5 bg-[#2EBCCC] text-white rounded-full hover:bg-[#239aaa] disabled:opacity-50 disabled:cursor-not-allowed transition flex-shrink-0 shadow-sm ml-1"
            >
              <Send className="w-5 h-5 ml-0.5" />
            </button>
          </form>
          </motion.div>
        )}
        </div>

      <AnimatePresence initial={false}>
        {currentChat && rightPanelOpen && (
          <motion.div
            key="right-panel"
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 320, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.23, 1, 0.32, 1] }}
            className="hidden xl:flex overflow-hidden flex-shrink-0 border-l border-[var(--msg-border)] bg-[var(--msg-card)] z-10"
          >
        <div className="w-[320px] flex flex-col p-8 items-center">
          {userInfoContent}
        </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {currentChat && rightPanelOpen && (
          <div className="xl:hidden fixed inset-0 z-50">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              onClick={() => setRightPanelOpen(false)}
              className="absolute inset-0 bg-black/40"
            />
            <motion.div
              initial={{ transform: "translateY(100%)" }}
              animate={{ transform: "translateY(0%)" }}
              exit={{ transform: "translateY(100%)" }}
              transition={{ duration: 0.32, ease: [0.32, 0.72, 0, 1] }}
              className="absolute bottom-0 left-0 right-0 max-h-[85vh] overflow-y-auto rounded-t-3xl bg-[var(--msg-card)] p-6 pt-3"
            >
              <div className="w-10 h-1.5 rounded-full bg-[var(--msg-border)] mx-auto mb-5" />
              <div className="flex flex-col items-center">{userInfoContent}</div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      </div>
    </>
  );
};

export default MessagesScreen;
