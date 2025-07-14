import httpRequest from "../utils/httpRequest";

export const getAllMessageByConversationId = async (conversationId) => {
    const result = await httpRequest.get(
        `/messages/conversation/${conversationId}`
    );
    return result;
};

export default {
    getAllMessageByConversationId,
};
