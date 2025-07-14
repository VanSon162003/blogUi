import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import authService from "../../services/authService";
import styles from "./VerifyEmail.module.scss";

const VerifyEmail = () => {
    const [searchParams] = useSearchParams();
    const token = searchParams.get("token");
    const [status, setStatus] = useState("pending");

    useEffect(() => {
        const verify = async () => {
            try {
                const { status } = await authService.verifyEmail(token);

                if (status) {
                    return setStatus("verified");
                }

                setStatus("success");
            } catch (error) {
                console.error("Verify email failed:", error);
                setStatus("error");
            }
        };

        if (token) {
            verify();
        } else {
            setStatus("error");
        }
    }, [token]);

    if (status === "pending") return <p>Đang xác thực...</p>;

    if (status === "success")
        return (
            <div className={styles.success}>
                <h1>✅ Xác thực thành công!</h1>
                <p>Bạn có thể đăng nhập hoặc quên mật khẩu ngay bây giờ.</p>
                <a href="/login">Quay lại trang đăng nhập</a> <br />
                <a href={`/reset-password?token=${token}`}>
                    Sang trang quên mật khẩu
                </a>
            </div>
        );

    if (status === "verified")
        return (
            <div className={styles.success}>
                <h1>✅ Email đã được xác thực</h1>
                <p>Tài khoản của bạn đã được xác thực trước đó.</p>
                <p>Bạn có thể đăng nhập và sử dụng đầy đủ các chức năng.</p>
                <a href="/login" className={styles.button}>
                    Đăng nhập ngay
                </a>
            </div>
        );

    return (
        <div className={styles.error}>
            <h1>❌ Xác thực thất bại</h1>
            <p>Liên kết không hợp lệ hoặc đã hết hạn.</p>
            <a href="/">Quay lại trang chủ</a>
        </div>
    );
};

export default VerifyEmail;
