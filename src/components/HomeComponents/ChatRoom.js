import React, { useState, useEffect, useContext, useRef } from "react";
import { AuthContext } from "../../context/AuthContext";
import axios from "axios";
import iziToast from "izitoast";
import { io } from "socket.io-client";
import "./ChatRoom.css";

// Initialize Socket.IO connection
// const socket = io(process.env.REACT_APP_BASE_URL.replace('/api', '').replace('http', 'ws'));

const socket = io(process.env.REACT_APP_BASE_URL.replace('/api', '').replace('http', 'ws'), {
  reconnection: true,           // Enables automatic reconnection
  reconnectionAttempts: 5,      // Number of attempts before giving up
  reconnectionDelay: 1000,      // Initial delay between attempts (in ms)
  reconnectionDelayMax: 5000,   // Maximum delay between attempts (in ms)
  timeout: 20000,               // Connection timeout before failing (in ms)
});

function ChatRoom() {
  const { loggedInUser } = useContext(AuthContext);
  const [usersList, setUsersList] = useState([]);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [chatWithUser, setChatWithUser] = useState(null);
  const [time, setTime] = useState(new Date());
  const messagesEndRef = useRef(null); // Reference to the end of the message list

  const baseURL = process.env.REACT_APP_BASE_URL;

  // Register user on socket connection
  useEffect(() => {
    if (loggedInUser?._id) {
      socket.emit("register_user", loggedInUser._id);
    }
  }, [loggedInUser]);

  // Handle receiving new messages
  useEffect(() => {
    socket.on("receive_message", (data) => {
      setMessages((prevMessages) => [...prevMessages, data]);
    });

    return () => {
      socket.off("receive_message");
    };
  }, []);

  // Fetch users list
  useEffect(() => {
    const getUsersList = async () => {
      try {
        const response = await axios.get(`${baseURL}/user/list`);
        setUsersList(response.data.users);
      } catch (error) {
        const errorMessage =
          error.response?.data?.message || "Something went wrong!";
        iziToast.error({
          title: "Error",
          message: errorMessage,
          position: "topRight",
        });
      }
    };

    getUsersList();
  }, [baseURL]);

  // Scroll to the bottom of the message list
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Select a user to chat with
  const chatWithUserFunction = (user) => {
    setChatWithUser(user);
    getChatHistory(user._id);
    setMessages([]); // Reset messages for new chat
  };

  // Send a message
  const sendMessage = () => {
    if (!message.trim()) return;

    const messageData = {
      sender: loggedInUser._id,
      receiver: chatWithUser._id,
      content: message,
      timestamp: new Date().toISOString(),
    };

    socket.emit("send_message", messageData);
    setMessages((prevMessages) => [...prevMessages, messageData]);
    setMessage("");
  };

  // Add this useEffect to update the time every second
  useEffect(() => {
    const interval = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Fetch chat history for a user
  const getChatHistory = async (userId) => {
    try {
      const response = await axios.get(`${baseURL}/chat/${userId}/${loggedInUser._id}`);
      setMessages(response.data);
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Unable to fetch chat history!";
      iziToast.error({
        title: "Error",
        message: errorMessage,
        position: "topRight",
      });
    }
  };

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/";
  };

  return (
    <div className="col-12 bg-lightblue">
      <div className="chat-room-container">
        <header className="dashboard-header p-3 border-bottom">
          <div className="d-flex justify-content-between">
            <div className="col-6">
              <a href="/home">
                <h5>{loggedInUser?.name}</h5>
              </a>
              <h6>{loggedInUser?.mobile}</h6>
            </div>
            <div className="col-6 d-flex justify-content-end header-right">
              <div className="logout-container">
                <button className="logout-button" onClick={handleLogout}>
                  Logout
                </button>
                <div className="time">{time.toLocaleTimeString()}</div>
              </div>
            </div>
          </div>
        </header>

        <div className="d-flex col-12 chat-body">
          {/* User List */}
          <div className="col-lg-3 col-md-4 col-6">
            <section className="user-list border">
              {usersList.map((user) =>
                user._id !== loggedInUser._id ? (
                  <div
                    key={user._id}
                    className="pointer users-list"
                    onClick={() => chatWithUserFunction(user)}
                  >
                    <div className="col-12 d-flex justify-content-between">
                      <div className="col-8">
                        <strong>{user.name}</strong>
                      </div>
                      <div className="col-5">{user.mobile}</div>
                    </div>
                  </div>
                ) : null
              )}
            </section>
          </div>

          {/* Chat Box */}
          <div className="col-lg-9 col-md-8 col-6">
            <section className="chat-box border d-flex flex-column">
              {chatWithUser && (
                <>
                  <h5 className="border-bottom p-2">{chatWithUser.name}</h5>
                  <div className="messages flex-grow-1 overflow-auto">
                    {messages.map((msg, index) => {
                      const dateObj = new Date(msg.timestamp);

                      const formattedTime = dateObj.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: true,
                      });

                      const fullDateTime = dateObj.toLocaleString("en-US", {
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit",
                        hour12: true,
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      });

                      return (
                        <div
                          key={index}
                          className={
                            msg.sender === loggedInUser._id
                              ? "sent-message"
                              : "received-message"
                          }
                        >
                          <p>{msg.content}</p>
                          <div
                            className="chat-timeStamp pointer"
                            title={fullDateTime}
                          >
                            {msg.sender === loggedInUser._id ? "Sent " : "Received "}
                            {formattedTime}
                          </div>
                        </div>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </div>

                  <div className="message-input-container d-flex align-items-center mt-auto">
                    <input
                      type="text"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Type a message..."
                      className="form-control me-2"
                    />
                    <button className="btn btn-primary" onClick={sendMessage}>
                      Send
                    </button>
                  </div>
                </>
              )}
            </section>
          </div>
        </div>

        <footer className="dashboard-footer">
          <p>&copy;2024 MERN Real time Chat System</p>
        </footer>
      </div>
    </div>
  );
}

export default ChatRoom;
