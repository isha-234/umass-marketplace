// src/ChatModal.jsx
import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { getAuth } from "firebase/auth";

const BACKEND_URL = "http://127.0.0.1:8000";

// Axios with Firebase auth header
async function getAuthAxios() {
  const auth = getAuth();
  const user = auth.currentUser;

  if (!user) {
    throw new Error("Not logged in");
  }

  const token = await user.getIdToken();

  return axios.create({
    baseURL: BACKEND_URL,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export default function ChatModal({ open, onClose, conversationId, listing }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loadingSend, setLoadingSend] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [error, setError] = useState("");

  const [currentUserEmail, setCurrentUserEmail] = useState("");
  const [loadingUser, setLoadingUser] = useState(true);

  const messagesEndRef = useRef(null);

  // Fetch current user from backend (/auth/me uses get_current_user)
  useEffect(() => {
    if (!open) return;

    let cancelled = false;

    const fetchMe = async () => {
      try {
        setLoadingUser(true);
        const ax = await getAuthAxios();
        const res = await ax.get("/auth/me");
        if (!cancelled) {
          setCurrentUserEmail(res.data.email || "");
        }
      } catch (err) {
        console.error("Error calling /auth/me", err);
        if (!cancelled) setCurrentUserEmail("");
      } finally {
        if (!cancelled) setLoadingUser(false);
      }
    };

    fetchMe();

    return () => {
      cancelled = true;
    };
  }, [open]);

  // Fetch messages for this conversation
  useEffect(() => {
    if (!open || !conversationId || !currentUserEmail) return;

    let cancelled = false;

    const fetchMessages = async () => {
      try {
        setLoadingMessages(true);
        const ax = await getAuthAxios();
        const res = await ax.get(`/conversations/${conversationId}/messages`);
        if (!cancelled) {
          setMessages(res.data);
          setError("");
        }
      } catch (err) {
        console.error("Error fetching messages", err);
        if (!cancelled) {
          setError("Could not load messages.");
        }
      } finally {
        if (!cancelled) setLoadingMessages(false);
      }
    };

    fetchMessages();
    const interval = setInterval(fetchMessages, 5000);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [open, conversationId, currentUserEmail]);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || !conversationId) return;

    try {
      setLoadingSend(true);
      const ax = await getAuthAxios();
      const res = await ax.post(`/conversations/${conversationId}/messages`, {
        text,
      });

      setMessages((prev) => [...prev, res.data]);
      setInput("");
    } catch (err) {
      console.error("Error sending message", err);
      let msg = "Could not send message.";
      if (err.message === "Not logged in") {
        msg = "Please log in to send messages.";
      } else if (err.response?.data?.detail) {
        msg = err.response.data.detail;
      }
      alert(msg);
    } finally {
      setLoadingSend(false);
    }
  };

  if (!open) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0,0,0,0.4)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: "#fff",
          width: "100%",
          maxWidth: "480px",
          maxHeight: "80vh",
          borderRadius: "12px",
          display: "flex",
          flexDirection: "column",
          boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: "12px 16px",
            borderBottom: "1px solid #eee",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <div style={{ fontWeight: 600 }}>
              Chat about: {listing?.title || "Listing"}
            </div>
            <div style={{ fontSize: 12, color: "#666" }}>
              Between you and the seller
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              border: "none",
              background: "transparent",
              fontSize: 20,
              lineHeight: 1,
              cursor: "pointer",
            }}
          >
            ×
          </button>
        </div>

        {/* Messages */}
        <div
          style={{
            flex: 1,
            padding: "12px 12px 4px",
            overflowY: "auto",
            backgroundColor: "#fafafa",
          }}
        >
          {loadingUser && (
            <div style={{ fontSize: 13, color: "#888", marginBottom: 8 }}>
              Checking your account…
            </div>
          )}

          {loadingMessages && !loadingUser && (
            <div style={{ fontSize: 13, color: "#888", marginBottom: 8 }}>
              Loading messages…
            </div>
          )}

          {error && (
            <div style={{ fontSize: 13, color: "red", marginBottom: 8 }}>
              {error}
            </div>
          )}

          {!loadingMessages &&
            !loadingUser &&
            messages.length === 0 &&
            !error && (
              <div style={{ fontSize: 13, color: "#888" }}>
                No messages yet. Say hi!
              </div>
            )}

          {messages.map((msg) => {
            const isMine = msg.senderId === currentUserEmail;
            return (
              <div
                key={msg.id}
                style={{
                  display: "flex",
                  justifyContent: isMine ? "flex-end" : "flex-start",
                  marginBottom: 6,
                }}
              >
                <div
                  style={{
                    padding: "8px 10px",
                    borderRadius: 10,
                    maxWidth: "70%",
                    fontSize: 14,
                    backgroundColor: isMine ? "#2563eb" : "#e5e7eb",
                    color: isMine ? "#fff" : "#111827",
                  }}
                >
                  <div>{msg.text}</div>
                  <div
                    style={{
                      fontSize: 10,
                      opacity: 0.75,
                      marginTop: 2,
                      textAlign: "right",
                    }}
                  >
                    {msg.createdAt &&
                      new Date(msg.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                  </div>
                </div>
              </div>
            );
          })}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <form
          onSubmit={handleSend}
          style={{
            borderTop: "1px solid #eee",
            padding: "8px",
            display: "flex",
            gap: 8,
          }}
        >
          <input
            type="text"
            placeholder="Write a message…"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            style={{
              flex: 1,
              borderRadius: 8,
              border: "1px solid #ddd",
              padding: "6px 10px",
              fontSize: 14,
            }}
          />
          <button
            type="submit"
            disabled={
              loadingSend || !input.trim() || loadingUser || !currentUserEmail
            }
            style={{
              borderRadius: 8,
              border: "none",
              backgroundColor: "#2563eb",
              color: "#fff",
              padding: "6px 12px",
              fontSize: 14,
              cursor: loadingSend ? "default" : "pointer",
              opacity:
                loadingSend || !input.trim() || loadingUser || !currentUserEmail
                  ? 0.7
                  : 1,
            }}
          >
            {loadingSend ? "Sending…" : "Send"}
          </button>
        </form>
      </div>
    </div>
  );
}
