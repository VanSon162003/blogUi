import httpRequest from "../utils/httpRequest";

export const getAll = async () => {
    const result = await httpRequest.get(`/conversation`);
    return result;
};

export const getOne = async (id) => {
    const result = await httpRequest.get(`/conversation/${id}`);
    return result;
};

export const getConversationByName = async (name) => {
    const result = await httpRequest.get(`/conversation/name/${name}`);
    return result;
};

export const create = async (data) => {
    const result = await httpRequest.post(`/conversation`, data);
    return result;
};

export default { getAll, getOne, getConversationByName, create };
