import { useState, memo } from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import Card from "../Card/Card";
import Badge from "../Badge/Badge";
import FallbackImage from "../FallbackImage/FallbackImage";
import styles from "./PostCard.module.scss";
import { toast } from "react-toastify";
import isHttps from "../../utils/isHttps";

const PostCard = ({
    id,
    title,
    excerpt,
    user,
    published_at,
    readTime,
    topic = [],
    slug,
    featuredImage,
    loading = false,
    compact = false,
    className,
    // New interaction props
    likes = 10,
    views = 100,
    isLiked = false,
    isBookmarked = false,
    showViewCount = true,
    showInteractions = true,
    onLike,
    onBookmark,
    ...props
}) => {
    const [optimisticLiked, setOptimisticLiked] = useState(isLiked);
    const [optimisticBookmarked, setOptimisticBookmarked] =
        useState(isBookmarked);
    const [optimisticLikes, setOptimisticLikes] = useState(likes);
    const [likingInProgress, setLikingInProgress] = useState(false);
    const [bookmarkingInProgress, setBookmarkingInProgress] = useState(false);
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    };

    const handleLike = async () => {
        if (!onLike || likingInProgress) return;

        // Optimistic update

        try {
            setLikingInProgress(true);

            const check = await onLike(id, !optimisticLiked);

            setOptimisticLiked(!optimisticLiked);
            setOptimisticLikes(
                optimisticLiked ? optimisticLikes - 1 : optimisticLikes + 1
            );
            if (check?.data) toast.success("You liked this post ❤️");
            else toast.success("You unliked this post 💔");
        } catch (error) {
            toast.error(error?.message);

            // Revert on error
            setOptimisticLiked(optimisticLiked);
            setOptimisticLikes(optimisticLikes);
            console.error("Failed to toggle like:", error);
        } finally {
            setLikingInProgress(false);
        }
    };

    const handleBookmark = async () => {
        if (!onBookmark || bookmarkingInProgress) return;

        try {
            const check = await onBookmark(id, !optimisticBookmarked);

            setBookmarkingInProgress(true);

            // Optimistic update
            setOptimisticBookmarked(!optimisticBookmarked);

            if (Array.isArray(check?.data))
                toast.success("You bookmarked this post.");
            else toast.success("You removed this post from your bookmarks.");
        } catch (error) {
            console.log(error);

            // Revert on error
            setOptimisticBookmarked(optimisticBookmarked);
            toast.error(error.message);
        } finally {
            setBookmarkingInProgress(false);
        }
    };

    if (loading) {
        return (
            <Card
                className={`${styles.postCard} ${styles.loading} ${
                    className || ""
                }`}
                variant="default"
                padding="none"
                {...props}
            >
                <div className={styles.skeletonImage} />
                <div className={styles.content}>
                    <div className={styles.skeletonBadge} />
                    <div className={styles.skeletonTitle} />
                    <div className={styles.skeletonExcerpt} />
                    <div className={styles.skeletonMeta} />
                </div>
            </Card>
        );
    }

    return (
        <Card
            className={`${styles.postCard} ${compact ? styles.compact : ""} ${
                className || ""
            }`}
            variant="default"
            hoverable
            padding="none"
            {...props}
        >
            {/* Featured Image */}
            <div className={styles.imageContainer}>
                <Link to={`/blog/${slug}`}>
                    <FallbackImage
                        src={
                            isHttps(featuredImage)
                                ? featuredImage
                                : `${
                                      import.meta.env.VITE_BASE_URL
                                  }/${featuredImage}`
                        }
                        alt={title}
                        className={styles.image}
                        lazy={true}
                    />
                </Link>
            </div>

            {/* Content */}
            <div className={styles.content}>
                {/* Topic Badge */}
                {topic && (
                    <div className={styles.topicBadge}>
                        {topic.map((item, i) => {
                            return (
                                <Badge key={i} variant="primary" size="sm">
                                    {item.name}
                                </Badge>
                            );
                        })}
                    </div>
                )}

                {/* Title */}
                <h3 className={styles.title}>
                    <Link to={`/blog/${slug}`} className={styles.titleLink}>
                        {title}
                    </Link>
                </h3>

                {/* Excerpt */}
                {excerpt && <p className={styles.excerpt}>{excerpt}</p>}

                {/* Meta Information */}
                <div className={styles.meta}>
                    <div className={styles.author}>
                        {user?.avatar && (
                            <FallbackImage
                                src={
                                    isHttps(user?.avatar)
                                        ? user?.avatar
                                        : `${import.meta.env.VITE_BASE_URL}/${
                                              user?.avatar
                                          }`
                                }
                                alt={user.username}
                                className={styles.authorAvatar}
                                lazy={true}
                            />
                        )}
                        <Link
                            to={`/profile/${
                                user?.username ||
                                user?.username
                                    ?.toLowerCase()
                                    .replace(/\s+/g, "-")
                            }`}
                            className={styles.authorName}
                        >
                            {user?.fullname ||
                                `${user?.first_name} ${user?.last_name}`}
                        </Link>
                    </div>

                    <div className={styles.metaInfo}>
                        <span className={styles.date}>
                            {formatDate(published_at)}
                        </span>
                        {readTime && (
                            <>
                                <span className={styles.separator}>•</span>
                                <span className={styles.readTime}>
                                    {readTime} min read
                                </span>
                            </>
                        )}
                    </div>
                </div>

                {/* Interactions */}
                {showInteractions && (
                    <div className={styles.interactions}>
                        <div className={styles.stats}>
                            {/* View Count */}
                            {showViewCount && views > 0 && (
                                <span className={styles.stat}>
                                    <svg
                                        width="16"
                                        height="16"
                                        viewBox="0 0 16 16"
                                        fill="none"
                                    >
                                        <path
                                            d="M1 8s3-5 7-5 7 5 7 5-3 5-7 5-7-5-7-5z"
                                            stroke="currentColor"
                                            strokeWidth="1.5"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        />
                                        <circle
                                            cx="8"
                                            cy="8"
                                            r="2"
                                            stroke="currentColor"
                                            strokeWidth="1.5"
                                        />
                                    </svg>
                                    {views}
                                </span>
                            )}

                            {/* Like Count */}
                            {optimisticLikes > 0 && (
                                <span className={styles.stat}>
                                    <svg
                                        width="16"
                                        height="16"
                                        viewBox="0 0 16 16"
                                        fill="none"
                                    >
                                        <path
                                            d="M14 6.5c0 4.8-5.25 7.5-6 7.5s-6-2.7-6-7.5C2 3.8 4.8 1 8 1s6 2.8 6 5.5z"
                                            stroke="currentColor"
                                            strokeWidth="1.5"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        />
                                    </svg>
                                    {optimisticLikes}
                                </span>
                            )}
                        </div>

                        <div className={styles.actions}>
                            {/* Like Button */}
                            <button
                                className={`${styles.actionButton} ${
                                    optimisticLiked ? styles.liked : ""
                                } ${likingInProgress ? styles.loading : ""}`}
                                onClick={handleLike}
                                disabled={likingInProgress}
                                title={optimisticLiked ? "Unlike" : "Like"}
                                aria-label={`${
                                    optimisticLiked ? "Unlike" : "Like"
                                } this post`}
                            >
                                <svg
                                    width="18"
                                    height="18"
                                    viewBox="0 0 24 24"
                                    fill={
                                        optimisticLiked
                                            ? "currentColor"
                                            : "none"
                                    }
                                >
                                    <path
                                        d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                </svg>
                            </button>

                            {/* Bookmark Button */}
                            <button
                                className={`${styles.actionButton} ${
                                    optimisticBookmarked
                                        ? styles.bookmarked
                                        : ""
                                } ${
                                    bookmarkingInProgress ? styles.loading : ""
                                }`}
                                onClick={handleBookmark}
                                disabled={bookmarkingInProgress}
                                title={
                                    optimisticBookmarked
                                        ? "Remove bookmark"
                                        : "Bookmark"
                                }
                                aria-label={`${
                                    optimisticBookmarked
                                        ? "Remove bookmark from"
                                        : "Bookmark"
                                } this post`}
                            >
                                <svg
                                    width="18"
                                    height="18"
                                    viewBox="0 0 16 16"
                                    fill={
                                        optimisticBookmarked
                                            ? "currentColor"
                                            : "none"
                                    }
                                >
                                    <path
                                        d="M3 1C2.45 1 2 1.45 2 2V15L8 12L14 15V2C14 1.45 13.55 1 13 1H3Z"
                                        stroke="currentColor"
                                        strokeWidth="1.5"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                </svg>
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </Card>
    );
};

PostCard.propTypes = {
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    title: PropTypes.string.isRequired,
    excerpt: PropTypes.string,
    user: PropTypes.shape({
        fullname: PropTypes.string,
        first_name: PropTypes.string,
        last_name: PropTypes.string,
        avatar: PropTypes.string,
        username: PropTypes.string,
    }).isRequired,
    published_at: PropTypes.string.isRequired,
    readTime: PropTypes.number,
    topic: PropTypes.arrayOf(
        PropTypes.shape({
            name: PropTypes.string.isRequired,
        })
    ),

    slug: PropTypes.string,
    featuredImage: PropTypes.string,
    loading: PropTypes.bool,
    compact: PropTypes.bool,
    className: PropTypes.string,
    // New interaction props
    likes: PropTypes.number,
    views: PropTypes.number,
    isLiked: PropTypes.bool,
    isBookmarked: PropTypes.bool,
    showViewCount: PropTypes.bool,
    showInteractions: PropTypes.bool,
    onLike: PropTypes.func,
    onBookmark: PropTypes.func,
};

export default memo(PostCard);
