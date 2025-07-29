// Copyright 2025 Circle Company, Inc.
// Licensed under the Circle License, Version 1.0

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { circleText } from "../index.js";

describe("Test circleText lib", () => {
    it("should be defined", () => {
        expect(circleText).toBeDefined();
    })
    it("should validate username", () => {
        expect(circleText.validation.username("test_user")).toBe(true);
        expect(circleText.validation.username("@test_user")).toBe(true);
        expect(circleText.validation.username("invalid user")).toBe(false);
        expect(circleText.validation.username("")).toBe(false);
    })
    it("should validate hashtag", () => {
        expect(circleText.validation.hashtag("#example")).toBe(true);
        expect(circleText.validation.hashtag("example")).toBe(false);
        expect(circleText.validation.hashtag("#invalid hashtag")).toBe(false);
        expect(circleText.validation.hashtag("")).toBe(false);
    })
    it("should validate URL", () => {
        expect(circleText.validation.url("https://example.com")).toBe(true);
        expect(circleText.validation.url("http://example.com")).toBe(true);
        expect(circleText.validation.url("example.com", false)).toBe(true); // without protocol
        expect(circleText.validation.url("invalid-url")).toBe(false);
        expect(circleText.validation.url("")).toBe(false);
    })    
    it("should extract mentions", () => {
        const text = "Check out @test_user and @another_user!";
        const mentions = circleText.extract.mentions(text);
        expect(mentions).toEqual(["@test_user", "@another_user"]);
    })
    it("should extract hashtags", () => {
        const text = "Check out #example and #test!";
        const hashtags = circleText.extract.hashtags(text);
        expect(hashtags).toEqual(["#example", "#test"]);
    })
    it("should extract URLs", () => {
        const text = "Visit https://example.com and http://test.com for more info.";
        const urls = circleText.extract.urls(text);
        expect(urls).toEqual(["https://example.com", "http://test.com"]);
    })
    afterEach(() => {
        vi.clearAllMocks();
    })
    beforeEach(() => {
        vi.resetModules();
    })
})