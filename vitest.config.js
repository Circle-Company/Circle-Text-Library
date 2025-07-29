// vitest.config.js
import path from "path"
import { defineConfig } from "vitest/config"

export default defineConfig({
    test: {
        globals: true,
        environment: "node",
        include: ["**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
        exclude: ["**/node_modules/**", "**/build/**"],
        transformMode: {
            web: [/\.[jt]sx$/],
            ssr: [/\.([cm]?[jt]s|[jt]sx)$/],
        },
        setupFiles: ["./vitest.setup.js"],
        coverage: {
            reporter: ["text", "json", "html"],
            exclude: ["node_modules/", "test/", "**/*.d.ts", "**/*.test.ts", "**/*.spec.ts"],
        },
    },
    resolve: {
        alias: {
            "@models": path.resolve(__dirname, "./src/models"),
            "@errors": path.resolve(__dirname, "./src/errors"),
            "@swipe-engine": path.resolve(__dirname, "./src/swipe-engine"),
        },
    },
})
