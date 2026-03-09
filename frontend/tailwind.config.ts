import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                mzansi: {
                    dark: "#2A1617",
                    muted: "#7A4B47",
                    light: "#FFFB97",
                    orange: "#FE7F42",
                    red: "#B32C1A"
                }
            }
        },
    },
    plugins: [],
};
export default config;
