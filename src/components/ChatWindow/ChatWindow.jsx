/* eslint-disable react/prop-types */
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PropTypes from "prop-types";
import FallbackImage from "../FallbackImage/FallbackImage";
import Button from "../Button/Button";
import styles from "./ChatWindow.module.scss";

import socketClient from "../../utils/websocket";

import conversationService from "../../services/conversationService";
import messageService from "../../services/messageService";
import useUser from "../../hook/useUser";
import isHttps from "../../utils/isHttps";

import chatRealtimeService from "../../services/chatRealtimeService";
import { toast } from "react-toastify";

const ChatWindow = ({
    user,
    isOpen = false,
    onClose,
    onMinimize,
    isMinimized = false,
    ...props
}) => {
    const navigate = useNavigate();
    const [message, setMessage] = useState("");
    const [messages, setMessages] = useState([]);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [channelName, setChannelName] = useState(null);
    const messagesEndRef = useRef(null);
    const menuRef = useRef(null);

    const { currentUser } = useUser();

    useEffect(() => {
        (async () => {
            try {
                if (currentUser?.data) {
                    if (currentUser.data.id === user.id) return;

                    await conversationService.create({
                        user1: currentUser.data.id,
                        user2: user.id,
                    });
                }
            } catch (error) {
                console.log(error);
            }
        })();
    }, [currentUser, user]);

    useEffect(() => {
        (async () => {
            try {
                if (channelName) {
                    const conversation =
                        await conversationService.getConversationByName(
                            channelName
                        );

                    const dataMessage =
                        await messageService.getAllMessageByConversationId(
                            conversation.data.id
                        );

                    setMessages(dataMessage.data);
                }
            } catch (error) {
                console.log(error);
            }
        })();
    }, [channelName]);

    useEffect(() => {
        if (currentUser?.data) {
            if (currentUser.data.id === user.id) return;

            const ids = [currentUser.data.id, user.id].sort((a, b) => a - b);
            const name = `private_${ids[0]}_${ids[1]}`;

            setChannelName(name);

            const channel = socketClient.subscribe(name);

            channel.bind("new-message", function (data) {
                if (data.user_id !== currentUser.data.id) {
                    setMessages((prev) => [
                        ...prev,
                        {
                            id: data.id,
                            content: data.content,
                            user_id: data.user_id,
                            conversation_id: data.conversation_id,
                            createdAt: data.createdAt,
                        },
                    ]);
                }
            });

            return () => {
                channel.unsubscribe();
            };
        }
    }, [currentUser, user]);

    // Scroll to bottom when window opens or when new messages arrive
    useEffect(() => {
        if (isOpen && !isMinimized && messages.length > 0) {
            // Multiple attempts to ensure scroll works
            setTimeout(() => {
                messagesEndRef.current?.scrollIntoView({
                    behavior: "instant",
                    block: "end",
                });
            }, 0);

            setTimeout(() => {
                messagesEndRef.current?.scrollIntoView({
                    behavior: "instant",
                    block: "end",
                });
            }, 50);

            setTimeout(() => {
                messagesEndRef.current?.scrollIntoView({
                    behavior: "instant",
                    block: "end",
                });
            }, 150);
        }
    }, [isOpen, isMinimized, messages]);

    // Additional scroll when window first opens
    useEffect(() => {
        if (isOpen && !isMinimized) {
            // Immediate scroll when window opens
            const scrollToBottomImmediate = () => {
                if (messagesEndRef.current) {
                    const messagesContainer =
                        messagesEndRef.current.parentElement;
                    if (messagesContainer) {
                        messagesContainer.scrollTop =
                            messagesContainer.scrollHeight;
                    }
                }
            };

            scrollToBottomImmediate();
            setTimeout(scrollToBottomImmediate, 100);
            setTimeout(scrollToBottomImmediate, 300);
        }
    }, [isOpen, isMinimized]);

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setIsMenuOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () =>
            document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (message.trim()) {
            (async () => {
                try {
                    const { data: newMessage } =
                        await chatRealtimeService.sendMessage({
                            channel: channelName,
                            message: message.trim(),
                            recipientId: user.id,
                        });

                    // Thêm tin nhắn vào state ngay lập tức cho người gửi
                    setMessages((prev) => [...prev, newMessage]);
                    setMessage("");
                } catch (error) {
                    toast.error(
                        error.message || "Có lỗi xảy ra khi gửi tin nhắn"
                    );
                }
            })();
        }
    };

    const handleOpenInMessages = () => {
        navigate("/messages");
        onClose();
    };

    const formatTime = (timestamp) => {
        const date = new Date(timestamp).toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
        });

        return date;
    };

    if (!isOpen) return null;

    if (isMinimized) {
        return (
            <div
                className={styles.minimizedWindow}
                onClick={() => onMinimize(false)}
            >
                <FallbackImage
                    src={
                        isHttps(user?.avatar)
                            ? user?.avatar
                            : `${import.meta.env.VITE_BASE_URL}/${user?.avatar}`
                    }
                    alt={user?.fullname}
                    className={styles.minimizedAvatar}
                />
                <span className={styles.minimizedName}>{user?.fullname}</span>
            </div>
        );
    }

    return (
        <div className={styles.chatWindow} {...props}>
            {/* Header */}
            <div className={styles.header}>
                <div className={styles.userInfo}>
                    <FallbackImage
                        src={
                            isHttps(user?.avatar)
                                ? user?.avatar
                                : `${import.meta.env.VITE_BASE_URL}/${
                                      user?.avatar
                                  }`
                        }
                        alt={user?.fullname}
                        className={styles.avatar}
                    />
                    <div className={styles.userDetails}>
                        <span className={styles.name}>{user?.fullname}</span>
                        <span className={styles.status}>
                            Hoạt động 5 phút trước
                        </span>
                    </div>
                </div>

                <div className={styles.headerActions}>
                    {/* Menu button */}
                    <div className={styles.menuContainer} ref={menuRef}>
                        <button
                            className={styles.menuButton}
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            aria-label="More options"
                        >
                            <svg
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill="currentColor"
                            >
                                <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
                            </svg>
                        </button>

                        {isMenuOpen && (
                            <div className={styles.menu}>
                                <button
                                    className={styles.menuItem}
                                    onClick={handleOpenInMessages}
                                >
                                    <svg
                                        width="16"
                                        height="16"
                                        viewBox="0 0 24 24"
                                        fill="currentColor"
                                    >
                                        <path d="M21 6h-2l-1.27-1.27c-.19-.19-.44-.29-.7-.29-.26 0-.51.1-.7.29L15 6H9L7.67 4.73c-.19-.19-.44-.29-.7-.29-.26 0-.51.1-.7.29L5 6H3c-.55 0-1 .45-1 1v11c0 .55.45 1 1 1h18c.55 0 1-.45 1-1V7c0-.55-.45-1-1-1zM12 16c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5z" />
                                    </svg>
                                    Mở trong Messages
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Minimize button */}
                    <button
                        className={styles.minimizeButton}
                        onClick={() => onMinimize(true)}
                        aria-label="Minimize"
                    >
                        <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                        >
                            <path d="M6 19h12v2H6z" />
                        </svg>
                    </button>

                    {/* Close button */}
                    <button
                        className={styles.closeButton}
                        onClick={onClose}
                        aria-label="Close chat"
                    >
                        <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                        >
                            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                        </svg>
                    </button>
                </div>
            </div>

            {/* Messages */}
            <div className={styles.messages}>
                {messages.map((msg, i) => {
                    return (
                        <div
                            key={i}
                            className={`${styles.message} ${
                                msg?.user_id === currentUser?.data.id
                                    ? styles.own
                                    : styles.other
                            }`}
                        >
                            <div className={styles.messageContent}>
                                <p className={styles.messageText}>
                                    {msg.content}
                                </p>
                                <span className={styles.messageTime}>
                                    {formatTime(msg.createdAt)}
                                </span>
                            </div>
                        </div>
                    );
                })}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form className={styles.inputForm} onSubmit={handleSendMessage}>
                <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Nhập tin nhắn..."
                    className={styles.input}
                />
                <Button
                    type="submit"
                    variant="primary"
                    size="sm"
                    disabled={!message.trim()}
                    className={styles.sendButton}
                >
                    <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                    >
                        <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                    </svg>
                </Button>
            </form>
        </div>
    );
};

ChatWindow.propTypes = {
    user: PropTypes.shape({
        first_name: PropTypes.string,
        last_name: PropTypes.string,
        avatar: PropTypes.string,
        username: PropTypes.string,
    }).isRequired,
    isOpen: PropTypes.bool,
    onClose: PropTypes.func.isRequired,
    onMinimize: PropTypes.func.isRequired,
    isMinimized: PropTypes.bool,
};

export default ChatWindow;
