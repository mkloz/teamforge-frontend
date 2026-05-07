/** @type {import("prettier").Config & import("prettier-plugin-tailwindcss").PluginOptions} */
export default {
    plugins: ["prettier-plugin-tailwindcss"],
    tailwindFunctions: ["cn", "clsx", "cva"],
    tailwindStylesheet: "./src/index.css",
};
