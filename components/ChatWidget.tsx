/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { useUser } from "@/context/userContext";
import {
  MessageCircle,
  X,
  Send,
  Bot,
  Loader2,
  Check,
  AlertCircle,
  History,
  Trash2,
  ChevronLeft,
  ChevronDown,
  MoreVertical,
} from "lucide-react";
import {
  handleChatMessage,
  handleConfirmDraft,
  getConversations,
  getConversationMessages,
  deleteConversation,
} from "@/lib/utils/api/apiHelper";
import ReactMarkdown from "react-markdown";

import { toast } from "sonner";
import { useRouter } from "next/navigation";

// ─── Types ────────────────────────────────────────────────────────────────────

type Role = "ai" | "user";

interface Message {
  id: string;
  role: Role;
  text: string;
  time: string;
}

interface PendingDraft {
  confirmId: string;
  type: "invoice" | "expense";
}

interface Conversation {
  uuid: string;
  title: string;
  message_count: number;
  last_message_at: string;
  created_at: string;
}

interface ConversationMessage {
  uuid: string;
  role: string;
  content: string;
  turn_id: string;
  created_at: string;
}

// ─── Quick questions ──────────────────────────────────────────────────────────

const QUICK_QUESTIONS = [
  "Which products are running low on stock?",
  "What are my top 5 selling products?",
  "How much have I sold today?",
  "Compare my sales this month vs last month",
  "What was my total profit this week?",
  "Show me my top 5 customers this month by revenue",
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function nowTime() {
  return new Date().toLocaleTimeString("en-NG", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDate(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString("en-NG", { month: "short", day: "numeric" });
}

// Skeleton Loader Component
function SkeletonLoader() {
  return (
    <div className="p-4 space-y-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4" />
            <div className="h-3 bg-gray-200 rounded animate-pulse w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}

// Delete Confirmation Dialog Component
// Delete Confirmation Dialog Component
function DeleteConfirmDialog({
  open,
  onConfirm,
  onCancel,
  title,
  isLoading,
}: {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  title: string;
  isLoading: boolean;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-xl w-[320px] p-5 animate-in fade-in zoom-in duration-200">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
            <Trash2 size={20} className="text-red-600" />
          </div>
          <h3 className="text-[16px] font-dm-sans font-semibold text-[#2F2F2F]">
            Delete Conversation
          </h3>
        </div>
        <p className="text-[13px] font-dm-sans text-[#565656] mb-6">
          Are you sure you want to delete{" "}
          <strong>
            {title.length > 50 ? title.substring(0, 50) + "..." : title}
          </strong>{" "}
          ? This action cannot be undone.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="flex-1 px-4 py-2 rounded-lg border border-[#E4E4E4] text-[13px] font-dm-sans text-[#565656] hover:bg-gray-50 transition disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="flex-1 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white text-[13px] font-dm-sans transition flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Trash2 size={14} />
            )}
            {isLoading ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function AIChatWidget() {
  const { user } = useUser();
  const router = useRouter();

  // Chat state
  const [open, setOpen] = useState(false);
  const [showSlideIn, setShowSlideIn] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "ai",
      text: `Hi${user?.firstname ? ` ${user.firstname}` : ""}! 👋\n\nI can help you with:\n• Stock levels & low stock alerts\n• Top selling products\n• Sales comparisons & trends\n• Profit analysis\n• Customer insights\n\nWhat would you like to know about your store?`,
      time: nowTime(),
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [conversationUuid, setConversationUuid] = useState<string | null>(null);
  const [pendingDraft, setPendingDraft] = useState<PendingDraft | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [justConfirmedExpense, setJustConfirmedExpense] = useState(false);

  // History state
  const [historyOpen, setHistoryOpen] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [expandedConvId, setExpandedConvId] = useState<string | null>(null);
  const [loadingMessages, setLoadingMessages] = useState<
    Record<string, boolean>
  >({});
  const [conversationMessagesMap, setConversationMessagesMap] = useState<
    Record<string, ConversationMessage[]>
  >({});
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [conversationToDelete, setConversationToDelete] =
    useState<Conversation | null>(null);

  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Slide-in welcome message on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSlideIn(true);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  // Auto-hide slide-in after 5 seconds
  useEffect(() => {
    if (showSlideIn) {
      const timer = setTimeout(() => {
        setShowSlideIn(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [showSlideIn]);

  // Load conversations when history panel opens
  useEffect(() => {
    if (historyOpen) {
      loadConversations();
    }
  }, [historyOpen]);

  useEffect(() => {
    // Scroll to top on initial load or when chat opens with welcome message
    if (open && messages.length <= 2) {
      const container = document.querySelector(".messages-container");
      if (container) {
        container.scrollTop = 0;
      }
    } else {
      // For regular messages, scroll to bottom
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, loading, open]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 300);
  }, [open]);

  const loadConversations = async () => {
    setLoadingHistory(true);
    try {
      const response = await getConversations(30, 0);
      setConversations(response.items || []);
    } catch (error) {
      console.error("Failed to load conversations:", error);
      toast.error("Failed to load conversation history");
    } finally {
      setLoadingHistory(false);
    }
  };

  const toggleConversation = async (conv: Conversation) => {
    if (expandedConvId === conv.uuid) {
      setExpandedConvId(null);
      return;
    }

    // If messages not loaded yet, load them
    if (!conversationMessagesMap[conv.uuid]) {
      setLoadingMessages((prev) => ({ ...prev, [conv.uuid]: true }));
      try {
        const messages = await getConversationMessages(conv.uuid);
        setConversationMessagesMap((prev) => ({
          ...prev,
          [conv.uuid]: messages, // messages is already the items array
        }));
      } catch (error) {
        console.error("Failed to load messages:", error);
        toast.error("Failed to load conversation messages");
      } finally {
        setLoadingMessages((prev) => ({ ...prev, [conv.uuid]: false }));
      }
    }

    setExpandedConvId(conv.uuid);
  };

  const handleDeleteClick = (conv: Conversation, e: React.MouseEvent) => {
    e.stopPropagation();
    setConversationToDelete(conv);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!conversationToDelete) return;

    setIsDeleting(true);
    try {
      await deleteConversation(conversationToDelete.uuid);
      toast.success("Conversation deleted");
      setConversations((prev) =>
        prev.filter((c) => c.uuid !== conversationToDelete.uuid),
      );
      setConversationMessagesMap((prev) => {
        const newMap = { ...prev };
        delete newMap[conversationToDelete.uuid];
        return newMap;
      });
      if (expandedConvId === conversationToDelete.uuid) {
        setExpandedConvId(null);
      }
      setDeleteDialogOpen(false);
    } catch (error) {
      console.error("Failed to delete conversation:", error);
      toast.error("Failed to delete conversation");
    } finally {
      setIsDeleting(false);
      setConversationToDelete(null);
    }
  };

  const cancelDelete = () => {
    setDeleteDialogOpen(false);
    setConversationToDelete(null);
  };

  const loadConversationIntoChat = (conv: Conversation) => {
    const messagesList = conversationMessagesMap[conv.uuid] || [];

    const historyMessages: Message[] = messagesList.map(
      (msg: ConversationMessage, idx: number) => ({
        id: msg.uuid || idx.toString(),
        role: msg.role as Role,
        text: msg.content,
        time: formatDate(msg.created_at),
      }),
    );

    setMessages(historyMessages);
    setConversationUuid(conv.uuid);
    setHistoryOpen(false);
    setOpen(true);
    toast.success(`Loaded: ${conv.title}`);
  };

  const startNewChat = () => {
    setMessages([
      {
        id: "welcome",
        role: "ai",
        text: `Hi${user?.firstname ? ` ${user.firstname}` : ""}! 👋\n\nI can help you with:\n• Stock levels & low stock alerts\n• Top selling products\n• Sales comparisons & trends\n• Profit analysis\n• Customer insights\n\nWhat would you like to know about your store?`,
        time: nowTime(),
      },
    ]);
    setConversationUuid(null);
    setHistoryOpen(false);
  };

  const handleConfirmDraftClick = async () => {
    if (!pendingDraft) return;

    setConfirming(true);
    try {
      const result = await handleConfirmDraft(pendingDraft.confirmId);

      if (result.ok === true) {
        toast.success(
          `${pendingDraft.type === "invoice" ? "Invoice" : "Expense"} confirmed successfully!`,
        );

        const confirmMsg: Message = {
          id: Date.now().toString(),
          role: "ai",
          text: `✅ ${pendingDraft.type === "invoice" ? "Invoice" : "Expense"} has been confirmed successfully!`,
          time: nowTime(),
        };
        setMessages((prev) => [...prev, confirmMsg]);

        // Store the expense ID if returned
        if (pendingDraft.type === "expense" && result.id) {
          // You might want to store expense ID for navigation
          sessionStorage.setItem("lastExpenseId", result.id);
        }

        setPendingDraft(null);
      } else {
        // Check for subscription error
        const errorMessage = result.message || result.error;
        if (errorMessage?.toLowerCase().includes("subscription")) {
          toast.error(
            "You need an active subscription to create expenses. Please upgrade your plan.",
          );

          const errorMsg: Message = {
            id: Date.now().toString(),
            role: "ai",
            text: "❌ I couldn't create the expense because you don't have an active subscription. Please upgrade your plan to track expenses.",
            time: nowTime(),
          };
          setMessages((prev) => [...prev, errorMsg]);
        } else {
          toast.error(errorMessage || "Failed to confirm draft");
        }
      }
    } catch (error) {
      console.error("Confirm draft error:", error);
      toast.error("Failed to confirm draft. Please try again.");
    } finally {
      setConfirming(false);
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      if (activeMenuId) {
        setActiveMenuId(null);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [activeMenuId]);

  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim() || loading) return;
      setInput("");

      const userMsg: Message = {
        id: Date.now().toString(),
        role: "user",
        text,
        time: nowTime(),
      };
      setMessages((prev) => [...prev, userMsg]);
      setLoading(true);

      const aiMsgId = (Date.now() + 1).toString();
      setMessages((prev) => [
        ...prev,
        {
          id: aiMsgId,
          role: "ai",
          text: "",
          time: nowTime(),
        },
      ]);

      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      const abortController = new AbortController();
      abortControllerRef.current = abortController;

      try {
        let fullText = "";
        let newConversationUuid = conversationUuid;
        let draftFound = false;

        await handleChatMessage(
          text,
          conversationUuid || undefined,
          (event) => {
            if (event.type === "token" && event.text) {
              fullText += event.text;
              setMessages((prev) =>
                prev.map((msg) =>
                  msg.id === aiMsgId ? { ...msg, text: fullText } : msg,
                ),
              );
            } else if (event.type === "tool_call" && !draftFound) {
              const confirmId = event.confirm_id;

              if (event.tool_name === "prepare_invoice" && confirmId) {
                draftFound = true;
                setPendingDraft({
                  confirmId: confirmId,
                  type: "invoice",
                });
              } else if (event.tool_name === "prepare_expense" && confirmId) {
                draftFound = true;
                setPendingDraft({
                  confirmId: confirmId,
                  type: "expense",
                });
              }
            } else if (event.type === "done") {
              if (event.metadata?.confirm_id && !draftFound) {
                setPendingDraft({
                  confirmId: event.metadata.confirm_id,
                  type:
                    event.metadata.draft_type === "prepare_invoice"
                      ? "invoice"
                      : "expense",
                });
              }

              if (event.conversation_uuid) {
                newConversationUuid = event.conversation_uuid;
              }

              const finalText = event.text || fullText;
              setMessages((prev) =>
                prev.map((msg) =>
                  msg.id === aiMsgId ? { ...msg, text: finalText } : msg,
                ),
              );
            }
          },
          abortController.signal,
        );

        if (newConversationUuid) {
          setConversationUuid(newConversationUuid);
        }
      } catch (error: any) {
        if (error.name === "AbortError") {
          console.log("Request aborted");
          return;
        }
        console.error("Chat error:", error);
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === aiMsgId
              ? {
                  ...msg,
                  text: "❌ Sorry, I'm having trouble connecting. Please try again.",
                }
              : msg,
          ),
        );
      } finally {
        setLoading(false);
        abortControllerRef.current = null;
      }
    },
    [loading, conversationUuid],
  );

  // Detect mobile screen
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  return (
    <>
      {/* Blur overlay when chat or history is open */}
      {(open || historyOpen) && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 transition-all duration-300" />
      )}

      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
        title={conversationToDelete?.title || ""}
        isLoading={isDeleting}
      />

      {/* History Panel - Slides from left */}
      <div
        className={`fixed top-0 left-0 bottom-0 z-50 w-[320px] sm:w-[380px] bg-white shadow-2xl flex flex-col transform transition-transform duration-300 ease-out ${
          historyOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* History Header */}
        <div className="bg-[#0A2540] px-4 py-4 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setHistoryOpen(false)}
              className="text-white/70 hover:text-white transition"
            >
              <ChevronLeft size={20} />
            </button>
            <div className="flex items-center gap-2">
              <History size={18} className="text-white/70" />
              <h2 className="text-white font-dm-sans font-semibold text-[15px]">
                Conversation History
              </h2>
            </div>
          </div>
          <button
            onClick={startNewChat}
            className="text-xs bg-[#0A6DC0] hover:bg-[#085a9e] text-white px-3 py-1.5 rounded-full transition"
          >
            New Chat
          </button>
        </div>

        {/* History List */}
        <div className="flex-1 overflow-y-auto bg-[#F9FAFB]">
          {loadingHistory ? (
            <SkeletonLoader />
          ) : conversations.length === 0 ? (
            <div className="text-center py-10 text-[#9E9A9A] font-dm-sans text-sm">
              No conversations yet
            </div>
          ) : (
            <div className="divide-y divide-[#E4E4E4]">
              {conversations.map((conv) => (
                <div key={conv.uuid} className="bg-white">
                  {/* Conversation Header */}
                  <div
                    onClick={() => toggleConversation(conv)}
                    className="px-4 py-3 hover:bg-gray-50 cursor-pointer transition flex items-center justify-between"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-dm-sans font-medium text-[#2F2F2F] truncate">
                        {conv.title}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] text-[#9E9A9A]">
                          {formatDate(conv.last_message_at)}
                        </span>
                        <span className="text-[10px] text-[#9E9A9A]">•</span>
                        <span className="text-[10px] text-[#9E9A9A]">
                          {conv.message_count} messages
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      {/* Three dots menu - always visible */}
                      <div className="relative">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveMenuId(
                              activeMenuId === conv.uuid ? null : conv.uuid,
                            );
                          }}
                          className="p-1.5 hover:bg-gray-100 rounded-lg transition"
                        >
                          <MoreVertical size={16} className="text-[#565656]" />
                        </button>

                        {/* Dropdown menu */}
                        {activeMenuId === conv.uuid && (
                          <div className="absolute right-0 top-8 z-20 bg-white rounded-lg shadow-lg border border-[#E4E4E4]  min-w-[120px]">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveMenuId(null);
                                toggleConversation(conv);
                              }}
                              className="w-full rounded-lg px-4 py-2 text-left text-[13px] text-[#2F2F2F] hover:bg-gray-50 transition flex justify-between  items-center gap-2"
                            >
                              View
                              <ChevronDown
                                size={14}
                                className="rotate-[-90deg]"
                              />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveMenuId(null);
                                handleDeleteClick(conv, e);
                              }}
                              className="w-full rounded-lg px-4 py-2 text-left text-[13px] text-red-600 hover:bg-red-50 transition flex justify-between  items-center gap-2"
                            >
                              Delete <Trash2 size={14} />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Expanded Messages */}
                  {expandedConvId === conv.uuid && (
                    <div className="bg-[#F9FAFB] px-4 py-3 border-t border-[#E4E4E4] space-y-3">
                      {loadingMessages[conv.uuid] ? (
                        <div className="space-y-3">
                          <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4" />
                          <div className="h-3 bg-gray-200 rounded animate-pulse w-1/2" />
                          <div className="h-4 bg-gray-200 rounded animate-pulse w-full" />
                        </div>
                      ) : conversationMessagesMap[conv.uuid]?.length === 0 ? (
                        <p className="text-[11px] text-[#9E9A9A] font-dm-sans text-center py-2">
                          No messages in this conversation
                        </p>
                      ) : (
                        <>
                          {conversationMessagesMap[conv.uuid]?.map((msg) => (
                            <div
                              key={msg.uuid}
                              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                            >
                              <div
                                className={`max-w-[90%] px-3 py-2 rounded-xl text-[12px] font-dm-sans leading-relaxed break-words ${
                                  msg.role === "user"
                                    ? "bg-[#0A6DC0] text-white rounded-br-sm"
                                    : "bg-white border border-[#E4E4E4] text-[#2F2F2F] rounded-bl-sm"
                                }`}
                              >
                                <p className="text-[9px] font-medium mb-1 opacity-70">
                                  {msg.role === "user" ? "You" : "Assistant"}
                                </p>
                                <div className="text-[14px]">
                                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                                </div>{" "}
                              </div>
                            </div>
                          ))}
                          <button
                            onClick={() => loadConversationIntoChat(conv)}
                            className="text-[11px] text-[#0A6DC0] font-dm-sans mt-2 hover:underline block text-center w-full py-1"
                          >
                            Continue this conversation →
                          </button>
                        </>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Slide-in notification */}
      <div
        className={`fixed bottom-6 right-20 z-50 bg-[#0A2540] text-white rounded-tl-lg rounded-bl-lg rounded-br-3xl shadow-lg px-4 py-3 max-w-[280px] transform transition-all duration-500 ease-out ${
          showSlideIn
            ? "translate-x-0 opacity-100"
            : "translate-x-full opacity-0"
        }`}
      >
        <div className="flex items-center gap-3">
          <Bot size={20} />
          <div>
            <div className="flex items-center gap-4">
              <p className="text-sm font-semibold">Hi {user?.firstname} </p>
              <span className="">👋</span>
            </div>
            <p className="text-xs text-white/70">How can I help you today?</p>
          </div>
        </div>
      </div>

      {/* Floating button */}
      <div
        className={`fixed bottom-6 right-6 z-50 ${isMobile && open ? "hidden" : ""}`}
      >
        {!open && !historyOpen && (
          <span className="absolute bottom-0 right-0 w-14 h-14 rounded-full bg-[#0A6DC0] opacity-30 animate-ping pointer-events-none" />
        )}
        <button
          onClick={() => {
            if (isMobile && historyOpen) {
              setHistoryOpen(false);
            } else {
              setOpen((v) => !v);
            }
          }}
          aria-label={open ? "Close assistant" : "Open AI assistant"}
          className="relative w-14 h-14 rounded-full bg-[#0A6DC0] hover:bg-[#085a9e] active:scale-95 transition-all flex items-center justify-center text-white shadow-lg"
        >
          {open ? <X size={22} /> : <MessageCircle size={22} />}
        </button>
      </div>

      {/* Chat panel */}
      <div
        className={`fixed z-50 bg-white flex flex-col overflow-hidden transition-all duration-300 origin-bottom-right
${open && (!isMobile || (isMobile && !historyOpen)) ? "opacity-100 scale-100 pointer-events-auto" : "opacity-0 scale-90 pointer-events-none"}
${isMobile ? "inset-0" : "bottom-24 right-6 w-[380px] sm:w-[420px]"}`}
        style={
          isMobile
            ? undefined
            : { maxHeight: "calc(100vh - 140px)", height: 560 }
        }
        role="dialog"
        aria-label="AI sales assistant"
      >
        {/* Header with History button next to Cancel */}
        <div className="bg-[#0A2540] px-4 py-3 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#0A6DC0] flex items-center justify-center text-white">
              <Bot size={18} />
            </div>
            <div>
              <p className="text-white font-dm-sans font-semibold text-[14px]">
                Sales Assistant
              </p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="w-2 h-2 rounded-full bg-[#1D9E75]" />
                <span className="text-[11px] text-white/60 font-dm-sans">
                  Online • AI Ready
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setHistoryOpen(true)}
              className="text-white/60 hover:text-white transition p-1"
              aria-label="View history"
            >
              <History size={18} />
            </button>
            <button
              onClick={() => setOpen(false)}
              className="text-white/60 hover:text-white transition"
              aria-label="Close"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="messages-container flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-3 bg-[#F9FAFB]">
          {" "}
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col gap-1 ${msg.role === "user" ? "items-end" : "items-start"}`}
            >
              <div
                className={`px-3 py-2 rounded-2xl text-[14px] font-dm-sans leading-relaxed max-w-[85%] whitespace-pre-line break-words
                  ${
                    msg.role === "user"
                      ? "bg-[#0A6DC0] text-white rounded-br-none"
                      : "bg-white border border-[#E4E4E4] text-[#2F2F2F] rounded-bl-none"
                  }`}
              >
                {loading &&
                msg === messages[messages.length - 1] &&
                !msg.text ? (
                  <div className="flex gap-1 items-center">
                    <span
                      className="w-1.5 h-1.5 rounded-full bg-[#0A6DC0] animate-bounce"
                      style={{ animationDelay: "0ms" }}
                    />
                    <span
                      className="w-1.5 h-1.5 rounded-full bg-[#0A6DC0] animate-bounce"
                      style={{ animationDelay: "150ms" }}
                    />
                    <span
                      className="w-1.5 h-1.5 rounded-full bg-[#0A6DC0] animate-bounce"
                      style={{ animationDelay: "300ms" }}
                    />
                  </div>
                ) : (
                  <ReactMarkdown>{msg.text}</ReactMarkdown>
                )}
              </div>
              <span className="text-[10px] text-[#9E9A9A] font-dm-sans px-1">
                {msg.time}
              </span>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        {/* Draft Confirmation Bar */}
        {pendingDraft && (
          <div className="px-4 py-3 bg-amber-50 border-t border-amber-200 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600" />
              <p className="text-xs text-amber-800 font-dm-sans">
                {pendingDraft.type === "invoice"
                  ? "Invoice draft ready to be confirmed"
                  : "Expense draft ready to be confirmed"}
              </p>
            </div>
            <button
              onClick={handleConfirmDraftClick}
              disabled={confirming}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white text-xs font-medium rounded-lg transition"
            >
              {confirming ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Check size={14} />
              )}
              {confirming ? "Confirming..." : "Confirm Draft"}
            </button>
          </div>
        )}

        {/* Success bar for expense - shows after confirmation */}
        {/* Success bar for expense - shows after expense confirmation */}
        {!pendingDraft &&
          messages.some((msg) =>
            msg.text.includes("Expense has been confirmed successfully"),
          ) && (
            <div className="px-4 py-3 bg-green-50 border-t border-green-200 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-600" />
                <p className="text-xs text-green-800 font-dm-sans">
                  Expense created successfully!
                </p>
              </div>
              <button
                onClick={() => router.push("/expenses")}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0A6DC0] hover:bg-[#085a9e] text-white text-xs font-medium rounded-lg transition"
              >
                View Expense
              </button>
            </div>
          )}

        {/* Success bar for invoice - shows after invoice confirmation */}
        {!pendingDraft &&
          messages.some((msg) =>
            msg.text.includes("Invoice has been confirmed successfully"),
          ) && (
            <div className="px-4 py-3 bg-green-50 border-t border-green-200 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-600" />
                <p className="text-xs text-green-800 font-dm-sans">
                  Invoice created successfully!
                </p>
              </div>
              <button
                onClick={() => router.push("/inventory/sales")}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0A6DC0] hover:bg-[#085a9e] text-white text-xs font-medium rounded-lg transition"
              >
                View Invoice
              </button>
            </div>
          )}

        {/* Quick questions */}
        {messages.length <= 2 && !pendingDraft && (
          <div className="px-4 py-3 flex flex-col gap-2 flex-shrink-0 bg-white border-t border-[#E4E4E4]">
            <p className="text-[11px] text-[#9E9A9A] font-dm-sans uppercase tracking-wide">
              Quick questions
            </p>
            <div className="flex flex-wrap gap-2 max-h-[140px] overflow-y-auto">
              {QUICK_QUESTIONS.map((q) => (
                <button
                  key={q}
                  onClick={() => sendMessage(q)}
                  disabled={loading}
                  className="text-left text-[12px] font-dm-sans text-[#0A6DC0] border border-[#0A6DC0]/30 bg-[#0A6DC0]/5 hover:bg-[#0A6DC0]/10 rounded-full px-3 py-2 transition disabled:opacity-50 whitespace-normal break-words"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <div className="flex items-center gap-2 px-4 py-3 border-t border-[#E4E4E4] bg-white flex-shrink-0">
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                sendMessage(input);
              }
            }}
            placeholder="Ask about your store..."
            disabled={loading || confirming}
            className="flex-1 bg-[#F9FAFB] border border-[#E4E4E4] rounded-md px-4 py-2.5 text-[13px] font-dm-sans text-[#2F2F2F] placeholder:text-[#9E9A9A] outline-none focus:border-[#0A6DC0] transition disabled:opacity-50"
          />
          <button
            onClick={() => sendMessage(input)}
            disabled={!input.trim()}
            aria-label="Send"
            className="w-9 py-3.5 rounded-md bg-[#0A6DC0] hover:bg-[#085a9e] disabled:bg-gray-200 flex items-center justify-center text-white transition active:scale-95"
          >
            <Send size={15} />
          </button>
        </div>
      </div>
    </>
  );
}
