import { data } from "react-router-dom";
import httpRequest from "../utils/httpRequest";

export const register = async (data) => {
    const result = await httpRequest.post("/auth/register", data);
    return result;
};

export const login = async (data) => {
    try {
        const result = await httpRequest.post("/auth/login", data);

        return result;
    } catch (error) {
        console.log(error);
        throw new Error("Thông tin đăng nhập không hợp lệ.");
    }
};

export const forgotPassword = async (data) => {
    try {
        const result = await httpRequest.post("/auth/forgot-password", data);

        return result;
    } catch (error) {
        throw new Error(error);
    }
};

export const verifyEmail = async (token) => {
    try {
        const result = await httpRequest.post(
            `/auth/verify-email?token=${token}`
        );

        return result;
    } catch (error) {
        throw new Error(error);
    }
};

export const verifyToken = async (token) => {
    try {
        const result = await httpRequest.get(
            `/auth/verify-token?token=${token}`
        );

        return result;
    } catch (error) {
        throw new Error(error);
    }
};

export const getUser = async () => {
    const result = await httpRequest.get("/auth/me");
    return result;
};

export const resetPassword = async (data) => {
    const result = await httpRequest.post("/auth/reset-password", data);
    return result;
};

export default {
    register,
    login,
    getUser,
    forgotPassword,
    verifyEmail,
    verifyToken,
    resetPassword,
};
