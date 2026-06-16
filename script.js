// ==UserScript==
// @name         Twitter(X) to Scrapbox
// @namespace    http://tampermonkey.net/
// @version      0.12
// @description  Export selected tweets to Scrapbox format
// @author       NISHIO Hirokazu (+ GPT-4)
// @match        https://twitter.com/*
// @match        https://x.com/*
// @grant        none
// ==/UserScript==

(function () {
  ("use strict");

  const TWEET_SELECTOR = '[data-testid="tweet"]';
  const ACCOUNT_SELECTOR = '[href^="/"]';
  const CONTENT_SELECTOR = '[data-testid="tweetText"], [lang]';
  const TWEET_LINK_SELECTOR = '[href*="/status/"]';
  const IMAGE_SELECTOR =
    '[data-testid="tweetPhoto"] img, a[href*="/photo/"] img[src*="pbs.twimg.com/media/"]';
  const LINK_CARD_SELECTOR = '[data-testid="card.layoutSmall.detail"]';
  const QUOTE_SELECTOR = 'div[role="link"]';

  function isNestedQuoteElement(element, tweet) {
    const link = element.closest(QUOTE_SELECTOR);
    return (
      link != null && link !== tweet && link !== element && tweet.contains(link)
    );
  }

  function queryOwn(tweet, selector) {
    return Array.from(tweet.querySelectorAll(selector)).filter(
      (element) => !isNestedQuoteElement(element, tweet)
    );
  }

  function findImages(tweet) {
    return queryOwn(tweet, IMAGE_SELECTOR);
  }

  function extractAndFormatImages(tweet) {
    const images = findImages(tweet);
    const imageUrls = images
      .map((img) => img.getAttribute("src"))
      .map((src) => `[${src}#.png]`)
      .join(" ");

    return imageUrls;
  }

  function extractLinkTitle(tweet) {
    const linkElement = queryOwn(tweet, LINK_CARD_SELECTOR)[0];
    const linkTitle = linkElement ? linkElement.innerText : "";
    return linkTitle;
  }

  function formatContentWithBlockquote(text) {
    const content = text.trim().split("\n").join("\n> ");
    return content;
  }

  function getAccount(tweet) {
    const avater = queryOwn(
      tweet,
      '[data-testid^="UserAvatar-Container-"]'
    )[0]?.attributes["data-testid"];
    if (avater) {
      // UserAvatar-Container-xxx
      return avater.value.split("-")[2];
    }
    const accountElement = queryOwn(tweet, ACCOUNT_SELECTOR).find((element) =>
      /^\/[^/]+$/.test(element.getAttribute("href") || "")
    );
    if (accountElement) {
      return accountElement.getAttribute("href").substring(1).split("/")[0];
    }
    const spanElements = queryOwn(tweet, "span");
    const filteredSpanElements = Array.from(spanElements).filter((span) =>
      span.innerText.startsWith("@")
    );
    if (filteredSpanElements.length > 0) {
      return filteredSpanElements[0].innerText.substring(1);
    }
    return "";
  }

  function getTweetId(tweet) {
    const permalink = queryOwn(tweet, TWEET_LINK_SELECTOR).find((element) =>
      /\/status\/\d+/.test(element.href)
    );
    if (!permalink) {
      return "";
    }
    const tweetId = permalink.href
      .split("/status/")[1]
      .split("?")[0]
      .split("/")[0];
    return tweetId;
  }

  function formatAccount(account, tweetId) {
    if (!tweetId) {
      return account + ":";
    }
    const tweetUrl = `https://x.com/${account}/status/${tweetId}`;
    return `[${account} ${tweetUrl}]`;
  }

  function formatTweet(tweet) {
    const account = getAccount(tweet);
    const contentElement = queryOwn(tweet, CONTENT_SELECTOR)[0];
    const content = contentElement
      ? formatContentWithBlockquote(contentElement.innerText)
      : "";

    const tweetId = getTweetId(tweet);

    const imageUrls = extractAndFormatImages(tweet);
    const linkTitle = formatContentWithBlockquote(extractLinkTitle(tweet));

    const quoteTweetElement = queryOwn(tweet, QUOTE_SELECTOR).find((element) =>
      element.querySelector(CONTENT_SELECTOR) && getAccount(element)
    );
    let quoteTweet = "";
    if (quoteTweetElement) {
      quoteTweet =
        "\n" +
        formatTweets([quoteTweetElement])
          .trimEnd()
          .split("\n")
          .map((line) => "> " + line)
          .join("\n");
    }

    return `>${formatAccount(account, tweetId)} ${content}${linkTitle}${
      imageUrls ? "\n> " + imageUrls : ""
    }${quoteTweet}\n`;
  }

  function formatTweets(tweets) {
    return tweets.map(formatTweet).join("\n");
  }

  async function copyToClipboard(text) {
    if (navigator.clipboard && window.isSecureContext) {
      try {
        await navigator.clipboard.writeText(text);
        return;
      } catch (error) {
        console.warn("navigator.clipboard.writeText failed", error);
      }
    }
    const el = document.createElement("textarea");
    el.value = text;
    el.style.position = "fixed";
    el.style.top = "0";
    el.style.left = "0";
    el.style.opacity = "0";
    document.body.appendChild(el);
    el.focus();
    el.select();
    try {
      if (!document.execCommand || !document.execCommand("copy")) {
        throw new Error("Clipboard copy failed");
      }
    } finally {
      document.body.removeChild(el);
    }
  }

  function getSelectedTweets() {
    const selection = window.getSelection();

    if (selection.isCollapsed) {
      // 選択されていない場合
      return Array.from(document.querySelectorAll(TWEET_SELECTOR));
    }

    const range = selection.getRangeAt(0);
    const selectedTweets = Array.from(document.querySelectorAll(TWEET_SELECTOR))
      .filter((tweet) => range.intersectsNode(tweet));

    if (selectedTweets.length > 0) {
      return selectedTweets;
    }

    // 選択がツイート本文の一部だけの場合に備えたフォールバック
    return Array.from(
      selection
        .getRangeAt(0)
        .cloneContents()
        .querySelectorAll(TWEET_SELECTOR)
    );
  }

  async function onButtonClick() {
    try {
      const selectedTweets = getSelectedTweets();
      const formattedText = formatTweets(selectedTweets);
      await copyToClipboard(formattedText);
      alert("OK:\n" + formattedText);
    } catch (error) {
      console.error(error);
      alert(
        "Export failed:\n" +
          (error && error.message ? error.message : String(error))
      );
    }
  }

  function addButton() {
    const nav = document.querySelector("nav");
    if (!nav) {
      // navが存在しない場合、1秒後に再試行
      setTimeout(addButton, 1000);
      return;
    }

    const button = document.createElement("button");
    button.textContent = "Export to Scrapbox";
    button.style.position = "fixed";
    button.style.top = "10px";
    button.style.right = "10px";
    button.style.zIndex = 1000;
    button.style.backgroundColor = "#1da1f2";
    button.style.border = "none";
    button.style.borderRadius = "4px";
    button.style.color = "white";
    button.style.padding = "6px 12px";
    button.style.fontSize = "14px";
    button.style.cursor = "pointer";

    button.addEventListener("click", onButtonClick);

    document.body.appendChild(button);
  }

  addButton();
})();
