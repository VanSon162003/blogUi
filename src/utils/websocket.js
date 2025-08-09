import PusherJS from "pusher-js";

const socketClient = new PusherJS("app1", {
    cluster: "",
    wsHost: import.meta.env.VITE_WSHOST,
    wsPort: import.meta.env.VITE_WSPORT,
    forceTLS: import.meta.env.VITE_FORCETLS,
    encrypted: true,
    disableStats: true,
    enabledTransports: ["ws", "wss"],
});

export default socketClient;
