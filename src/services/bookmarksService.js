import httpRequest from "../utils/httpRequest";

export const remove = async (ids) => {
    const result = await httpRequest.del("/bookmarks/all", ids);
    return result;
};

export default {
    remove,
};
