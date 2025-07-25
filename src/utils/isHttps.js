function isHttps(url) {
    if (typeof url !== "string") return false;
    return url.startsWith("https://");
}

export default isHttps;
