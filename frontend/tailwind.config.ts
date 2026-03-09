import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                mzansi: {
                    dark: "#000000",
                    muted: "#333333", // Used for borders and dark backgrounds
                    light: "#ffffff",
                    orange: "#ff9800",
                    red: "#cc7a00" // Darker orange for hovers
                }
            }
        },
    },
    plugins: [],
};
export default config;
