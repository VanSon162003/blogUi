import httpRequest from "../utils/httpRequest";

export const sendMessage = async (data) => {
    const result = await httpRequest.post("/pusher/send-message", data);
    return result;
};

export default {
    sendMessage,
};
