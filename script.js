// ==UserScript==
// @name         Twitter to Scrapbox
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Export selected tweets to Scrapbox format
// @author       You
// @match        https://twitter.com/*
// @grant        none
// ==/UserScript==

(function () {
  ("use strict");

  const ACCOUNT_SELECTOR = '[href^="/"]';
  const CONTENT_SELECTOR = "[lang]";
  const TWEET_LINK_SELECTOR = '[href*="/status/"]';
  const IMAGE_SELECTOR = ".css-9pa8cd";
  const LINK_CARD_SELECTOR = '[data-testid="card.layoutSmall.detail"]';

  function extractAndFormatImages(tweet) {
    const imageElements = Array.from(
      tweet.querySelectorAll(IMAGE_SELECTOR)
    ).slice(1);
    const imageUrls = imageElements
      .map((img) => `[${img.getAttribute("src")}#.png]`)
      .join(" ");

    return imageUrls;
  }

  function extractLinkTitle(tweet) {
    const linkElement = tweet.querySelector(LINK_CARD_SELECTOR);
    const linkTitle = linkElement ? linkElement.innerText : "";
    return linkTitle;
  }

  function formatContentWithBlockquote(text) {
    const content = text.trim().split("\n").join("\n> ");
    return content;
  }

  function formatTweets(tweets) {
    return tweets
      .map((tweet) => {
        const account = tweet
          .querySelector(ACCOUNT_SELECTOR)
          .getAttribute("href")
          .substring(1);
        const contentElement = tweet.querySelector(CONTENT_SELECTOR);
        const content = contentElement
          ? formatContentWithBlockquote(contentElement.innerText)
          : "";

        const permalink = tweet.querySelector(TWEET_LINK_SELECTOR);
        const tweetId = permalink.href.split("/status/")[1].split("?")[0];

        const tweetUrl = `https://twitter.com/${account}/status/${tweetId}`;

        const imageUrls = extractAndFormatImages(tweet);
        const linkTitle = formatContentWithBlockquote(extractLinkTitle(tweet));

        return `>[${account} ${tweetUrl}] ${content}${linkTitle}${
          imageUrls ? "\n> " + imageUrls : ""
        }\n`;
      })
      .join("\n");
  }

  function copyToClipboard(text) {
    const el = document.createElement("textarea");
    el.value = text;
    document.body.appendChild(el);
    el.select();
    document.execCommand("copy");
    document.body.removeChild(el);
  }

  function onButtonClick() {
    const selection = window.getSelection();
    let selectedTweets;

    if (selection.isCollapsed) {
      // 選択されていない場合
      selectedTweets = Array.from(
        document.querySelectorAll('[data-testid="tweet"]')
      );
    } else {
      // 選択されている場合
      selectedTweets = Array.from(
        selection
          .getRangeAt(0)
          .cloneContents()
          .querySelectorAll('[data-testid="tweet"]')
      );
    }

    const formattedText = formatTweets(selectedTweets);
    copyToClipboard(formattedText);
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
