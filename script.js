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
  "use strict";

  const ACCOUNT_SELECTOR = '[href^="/"]';
  const CONTENT_SELECTOR = "[lang]";
  const TWEET_LINK_SELECTOR = '[href*="/status/"]';
  const IMAGE_SELECTOR = ".css-9pa8cd";
  const LINK_CARD_SELECTOR = ".css-4rbku5";
  const LINK_TITLE_SELECTOR = ".css-901oao";

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
    const linkTitleElement = linkElement
      ? linkElement.querySelector(LINK_TITLE_SELECTOR)
      : null;
    const linkTitle = linkTitleElement ? linkTitleElement.innerText : "";

    return linkTitle;
  }

  function formatTweets(tweets) {
    return tweets
      .map((tweet) => {
        const account = tweet
          .querySelector(ACCOUNT_SELECTOR)
          .getAttribute("href")
          .substring(1);
        const content = tweet
          .querySelector(CONTENT_SELECTOR)
          .innerText.split("\n")
          .map((line) => `> ${line}`)
          .join("\n");

        const permalink = tweet.querySelector(TWEET_LINK_SELECTOR);
        const tweetId = permalink.href.split("/status/")[1].split("?")[0];

        const tweetUrl = `https://twitter.com/${account}/status/${tweetId}`;

        const imageUrls = extractAndFormatImages(tweet);
        const linkTitle = extractLinkTitle(tweet);

        return `>[${account} ${tweetUrl}]\n${content}${
          linkTitle ? "\n> " + linkTitle : ""
        }${imageUrls ? "\n" + imageUrls : ""}\n`;
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
    const selectedTweets = Array.from(
      window
        .getSelection()
        .getRangeAt(0)
        .cloneContents()
        .querySelectorAll('[data-testid="tweet"]')
    );
    const formattedText = formatTweets(selectedTweets);
    copyToClipboard(formattedText);
  }

  function addButton() {
    const nav = document.querySelector("nav");
    if (!nav) return;

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
