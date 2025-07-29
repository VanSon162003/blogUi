import httpRequest from "../utils/httpRequest";

export const getConversationByName = async (name) => {
    const result = await httpRequest.get(`/conversation/name/${name}`);
    return result;
};

export const create = async (data) => {
    const result = await httpRequest.post(`/conversation`, data);
    return result;
};

export default {
    getConversationByName,
    create,
};
