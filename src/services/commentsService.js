import httpRequest from "../utils/httpRequest";

export const getAllByPostId = async (id) => {
    const result = await httpRequest.get(`/comments/post/${id}`);
    return result;
};

export const create = async (data) => {
    const result = await httpRequest.post(`/comments`, data);
    return result;
};

export const update = async (id, data) => {
    const result = await httpRequest.put(`/comments/${id}`, data);
    return result;
};

export const toggleLike = async (id) => {
    const result = await httpRequest.post(`/comments/${id}/like`);
    return result;
};

export default {
    create,
    toggleLike,
    getAllByPostId,
    update,
};
