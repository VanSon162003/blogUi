import { useState, useRef, useEffect } from "react";
import styles from "./Chat.module.scss";
import conversationService from "../../services/conversationService";
import messageService from "../../services/messageService";

function Chat() {
    const [isOpen, setIsOpen] = useState(false);
    const [showEndChatModal, setShowEndChatModal] = useState(false); // Add this state
    const [messages, setMessages] = useState([
        {
            id: 1,
            content:
                "Xin chào! Tôi là VSRon Assistant. Tôi có thể giúp gì cho bạn hôm nay? 👋",
            sender: "bot",
            time: "",
        },
    ]);
    const [inputValue, setInputValue] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);
    const messagesContainerRef = useRef(null);

    const getCurrentTime = () => {
        const now = new Date();
        return (
            now.getHours().toString().padStart(2, "0") +
            ":" +
            now.getMinutes().toString().padStart(2, "0")
        );
    };

    const scrollToBottom = (force = false) => {
        if (messagesEndRef.current) {
            if (force) {
                messagesEndRef.current.scrollIntoView({
                    behavior: "auto",
                    block: "end",
                });
            } else {
                messagesEndRef.current.scrollIntoView({
                    behavior: "smooth",
                    block: "end",
                });
            }
        }
    };

    const forceScrollToBottom = () => {
        if (messagesContainerRef.current) {
            const container = messagesContainerRef.current;
            container.scrollTop = container.scrollHeight;
        }
    };

    useEffect(() => {
        (async () => {
            const result = await messageService.getAllMessageByConversationId(
                localStorage.getItem("conversationId")
            );

            if (result?.data) {
                const messages = result.data.map((item) => {
                    const content = JSON.parse(item.content);

                    return {
                        content: content.content,
                        sender: content.role !== "user" ? "bot" : "user",
                        id: item.user.id,
                        time: getCurrentTime(item.updatedAt),
                    };
                });

                setMessages((prev) => [...prev, ...messages]);

                if (isOpen) {
                    setTimeout(() => {
                        scrollToBottom(true);
                    }, 100);
                }
            }
        })();
    }, []);

    useEffect(() => {
        scrollToBottom();
    }, [messages, isTyping]);

    useEffect(() => {
        if (isOpen) {
            setTimeout(() => scrollToBottom(true), 50);
            setTimeout(() => scrollToBottom(true), 100);
            setTimeout(() => scrollToBottom(true), 200);
            setTimeout(() => forceScrollToBottom(), 250);
        }
    }, [isOpen]);

    // Toggle chat window
    const toggleChat = () => {
        setIsOpen(!isOpen);
        if (!isOpen) {
            setTimeout(() => {
                inputRef.current?.focus();
                scrollToBottom(true);
                forceScrollToBottom();
            }, 300);

            setTimeout(() => {
                scrollToBottom(true);
                forceScrollToBottom();
            }, 500);
        }
    };

    const addMessage = (content, sender) => {
        const newMessage = {
            id: Date.now(),
            content,
            sender,
            time: getCurrentTime(),
        };
        setMessages((prev) => [...prev, newMessage]);
    };

    const getBotResponse = async (userMessage) => {
        const responses = {
            "giới thiệu về vsron":
                "VSRon là một nền tảng công nghệ hàng đầu, chuyên cung cấp các giải pháp phần mềm và dịch vụ tư vấn công nghệ thông tin. Chúng tôi cam kết mang đến những sản phẩm chất lượng cao và dịch vụ tốt nhất cho khách hàng.",

            "liên hệ hỗ trợ":
                "Bạn có thể liên hệ với chúng tôi qua:\n📧 Email: vanson16032003@gmail.com\n📞 Hotline: 0388308588\n🕐 Thời gian hỗ trợ: 24/7",
            "câu hỏi thường gặp": `Dưới đây là một số câu hỏi phổ biến:
                • Làm thế nào để tạo tài khoản trên VSRon?
                • Hướng dẫn sử dụng các tính năng chính của nền tảng
                • Chính sách bảo mật và quyền riêng tư của VSRon
                • Quy trình thanh toán và các phương thức hỗ trợ

                Bạn cần hỗ trợ thêm về vấn đề gì? Hãy cho chúng tôi biết!`,
        };

        let response = responses[userMessage.toLowerCase()];

        if (response) return response;

        try {
            const conversationId = localStorage.getItem("conversationId");

            const result = await conversationService.chatBot(conversationId, {
                message: userMessage,
            });

            localStorage.setItem("conversationId", result.data.conversationId);

            return result.data.content;
        } catch (error) {
            console.error("Error getting bot response:", error);
            return "Xin lỗi, tôi đang gặp sự cố kỹ thuật. Vui lòng thử lại sau.";
        }
    };

    const sendMessage = async () => {
        const message = inputValue.trim();
        if (message) {
            addMessage(message, "user");
            setInputValue("");

            setIsTyping(true);

            try {
                const botResponse = await getBotResponse(message);
                addMessage(botResponse, "bot");
            } catch (error) {
                addMessage(
                    "Xin lỗi, tôi không thể trả lời lúc này. Vui lòng thử lại.",
                    "bot"
                );
            } finally {
                setIsTyping(false);
            }
        }
    };

    const sendQuickMessage = async (msg) => {
        addMessage(msg, "user");

        setIsTyping(true);

        const result = await messageService.create({
            conversationId: localStorage.getItem("conversationId"),
            role: "user",
            content: msg,
        });

        localStorage.setItem("conversationId", result.data.conversationId);

        setTimeout(async () => {
            try {
                const botResponse = await getBotResponse(msg);
                await messageService.create({
                    conversationId: localStorage.getItem("conversationId"),
                    role: "system",
                    content: botResponse,
                });

                addMessage(botResponse, "bot");
            } catch (error) {
                addMessage(
                    "Xin lỗi, tôi không thể trả lời lúc này. Vui lòng thử lại.",
                    "bot"
                );
            } finally {
                setIsTyping(false);
            }
        }, 2000);
    };

    const handleKeyPress = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            const chatContainer = document.querySelector(
                `.${styles["chatbot-container"]}`
            );

            if (
                isOpen &&
                !showEndChatModal &&
                chatContainer &&
                !chatContainer.contains(event.target)
            ) {
                setIsOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isOpen, showEndChatModal]);

    const handleShowEndChatModal = () => {
        setShowEndChatModal(!showEndChatModal);
    };

    const handleHideEndChatModal = () => {
        setShowEndChatModal(false);
    };

    const handleEndChat = async () => {
        setMessages([
            {
                id: 1,
                content:
                    "Xin chào! Tôi là VSRon Assistant. Tôi có thể giúp gì cho bạn hôm nay? 👋",
                sender: "bot",
                time: "",
            },
        ]);

        await conversationService.removeChat(
            localStorage.getItem("conversationId")
        );

        localStorage.removeItem("conversationId");

        setShowEndChatModal(false);
        setIsOpen(false);

        alert(
            "Cuộc trò chuyện đã kết thúc. Cảm ơn bạn đã sử dụng VSRon Assistant!"
        );
    };

    const handleModalBackdropClick = (e) => {
        if (e.target === e.currentTarget) {
            handleHideEndChatModal();
        }
    };

    return (
        <>
            <div className={styles["chatbot-container"]}>
                {isOpen && (
                    <div
                        className={`${styles["chat-window"]} ${
                            isOpen ? styles["active"] : ""
                        }`}
                    >
                        <div className={styles["chat-header"]}>
                            <div className={styles["bot-avatar"]}>🤖</div>
                            <div className={styles["chat-info"]}>
                                <h3>VSRon Assistant</h3>
                                <p>Hỗ trợ 24/7</p>
                                <div
                                    className={styles["online-indicator"]}
                                ></div>
                            </div>
                            <button
                                onClick={handleShowEndChatModal}
                                className={styles.closeChat}
                            >
                                End chat
                            </button>
                        </div>

                        <div
                            className={styles["chat-messages"]}
                            ref={messagesContainerRef}
                        >
                            {messages.map((message) => (
                                <div
                                    key={message.id}
                                    className={`${styles["message"]} ${
                                        styles[message.sender]
                                    }`}
                                >
                                    <div className={styles["message-content"]}>
                                        {message?.content
                                            ?.split("\n")
                                            ?.map((line, index) => (
                                                <div key={index}>{line}</div>
                                            ))}
                                    </div>
                                    <div className={styles["message-time"]}>
                                        {message.time}
                                    </div>
                                </div>
                            ))}

                            {isTyping && (
                                <div
                                    className={`${styles["message"]} ${styles["bot"]}`}
                                >
                                    <div className={styles["typing-indicator"]}>
                                        <div className={styles["typing-dots"]}>
                                            <div
                                                className={styles["typing-dot"]}
                                            ></div>
                                            <div
                                                className={styles["typing-dot"]}
                                            ></div>
                                            <div
                                                className={styles["typing-dot"]}
                                            ></div>
                                        </div>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        <div className={styles["quick-actions"]}>
                            <div
                                className={styles["quick-action"]}
                                onClick={() =>
                                    sendQuickMessage("Giới thiệu về VSRon")
                                }
                            >
                                Giới thiệu về VSRon
                            </div>
                            <div
                                className={styles["quick-action"]}
                                onClick={() =>
                                    sendQuickMessage("Liên hệ hỗ trợ")
                                }
                            >
                                Liên hệ hỗ trợ
                            </div>
                            <div
                                className={styles["quick-action"]}
                                onClick={() =>
                                    sendQuickMessage("Câu hỏi thường gặp")
                                }
                            >
                                FAQ
                            </div>
                        </div>

                        <div className={styles["chat-input-container"]}>
                            <div className={styles["chat-input-wrapper"]}>
                                <input
                                    ref={inputRef}
                                    type="text"
                                    className={styles["chat-input"]}
                                    placeholder="Nhập tin nhắn của bạn..."
                                    value={inputValue}
                                    onChange={(e) =>
                                        setInputValue(e.target.value)
                                    }
                                    onKeyPress={handleKeyPress}
                                />
                                <button
                                    className={styles["send-button"]}
                                    onClick={sendMessage}
                                    disabled={!inputValue.trim()}
                                >
                                    <svg
                                        width="20"
                                        height="20"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    >
                                        <line
                                            x1="22"
                                            y1="2"
                                            x2="11"
                                            y2="13"
                                        ></line>
                                        <polygon points="22,2 15,22 11,13 2,9"></polygon>
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                <button
                    className={`${styles["chat-button"]} ${
                        isOpen ? styles["active"] : ""
                    }`}
                    onClick={toggleChat}
                    aria-label={isOpen ? "Đóng chat" : "Mở chat"}
                >
                    <svg
                        className={styles["chat-icon"]}
                        viewBox="0 0 24 24"
                        fill="white"
                    >
                        {isOpen ? (
                            <path
                                d="M18 6L6 18M6 6l12 12"
                                stroke="white"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                fill="none"
                            />
                        ) : (
                            <path d="M20 2H4C2.9 2 2 2.9 2 4V22L6 18H20C21.1 18 22 17.1 22 16V4C22 2.9 21.1 2 20 2Z" />
                        )}
                    </svg>
                </button>
            </div>

            {showEndChatModal && (
                <div
                    className={styles["end-chat-modal"]}
                    onClick={handleModalBackdropClick}
                >
                    <div className={styles["modal-content"]}>
                        <h3>Kết thúc cuộc trò chuyện?</h3>
                        <p>
                            Bạn có chắc chắn muốn kết thúc cuộc trò chuyện này
                            không? Tất cả tin nhắn sẽ được lưu lại.
                        </p>
                        <div className={styles["modal-buttons"]}>
                            <button
                                className={`${styles["modal-btn"]} ${styles["cancel-btn"]}`}
                                onClick={handleHideEndChatModal}
                            >
                                Hủy
                            </button>
                            <button
                                className={`${styles["modal-btn"]} ${styles["confirm-btn"]}`}
                                onClick={handleEndChat}
                            >
                                Kết thúc
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

export default Chat;
