import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Input from "../../components/Input/Input";
import Button from "../../components/Button/Button";
import Badge from "../../components/Badge/Badge";
import FallbackImage from "../../components/FallbackImage/FallbackImage";
import RichTextEditor from "../../components/RichTextEditor/RichTextEditor";
import PublishModal from "../../components/PublishModal/PublishModal";
import styles from "./WritePost.module.scss";
import topicsService from "../../services/topicsService";
import postsService from "../../services/postsService";
import dayjs from "dayjs";

const WritePost = () => {
    const { slug } = useParams();
    const navigate = useNavigate();
    const isEditing = Boolean(slug);

    const [formData, setFormData] = useState({
        title: "",
        description: "",
        content: "",
        thumbnail: null, // Sẽ lưu File object
        previewThumbnail: "", // Dùng để preview ảnh
        topics: [],
        status: "draft",
        visibility: "public",
        meta_title: "",
        meta_description: "",
    });

    const [errors, setErrors] = useState({});
    const [saving, setSaving] = useState(false);
    const [previewMode, setPreviewMode] = useState(false);
    const [selectedTopics, setSelectedTopics] = useState([]);
    const [topicInput, setTopicInput] = useState("");
    const [isHeaderScrolled, setIsHeaderScrolled] = useState(false);
    const [showPublishModal, setShowPublishModal] = useState(false);
    const [topics, setTopics] = useState([]);

    const headerRef = useRef(null);

    useEffect(() => {
        if (slug) {
            (async () => {
                const { data: post } = await postsService.getBySlug(slug);

                setFormData(post[0]);
            })();
        }
    }, [slug]);

    useEffect(() => {
        (async () => {
            const result = await topicsService.getAll();
            const topics = result.data.map((item) => item.name);
            setTopics(topics);
        })();
    }, []);

    useEffect(() => {
        const handleScroll = () => {
            if (headerRef.current) {
                const headerRect = headerRef.current.getBoundingClientRect();
                const isSticky = headerRect.top <= 0;
                setIsHeaderScrolled(isSticky);
            }
        };

        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const handleInputChange = (field) => (e) => {
        setFormData((prev) => ({
            ...prev,
            [field]: e.target.value,
        }));

        if (errors[field]) {
            setErrors((prev) => ({
                ...prev,
                [field]: "",
            }));
        }
    };

    const handleAddTopic = (topic) => {
        if (topic && !selectedTopics.includes(topic)) {
            const newTopics = [...selectedTopics, topic];
            setSelectedTopics(newTopics);
            setFormData((prev) => ({
                ...prev,
                topics: newTopics,
            }));
            setTopicInput("");
        }
    };

    const handleRemoveTopic = (topicToRemove) => {
        const newTopics = selectedTopics.filter(
            (topic) => topic !== topicToRemove
        );
        setSelectedTopics(newTopics);
        setFormData((prev) => ({
            ...prev,
            topics: newTopics,
        }));
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.title.trim()) newErrors.title = "Title is required";
        if (!formData.description.trim())
            newErrors.description = "Excerpt is required";
        if (!formData.content.trim()) newErrors.content = "Content is required";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const buildFormData = (data, status = "draft") => {
        const form = new FormData();
        form.append("title", data.title);
        form.append("description", data.description);
        form.append("content", data.content);
        form.append("status", status);
        form.append("visibility", data.visibility);
        form.append("meta_title", data.meta_title);
        form.append("meta_description", data.meta_description);
        form.append("topics", JSON.stringify(data.topics));

        if (data.isScheduled) {
            const now = dayjs(data.publishDate);
            const formatted = now.format("YYYY-MM-DD HH:mm:ss");
            form.append("published_at", formatted);
        }

        if (data.thumbnail instanceof File) {
            form.append("thumbnail", data.thumbnail);
        }

        return form;
    };

    const handleSave = async (status = "draft") => {
        if (!validateForm()) return;
        setSaving(true);
        try {
            const form = buildFormData(formData, status);
            await postsService.create(form);

            console.log("Saving post:", Object.fromEntries(form.entries()));
            navigate("/my-posts");
        } catch (error) {
            console.error("Error saving post:", error);
        } finally {
            setSaving(false);
        }
    };

    const handlePublish = async (publishData) => {
        if (!validateForm()) return;
        setSaving(true);
        try {
            const form = buildFormData(publishData, "published");

            console.log(form);

            if (!slug) await postsService.create(form);
            else await postsService.update(slug, form);

            console.log("Publishing post:", Object.fromEntries(form.entries()));
            setShowPublishModal(false);
            navigate("/my-posts");
        } catch (error) {
            console.error("Error publishing post:", error);
        } finally {
            setSaving(false);
        }
    };

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const previewUrl = URL.createObjectURL(file);
            setFormData((prev) => ({
                ...prev,
                thumbnail: file,
                previewThumbnail: previewUrl,
            }));
        }
    };

    const handleOpenPublishModal = () => {
        if (validateForm()) {
            setShowPublishModal(true);
        }
    };

    const wordCount = formData.content
        .split(/\s+/)
        .filter((word) => word.length > 0).length;
    const readingTime = Math.ceil(wordCount / 200);

    return (
        <div className={styles.container}>
            <div className={styles.content}>
                {!previewMode ? (
                    <div className={styles.editor}>
                        <div className={styles.form}>
                            <Input
                                label="Title"
                                placeholder="Enter your post title..."
                                value={formData.title}
                                onChange={handleInputChange("title")}
                                error={errors.title}
                                required
                                fullWidth
                                size="lg"
                            />
                            <Input
                                label="Excerpt"
                                placeholder="Write a brief description..."
                                value={formData.description}
                                onChange={handleInputChange("description")}
                                error={errors.description}
                                required
                                fullWidth
                            />
                            <div className={styles.contentSection}>
                                <label
                                    className={styles.label}
                                    htmlFor="content"
                                >
                                    Content *
                                </label>
                                <RichTextEditor
                                    value={formData.content}
                                    onChange={(value) =>
                                        setFormData((prev) => ({
                                            ...prev,
                                            content: value,
                                        }))
                                    }
                                    placeholder="Start writing your post content..."
                                    error={errors.content}
                                    className={styles.richTextEditor}
                                />
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className={styles.preview}>
                        <div className={styles.previewContent}>
                            <div className={styles.previewHeader}>
                                {formData.previewThumbnail && (
                                    <FallbackImage
                                        src={formData.previewThumbnail}
                                        alt={formData.title}
                                        className={styles.previewCoverImage}
                                    />
                                )}
                                <h1 className={styles.previewTitle}>
                                    {formData.title || "Your Post Title"}
                                </h1>
                                <p className={styles.previewExcerpt}>
                                    {formData.description ||
                                        "Your post excerpt..."}
                                </p>
                                <div className={styles.previewTopics}>
                                    {selectedTopics.map((topic) => (
                                        <Badge key={topic} variant="primary">
                                            {topic}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                            <div className={styles.previewBody}>
                                <div
                                    className={styles.previewText}
                                    dangerouslySetInnerHTML={{
                                        __html:
                                            formData.content ||
                                            "<p>Your post content...</p>",
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <div
                ref={headerRef}
                className={`${styles.footer} ${
                    isHeaderScrolled ? styles.scrolled : ""
                }`}
            >
                <div className={styles.footerContent}>
                    <h1 className={styles.title}>
                        {isEditing ? "Edit Post" : "Write New Post"}
                    </h1>
                    <div className={styles.stats}>
                        <span>{wordCount} words</span>
                        <span>~{readingTime} min read</span>
                    </div>
                </div>
                <div className={styles.actions}>
                    <div className={styles.viewToggle}>
                        <button
                            className={`${styles.toggleButton} ${
                                !previewMode ? styles.active : ""
                            }`}
                            onClick={() => setPreviewMode(false)}
                        >
                            Write
                        </button>
                        <button
                            className={`${styles.toggleButton} ${
                                previewMode ? styles.active : ""
                            }`}
                            onClick={() => setPreviewMode(true)}
                        >
                            Preview
                        </button>
                    </div>
                    <div className={styles.saveActions}>
                        <Button
                            variant="secondary"
                            onClick={() => handleSave("draft")}
                            loading={saving}
                            disabled={saving}
                        >
                            Save Draft
                        </Button>
                        <Button
                            variant="primary"
                            onClick={handleOpenPublishModal}
                            disabled={saving}
                        >
                            {isEditing ? "Update" : "Publish"}
                        </Button>
                    </div>
                </div>
            </div>

            <PublishModal
                isOpen={showPublishModal}
                onClose={() => setShowPublishModal(false)}
                onPublish={handlePublish}
                formData={formData}
                setFormData={setFormData}
                selectedTopics={selectedTopics}
                topicInput={topicInput}
                setTopicInput={setTopicInput}
                availableTopics={topics}
                handleAddTopic={handleAddTopic}
                handleRemoveTopic={handleRemoveTopic}
                handleImageUpload={handleImageUpload}
                isPublishing={saving}
            />
        </div>
    );
};

export default WritePost;
