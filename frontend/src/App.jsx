"use client"

import { useState, useRef, useEffect } from "react"

// Helper function to format text with markdown-style formatting
const formatMessage = (text) => {
  // Replace **text** with bold formatting
  const formattedText = text.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")

  // Replace *text* with italic formatting
  const withItalics = formattedText.replace(/\*(.*?)\*/g, "<em>$1</em>")

  return withItalics
}

function App() {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState("")
  const [uploadStatus, setUploadStatus] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const messagesEndRef = useRef(null)
  const fileInputRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const sendMessage = async () => {
    if (!input.trim()) return

    const userMessage = { sender: "user", text: input }
    setMessages((prev) => [...prev, userMessage])
    setIsLoading(true)

    try {
      const response = await fetch("http://localhost:8000/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input }),
      })
      const data = await response.json()
      const botMessage = { sender: "bot", text: data.reply }
      setMessages((prev) => [...prev, botMessage])
    } catch (err) {
      const errorMessage = { sender: "bot", text: "❌ Error connecting to server." }
      setMessages((prev) => [...prev, errorMessage])
    }

    setInput("")
    setIsLoading(false)
  }

  const uploadCSV = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    setIsUploading(true)
    const formData = new FormData()
    formData.append("file", file)

    try {
      const response = await fetch("http://localhost:8000/api/upload", {
        method: "POST",
        body: formData,
      })
      const data = await response.json()
      if (data.error) {
        setUploadStatus(`❌ Upload failed: ${data.error}`)
      } else {
        setUploadStatus(`✅ CSV Uploaded Successfully\n\n${data.content}`)
      }
    } catch (err) {
      setUploadStatus(`❌ Upload error`)
    }

    setIsUploading(false)
  }

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const styles = {
    container: {
      display: "flex",
      height: "100vh",
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      background: "#f8fafc",
    },

    // LEFT PANEL - CSV Upload & Info
    leftPanel: {
      width: "30%",
      background: "white",
      borderRight: "2px solid #e2e8f0",
      display: "flex",
      flexDirection: "column",
      overflow: "hidden",
    },
    leftHeader: {
      padding: "20px",
      borderBottom: "1px solid #e2e8f0",
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      color: "white",
    },
    leftTitle: {
      fontSize: "18px",
      fontWeight: "600",
      margin: "0 0 8px 0",
      display: "flex",
      alignItems: "center",
      gap: "8px",
    },
    leftSubtitle: {
      fontSize: "14px",
      opacity: 0.9,
      margin: 0,
    },
    uploadSection: {
      padding: "20px",
      borderBottom: "1px solid #e2e8f0",
    },
    uploadButton: {
      width: "100%",
      padding: "12px 16px",
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      color: "white",
      border: "none",
      borderRadius: "8px",
      cursor: "pointer",
      fontSize: "14px",
      fontWeight: "500",
      transition: "all 0.2s",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "8px",
    },
    uploadButtonHover: {
      transform: "translateY(-1px)",
      boxShadow: "0 4px 12px rgba(102, 126, 234, 0.4)",
    },
    uploadButtonDisabled: {
      background: "#9ca3af",
      cursor: "not-allowed",
      transform: "none",
      boxShadow: "none",
    },
    statusSection: {
      flex: 1,
      padding: "20px",
      overflow: "auto",
    },
    statusCard: {
      padding: "16px",
      borderRadius: "8px",
      border: "1px solid",
      fontSize: "13px",
      fontFamily: "monospace",
      whiteSpace: "pre-wrap",
      lineHeight: "1.4",
    },
    statusCardSuccess: {
      background: "#f0fdf4",
      borderColor: "#bbf7d0",
      color: "#166534",
    },
    statusCardError: {
      background: "#fef2f2",
      borderColor: "#fecaca",
      color: "#dc2626",
    },
    emptyUpload: {
      textAlign: "center",
      color: "#64748b",
      padding: "40px 20px",
    },
    emptyUploadIcon: {
      fontSize: "48px",
      marginBottom: "16px",
      display: "block",
    },
    emptyUploadText: {
      fontSize: "14px",
      lineHeight: "1.5",
    },

    // RIGHT PANEL - Chat Interface
    rightPanel: {
      width: "70%",
      display: "flex",
      flexDirection: "column",
      background: "white",
    },
    chatHeader: {
      padding: "20px 24px",
      borderBottom: "1px solid #e2e8f0",
      background: "white",
      boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
    },
    chatTitle: {
      fontSize: "20px",
      fontWeight: "600",
      color: "#1e293b",
      margin: 0,
      display: "flex",
      alignItems: "center",
      gap: "12px",
    },
    chatIcon: {
      width: "32px",
      height: "32px",
      background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
      borderRadius: "8px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: "16px",
    },
    chatContainer: {
      flex: 1,
      overflow: "hidden",
      background: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)",
    },
    chatContent: {
      height: "100%",
      padding: "20px 24px",
      overflowY: "auto",
    },
    emptyChat: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      height: "100%",
      textAlign: "center",
    },
    emptyChatIcon: {
      width: "64px",
      height: "64px",
      background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
      borderRadius: "50%",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: "white",
      fontSize: "24px",
      marginBottom: "16px",
    },
    emptyChatTitle: {
      fontSize: "20px",
      fontWeight: "600",
      color: "#1e293b",
      marginBottom: "8px",
    },
    emptyChatDescription: {
      color: "#64748b",
      maxWidth: "400px",
      lineHeight: "1.5",
    },
    messagesContainer: {
      display: "flex",
      flexDirection: "column",
      gap: "20px",
    },
    messageRow: {
      display: "flex",
      alignItems: "flex-start",
      gap: "12px",
    },
    messageRowUser: {
      flexDirection: "row-reverse",
    },
    avatar: {
      width: "36px",
      height: "36px",
      borderRadius: "50%",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: "white",
      fontSize: "16px",
      flexShrink: 0,
    },
    avatarUser: {
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    },
    avatarBot: {
      background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
    },
    messageContent: {
      flex: 1,
      maxWidth: "80%",
    },
    messageContentUser: {
      textAlign: "right",
    },
    messageBubble: {
      display: "inline-block",
      padding: "12px 16px",
      borderRadius: "18px",
      whiteSpace: "pre-wrap",
      lineHeight: "1.5",
      fontSize: "14px",
      wordBreak: "break-word",
    },
    messageBubbleUser: {
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      color: "white",
    },
    messageBubbleBot: {
      background: "white",
      border: "1px solid #e2e8f0",
      color: "#1e293b",
      boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
    },
    loadingContainer: {
      display: "flex",
      alignItems: "flex-start",
      gap: "12px",
    },
    loadingBubble: {
      background: "white",
      border: "1px solid #e2e8f0",
      borderRadius: "18px",
      padding: "12px 16px",
      boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
    },
    loadingDots: {
      display: "flex",
      gap: "4px",
    },
    loadingDot: {
      width: "8px",
      height: "8px",
      background: "#9ca3af",
      borderRadius: "50%",
      animation: "bounce 1.4s ease-in-out infinite both",
    },
    inputContainer: {
      background: "white",
      borderTop: "1px solid #e2e8f0",
      padding: "20px 24px",
    },
    inputRow: {
      display: "flex",
      alignItems: "flex-end",
      gap: "12px",
    },
    inputWrapper: {
      flex: 1,
      position: "relative",
    },
    input: {
      width: "100%",
      padding: "12px 16px",
      fontSize: "14px",
      border: "1px solid #d1d5db",
      borderRadius: "12px",
      outline: "none",
      resize: "none",
      transition: "all 0.2s",
      background: "#f8fafc",
    },
    inputFocus: {
      borderColor: "#10b981",
      boxShadow: "0 0 0 3px rgba(16, 185, 129, 0.1)",
      background: "white",
    },
    sendButton: {
      padding: "12px 20px",
      background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
      color: "white",
      border: "none",
      borderRadius: "12px",
      cursor: "pointer",
      fontSize: "14px",
      fontWeight: "500",
      transition: "all 0.2s",
      display: "flex",
      alignItems: "center",
      gap: "8px",
    },
    sendButtonHover: {
      transform: "translateY(-1px)",
      boxShadow: "0 4px 12px rgba(16, 185, 129, 0.4)",
    },
    sendButtonDisabled: {
      background: "#9ca3af",
      cursor: "not-allowed",
      transform: "none",
      boxShadow: "none",
    },
    helpText: {
      fontSize: "12px",
      color: "#64748b",
      textAlign: "center",
      marginTop: "8px",
    },
  }

  return (
    <div style={styles.container}>
      {/* LEFT PANEL - CSV Upload & Info */}
      <div style={styles.leftPanel}>
        {/* Left Header */}
        <div style={styles.leftHeader}>
          <h2 style={styles.leftTitle}>📊 CSV Manager</h2>
          <p style={styles.leftSubtitle}>Upload and manage your data files</p>
        </div>

        {/* Upload Section */}
        <div style={styles.uploadSection}>
          <input ref={fileInputRef} type="file" accept=".csv" onChange={uploadCSV} style={{ display: "none" }} />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            style={{
              ...styles.uploadButton,
              ...(isUploading ? styles.uploadButtonDisabled : {}),
            }}
            onMouseEnter={(e) => !isUploading && Object.assign(e.target.style, styles.uploadButtonHover)}
            onMouseLeave={(e) => !isUploading && Object.assign(e.target.style, styles.uploadButton)}
          >
            📁 {isUploading ? "Uploading..." : "Upload CSV File"}
          </button>
        </div>

        {/* Status Section */}
        <div style={styles.statusSection}>
          {uploadStatus ? (
            <div
              style={{
                ...styles.statusCard,
                ...(uploadStatus.includes("✅") ? styles.statusCardSuccess : styles.statusCardError),
              }}
            >
              {uploadStatus}
            </div>
          ) : (
            <div style={styles.emptyUpload}>
              <span style={styles.emptyUploadIcon}>📄</span>
              <div style={styles.emptyUploadText}>
                No CSV file uploaded yet.
                <br />
                Click the button above to get started!
              </div>
            </div>
          )}
        </div>
      </div>

      {/* RIGHT PANEL - Chat Interface */}
      <div style={styles.rightPanel}>
        {/* Chat Header */}
        <div style={styles.chatHeader}>
          <h1 style={styles.chatTitle}>
            <div style={styles.chatIcon}>🤖</div>
            Chat Assistant
          </h1>
        </div>

        {/* Chat Messages */}
        <div style={styles.chatContainer}>
          <div style={styles.chatContent}>
            {messages.length === 0 ? (
              <div style={styles.emptyChat}>
                <div style={styles.emptyChatIcon}>💬</div>
                <h2 style={styles.emptyChatTitle}>Ready to Chat!</h2>
                <p style={styles.emptyChatDescription}>
                  Upload a CSV file on the left and start asking questions about your data. I'm here to help you analyze
                  and understand your information.
                </p>
              </div>
            ) : (
              <div style={styles.messagesContainer}>
                {messages.map((msg, i) => (
                  <div
                    key={i}
                    style={{
                      ...styles.messageRow,
                      ...(msg.sender === "user" ? styles.messageRowUser : {}),
                    }}
                  >
                    <div
                      style={{
                        ...styles.avatar,
                        ...(msg.sender === "user" ? styles.avatarUser : styles.avatarBot),
                      }}
                    >
                      {msg.sender === "user" ? "👤" : "🤖"}
                    </div>
                    <div
                      style={{
                        ...styles.messageContent,
                        ...(msg.sender === "user" ? styles.messageContentUser : {}),
                      }}
                    >
                      <div
                        style={{
                          ...styles.messageBubble,
                          ...(msg.sender === "user" ? styles.messageBubbleUser : styles.messageBubbleBot),
                        }}
                      >
                        <div dangerouslySetInnerHTML={{ __html: formatMessage(msg.text) }} />
                      </div>
                    </div>
                  </div>
                ))}

                {/* Loading indicator */}
                {isLoading && (
                  <div style={styles.loadingContainer}>
                    <div style={{ ...styles.avatar, ...styles.avatarBot }}>🤖</div>
                    <div style={styles.loadingBubble}>
                      <div style={styles.loadingDots}>
                        <div style={{ ...styles.loadingDot, animationDelay: "0s" }}></div>
                        <div style={{ ...styles.loadingDot, animationDelay: "0.2s" }}></div>
                        <div style={{ ...styles.loadingDot, animationDelay: "0.4s" }}></div>
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>
            )}
          </div>
        </div>

        {/* Input Area */}
        <div style={styles.inputContainer}>
          <div style={styles.inputRow}>
            <div style={styles.inputWrapper}>
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Ask me anything about your CSV data..."
                style={styles.input}
                disabled={isLoading}
                onFocus={(e) => Object.assign(e.target.style, styles.inputFocus)}
                onBlur={(e) => Object.assign(e.target.style, styles.input)}
              />
            </div>
            <button
              onClick={sendMessage}
              disabled={!input.trim() || isLoading}
              style={{
                ...styles.sendButton,
                ...(!input.trim() || isLoading ? styles.sendButtonDisabled : {}),
              }}
              onMouseEnter={(e) =>
                !(!input.trim() || isLoading) && Object.assign(e.target.style, styles.sendButtonHover)
              }
              onMouseLeave={(e) => !(!input.trim() || isLoading) && Object.assign(e.target.style, styles.sendButton)}
            >
              ➤ Send
            </button>
          </div>
          <p style={styles.helpText}>Press Enter to send, Shift + Enter for new line</p>
        </div>
      </div>

      <style jsx>{`
        @keyframes bounce {
          0%, 80%, 100% {
            transform: scale(0);
          }
          40% {
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  )
}

export default App
