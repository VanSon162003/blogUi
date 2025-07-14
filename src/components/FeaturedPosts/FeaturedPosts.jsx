import PropTypes from "prop-types";
import PostCard from "../PostCard/PostCard";
import EmptyState from "../EmptyState/EmptyState";
import Loading from "../Loading/Loading";
import styles from "./FeaturedPosts.module.scss";
import useUser from "../../hook/useUser";
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
    const { currentUser: user } = useUser();

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

    const handle = async (postId) => {
        console.log(postId);

        try {
            await postsService.toggleLikePost(postId);
        } catch (error) {
            console.log(error);
        }
    };

    const displayPosts = posts.slice(0, maxPosts);

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
                            title={post.title}
                            excerpt={post.meta_description}
                            author={post.user}
                            publishedAt={post.published_at}
                            readTime={2}
                            topic={post.topics.name}
                            slug={post.slug}
                            featuredImage={post.thumbnail}
                            isLiked={post?.is_like ? true : false}
                            onLike={(id, liked) => handle(id, liked)}
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
