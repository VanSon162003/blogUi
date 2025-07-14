import httpRequest from "../utils/httpRequest";

export const getConversationByName = async (name) => {
    const result = await httpRequest.get(`/conversation/name/${name}`);
    return result;
};

export default {
    getConversationByName,
};
