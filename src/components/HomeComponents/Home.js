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

function Home() {
  const { loggedInUser } = useContext(AuthContext);
  const [usersList, setUsersList] = useState([]);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [chatWithUser, setChatWithUser] = useState(null);
  const [time, setTime] = useState(new Date());
  const messagesEndRef = useRef(null); // Reference to the end of the message list

  const baseURL = process.env.REACT_APP_BASE_URL;


  // Add this useEffect to update the time every second
  useEffect(() => {
    const interval = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Fetch chat history for a user
  const searchMessage = async (searchValue) => {

    
    if(searchValue.trim().length > 0) {
      console.log(searchValue);

      try {
        const response = await axios.get(`${baseURL}/data/search`, {
          params: { 
            key: searchValue
          }
        });
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
              <a href="/chatroom">
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


          {/* Chat Box */}
          <div className="col-12">
            <section className="chat-box border d-flex flex-column">
              <input
                type="text"
                placeholder="Search message"
                onKeyUp={(event) => searchMessage(event.target.value)}
              />
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

export default Home;
