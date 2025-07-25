import PropTypes from "prop-types";
import PostCard from "../PostCard/PostCard";
import EmptyState from "../EmptyState/EmptyState";
import styles from "./RelatedPosts.module.scss";
import postsService from "../../services/postsService";

const RelatedPosts = ({
    posts = [],
    loading = false,
    maxPosts = 3,
    className,
    ...props
}) => {
    const displayPosts = posts.slice(0, maxPosts);

    const handleLike = async (postId) => {
        try {
            await postsService.toggleLikePost(postId);
        } catch (error) {
            throw new Error(error);
        }
    };

    const handleBookmark = async (postId) => {
        try {
            await postsService.toggleBookmarkPost(postId);
        } catch (error) {
            throw new Error(error);
        }
    };

    if (loading) {
        return (
            <section
                className={`${styles.relatedPosts} ${className || ""}`}
                {...props}
            >
                <h2 className={styles.title}>Related Posts</h2>
                <div className={styles.grid}>
                    {Array.from({ length: maxPosts }, (_, index) => (
                        <PostCard key={index} loading />
                    ))}
                </div>
            </section>
        );
    }

    if (displayPosts.length === 0) {
        return (
            <section
                className={`${styles.relatedPosts} ${className || ""}`}
                {...props}
            >
                <h2 className={styles.title}>Related Posts</h2>
                <EmptyState
                    icon="📰"
                    title="No related posts"
                    description="Check back later for more content on this topic."
                />
            </section>
        );
    }

    return (
        <section
            className={`${styles.relatedPosts} ${className || ""}`}
            {...props}
        >
            <h2 className={styles.title}>Related Posts</h2>
            <div className={styles.grid}>
                {displayPosts.map((post) => (
                    <PostCard
                        key={post.id}
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
                        onBookmark={(id, liked) => handleBookmark(id, liked)}
                        isBookmarked={post?.is_bookmark || false}
                    />
                ))}
            </div>
        </section>
    );
};

RelatedPosts.propTypes = {
    posts: PropTypes.arrayOf(
        PropTypes.shape({
            id: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
                .isRequired,
            title: PropTypes.string.isRequired,
            excerpt: PropTypes.string,
            featuredImage: PropTypes.string,
            user: PropTypes.shape({
                first_name: PropTypes.string.isRequired,
                last_name: PropTypes.string.isRequired,
                avatar: PropTypes.string,
            }),
            published_at: PropTypes.string.isRequired,
            readTime: PropTypes.number,
            topic: PropTypes.string,
        })
    ),
    loading: PropTypes.bool,
    maxPosts: PropTypes.number,
    className: PropTypes.string,
};

export default RelatedPosts;
