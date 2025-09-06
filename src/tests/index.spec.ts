// Copyright 2025 Circle Company, Inc.
// Licensed under the Circle License, Version 1.0

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { CircleText } from "../../index.js"

describe("Test circleText lib", () => {
    const circleText = new CircleText()
    const validate = circleText.validate

    it("should be defined", () => {
        expect(circleText).toBeDefined()
    })
    it("should validate username", () => {
        expect(validate.username("test_user")).toBeTypeOf("boolean")
        expect(validate.username("test_user")).toBe(true)
        expect(validate.username("@test_user")).toBe(true)
        expect(validate.username("invalid user")).toBe(false)
        expect(validate.username("@")).toBe(false)
        expect(validate.username("")).toBe(false)
    })
    it("should validate hashtag", () => {
        expect(validate.hashtag("#example")).toBeTypeOf("boolean")
        expect(validate.hashtag("#example")).toBe(true)
        expect(validate.hashtag("example")).toBe(false)
        expect(validate.hashtag("#invalid hashtag")).toBe(false)
        expect(validate.hashtag("#")).toBe(false)
        expect(validate.hashtag("")).toBe(false)
    })
    it("should validate URL", () => {
        expect(validate.url("https://example.com")).toBeTypeOf("boolean")
        expect(validate.url("https://example.com")).toBe(true)
        expect(validate.url("http://example.com")).toBe(true)
        expect(validate.url("example.com", false)).toBe(true) // without protocol
        expect(validate.url("invalid-url")).toBe(false)
        expect(validate.url("http://")).toBe(false)
        expect(validate.url("")).toBe(false)
    })
    it("should extract mentions", () => {
        const text = "Check out @test_user and @another_user!"
        const mentions = circleText.extract.mentions(text)
        expect(mentions).toBeInstanceOf(Array)
        expect(mentions).toEqual(["@test_user", "@another_user"])
    })
    it("should extract hashtags", () => {
        const text = "Check out #example and #test!"
        const hashtags = circleText.extract.hashtags(text)
        expect(hashtags).toBeInstanceOf(Array)
        expect(hashtags).toEqual(["#example", "#test"])
    })
    it("should extract URLs", () => {
        const text = "Visit https://example.com and http://test.com for more info."
        const urls = circleText.extract.urls(text)
        expect(urls).toBeInstanceOf(Array)
        expect(urls).toEqual(["https://example.com", "http://test.com"])
    })
    it("should extract keywords", () => {
        const text =
            "Esse é um texto de teste com algumas keywords importantes: fome, test, text, keywords, importantes."
        const keywords = circleText.extract.keywords(text)

        expect(keywords).toBeInstanceOf(Array)
        expect(keywords.length).toBeGreaterThan(0)
        expect(keywords).toEqual(["keyword", "importante", "texto", "teste", "fome"])
    })
    it("should analyze positive sentiment", () => {
        const text = "Estou muito feliz com o resultado do projeto!"
        const sentiment = circleText.analize.sentiment(text)

        expect(sentiment).toBeDefined()
        expect(sentiment.intensity).toBeTypeOf("number")
        expect(sentiment.intensity).toBeGreaterThan(0)
        expect(sentiment.sentiment).toBeTypeOf("string")
        expect(sentiment.sentiment).toEqual("positive")
    })

    it("should analyze negative sentiment", () => {
        const text = "Estou muito triste com o resultado do projeto."
        const sentiment = circleText.analize.sentiment(text)

        expect(sentiment).toBeDefined()
        expect(sentiment.intensity).toBeTypeOf("number")
        expect(sentiment.intensity).toBeLessThan(0)
        expect(sentiment.sentiment).toBeTypeOf("string")
        expect(sentiment.sentiment).toEqual("negative")
    })

    it("should analyze negative sentiment", () => {
        const text = "Estou muito triste com o resultado do projeto."
        const sentiment = circleText.analize.sentiment(text)

        expect(sentiment).toBeDefined()
        expect(sentiment.intensity).toBeTypeOf("number")
        expect(sentiment.intensity).toBeLessThan(0)
        expect(sentiment.sentiment).toBeTypeOf("string")
        expect(sentiment.sentiment).toEqual("negative")
    })
    afterEach(() => {
        vi.clearAllMocks()
    })
    beforeEach(() => {
        vi.resetModules()
    })
})
