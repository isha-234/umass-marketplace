// src/MessagesDrawer.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { getAuth } from "firebase/auth";

const BACKEND_URL = "http://127.0.0.1:8000";

async function getAuthAxios() {
  const auth = getAuth();
  const fbUser = auth.currentUser;
  if (!fbUser) throw new Error("Not logged in");

  const token = await fbUser.getIdToken();

  return axios.create({
    baseURL: BACKEND_URL,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export default function MessagesDrawer({ open, onClose, currentUserEmail }) {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedConv, setSelectedConv] = useState(null);

  const [messages, setMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");

  // Load conversation list
  useEffect(() => {
    if (!open) return;
    setSelectedConv(null);

    let cancelled = false;
    const fetchConversations = async () => {
      try {
        setLoading(true);
        const ax = await getAuthAxios();
        const res = await ax.get("/conversations");
        if (!cancelled) {
          setConversations(res.data);
          setError("");
        }
      } catch (err) {
        console.error(err);
        if (!cancelled) setError("Could not load conversations.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchConversations();

    return () => (cancelled = true);
  }, [open]);

  // Load messages when selecting a conversation
  useEffect(() => {
    if (!selectedConv) return;

    let cancelled = false;
    const fetchMessages = async () => {
      try {
        const ax = await getAuthAxios();
        const res = await ax.get(`/conversations/${selectedConv.id}/messages`);
        if (!cancelled) setMessages(res.data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchMessages();

    return () => (cancelled = true);
  }, [selectedConv]);

  const sendMessage = async () => {
    if (!chatInput.trim()) return;
    const text = chatInput;
    setChatInput("");

    try {
      const ax = await getAuthAxios();
      await ax.post(`/conversations/${selectedConv.id}/messages`, { text });

      setMessages((prev) => [
        ...prev,
        {
          text,
          senderId: currentUserEmail,
          createdAt: new Date().toISOString(),
        },
      ]);
    } catch (err) {
      console.error(err);
    }
  };

  if (!open) return null;

  return (
    <>
      {/* background overlay */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          backgroundColor: "rgba(0,0,0,0.08)",
          zIndex: 900,
        }}
        onClick={onClose}
      />

      {/* floating panel */}
      <div
        style={{
          position: "fixed",
          right: 24,
          bottom: 24,
          width: 420,
          maxWidth: "calc(100% - 32px)",
          height: "80vh",
          maxHeight: "80vh",
          backgroundColor: "#ffffff",
          borderRadius: 18,
          boxShadow: "0 20px 55px rgba(0,0,0,0.22)",
          zIndex: 1000,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER */}
        <div
          style={{
            padding: "12px 16px",
            borderBottom: "1px solid #eee",
            background: "#faf6f5",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          {selectedConv ? (
            <>
              <button
                onClick={() => setSelectedConv(null)}
                style={{
                  border: "none",
                  background: "transparent",
                  fontSize: 18,
                  cursor: "pointer",
                  color: "#555",
                  paddingRight: 10,
                }}
              >
                ←
              </button>
              <div>
                <div style={{ fontWeight: 600, fontSize: 14 }}>
                  Chat about: {selectedConv.listingTitle}
                </div>
                <div style={{ fontSize: 12, color: "#777" }}>
                  With{" "}
                  {selectedConv.buyerId === currentUserEmail
                    ? selectedConv.sellerId
                    : selectedConv.buyerId}
                </div>
              </div>
              <div style={{ width: 20 }} />
            </>
          ) : (
            <>
              <div>
                <div style={{ fontWeight: 600, fontSize: 16 }}>
                  My Messages
                </div>
                <div style={{ fontSize: 11, color: "#777" }}>
                  Chat with buyers and sellers
                </div>
              </div>

              <button
                onClick={onClose}
                style={{
                  border: "none",
                  background: "transparent",
                  fontSize: 20,
                  cursor: "pointer",
                  color: "#999",
                }}
              >
                ×
              </button>
            </>
          )}
        </div>

        {/* BODY */}
        <div style={{ flex: 1, overflowY: "auto", padding: "12px 14px" }}>
          {/* LIST VIEW */}
          {!selectedConv &&
            conversations.map((conv) => {
              const amBuyer = conv.buyerId === currentUserEmail;
              const otherParty = amBuyer ? conv.sellerId : conv.buyerId;

              const dateLabel = conv.lastMessageAt
                ? new Date(conv.lastMessageAt).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                  })
                : "";

              return (
                <button
                  key={conv.id}
                  onClick={() => setSelectedConv(conv)}
                  style={{
                    width: "100%",
                    textAlign: "left",
                    border: "1px solid #f1eaea",
                    padding: "10px 12px",
                    borderRadius: 12,
                    background: "#fdfaf9",
                    marginBottom: 10,
                    cursor: "pointer",
                    display: "flex",
                    flexDirection: "column",
                    gap: 4,
                  }}
                >
                  {/* FIRST LINE: other person's email (or name later) */}
                  <div
                    style={{
                      fontWeight: 600,
                      fontSize: 14,
                      color: "#2d2d2d",
                    }}
                  >
                    {otherParty}
                  </div>

                  {/* SECOND LINE: listing title + date */}
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      fontSize: 11,
                      color: "#888",
                    }}
                  >
                    <span>{conv.listingTitle || "Listing"}</span>
                    {dateLabel && (
                      <span
                        style={{
                          textTransform: "uppercase",
                          letterSpacing: 0.08,
                        }}
                      >
                        {dateLabel}
                      </span>
                    )}
                  </div>

                  {/* THIRD LINE: last message preview */}
                  <div
                    style={{
                      fontSize: 12,
                      color: "#555",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {conv.lastMessageText || "No messages yet"}
                  </div>
                </button>
              );
            })}

          {/* CHAT VIEW */}
          {selectedConv &&
            messages.map((msg, idx) => {
              const mine = msg.senderId === currentUserEmail;

              return (
                <div
                  key={idx}
                  style={{
                    display: "flex",
                    justifyContent: mine ? "flex-end" : "flex-start",
                    padding: "4px 0",
                  }}
                >
                  <div
                    style={{
                      background: mine ? "#2563eb" : "#e5e5e5",
                      color: mine ? "#fff" : "#000",
                      padding: "8px 12px",
                      borderRadius: 12,
                      maxWidth: "70%",
                    }}
                  >
                    {msg.text}
                    <div
                      style={{
                        marginTop: 4,
                        fontSize: 10,
                        textAlign: mine ? "right" : "left",
                        opacity: 0.7,
                      }}
                    >
                      {new Date(msg.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
        </div>

        {/* CHAT INPUT */}
        {selectedConv && (
          <div
            style={{
              padding: "12px",
              borderTop: "1px solid #eee",
              background: "#fff",
            }}
          >
            <div style={{ display: "flex", gap: 8 }}>
              <input
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Write a message…"
                style={{
                  flex: 1,
                  border: "1px solid #ccc",
                  borderRadius: 8,
                  padding: "8px 10px",
                }}
              />
              <button
                onClick={sendMessage}
                style={{
                  background: "#2563eb",
                  color: "#fff",
                  border: "none",
                  padding: "8px 16px",
                  borderRadius: 8,
                  cursor: "pointer",
                }}
              >
                Send
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
