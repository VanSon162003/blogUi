import httpRequest from "../utils/httpRequest";

export const getAll = async () => {
    const result = await httpRequest.get("/topics");
    return result;
};

export const getBySlug = async (slug) => {
    const result = await httpRequest.get(`/topics/slug/${slug}`);
    return result;
};

export default {
    getAll,
    getBySlug,
};
