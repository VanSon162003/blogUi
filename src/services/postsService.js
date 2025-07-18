import httpRequest from "../utils/httpRequest";

export const getAll = async () => {
    const result = await httpRequest.get("/posts");
    return result;
};

export const getBySlug = async (slug) => {
    const result = await httpRequest.get(`/posts/slug/${slug}`);
    return result;
};

export const getListByTopicId = async (topicId) => {
    const result = await httpRequest.get(`/posts/topic/${topicId}`);
    return result;
};

export const getListByUserBookmarks = async () => {
    const result = await httpRequest.get(`/posts/user/bookmarks`);
    return result;
};

export const toggleLikePost = async (id) => {
    const result = await httpRequest.post(`/posts/${id}/like`);
    return result;
};

export const toggleBookmarkPost = async (id) => {
    const result = await httpRequest.post(`/bookmarks/${id}`);
    return result;
};

export const getPostsRelate = async (currentPostId) => {
    const result = await httpRequest.get(`/posts/${currentPostId}/related`);
    return result;
};

export default {
    getAll,
    toggleLikePost,
    toggleBookmarkPost,
    getListByTopicId,
    getListByUserBookmarks,
    getBySlug,
    getPostsRelate,
};
