import PropTypes from "prop-types";
import PostCard from "../PostCard/PostCard";
import EmptyState from "../EmptyState/EmptyState";
import Loading from "../Loading/Loading";
import styles from "./FeaturedPosts.module.scss";
import postsService from "../../services/postsService";

const FeaturedPosts = ({
    posts = [],
    loading = false,
    title = "Featured Posts",
    showTitle = true,
    maxPosts = 3,
    className,
    ...props
}) => {
    if (loading) {
        return (
            <section
                className={`${styles.featuredPosts} ${className || ""}`}
                {...props}
            >
                {showTitle && <h2 className={styles.title}>{title}</h2>}
                <Loading size="md" text="Loading featured posts..." />
            </section>
        );
    }

    if (!posts.length) {
        return (
            <section
                className={`${styles.featuredPosts} ${className || ""}`}
                {...props}
            >
                {showTitle && <h2 className={styles.title}>{title}</h2>}
                <EmptyState
                    title="No featured posts"
                    description="There are no featured posts available at the moment."
                    icon="⭐"
                />
            </section>
        );
    }

    const sortedPosts = [...posts].sort(
        (a, b) => b.likes_count - a.likes_count
    );

    const handleLike = async (postId) => {
        try {
            return await postsService.toggleLikePost(postId);
        } catch (error) {
            throw new Error(error);
        }
    };

    const handleBookmark = async (postId) => {
        try {
            return await postsService.toggleBookmarkPost(postId);
        } catch (error) {
            const check =
                Object.keys(error).length === 0 && error.constructor === Object;

            throw new Error(
                !check ? error : "You must be logged in to save this post."
            );
        }
    };

    const displayPosts = sortedPosts.slice(0, maxPosts);

    return (
        <section
            className={`${styles.featuredPosts} ${className || ""}`}
            {...props}
        >
            {showTitle && <h2 className={styles.title}>{title}</h2>}

            <div className={styles.postsGrid}>
                {displayPosts.map((post, index) => (
                    <div
                        key={post.id || post.slug}
                        className={`${styles.postItem} ${
                            index === 0 ? styles.featured : ""
                        }`}
                    >
                        <PostCard
                            id={post.id}
                            likes={post.likes_count}
                            views={post.views_count}
                            title={post.title}
                            excerpt={post.meta_description}
                            user={post.user}
                            published_at={post.published_at}
                            readTime={Math.floor((Math.random() + 1) * 10)}
                            topic={post.topics.name}
                            slug={post.slug}
                            featuredImage={post.thumbnail}
                            isLiked={post?.is_like || false}
                            onLike={(id, liked) => handleLike(id, liked)}
                            onBookmark={(id, liked) =>
                                handleBookmark(id, liked)
                            }
                            isBookmarked={post?.is_bookmark || false}
                        />
                    </div>
                ))}
            </div>
        </section>
    );
};

FeaturedPosts.propTypes = {
    posts: PropTypes.arrayOf(
        PropTypes.shape({
            id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
            title: PropTypes.string.isRequired,
            excerpt: PropTypes.string,
            user: PropTypes.shape({}).isRequired,
            published_at: PropTypes.string.isRequired,
            readTime: PropTypes.number,
            topic: PropTypes.string,
            slug: PropTypes.string.isRequired,
            featuredImage: PropTypes.string,
        })
    ),
    loading: PropTypes.bool,
    title: PropTypes.string,
    showTitle: PropTypes.bool,
    maxPosts: PropTypes.number,
    className: PropTypes.string,
};

export default FeaturedPosts;
