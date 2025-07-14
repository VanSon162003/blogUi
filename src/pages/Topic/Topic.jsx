import { useState, useEffect } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import TopicHeader from "../../components/TopicHeader/TopicHeader";
import PostList from "../../components/PostList/PostList";
import EmptyState from "../../components/EmptyState/EmptyState";
import Loading from "../../components/Loading/Loading";
import styles from "./Topic.module.scss";
import topicsService from "../../services/topicsService";
import postsService from "../../services/postsService";

const Topic = () => {
    const { slug } = useParams();
    const [searchParams, setSearchParams] = useSearchParams();

    // States
    const [topic, setTopic] = useState(null);
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [postsLoading, setPostsLoading] = useState(false);
    const [error, setError] = useState(null);

    // Pagination
    const currentPage = parseInt(searchParams.get("page")) || 1;
    const [totalPages, setTotalPages] = useState(1);
    const postsPerPage = 10;

    // const generateMockPosts = (topicName, page = 1) => {
    //     const posts = [];
    //     const startIndex = (page - 1) * postsPerPage;

    //     for (let i = 1; i <= postsPerPage; i++) {
    //         const postIndex = startIndex + i;
    //         posts.push({
    //             id: `${slug}-${postIndex}`,
    //             title: `${topicName} Tutorial ${postIndex}: Advanced Concepts and Best Practices`,
    //             excerpt: `Learn advanced ${topicName} concepts in this comprehensive tutorial. We'll cover important topics, best practices, and real-world examples that will help you become a better developer.`,
    //             slug: `${slug}-tutorial-${postIndex}`,
    //             user: {
    //                 name: "John Doe",
    //                 avatar: `https://via.placeholder.com/32?text=JD`,
    //                 first_name: "ss",
    //                 last_name: "sád",
    //             },
    //             published_at: new Date(2024, 0, postIndex).toISOString(),
    //             readTime: Math.floor(Math.random() * 10) + 3,
    //             topic: topicName,
    //             featuredImage: `https://via.placeholder.com/400x200?text=${topicName}+${postIndex}`,
    //         });
    //     }

    //     return posts;
    // };

    // Fetch topic data
    useEffect(() => {
        const fetchTopic = async () => {
            setLoading(true);
            setError(null);

            try {
                // Simulate API delay

                const { data } = await topicsService.getBySlug(slug);

                if (!data) {
                    setError("Topic not found");
                    return;
                }

                setTopic(data);

                // Calculate total pages
                const totalPostsCount = data.postCount;
                setTotalPages(Math.ceil(totalPostsCount / postsPerPage));
            } catch (err) {
                setError("Failed to load topic");
            } finally {
                setLoading(false);
            }
        };

        if (slug) {
            fetchTopic();
        }
    }, [slug]);

    // Fetch posts for current page
    useEffect(() => {
        const fetchPosts = async () => {
            if (!topic) return;

            setPostsLoading(true);

            try {
                // Simulate API delay

                const mockPosts = await postsService.getListByTopicId(topic.id);

                setPosts(mockPosts.data);
            } catch (err) {
                console.error("Failed to load posts:", err);
            } finally {
                setPostsLoading(false);
            }
        };

        fetchPosts();
    }, [topic, currentPage]);

    const handlePageChange = (page) => {
        setSearchParams({ page: page.toString() });
        // Scroll to top
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    if (loading) {
        return (
            <div className={styles.topicPage}>
                <div className="container">
                    <Loading size="md" text="Loading topic..." />
                </div>
            </div>
        );
    }

    if (error || !topic) {
        return (
            <div className={styles.topicPage}>
                <div className="container">
                    <EmptyState
                        icon="📚"
                        title="Topic not found"
                        description="The topic you're looking for doesn't exist or has been removed."
                    />
                </div>
            </div>
        );
    }

    return (
        <div className={styles.topicPage}>
            <div className="container">
                {/* Topic Header */}
                <TopicHeader topic={topic} />

                {/* Posts List */}
                <PostList
                    maxPosts={posts.length}
                    posts={posts}
                    loading={postsLoading}
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                    showPagination={true}
                    className={styles.postsList}
                />
            </div>
        </div>
    );
};

export default Topic;
