import { describe, expect, it } from "vitest";
import { appendToken, extractToken, resolveEsriToken, stripToken } from "./token.ts";

describe("extractToken", () => {
  it("returns the token value when present", () => {
    expect(extractToken("https://example.com/service?token=abc123")).toBe("abc123");
  });

  it("returns null when no token param exists", () => {
    expect(extractToken("https://example.com/service")).toBeNull();
  });

  it("returns null when the URL is not parseable", () => {
    expect(extractToken("not-a-url")).toBeNull();
  });

  it("extracts token when other params are present", () => {
    expect(extractToken("https://example.com/service?foo=bar&token=xyz&baz=1")).toBe("xyz");
  });
});

describe("stripToken", () => {
  it("removes the token param from a URL", () => {
    expect(stripToken("https://example.com/service?token=abc")).toBe("https://example.com/service");
  });

  it("preserves other query params", () => {
    expect(stripToken("https://example.com/service?foo=bar&token=abc&baz=1")).toBe(
      "https://example.com/service?foo=bar&baz=1",
    );
  });

  it("returns the URL unchanged if no token param", () => {
    expect(stripToken("https://example.com/service?foo=bar")).toBe(
      "https://example.com/service?foo=bar",
    );
  });

  it("returns the URL unchanged for an unparseable URL", () => {
    expect(stripToken("not-a-url")).toBe("not-a-url");
  });

  it("removes trailing ? when token is the only param", () => {
    const result = stripToken("https://example.com/path?token=secret");
    expect(result).not.toContain("?");
  });
});

describe("appendToken", () => {
  it("adds token to a URL without a query string", () => {
    expect(appendToken("https://example.com/path", "mytoken")).toBe(
      "https://example.com/path?token=mytoken",
    );
  });

  it("adds token to a URL that already has a query string", () => {
    expect(appendToken("https://example.com/path?foo=bar", "mytoken")).toBe(
      "https://example.com/path?foo=bar&token=mytoken",
    );
  });

  it("returns the URL unchanged when token is null", () => {
    expect(appendToken("https://example.com/path", null)).toBe("https://example.com/path");
  });

  it("encodes special characters in the token", () => {
    const result = appendToken("https://example.com/path", "a b+c");
    expect(result).toContain("token=a%20b%2Bc");
  });
});

describe("resolveEsriToken", () => {
  it("returns the options token when provided", () => {
    expect(resolveEsriToken("https://example.com?token=url", "opts")).toBe("opts");
  });

  it("falls back to the URL token when options token is undefined", () => {
    expect(resolveEsriToken("https://example.com?token=fromurl", undefined)).toBe("fromurl");
  });

  it("returns null when neither is available", () => {
    expect(resolveEsriToken("https://example.com", undefined)).toBeNull();
  });

  it("returns null when both baseUrl and optionsToken are undefined", () => {
    expect(resolveEsriToken(undefined, undefined)).toBeNull();
  });
});
