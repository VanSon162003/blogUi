import { useState, useEffect } from "react";
import TopicList from "../../components/TopicList/TopicList";
import Loading from "../../components/Loading/Loading";
import styles from "./TopicsListing.module.scss";
import topicsService from "../../services/topicsService";

const TopicsListing = () => {
    const [topics, setTopics] = useState([]);
    const [loading, setLoading] = useState(true);

    // Mock data - replace with API call

    useEffect(() => {
        const fetchTopics = async () => {
            setLoading(true);

            try {
                const data = await topicsService.getAll();
                setTopics(data.data);
            } catch (error) {
                console.error("Failed to fetch topics:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchTopics();
    }, []);

    if (loading) {
        return (
            <div className={styles.topicsListing}>
                <div className="container">
                    <Loading size="md" text="Loading topics..." />
                </div>
            </div>
        );
    }

    return (
        <div className={styles.topicsListing}>
            <div className="container">
                {/* Header */}
                <header className={styles.header}>
                    <h1 className={styles.title}>All Topics</h1>
                    <p className={styles.description}>
                        Explore all available topics and find content that
                        interests you.
                    </p>
                </header>

                {/* Topics Grid */}
                <section className={styles.content}>
                    <TopicList
                        maxTopics={topics.length}
                        topics={topics}
                        loading={loading}
                    />
                </section>
            </div>
        </div>
    );
};

export default TopicsListing;
