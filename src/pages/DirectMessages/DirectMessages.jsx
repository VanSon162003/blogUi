import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import Button from "../../components/Button/Button";
import Input from "../../components/Input/Input";
import FallbackImage from "../../components/FallbackImage/FallbackImage";
import styles from "./DirectMessages.module.scss";
import isHttps from "../../utils/isHttps";
import conversationService from "../../services/conversationService";
import messagesService from "../../services/messageService";
import useUser from "../../hook/useUser";
import socketClient from "../../utils/websocket";
import chatRealtimeService from "../../services/chatRealtimeService";

const DirectMessages = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [searchQuery, setSearchQuery] = useState("");
    const [newMessage, setNewMessage] = useState("");
    const [selectedConversation, setSelectedConversation] = useState(null);
    const messagesEndRef = useRef(null);

    const [conversations, setConversations] = useState([]);
    const [checkParams, setCheckParams] = useState([]);

    const [messages, setMessages] = useState({});
    const [user, setUser] = useState(null);
    const [channelName, setChannelName] = useState(null);
    const [recipientId, setRecipientId] = useState(null);

    const { currentUser } = useUser();

    useEffect(() => {
        if (currentUser?.data) setUser(currentUser.data);
    }, [currentUser]);

    const timestamp = (time) => {
        if (!time) {
            return new Date(Date.now() - 24 * 60 * 60 * 1000);
        }

        const date = new Date(time);

        if (isNaN(date.getTime())) {
            return new Date(Date.now() - 24 * 60 * 60 * 1000);
        }

        return date;
    };
    useEffect(() => {
        (async () => {
            const result = await conversationService.getAll();
            result.data.forEach((item) => {
                setConversations((prev) => [
                    ...prev,
                    {
                        id: item.id,
                        participant: {
                            id: item.otherUsers[0].id,
                            name: item.otherUsers[0].fullname,
                            username: item.otherUsers[0].username,
                            avatar: item.otherUsers[0].avatar,
                        },
                        lastMessage: {
                            text: item.otherUsers[0]?.messages[0]?.content,
                            timestamp: timestamp(
                                item.otherUsers?.[0]?.messages?.[0]?.createdAt
                            ),
                            senderId: item.otherUsers[0]?.id,
                        },
                        unreadCount: 0,
                        isOnline: true,
                    },
                ]);
            });
        })();
    }, []);

    // Get conversation ID from URL params
    useEffect(() => {
        const conversationId = searchParams.get("conversation");

        if (!conversationId) return;

        const conversation = conversations.find(
            (c) => c.id === parseInt(conversationId)
        );

        if (!conversation) return;

        (async () => {
            if (!checkParams.includes(conversationId)) {
                const result =
                    await messagesService.getAllMessageByConversationId(
                        conversationId
                    );

                setMessages((prev) => {
                    const newMessages = result.data.map((item) => ({
                        id: item.id,
                        text: item.content,
                        senderId: item.user.id,
                        timestamp: timestamp(item.createdAt),
                    }));

                    return {
                        ...prev,
                        [conversation.id]: [
                            ...(prev[conversation.id] || []),
                            ...newMessages,
                        ],
                    };
                });

                setCheckParams((prev) => [...prev, conversationId]);
            }
        })();

        setSelectedConversation(conversation);

        // Mark as read
        markAsRead(conversation.id);
    }, [searchParams]);

    useEffect(() => {
        if (user) {
            (async () => {
                const conversationId = searchParams.get("conversation");

                if (!checkParams.includes(conversationId)) {
                    const result = await conversationService.getOne(
                        conversationId
                    );
                    console.log(result);

                    const name = result.data.name;
                    setRecipientId(result.data.users[0].id);
                    setChannelName(name);

                    const channel = socketClient.subscribe(name);

                    channel.bind("new-message", function (data) {
                        if (data.user_id !== currentUser.data.id) {
                            console.log(data);

                            setMessages((prev) => {
                                const newMessages = {
                                    id: data.id,
                                    text: data.content,
                                    senderId: data.user_id,
                                    timestamp: timestamp(data.createdAt),
                                };

                                return {
                                    ...prev,
                                    [data.conversation_id]: [
                                        ...(prev[data.conversation_id] || []),
                                        ...newMessages,
                                    ],
                                };
                            });
                        }
                    });

                    return () => {
                        channel.unsubscribe();
                    };
                }
            })();
        }
    }, [searchParams, user]);

    // Auto-scroll to bottom when messages change
    useEffect(() => {
        scrollToBottom();
    }, [messages, selectedConversation]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const markAsRead = (conversationId) => {
        setConversations((prev) =>
            prev.map((conv) =>
                conv.id === conversationId ? { ...conv, unreadCount: 0 } : conv
            )
        );
    };

    const handleConversationSelect = (conversation) => {
        setSelectedConversation(conversation);
        setSearchParams({ conversation: conversation.id.toString() });
        markAsRead(conversation.id);
    };

    const handleSendMessage = () => {
        if (!newMessage.trim() || !selectedConversation) return;

        const message = {
            id: Date.now(),
            text: newMessage.trim(),
            senderId: user.id,
            timestamp: new Date(),
        };

        (async () => {
            await chatRealtimeService.sendMessage({
                channel: channelName,
                message: newMessage.trim(),
                recipientId,
            });
        })();

        // Add message to conversation
        setMessages((prev) => ({
            ...prev,
            [selectedConversation.id]: [
                ...(prev[selectedConversation.id] || []),
                message,
            ],
        }));

        // Update last message in conversation
        setConversations((prev) =>
            prev.map((conv) =>
                conv.id === selectedConversation.id
                    ? {
                          ...conv,
                          lastMessage: {
                              text: newMessage.trim(),
                              timestamp: new Date(),
                              senderId: 1,
                          },
                      }
                    : conv
            )
        );

        setNewMessage("");
    };

    const handleKeyPress = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const formatTime = (date) => {
        const now = new Date();
        const diff = now - date;
        const minutes = Math.floor(diff / (1000 * 60));
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));

        if (minutes < 1) return "now";
        if (minutes < 60) return `${minutes}m`;
        if (hours < 24) return `${hours}h`;
        if (days < 7) return `${days}d`;

        return date.toLocaleDateString();
    };

    const filteredConversations = conversations.filter(
        (conv) =>
            conv?.participant?.name
                ?.toLowerCase()
                .includes(searchQuery.toLowerCase()) ||
            conv?.participant?.username
                ?.toLowerCase()
                .includes(searchQuery.toLowerCase())
    );

    const currentMessages = selectedConversation
        ? messages[selectedConversation.id] || []
        : [];

    return (
        <div className={styles.container}>
            <div className={styles.layout}>
                {/* Conversations Sidebar */}
                <div className={styles.sidebar}>
                    <div className={styles.sidebarHeader}>
                        <h1 className={styles.title}>Messages</h1>
                        <Button
                            variant="ghost"
                            size="sm"
                            className={styles.newMessageButton}
                        >
                            <svg
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill="currentColor"
                            >
                                <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
                            </svg>
                        </Button>
                    </div>

                    <div className={styles.searchSection}>
                        <Input
                            placeholder="Search conversations..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className={styles.searchInput}
                        />
                    </div>

                    <div className={styles.conversationsList}>
                        {filteredConversations.map((conversation) => (
                            <div
                                key={conversation.id}
                                className={`${styles.conversationItem} ${
                                    selectedConversation?.id === conversation.id
                                        ? styles.selected
                                        : ""
                                }`}
                                onClick={() =>
                                    handleConversationSelect(conversation)
                                }
                            >
                                <div className={styles.avatarContainer}>
                                    <FallbackImage
                                        src={
                                            isHttps(
                                                conversation.participant.avatar
                                            )
                                                ? conversation.participant
                                                      .avatar
                                                : `${
                                                      import.meta.env
                                                          .VITE_BASE_URL
                                                  }/${
                                                      conversation.participant
                                                          .avatar
                                                  }`
                                        }
                                        alt={conversation.participant.name}
                                        className={styles.avatar}
                                    />
                                    {conversation.participant.isOnline && (
                                        <div
                                            className={styles.onlineIndicator}
                                        />
                                    )}
                                </div>

                                <div className={styles.conversationContent}>
                                    <div className={styles.conversationHeader}>
                                        <span
                                            className={styles.participantName}
                                        >
                                            {conversation.participant.name}
                                        </span>
                                        <span className={styles.timestamp}>
                                            {formatTime(
                                                conversation.lastMessage
                                                    .timestamp
                                            )}
                                        </span>
                                    </div>
                                    <div className={styles.lastMessage}>
                                        <span className={styles.messageText}>
                                            {conversation.lastMessage.text}
                                        </span>
                                        {conversation.unreadCount > 0 && (
                                            <span
                                                className={styles.unreadBadge}
                                            >
                                                {conversation.unreadCount}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Messages Area */}
                <div className={styles.messagesArea}>
                    {selectedConversation ? (
                        <>
                            {/* Messages Header */}
                            <div className={styles.messagesHeader}>
                                <div className={styles.participantInfo}>
                                    <FallbackImage
                                        src={
                                            isHttps(
                                                selectedConversation.participant
                                                    .avatar
                                            )
                                                ? selectedConversation
                                                      .participant.avatar
                                                : `${
                                                      import.meta.env
                                                          .VITE_BASE_URL
                                                  }/${
                                                      selectedConversation
                                                          .participant.avatar
                                                  }`
                                        }
                                        alt={
                                            selectedConversation.participant
                                                .name
                                        }
                                        className={styles.headerAvatar}
                                    />
                                    <div>
                                        <h2 className={styles.participantName}>
                                            {
                                                selectedConversation.participant
                                                    .name
                                            }
                                        </h2>
                                        <span
                                            className={styles.participantStatus}
                                        >
                                            {selectedConversation.participant
                                                .isOnline
                                                ? "Online"
                                                : "Offline"}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Messages Thread */}
                            <div className={styles.messagesThread}>
                                {currentMessages.map((message) => (
                                    <div
                                        key={message.id}
                                        className={`${styles.message} ${
                                            message.senderId === user.id
                                                ? styles.sent
                                                : styles.received
                                        }`}
                                    >
                                        <div className={styles.messageContent}>
                                            <span
                                                className={styles.messageText}
                                            >
                                                {message.text}
                                            </span>
                                            <span
                                                className={styles.messageTime}
                                            >
                                                {formatTime(message.timestamp)}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Message Input */}
                            <div className={styles.messageInputContainer}>
                                <div className={styles.messageInputWrapper}>
                                    <textarea
                                        value={newMessage}
                                        onChange={(e) =>
                                            setNewMessage(e.target.value)
                                        }
                                        onKeyPress={handleKeyPress}
                                        placeholder={`Message ${selectedConversation.participant.name}...`}
                                        className={styles.messageInput}
                                        rows={1}
                                    />
                                    <Button
                                        onClick={handleSendMessage}
                                        disabled={!newMessage.trim()}
                                        className={styles.sendButton}
                                        size="sm"
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
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className={styles.emptyState}>
                            <div className={styles.emptyStateContent}>
                                <svg
                                    width="64"
                                    height="64"
                                    viewBox="0 0 24 24"
                                    fill="currentColor"
                                    className={styles.emptyIcon}
                                >
                                    <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
                                </svg>
                                <h3 className={styles.emptyTitle}>
                                    Select a conversation
                                </h3>
                                <p className={styles.emptyDescription}>
                                    Choose a conversation from the sidebar to
                                    start messaging
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DirectMessages;
