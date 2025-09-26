import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import PropTypes from "prop-types";
import Button from "../Button/Button";
import Input from "../Input/Input";
import Badge from "../Badge/Badge";
import FallbackImage from "../FallbackImage/FallbackImage";
import styles from "./PublishModal.module.scss";

const visibilityOptions = [
    {
        value: "public",
        label: "Public",
        description: "Anyone can see this post",
        icon: "🌍",
    },
    {
        value: "followers",
        label: "Followers only",
        description: "Only your followers can see this post",
        icon: "👥",
    },
    {
        value: "private",
        label: "Only me",
        description: "Only you can see this post",
        icon: "🔒",
    },
];

const PublishModal = ({
    isOpen,
    onClose,
    onPublish,
    formData,
    setFormData,
    selectedTopics,
    topicInput,
    setTopicInput,
    availableTopics,
    handleAddTopic,
    handleRemoveTopic,
    handleImageUpload,
    isPublishing = false,
    isEditing = false,
    editData = null,
}) => {
    const [isScheduled, setIsScheduled] = useState(false);
    const [publishDate, setPublishDate] = useState("");

    const handleVisibilityChange = (visibility) => {
        setFormData((prev) => ({ ...prev, visibility }));
    };

    const handleMetaChange = (field) => (e) => {
        setFormData((prev) => ({ ...prev, [field]: e.target.value }));
    };

    const handlePublish = () => {
        onPublish({
            ...formData,
            isScheduled,
            publishDate: isScheduled ? publishDate : null,
        });
    };

    useEffect(() => {
        if (isEditing && editData && isOpen) {
            setFormData((prev) => ({
                ...prev,
                meta_title: editData.meta_title || "",
                meta_description: editData.meta_description || "",
                visibility: editData.visibility || "public",
                thumbnail: editData.thumbnail || "",
                previewThumbnail: editData.thumbnail
                    ? editData.thumbnail.startsWith("http")
                        ? editData.thumbnail
                        : `${import.meta.env.VITE_BASE_URL}/${
                              editData.thumbnail
                          }`
                    : null,
            }));

            if (editData.published_at) {
                const publishTime = new Date(editData.published_at);
                const now = new Date();
                if (publishTime > now) {
                    setIsScheduled(true);
                    setPublishDate(publishTime.toISOString().slice(0, 16));
                }
            }
        }
    }, [isEditing, editData, isOpen, setFormData]);

    const renderVisibilityOptions = () =>
        visibilityOptions.map((option) => (
            <div
                key={option.value}
                className={`${styles.visibilityOption} ${
                    formData.visibility === option.value ? styles.selected : ""
                }`}
                onClick={() => handleVisibilityChange(option.value)}
            >
                <div className={styles.optionHeader}>
                    <span className={styles.optionIcon}>{option.icon}</span>
                    <span className={styles.optionLabel}>{option.label}</span>
                    <input
                        type="radio"
                        name="visibility"
                        checked={formData.visibility === option.value}
                        readOnly
                        className={styles.visibilityRadio}
                    />
                </div>
                <p className={styles.optionDescription}>{option.description}</p>
            </div>
        ));

    const renderCoverImage = () => {
        let imageUrl = formData.previewThumbnail;

        if (!imageUrl && formData.thumbnail) {
            if (typeof formData.thumbnail === "string") {
                imageUrl = formData.thumbnail.startsWith("http")
                    ? formData.thumbnail
                    : `${import.meta.env.VITE_BASE_URL}/${formData.thumbnail}`;
            } else if (formData.thumbnail instanceof File) {
                imageUrl = URL.createObjectURL(formData.thumbnail);
            }
        }

        if (imageUrl) {
            return (
                <div className={styles.imagePreview}>
                    <FallbackImage
                        src={imageUrl}
                        alt="Cover preview"
                        className={styles.coverImage}
                    />
                    <div className={styles.imageActions}>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            className={styles.fileInput}
                            id="cover-upload-modal"
                        />
                        <label
                            htmlFor="cover-upload-modal"
                            className={styles.changeImageButton}
                        >
                            Change
                        </label>
                        <button
                            type="button"
                            onClick={() =>
                                setFormData((prev) => ({
                                    ...prev,
                                    thumbnail: "",
                                    previewThumbnail: null,
                                    coverImage: "",
                                }))
                            }
                            className={styles.removeImageButton}
                        >
                            Remove
                        </button>
                    </div>
                </div>
            );
        }

        return (
            <div className={styles.uploadArea}>
                <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className={styles.fileInput}
                    id="cover-upload-modal"
                />
                <label
                    htmlFor="cover-upload-modal"
                    className={styles.uploadButton}
                >
                    Upload Cover Image
                </label>
            </div>
        );
    };

    if (!isOpen) return null;

    return createPortal(
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                <div className={styles.header}>
                    <h2 className={styles.title}>Ready to publish?</h2>
                    <button className={styles.closeButton} onClick={onClose}>
                        ×
                    </button>
                </div>

                <div className={styles.content}>
                    {/* SEO & Meta */}
                    <div className={styles.section}>
                        <h3 className={styles.sectionTitle}>SEO & Meta</h3>
                        <Input
                            label="Meta Title"
                            placeholder="SEO-friendly title"
                            value={formData.meta_title || ""}
                            onChange={handleMetaChange("meta_title")}
                            fullWidth
                            maxLength={60}
                        />
                        <Input
                            label="Meta Description"
                            placeholder="Short SEO description"
                            value={formData.meta_description || ""}
                            onChange={handleMetaChange("meta_description")}
                            fullWidth
                            maxLength={160}
                            rows={3}
                        />
                    </div>

                    {/* Cover Image */}
                    <div className={styles.section}>
                        <h3 className={styles.sectionTitle}>Cover Image</h3>
                        {renderCoverImage()}
                    </div>

                    {/* Topics */}
                    <div className={styles.section}>
                        <h3 className={styles.sectionTitle}>Topics</h3>
                        <div className={styles.topicsInput}>
                            <input
                                type="text"
                                placeholder="Add topics..."
                                value={topicInput}
                                onChange={(e) => setTopicInput(e.target.value)}
                                onKeyDown={(e) => {
                                    if (
                                        e.key === "Enter" &&
                                        topicInput.trim()
                                    ) {
                                        e.preventDefault();
                                        handleAddTopic(topicInput.trim());
                                    }
                                }}
                                className={styles.topicInput}
                            />
                            <div className={styles.topicSuggestions}>
                                {topicInput &&
                                    availableTopics
                                        .filter(
                                            (topic) =>
                                                topic
                                                    .toLowerCase()
                                                    .includes(
                                                        topicInput.toLowerCase()
                                                    ) &&
                                                !selectedTopics.includes(topic)
                                        )
                                        .slice(0, 5)
                                        .map((topic) => (
                                            <button
                                                key={topic}
                                                type="button"
                                                className={
                                                    styles.suggestionItem
                                                }
                                                onClick={() =>
                                                    handleAddTopic(topic)
                                                }
                                            >
                                                {topic}
                                            </button>
                                        ))}
                            </div>
                        </div>
                        <div className={styles.selectedTopics}>
                            {selectedTopics.map((topic) => (
                                <Badge
                                    key={topic}
                                    variant="secondary"
                                    className={styles.topicBadge}
                                >
                                    {topic}
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveTopic(topic)}
                                        className={styles.removeTopic}
                                    >
                                        ×
                                    </button>
                                </Badge>
                            ))}
                        </div>
                    </div>

                    {/* Visibility */}
                    <div className={styles.section}>
                        <h3 className={styles.sectionTitle}>Post Visibility</h3>
                        <div className={styles.visibilityOptions}>
                            {renderVisibilityOptions()}
                        </div>
                    </div>

                    {/* Schedule */}
                    <div className={styles.section}>
                        <h3 className={styles.sectionTitle}>Publishing</h3>
                        <label className={styles.toggleLabel}>
                            <input
                                type="checkbox"
                                checked={isScheduled}
                                onChange={(e) =>
                                    setIsScheduled(e.target.checked)
                                }
                                className={styles.toggleInput}
                            />
                            <span className={styles.toggleSlider}></span>
                            <span className={styles.toggleText}>
                                Schedule for later
                            </span>
                        </label>
                        {isScheduled && (
                            <div className={styles.scheduleDateTime}>
                                <Input
                                    label="Publish Date & Time"
                                    type="datetime-local"
                                    value={publishDate}
                                    onChange={(e) =>
                                        setPublishDate(e.target.value)
                                    }
                                    min={new Date().toISOString().slice(0, 16)}
                                    fullWidth
                                />
                            </div>
                        )}
                    </div>
                </div>

                <div className={styles.footer}>
                    <Button variant="secondary" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button
                        variant="primary"
                        onClick={handlePublish}
                        loading={isPublishing}
                        disabled={isPublishing || (isScheduled && !publishDate)}
                    >
                        {isScheduled ? "Schedule Post" : "Publish Now"}
                    </Button>
                </div>
            </div>
        </div>,
        document.body
    );
};

PublishModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    onPublish: PropTypes.func.isRequired,
    formData: PropTypes.object.isRequired,
    setFormData: PropTypes.func.isRequired,
    selectedTopics: PropTypes.array.isRequired,
    topicInput: PropTypes.string.isRequired,
    setTopicInput: PropTypes.func.isRequired,
    availableTopics: PropTypes.array.isRequired,
    handleAddTopic: PropTypes.func.isRequired,
    handleRemoveTopic: PropTypes.func.isRequired,
    handleImageUpload: PropTypes.func.isRequired,
    isPublishing: PropTypes.bool,
    isEditing: PropTypes.bool,
    editData: PropTypes.object,
};

export default PublishModal;
