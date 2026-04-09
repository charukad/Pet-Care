"use client";

import Link from "next/link";
import { MessageCircleMore, Send, Stethoscope, UserRound } from "lucide-react";
import { useEffect, useRef, useState, useTransition } from "react";
import { io, type Socket } from "socket.io-client";
import { api, createAuthHeaders, getApiErrorMessage, type ApiResponse } from "@/lib/api";
import { useAuth } from "@/providers/auth-provider";
import type { ChatMessage, Conversation, ConversationDetails } from "@/types/app";

type RealtimeChatPayload = {
  id: string;
  conversationId: string;
  content: string;
  createdAt: string;
  senderId: string;
  senderName: string;
  senderRole: "user" | "doctor";
};

function getSocketUrl() {
  if (process.env.NEXT_PUBLIC_SOCKET_URL) {
    return process.env.NEXT_PUBLIC_SOCKET_URL;
  }

  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api/v1";

  return apiUrl.replace(/\/api\/v1\/?$/, "");
}

function formatConversationTime(isoString: string) {
  return new Intl.DateTimeFormat("en-LK", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(isoString));
}

function formatMessageTime(isoString: string) {
  return new Intl.DateTimeFormat("en-LK", {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(isoString));
}

function upsertConversation(
  conversations: Conversation[],
  conversationId: string,
  message: ChatMessage,
) {
  return conversations
    .map((conversation) =>
      conversation.id === conversationId
        ? {
            ...conversation,
            lastMessage: message,
            lastActivityAt: message.createdAt,
          }
        : conversation,
    )
    .sort((left, right) => right.lastActivityAt.localeCompare(left.lastActivityAt));
}

export function ChatWorkspace() {
  const { isAuthenticated, isLoading, session, user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversationId, setSelectedConversationId] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [conversationDetails, setConversationDetails] =
    useState<ConversationDetails["details"] | null>(null);
  const [draft, setDraft] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [hasLoadedConversations, setHasLoadedConversations] = useState(false);
  const [loadedConversationId, setLoadedConversationId] = useState("");
  const [isSending, startTransition] = useTransition();
  const socketRef = useRef<Socket | null>(null);
  const selectedConversationIdRef = useRef("");

  const shouldLoadChat = Boolean(
    session?.token && (user?.role === "user" || user?.role === "doctor"),
  );

  const selectedConversation =
    conversations.find((conversation) => conversation.id === selectedConversationId) ??
    null;

  useEffect(() => {
    selectedConversationIdRef.current = selectedConversationId;
  }, [selectedConversationId]);

  useEffect(() => {
    if (!shouldLoadChat) {
      return;
    }

    let isMounted = true;

    void api
      .get<ApiResponse<Conversation[]>>("/chat/conversations", {
        headers: createAuthHeaders(session!.token),
      })
      .then((response) => {
        if (!isMounted) {
          return;
        }

        const nextConversations = response.data.data;
        setConversations(nextConversations);
        setSelectedConversationId(
          (currentConversationId) =>
            currentConversationId || nextConversations[0]?.id || "",
        );
      })
      .catch((error) => {
        if (!isMounted) {
          return;
        }

        setErrorMessage(getApiErrorMessage(error, "Unable to load conversations."));
      })
      .finally(() => {
        if (isMounted) {
          setHasLoadedConversations(true);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [session, shouldLoadChat]);

  useEffect(() => {
    if (!shouldLoadChat || !selectedConversationId) {
      return;
    }

    let isMounted = true;

    void api
      .get<ApiResponse<ConversationDetails>>(`/chat/conversations/${selectedConversationId}`, {
        headers: createAuthHeaders(session!.token),
      })
      .then((response) => {
        if (!isMounted) {
          return;
        }

        setConversationDetails(response.data.data.details);
        setMessages(response.data.data.messages);
        setLoadedConversationId(selectedConversationId);
      })
      .catch((error) => {
        if (!isMounted) {
          return;
        }

        setErrorMessage(
          getApiErrorMessage(error, "Unable to load that conversation."),
        );
      });

    return () => {
      isMounted = false;
    };
  }, [selectedConversationId, session, shouldLoadChat]);

  useEffect(() => {
    if (!shouldLoadChat || !session?.user) {
      return;
    }

    const socket = io(getSocketUrl(), {
      transports: ["websocket"],
    });

    const handleIncomingMessage = (payload: RealtimeChatPayload) => {
      const nextMessage: ChatMessage = {
        id: payload.id,
        conversationId: payload.conversationId,
        content: payload.content,
        createdAt: payload.createdAt,
        sender: {
          id: payload.senderId,
          name: payload.senderName,
          role: payload.senderRole,
        },
      };

      setConversations((currentConversations) =>
        upsertConversation(currentConversations, payload.conversationId, nextMessage),
      );

      if (selectedConversationIdRef.current !== payload.conversationId) {
        return;
      }

      setMessages((currentMessages) =>
        currentMessages.some((message) => message.id === nextMessage.id)
          ? currentMessages
          : [...currentMessages, nextMessage],
      );
    };

    socket.on("chat:message", handleIncomingMessage);
    socketRef.current = socket;

    return () => {
      socket.off("chat:message", handleIncomingMessage);
      socket.disconnect();
      socketRef.current = null;
    };
  }, [session?.user, shouldLoadChat]);

  useEffect(() => {
    if (!socketRef.current || !selectedConversationId) {
      return;
    }

    socketRef.current.emit("chat:join", selectedConversationId);

    return () => {
      socketRef.current?.emit("chat:leave", selectedConversationId);
    };
  }, [selectedConversationId]);

  function handleSendMessage(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(null);

    if (!session?.token || !selectedConversationId || !draft.trim() || !user) {
      return;
    }

    startTransition(() => {
      void (async () => {
        try {
          const response = await api.post<ApiResponse<ChatMessage>>(
            `/chat/conversations/${selectedConversationId}/messages`,
            { content: draft },
            {
              headers: createAuthHeaders(session.token),
            },
          );

          const nextMessage = response.data.data;
          setMessages((currentMessages) =>
            currentMessages.some((message) => message.id === nextMessage.id)
              ? currentMessages
              : [...currentMessages, nextMessage],
          );
          setConversations((currentConversations) =>
            upsertConversation(currentConversations, selectedConversationId, nextMessage),
          );
          socketRef.current?.emit("chat:message", {
            id: nextMessage.id,
            conversationId: nextMessage.conversationId,
            content: nextMessage.content,
            createdAt: nextMessage.createdAt,
            senderId: nextMessage.sender.id,
            senderName: nextMessage.sender.name,
            senderRole:
              nextMessage.sender.role === "doctor" ? "doctor" : "user",
          } satisfies RealtimeChatPayload);
          setDraft("");
        } catch (error) {
          setErrorMessage(
            getApiErrorMessage(error, "Unable to send that message right now."),
          );
        }
      })();
    });
  }

  if (isLoading || (shouldLoadChat && !hasLoadedConversations)) {
    return (
      <main className="mx-auto flex w-full max-w-6xl flex-1 items-center justify-center px-4 py-16 sm:px-6 lg:px-8">
        <section className="w-full max-w-2xl rounded-[2rem] border border-[color:var(--pc-line)] bg-white/90 p-8 text-center shadow-[0_24px_80px_rgba(8,47,73,0.08)]">
          <p className="text-sm leading-7 text-[color:var(--pc-muted)]">
            Loading conversations and message history.
          </p>
        </section>
      </main>
    );
  }

  if (!isAuthenticated) {
    return (
      <main className="mx-auto flex w-full max-w-5xl flex-1 items-center justify-center px-4 py-16 sm:px-6 lg:px-8">
        <section className="w-full max-w-2xl rounded-[2rem] border border-[color:var(--pc-line)] bg-white/90 p-8 shadow-[0_24px_80px_rgba(8,47,73,0.08)]">
          <p className="text-xs font-semibold tracking-[0.24em] text-[color:var(--pc-muted)] uppercase">
            Chat access
          </p>
          <h1 className="mt-4 [font-family:var(--font-display)] text-4xl text-[color:var(--pc-ink)]">
            Sign in to open secure doctor messaging.
          </h1>
          <p className="mt-4 text-base leading-8 text-[color:var(--pc-muted)]">
            Chat is available to pet owners and doctors once there is a live booking relationship between them.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/auth/login?next=/chat"
              className="rounded-full bg-[color:var(--pc-ink)] px-5 py-3 text-sm font-medium text-white transition hover:opacity-90"
            >
              Sign in
            </Link>
            <Link
              href="/booking"
              className="rounded-full border border-[color:var(--pc-line)] px-5 py-3 text-sm font-medium text-[color:var(--pc-ink)] transition hover:border-[color:var(--pc-sky)]"
            >
              View booking flow
            </Link>
          </div>
        </section>
      </main>
    );
  }

  if (user?.role === "admin") {
    return (
      <main className="mx-auto flex w-full max-w-5xl flex-1 items-center justify-center px-4 py-16 sm:px-6 lg:px-8">
        <section className="w-full max-w-2xl rounded-[2rem] border border-[color:var(--pc-line)] bg-white/90 p-8 shadow-[0_24px_80px_rgba(8,47,73,0.08)]">
          <h1 className="[font-family:var(--font-display)] text-4xl text-[color:var(--pc-ink)]">
            Direct chat is reserved for owners and doctors.
          </h1>
          <p className="mt-4 text-base leading-8 text-[color:var(--pc-muted)]">
            Admin accounts can monitor the platform from the admin dashboard, but they do not join private care conversations.
          </p>
          <Link
            href="/dashboard/admin"
            className="mt-8 inline-flex rounded-full bg-[color:var(--pc-ink)] px-5 py-3 text-sm font-medium text-white transition hover:opacity-90"
          >
            Open admin dashboard
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-8 px-4 py-14 sm:px-6 lg:px-8">
      <section className="space-y-4">
        <p className="text-xs font-semibold tracking-[0.24em] text-[color:var(--pc-muted)] uppercase">
          Real-time consultation chat
        </p>
        <h1 className="max-w-4xl [font-family:var(--font-display)] text-4xl leading-tight text-[color:var(--pc-ink)] sm:text-5xl">
          Keep owner and doctor conversations in the same care flow as bookings.
        </h1>
        <p className="max-w-3xl text-base leading-8 text-[color:var(--pc-muted)] sm:text-lg">
          Conversations are unlocked by an active booking relationship, loaded over protected API routes, and updated live with Socket.io rooms.
        </p>
      </section>

      {errorMessage ? (
        <div className="rounded-[1.5rem] border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {errorMessage}
        </div>
      ) : null}

      {conversations.length === 0 ? (
        <section className="rounded-[2rem] border border-[color:var(--pc-line)] bg-white/90 p-8 shadow-[0_24px_80px_rgba(8,47,73,0.08)]">
          <h2 className="text-2xl font-semibold text-[color:var(--pc-ink)]">
            No conversations available yet.
          </h2>
          <p className="mt-3 max-w-2xl text-base leading-8 text-[color:var(--pc-muted)]">
            Create an active booking first and a conversation will appear here automatically for the doctor-owner pair.
          </p>
          <Link
            href={user?.role === "doctor" ? "/dashboard/doctor" : "/booking"}
            className="mt-6 inline-flex rounded-full bg-[color:var(--pc-ink)] px-5 py-3 text-sm font-medium text-white transition hover:opacity-90"
          >
            {user?.role === "doctor" ? "Open doctor dashboard" : "Create a booking"}
          </Link>
        </section>
      ) : (
        <section className="grid gap-6 xl:grid-cols-[0.82fr_1.18fr]">
          <aside className="rounded-[2rem] border border-[color:var(--pc-line)] bg-white/90 p-4 shadow-[0_24px_80px_rgba(8,47,73,0.08)] sm:p-5">
            <div className="flex items-center gap-3 px-2 pb-4">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[color:var(--pc-surface)] text-[color:var(--pc-emerald)]">
                <MessageCircleMore className="h-5 w-5" />
              </span>
              <div>
                <h2 className="text-lg font-semibold text-[color:var(--pc-ink)]">Conversations</h2>
                <p className="text-sm text-[color:var(--pc-muted)]">
                  {conversations.length} active thread{conversations.length === 1 ? "" : "s"}
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {conversations.map((conversation) => {
                const isActive = conversation.id === selectedConversationId;
                const CounterpartIcon =
                  conversation.counterpart.role === "doctor"
                    ? Stethoscope
                    : UserRound;

                return (
                  <button
                    key={conversation.id}
                    type="button"
                    onClick={() => setSelectedConversationId(conversation.id)}
                    className={`w-full rounded-[1.5rem] border p-4 text-left transition ${
                      isActive
                        ? "border-[color:var(--pc-sky)] bg-[color:var(--pc-surface-strong)]"
                        : "border-[color:var(--pc-line)] bg-[color:var(--pc-surface)] hover:border-[color:var(--pc-sky)]"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <span className="mt-1 flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-[color:var(--pc-emerald)]">
                        <CounterpartIcon className="h-5 w-5" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="font-semibold text-[color:var(--pc-ink)]">
                              {conversation.counterpart.name}
                            </p>
                            <p className="mt-1 text-sm text-[color:var(--pc-muted)]">
                              {conversation.counterpart.specialization ??
                                `${conversation.bookingCount} linked booking${conversation.bookingCount === 1 ? "" : "s"}`}
                            </p>
                          </div>
                          <span className="shrink-0 text-xs text-[color:var(--pc-muted)]">
                            {formatConversationTime(conversation.lastActivityAt)}
                          </span>
                        </div>
                        <p className="mt-3 line-clamp-2 text-sm leading-7 text-[color:var(--pc-muted)]">
                          {conversation.lastMessage?.content ??
                            "No messages yet in this conversation."}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </aside>

          <section className="flex min-h-[640px] flex-col overflow-hidden rounded-[2rem] border border-[color:var(--pc-line)] bg-white/90 shadow-[0_24px_80px_rgba(8,47,73,0.08)]">
            <header className="border-b border-[color:var(--pc-line)] px-6 py-5">
              {selectedConversation && conversationDetails ? (
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-semibold text-[color:var(--pc-ink)]">
                      {selectedConversation.counterpart.name}
                    </h2>
                    <p className="mt-1 text-sm text-[color:var(--pc-muted)]">
                      {selectedConversation.counterpart.specialization ??
                        conversationDetails.doctor.specialization}
                      {selectedConversation.counterpart.location
                        ? ` · ${selectedConversation.counterpart.location}`
                        : ""}
                    </p>
                  </div>
                  <Link
                    href={user?.role === "doctor" ? "/dashboard/doctor" : "/dashboard/user"}
                    className="rounded-full border border-[color:var(--pc-line)] px-4 py-2 text-sm font-medium text-[color:var(--pc-ink)] transition hover:border-[color:var(--pc-sky)]"
                  >
                    Open dashboard
                  </Link>
                </div>
              ) : (
                <div className="text-sm text-[color:var(--pc-muted)]">
                  Select a conversation to view messages.
                </div>
              )}
            </header>

            <div className="flex-1 space-y-4 overflow-y-auto bg-[color:var(--pc-surface)] px-5 py-6 sm:px-6">
              {selectedConversationId && loadedConversationId !== selectedConversationId ? (
                <div className="rounded-[1.5rem] border border-dashed border-[color:var(--pc-line)] bg-white/75 px-4 py-6 text-sm text-[color:var(--pc-muted)]">
                  Loading conversation history.
                </div>
              ) : messages.length > 0 ? (
                messages.map((message) => {
                  const isMine = message.sender.id === user?.id;

                  return (
                    <div
                      key={message.id}
                      className={`flex ${isMine ? "justify-end" : "justify-start"}`}
                    >
                      <article
                        className={`max-w-[85%] rounded-[1.5rem] px-4 py-3 shadow-[0_10px_35px_rgba(8,47,73,0.08)] sm:max-w-[70%] ${
                          isMine
                            ? "bg-[color:var(--pc-ink)] text-white"
                            : "border border-[color:var(--pc-line)] bg-white text-[color:var(--pc-ink)]"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <p className={`text-sm font-semibold ${isMine ? "text-white" : "text-[color:var(--pc-ink)]"}`}>
                            {message.sender.name}
                          </p>
                          <span
                            className={`text-xs ${isMine ? "text-white/70" : "text-[color:var(--pc-muted)]"}`}
                          >
                            {formatMessageTime(message.createdAt)}
                          </span>
                        </div>
                        <p
                          className={`mt-2 text-sm leading-7 ${isMine ? "text-white/90" : "text-[color:var(--pc-muted)]"}`}
                        >
                          {message.content}
                        </p>
                      </article>
                    </div>
                  );
                })
              ) : (
                <div className="rounded-[1.5rem] border border-dashed border-[color:var(--pc-line)] bg-white/75 px-4 py-6 text-sm text-[color:var(--pc-muted)]">
                  This conversation is ready. Send the first message when you are ready.
                </div>
              )}
            </div>

            <form
              onSubmit={handleSendMessage}
              className="border-t border-[color:var(--pc-line)] bg-white px-5 py-4 sm:px-6"
            >
              <div className="flex flex-col gap-3 sm:flex-row">
                <textarea
                  value={draft}
                  onChange={(event) => setDraft(event.target.value)}
                  rows={2}
                  placeholder="Type your message here"
                  disabled={!selectedConversationId}
                  className="min-h-[84px] flex-1 rounded-[1.2rem] border border-[color:var(--pc-line)] bg-[color:var(--pc-surface)] px-4 py-3 text-sm text-[color:var(--pc-ink)] outline-none transition focus:border-[color:var(--pc-sky)] disabled:cursor-not-allowed disabled:opacity-60"
                />
                <button
                  type="submit"
                  disabled={!selectedConversationId || !draft.trim() || isSending}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-[color:var(--pc-ink)] px-5 py-3 text-sm font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  <Send className="h-4 w-4" />
                  {isSending ? "Sending..." : "Send"}
                </button>
              </div>
            </form>
          </section>
        </section>
      )}
    </main>
  );
}
