import httpRequest from "../utils/httpRequest";

export const getUserByUsername = async (username) => {
    const result = await httpRequest.get(`/users/${username}`);
    return result;
};

export const editProfile = async (formData) => {
    console.log(formData);

    const result = await httpRequest.put(`/users/edit-profile`, formData);
    return result;
};

export const checkFollower = async (userId) => {
    const result = await httpRequest.get(`/users/follow/${userId}`);
    return result;
};

export const toggleFollower = async (userId) => {
    const result = await httpRequest.post(`/users/follow/${userId}`);
    return result;
};

export const settings = async (data) => {
    const result = await httpRequest.post(`/users/settings`, data);
    return result;
};

export const readNotification = async (notificationIds) => {
    const result = await httpRequest.post(
        `/users/notifications`,
        notificationIds
    );
    return result;
};

export default {
    checkFollower,
    toggleFollower,
    getUserByUsername,
    editProfile,
    settings,
    readNotification,
};
