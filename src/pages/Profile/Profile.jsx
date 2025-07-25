import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import AuthorInfo from "../../components/AuthorInfo/AuthorInfo";
import PostList from "../../components/PostList/PostList";
import Button from "../../components/Button/Button";
import Badge from "../../components/Badge/Badge";
import EmptyState from "../../components/EmptyState/EmptyState";
import Loading from "../../components/Loading/Loading";
import FallbackImage from "../../components/FallbackImage/FallbackImage";
import ChatWindow from "../../components/ChatWindow/ChatWindow";

import styles from "./Profile.module.scss";
import useUser from "../../hook/useUser";
import usersService from "../../services/usersService";
import postsService from "../../services/postsService";
import { toast } from "react-toastify";
import isHttps from "../../utils/isHttps";

const Profile = () => {
    const { username } = useParams();
    const navigate = useNavigate();
    const [profile, setProfile] = useState(null);
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [postsLoading, setPostsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("posts");
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [isChatMinimized, setIsChatMinimized] = useState(false);
    const [user, setUser] = useState({});
    const [isFollow, setIsFollow] = useState(false);

    const [followers, setFollowers] = useState(0);

    const { currentUser } = useUser();

    useEffect(() => {
        (async () => {
            const response = await usersService.getUserByUsername(username);

            if (!response?.success || !response?.data) return;

            const userData = { ...response.data };
            userData.skills =
                typeof userData.skills === "string"
                    ? JSON.parse(userData.skills) || []
                    : userData.skills;

            setUser({
                ...userData,
                social: {
                    twitter: userData.twitter_url,
                    github: userData.github_url,
                    linkedin: userData.linkedin_url,
                    website: userData.website_url,
                },
            });

            setFollowers(response.data.follower_count);
        })();
    }, [username]);

    const isOwnProfile = profile?.username === currentUser?.data.username;

    useEffect(() => {
        const loadProfile = async () => {
            setLoading(true);
            // Simulate API delay
            setProfile(user);
            setLoading(false);
        };

        loadProfile();
    }, [user]);

    useEffect(() => {
        (async () => {
            try {
                const check = await usersService.checkFollower(user?.id);
                setIsFollow(check?.data);
            } catch (error) {
                console.log(error);
            }
        })();
    }, [user]);

    useEffect(() => {
        const loadPosts = async () => {
            setPostsLoading(true);
            // Simulate API delay

            const posts = await postsService.getByUserName(username);

            // const newPosts = generatePosts(currentPage);
            setPosts(posts.data);
            setTotalPages(Math.ceil(posts.data.length / 6)); // 42 total posts, 6 per page
            setPostsLoading(false);
        };

        if (profile) {
            loadPosts();
        }
    }, [profile, username, activeTab]);

    const handlePageChange = (page) => {
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
        });
    };

    const handleMessageClick = () => {
        setIsChatOpen(true);
        setIsChatMinimized(false);
    };

    const handleChatClose = () => {
        setIsChatOpen(false);
        setIsChatMinimized(false);
    };

    const handleChatMinimize = (minimize) => {
        setIsChatMinimized(minimize);
    };

    const handleFollow = async () => {
        try {
            await usersService.toggleFollower(user.id);

            const toggle = !isFollow;

            setIsFollow(toggle);
            setFollowers((prev) => {
                return toggle ? prev + 1 : prev - 1;
            });
        } catch (error) {
            toast.error(error);
        }
    };

    if (loading) {
        return (
            <div className={styles.profile}>
                <div className="container">
                    <Loading size="md" text="Loading profile..." />
                </div>
            </div>
        );
    }

    if (!profile) {
        return (
            <div className={styles.profile}>
                <div className="container">
                    <EmptyState
                        title="Profile not found"
                        description="The user profile you're looking for doesn't exist or has been removed."
                        icon="👤"
                    />
                </div>
            </div>
        );
    }

    return (
        <div className={styles.profile}>
            {/* Cover Section */}
            <div className={styles.coverSection}>
                <div className={styles.coverImage}>
                    <FallbackImage
                        src={
                            isHttps(profile?.cover_image)
                                ? profile?.cover_image
                                : `${import.meta.env.VITE_BASE_URL}/${
                                      profile?.cover_image
                                  }`
                        }
                        alt="Cover"
                    />
                    <div className={styles.coverOverlay}></div>
                </div>

                <div className={styles.profileHeader}>
                    <div className="container">
                        <div className={styles.headerContent}>
                            <div className={styles.avatarSection}>
                                <FallbackImage
                                    src={
                                        isHttps(profile?.avatar)
                                            ? profile?.avatar
                                            : `${
                                                  import.meta.env.VITE_BASE_URL
                                              }/${profile?.avatar}`
                                    }
                                    alt={profile?.username}
                                    className={styles.avatar}
                                />
                                <div className={styles.basicInfo}>
                                    <h1 className={styles.name}>
                                        {profile?.fullname ||
                                            `${profile?.first_name} ${profile?.last_name}`}
                                    </h1>
                                    <p className={styles.username}>
                                        @{profile.username}
                                    </p>
                                    {profile.title && (
                                        <p className={styles.title}>
                                            {profile.title}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className={styles.actions}>
                                {isOwnProfile ? (
                                    <Button
                                        variant="secondary"
                                        size="md"
                                        onClick={() =>
                                            navigate(
                                                `/profile/${username}/edit`
                                            )
                                        }
                                    >
                                        Edit Profile
                                    </Button>
                                ) : (
                                    <>
                                        <Button
                                            onClick={handleFollow}
                                            variant="primary"
                                            size="md"
                                        >
                                            {!isFollow ? "Follow" : "UnFollow"}
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="md"
                                            onClick={handleMessageClick}
                                        >
                                            Message
                                        </Button>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Section */}
            <div className="container">
                <div className={styles.content}>
                    {/* Sidebar */}
                    <aside className={styles.sidebar}>
                        {/* Bio */}
                        {profile?.about && (
                            <div className={styles.bioCard}>
                                <h3>About</h3>
                                <p>{profile?.about}</p>
                            </div>
                        )}

                        {/* Stats */}
                        <div className={styles.statsCard}>
                            <h3>Stats</h3>
                            <div className={styles.stats}>
                                <div className={styles.stat}>
                                    <strong>{profile?.posts_count}</strong>
                                    <span>Posts</span>
                                </div>
                                <div className={styles.stat}>
                                    <strong>{followers}</strong>
                                    <span>Followers</span>
                                </div>
                                <div className={styles.stat}>
                                    <strong>{profile?.following_count}</strong>
                                    <span>Following</span>
                                </div>
                                <div className={styles.stat}>
                                    <strong>{profile?.likes_count}</strong>
                                    <span>Likes</span>
                                </div>
                            </div>
                        </div>

                        {/* Skills */}
                        {profile.skills && profile.skills.length > 0 && (
                            <div className={styles.skillsCard}>
                                <h3>Skills</h3>
                                <div className={styles.skills}>
                                    {profile.skills.map((skill) => (
                                        <Badge
                                            key={skill}
                                            variant="secondary"
                                            size="sm"
                                        >
                                            {skill}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Badges */}
                        {profile.badges && profile.badges.length > 0 && (
                            <div className={styles.badgesCard}>
                                <h3>Achievements</h3>
                                <div className={styles.badges}>
                                    {profile.badges.map((badge) => (
                                        <div
                                            key={badge.name}
                                            className={styles.badge}
                                        >
                                            <span className={styles.badgeIcon}>
                                                {badge.icon}
                                            </span>
                                            <span className={styles.badgeName}>
                                                {badge.name}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Additional Info */}
                        <div className={styles.infoCard}>
                            <h3>Info</h3>
                            <div className={styles.infoItems}>
                                {profile.location && (
                                    <div className={styles.infoItem}>
                                        <span className={styles.infoIcon}>
                                            📍
                                        </span>
                                        <span>{profile.location}</span>
                                    </div>
                                )}
                                {profile.website_url && (
                                    <div className={styles.infoItem}>
                                        <span className={styles.infoIcon}>
                                            🌐
                                        </span>
                                        <a
                                            href={profile.website_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            {profile.website_url.replace(
                                                /^https?:\/\//,
                                                ""
                                            )}
                                        </a>
                                    </div>
                                )}
                                <div className={styles.infoItem}>
                                    <span className={styles.infoIcon}>📅</span>
                                    <span>
                                        Joined {formatDate(profile?.createdAt)}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Social Links */}
                        {profile.social &&
                            Object.keys(profile.social).length > 0 && (
                                <div className={styles.socialCard}>
                                    <h3>Connect</h3>
                                    <div className={styles.socialLinks}>
                                        {profile.social.twitter && (
                                            <a
                                                href={profile.social.twitter}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                            >
                                                <span>🐦</span> Twitter
                                            </a>
                                        )}
                                        {profile.social.github && (
                                            <a
                                                href={profile.social.github}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                            >
                                                <span>🐙</span> GitHub
                                            </a>
                                        )}
                                        {profile.social.linkedin && (
                                            <a
                                                href={profile.social.linkedin}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                            >
                                                <span>💼</span> LinkedIn
                                            </a>
                                        )}
                                    </div>
                                </div>
                            )}
                    </aside>

                    {/* Main Content */}
                    <main className={styles.main}>
                        {/* Tabs */}
                        <div className={styles.tabs}>
                            <button
                                className={`${styles.tab} ${
                                    activeTab === "posts" ? styles.active : ""
                                }`}
                                onClick={() => setActiveTab("posts")}
                            >
                                Posts ({profile?.posts_count})
                            </button>
                            <button
                                className={`${styles.tab} ${
                                    activeTab === "about" ? styles.active : ""
                                }`}
                                onClick={() => setActiveTab("about")}
                            >
                                About
                            </button>
                        </div>

                        {/* Tab Content */}
                        <div className={styles.tabContent}>
                            {activeTab === "posts" && (
                                <div className={styles.postsTab}>
                                    <PostList
                                        posts={posts}
                                        maxPosts={posts.length}
                                        loading={postsLoading}
                                        currentPage={currentPage}
                                        totalPages={totalPages}
                                        visibility={{
                                            followers: isFollow,
                                            isOwnProfile,
                                        }}
                                        onPageChange={handlePageChange}
                                        layout="grid"
                                    />
                                </div>
                            )}

                            {activeTab === "about" && (
                                <div className={styles.aboutTab}>
                                    <AuthorInfo
                                        user={{
                                            fullname: profile.fullname,

                                            first_name: profile.first_name,
                                            last_name: profile.last_name,
                                            username: profile.username,
                                            title: profile.title,
                                            about: profile.about,
                                            avatar: profile.avatar,
                                            social: {
                                                twitter: profile?.twitter_url,
                                                github: profile?.github_url,
                                                linkedin: profile?.linkedin_url,
                                                website: profile?.website_url,
                                            },
                                            postsCount: profile.posts_count,
                                            followers: profile.follower_count,
                                            following: profile.following_count,
                                        }}
                                        showFollowButton={false}
                                    />
                                </div>
                            )}
                        </div>
                    </main>
                </div>
            </div>

            {/* Chat Window */}
            {!isOwnProfile && (
                <ChatWindow
                    user={{
                        first_name: user.first_name,
                        last_name: user.last_name,
                        avatar: user.avatar,
                        username: user.username,
                    }}
                    isOpen={isChatOpen}
                    isMinimized={isChatMinimized}
                    onClose={handleChatClose}
                    onMinimize={handleChatMinimize}
                />
            )}
        </div>
    );
};

export default Profile;
