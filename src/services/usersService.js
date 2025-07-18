import httpRequest from "../utils/httpRequest";

export const checkFollower = async (userId) => {
    const result = await httpRequest.get(`/users/follow/${userId}`);
    return result;
};

export const toggleFollower = async (userId) => {
    const result = await httpRequest.post(`/users/follow/${userId}`);
    return result;
};

export default {
    checkFollower,
    toggleFollower,
};
