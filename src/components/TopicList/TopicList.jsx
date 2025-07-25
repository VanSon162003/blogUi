import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import Badge from "../Badge/Badge";
import EmptyState from "../EmptyState/EmptyState";
import FallbackImage from "../FallbackImage/FallbackImage";
import styles from "./TopicList.module.scss";
import isHttps from "../../utils/isHttps";

const TopicList = ({
    topics = [],
    loading = false,
    className,
    maxTopics = 3,
    ...props
}) => {
    if (loading) {
        return (
            <div
                className={`${styles.topicList} ${className || ""}`}
                {...props}
            >
                <div className={styles.loadingSkeleton}>
                    {Array.from({ length: 6 }, (_, i) => (
                        <div key={i} className={styles.skeletonItem} />
                    ))}
                </div>
            </div>
        );
    }

    if (!topics.length) {
        return (
            <div
                className={`${styles.topicList} ${className || ""}`}
                {...props}
            >
                <EmptyState
                    title="No topics found"
                    description="There are no topics available at the moment."
                    icon="📚"
                />
            </div>
        );
    }
    const displayTopics = topics.slice(0, maxTopics);

    return (
        <div className={`${styles.topicList} ${className || ""}`} {...props}>
            <div className={styles.grid}>
                {displayTopics.map((topic) => (
                    <Link
                        key={topic.id}
                        to={`/topics/${topic.slug}`}
                        className={styles.topicCard}
                    >
                        <div className={styles.cardContent}>
                            {/* Topic Icon/Image */}
                            {topic.image && (
                                <div className={styles.iconContainer}>
                                    <FallbackImage
                                        src={
                                            isHttps(topic.image)
                                                ? topic.image
                                                : `${
                                                      import.meta.env
                                                          .VITE_BASE_URL
                                                  }/${topic.image}`
                                        }
                                        alt={topic.name}
                                        className={styles.image}
                                    />
                                </div>
                            )}

                            {/* Topic Name */}
                            <h3 className={styles.topicName}>{topic.name}</h3>

                            {/* Topic Description */}
                            {topic.description && (
                                <p className={styles.description}>
                                    {topic.description}
                                </p>
                            )}

                            {/* Post Count */}
                            <div className={styles.meta}>
                                <Badge variant="secondary" size="sm">
                                    {topic.posts_count || 0} posts
                                </Badge>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
};

TopicList.propTypes = {
    topics: PropTypes.arrayOf(
        PropTypes.shape({
            id: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
                .isRequired,
            name: PropTypes.string.isRequired,
            slug: PropTypes.string.isRequired,
            description: PropTypes.string,
            icon: PropTypes.string,
            postCount: PropTypes.number,
        })
    ),
    loading: PropTypes.bool,
    className: PropTypes.string,
    maxTopics: PropTypes.number,
};

export default TopicList;
