import httpRequest from "../utils/httpRequest";

export const getAll = async () => {
    const result = await httpRequest.get("/posts");
    return result;
};

export const toggleLikePost = async (id) => {
    const result = await httpRequest.post(`/posts/${id}/like`);
    return result;
};

export default {
    getAll,
    toggleLikePost,
};
