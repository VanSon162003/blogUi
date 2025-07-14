import httpRequest from "../utils/httpRequest";

export const getAll = async () => {
    const result = await httpRequest.get("/topics");
    return result;
};

export default {
    getAll,
};
