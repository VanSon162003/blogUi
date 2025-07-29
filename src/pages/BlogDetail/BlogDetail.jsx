import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
    BlogContent,
    AuthorInfo,
    RelatedPosts,
    CommentSection,
    Loading,
} from "../../components";
import styles from "./BlogDetail.module.scss";
import postsService from "../../services/postsService";
import usersService from "../../services/usersService";
import useUser from "../../hook/useUser";

import commentsService from "../../services/commentsService";
import { toast } from "react-toastify";

const BlogDetail = () => {
    const { slug } = useParams();
    const [loading, setLoading] = useState(true);
    const [post, setPost] = useState(null);
    const [relatedPosts, setRelatedPosts] = useState([]);
    const [comments, setComments] = useState([]);
    const [isAuthenticated, setIsAuthenticated] = useState(false); // Mock authentication

    // Like and bookmark states
    const [isLiked, setIsLiked] = useState(false);
    const [isBookmarked, setIsBookmarked] = useState(false);
    const [likes, setLikes] = useState(45); // Mock initial likes
    const [views, setViews] = useState(892); // Mock views
    const [likingInProgress, setLikingInProgress] = useState(false);
    const [bookmarkingInProgress, setBookmarkingInProgress] = useState(false);
    const [follow, setFollow] = useState(false);

    const { currentUser } = useUser();

    useEffect(() => {
        (async () => {
            if (post) {
                await postsService.updateViews(post.id);
            }
        })();
    }, [post]);

    useEffect(() => {
        // Simulate API call
        const loadPost = async () => {
            setLoading(true);
            try {
                // Simulate loading delay
                const { data: post } = await postsService.getBySlug(slug);

                setLikes(post[0].likes_count);
                setViews(post[0].views_count);
                setIsLiked(post[0].is_like);
                setIsBookmarked(post[0].is_bookmark);

                setPost(post[0]);
            } catch (error) {
                console.error("Failed to load post:", error);
            } finally {
                setLoading(false);
            }
        };

        loadPost();
    }, [slug]);

    useEffect(() => {
        if (currentUser?.data) {
            return setIsAuthenticated(true);
        }

        setIsAuthenticated(false);
    }, [currentUser?.data]);

    useEffect(() => {
        try {
            (async () => {
                const result = await commentsService.getAllByPostId(post?.id);
                setComments(result.reverse());
            })();
        } catch (error) {
            console.log(error);
        }
    }, [post?.id]);

    useEffect(() => {
        (async () => {
            try {
                const result = await usersService.checkFollower(post?.user.id);

                setFollow(result.data);
            } catch (error) {
                console.log(error);
            }
        })();
    }, [post?.user.id]);

    useEffect(() => {
        (async () => {
            const postRelates = await postsService.getPostsRelate(post?.id);
            setRelatedPosts(postRelates.data);
        })();
    }, [post?.id]);

    const handleAddComment = async (content) => {
        // Simulate API call
        const data = {
            post_id: post.id,
            content,
        };

        const { data: result } = await commentsService.create(data);

        const newComment = {
            ...result,
            created_at: result.createdAt,
            updated_at: result.updatedAt,
        };

        setComments((prev) => [newComment, ...prev]);
    };

    const handleReplyComment = async (parentId, content) => {
        // Tìm comment cấp 1 chứa parentId này
        let topLevelParentId = parentId;

        for (const comment of comments) {
            if (comment.id === parentId) {
                // Reply vào comment cấp 1 → giữ nguyên
                break;
            }

            // Nếu comment.replies chứa comment có id === parentId
            if (
                comment.replies &&
                comment.replies.some((reply) => reply.id === parentId)
            ) {
                topLevelParentId = comment.id; // chuyển về cấp 1
                break;
            }
        }

        const data = {
            post_id: post.id,
            content,
            parent_id: topLevelParentId,
        };

        const { data: result } = await commentsService.create(data);

        const newComment = {
            ...result,
            created_at: result.createdAt,
            updated_at: result.updatedAt,
        };

        setComments((prev) =>
            prev.map((comment) =>
                comment.id === topLevelParentId
                    ? { ...comment, replies: [...comment.replies, newComment] }
                    : comment
            )
        );
    };

    const handleLikeComment = async (commentId) => {
        await commentsService.toggleLike(commentId);
        setComments((prev) =>
            prev.map((comment) => {
                if (comment.id === commentId) {
                    return {
                        ...comment,
                        is_like: !comment.is_like,
                        like_count: comment.is_like
                            ? comment.like_count - 1
                            : comment.like_count + 1,
                    };
                }

                if (comment.replies && comment.replies.length > 0) {
                    const updatedReplies = comment.replies.map((reply) => {
                        if (reply.id === commentId) {
                            return {
                                ...reply,
                                is_like: !reply.is_like,
                                like_count: reply.is_like
                                    ? reply.like_count - 1
                                    : reply.like_count + 1,
                            };
                        }
                        return reply;
                    });

                    return { ...comment, replies: updatedReplies };
                }

                return comment;
            })
        );
    };

    const handleEditComment = async (commentId, newContent) => {
        try {
            // Simulate API call

            await commentsService.update(commentId, {
                content: newContent,
                edited_at: Date.now(),
            });

            const updateCommentRecursively = (comments) => {
                return comments.map((comment) => {
                    if (comment.id === commentId) {
                        return {
                            ...comment,
                            content: newContent,
                            isEdited: true,
                        };
                    }
                    if (comment.replies && comment.replies.length > 0) {
                        return {
                            ...comment,
                            replies: updateCommentRecursively(comment.replies),
                        };
                    }
                    return comment;
                });
            };

            setComments((prev) => updateCommentRecursively(prev));
            console.log("Comment edited:", commentId, newContent);
        } catch (error) {
            console.error("Failed to edit comment:", error);
        }
    };

    const handleDeleteComment = async (commentId) => {
        try {
            // Simulate API call

            await commentsService.update(commentId, {
                deleted_at: Date.now(),
            });

            const deleteCommentRecursively = (comments) => {
                return comments
                    .filter((comment) => comment.id !== commentId)
                    .map((comment) => {
                        if (comment.replies && comment.replies.length > 0) {
                            return {
                                ...comment,
                                replies: deleteCommentRecursively(
                                    comment.replies
                                ),
                            };
                        }
                        return comment;
                    });
            };

            setComments((prev) => deleteCommentRecursively(prev));

            console.log("Comment deleted:", commentId);
        } catch (error) {
            console.error("Failed to delete comment:", error);
        }
    };

    const handleLikePost = async () => {
        if (likingInProgress) return;

        setLikingInProgress(true);

        // Optimistic update

        try {
            // Simulate API call
            await postsService.toggleLikePost(post?.id);
            setIsLiked(!isLiked);
            setLikes(isLiked ? likes - 1 : likes + 1);
        } catch (error) {
            // Revert on error
            setIsLiked(isLiked);
            setLikes(likes);
            toast.error(error);
        } finally {
            setLikingInProgress(false);
        }
    };

    const handleBookmarkPost = async () => {
        if (bookmarkingInProgress) return;

        setBookmarkingInProgress(true);

        // Optimistic update

        try {
            // Simulate API call
            await postsService.toggleBookmarkPost(post?.id);
            setIsBookmarked(!isBookmarked);
        } catch (error) {
            // Revert on error
            setIsBookmarked(isBookmarked);
            toast.error(error);
        } finally {
            setBookmarkingInProgress(false);
        }
    };

    if (loading) {
        return (
            <div className={styles.loadingContainer}>
                <Loading size="md" text="Loading article..." />
            </div>
        );
    }

    if (!post) {
        return (
            <div className={styles.notFoundContainer}>
                <h1>Article not found</h1>
                <p>
                    The article you&apos;re looking for doesn&apos;t exist or
                    has been removed.
                </p>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            {/* Article Header with Interactions */}
            <div className={styles.articleHeader}>
                <BlogContent {...post} />

                {/* Post Interactions - Moved to top for better UX */}
                <div className={styles.interactions}>
                    {/* Stats */}
                    <div className={styles.stats}>
                        {/* Views */}
                        <div className={styles.stat}>
                            <svg viewBox="0 0 16 16" fill="none">
                                <path
                                    d="M1 8s3-5 7-5 7 5 7 5-3 5-7 5-7-5-7-5z"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                                <circle cx="8" cy="8" r="2" />
                            </svg>
                            <span>{views} views</span>
                        </div>

                        {/* Likes */}
                        <div className={styles.stat}>
                            <svg viewBox="0 0 16 16" fill="none">
                                <path
                                    d="M14 6.5c0 4.8-5.25 7.5-6 7.5s-6-2.7-6-7.5C2 3.8 4.8 1 8 1s6 2.8 6 5.5z"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                            </svg>
                            <span>{likes} likes</span>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className={styles.actions}>
                        {/* Like Button */}
                        <button
                            className={`${styles.actionButton} ${
                                isLiked ? styles.liked : ""
                            } ${likingInProgress ? styles.loading : ""}`}
                            onClick={handleLikePost}
                            disabled={likingInProgress}
                            title={isLiked ? "Unlike" : "Like"}
                            aria-label={`${
                                isLiked ? "Unlike" : "Like"
                            } this post`}
                        >
                            <svg
                                viewBox="0 0 24 24"
                                fill={isLiked ? "currentColor" : "none"}
                            >
                                <path
                                    d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                            </svg>
                            {isLiked ? "Liked" : "Like"}
                        </button>

                        {/* Bookmark Button */}
                        <button
                            className={`${styles.actionButton} ${
                                isBookmarked ? styles.bookmarked : ""
                            } ${bookmarkingInProgress ? styles.loading : ""}`}
                            onClick={handleBookmarkPost}
                            disabled={bookmarkingInProgress}
                            title={
                                isBookmarked ? "Remove bookmark" : "Bookmark"
                            }
                            aria-label={`${
                                isBookmarked
                                    ? "Remove bookmark from"
                                    : "Bookmark"
                            } this post`}
                        >
                            <svg
                                viewBox="0 0 16 16"
                                fill={isBookmarked ? "currentColor" : "none"}
                            >
                                <path
                                    d="M3 1C2.45 1 2 1.45 2 2V15L8 12L14 15V2C14 1.45 13.55 1 13 1H3Z"
                                    stroke="currentColor"
                                    strokeWidth="1.5"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                            </svg>
                            {isBookmarked ? "Bookmarked" : "Bookmark"}
                        </button>
                    </div>
                </div>
            </div>

            {/* Author Info */}
            <div className={styles.authorSection}>
                <AuthorInfo
                    follow={follow}
                    user={{
                        ...post.user,
                        social: {
                            twitter: post.user?.twitter_url,
                            github: post.user?.github_url,
                            linkedin: post.user?.linkedin_url,
                            website: post.user?.website_url,
                        },
                    }}
                />
            </div>

            {/* Related Posts */}
            <div className={styles.contentSection}>
                <RelatedPosts posts={relatedPosts} />
            </div>

            {/* Comments */}
            <div className={styles.contentSection}>
                <CommentSection
                    comments={comments}
                    onAddComment={handleAddComment}
                    onReplyComment={handleReplyComment}
                    onLikeComment={handleLikeComment}
                    onEditComment={handleEditComment}
                    onDeleteComment={handleDeleteComment}
                    isAuthenticated={isAuthenticated}
                />
            </div>
        </div>
    );
};

export default BlogDetail;
