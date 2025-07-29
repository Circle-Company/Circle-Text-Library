import path from "path"
import tsconfigPaths from "vite-tsconfig-paths"
import { defineConfig } from "vitest/config"

export default defineConfig({
    plugins: [tsconfigPaths()],

    test: {
        globals: true,
        environment: "node",
        include: ["src/**/*.spec.ts", "src/**/*.test.ts"],
    },
    resolve: {
        alias: {
            "@swipe-engine": path.resolve(__dirname, "src/swipe-engine"),
            "@controllers/*": path.resolve(__dirname, "src/controllers"),
            "@models/*": path.resolve(__dirname, "src/models"),
            "@routes/*": path.resolve(__dirname, "src/routes"),
            "@libs/*": path.resolve(__dirname, "src/libs"),
            "@math/*": path.resolve(__dirname, "src/math"),
            "@errors/*": path.resolve(__dirname, "src/errors"),
            "@pages/*": path.resolve(__dirname, "src/pages"),
        },
    },
})
