export const GA_ID = process.env.NEXT_PUBLIC_GA_ID || "";

export const sendGAEventL = (name, params = {}) => {
    if (typeof window !== "undefined" && window.gtag) {
        window.gtag("event", name, params);

        // Debug hanya di mode development
        if (process.env.NODE_ENV === "development") {
            console.log("[GA EVENT]", name, params);
        }
    }
};
