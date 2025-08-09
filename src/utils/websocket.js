import PusherJS from "pusher-js";

const socketClient = new PusherJS("app1", {
    cluster: "",
    wsHost: "chat.vsron.site",
    wsPort: 443,
    forceTLS: true,
    encrypted: true,
    disableStats: true,
    enabledTransports: ["ws", "wss"],
});

export default socketClient;
