import PropTypes from "prop-types";
import PostCard from "../PostCard/PostCard";
import Pagination from "../Pagination/Pagination";
import EmptyState from "../EmptyState/EmptyState";
import Loading from "../Loading/Loading";
import styles from "./PostList.module.scss";

import postsService from "../../services/postsService";

const PostList = ({
    posts = [],
    loading = false,
    currentPage = 1,
    totalPages = 1,
    onPageChange,
    showPagination = true,
    layout = "grid",
    maxPosts = 3,
    className,
    ...props
}) => {
    if (loading) {
        return (
            <div className={`${styles.postList} ${className || ""}`} {...props}>
                <Loading size="md" text="Loading posts..." />
            </div>
        );
    }

    if (!posts.length) {
        return (
            <div className={`${styles.postList} ${className || ""}`} {...props}>
                <EmptyState
                    title="No posts found"
                    description="There are no posts available for this topic."
                    icon="📝"
                />
            </div>
        );
    }

    const handle = async (postId) => {
        try {
            await postsService.toggleLikePost(postId);
        } catch (error) {
            console.log(error);
        }
    };

    const displayPosts = posts.slice(0, maxPosts).reverse();

    return (
        <div className={`${styles.postList} ${className || ""}`} {...props}>
            <div className={`${styles.postsContainer} ${styles[layout]}`}>
                {displayPosts.map((post) => (
                    <div key={post.id || post.slug} className={styles.postItem}>
                        <PostCard
                            id={post.id}
                            title={post.title}
                            excerpt={post.meta_description}
                            author={post.user}
                            publishedAt={post.published_at}
                            readTime={2}
                            topic={post.topics}
                            slug={post.slug}
                            featuredImage={post.thumbnail}
                            isLiked={post?.is_like ? true : false}
                            onLike={(id, liked) => handle(id, liked)}
                        />
                    </div>
                ))}
            </div>

            {showPagination && totalPages > 1 && (
                <div className={styles.paginationContainer}>
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={onPageChange}
                    />
                </div>
            )}
        </div>
    );
};

PostList.propTypes = {
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
    currentPage: PropTypes.number,
    totalPages: PropTypes.number,
    onPageChange: PropTypes.func,
    showPagination: PropTypes.bool,
    layout: PropTypes.oneOf(["grid", "list"]),
    maxPosts: PropTypes.number,
    className: PropTypes.string,
};

export default PostList;
