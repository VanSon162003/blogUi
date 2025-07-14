import { useEffect, useState } from "react";
import authService from "../services/authService";

function useUser() {
    const [currentUser, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        (async () => {
            try {
                const data = await authService.getUser();
                setUser(data);
            } catch (err) {
                setError(err);
                console.error("Lỗi khi lấy thông tin currentUser:", err);
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    return { currentUser, loading, error };
}

export default useUser;
