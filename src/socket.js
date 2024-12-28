import { io } from "socket.io-client";

// In case of HTTPS backend, use `wss://`
const socket = io(process.env.REACT_APP_BASE_URL.replace('/api', '').replace('http', 'ws'));

export default socket;
