// ==UserScript==
// @name         Twitter(X) to Scrapbox
// @namespace    http://tampermonkey.net/
// @version      0.11
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
  const CONTENT_SELECTOR = "[lang]";
  const TWEET_LINK_SELECTOR = '[href*="/status/"]';
  const IMAGE_SELECTOR = '[data-testid="tweetPhoto"] img';
  const LINK_CARD_SELECTOR = '[data-testid="card.layoutSmall.detail"]';
  const QUOTE_SELECTOR = 'div[role="link"]';

  function findImages(tweet) {
    const text = tweet.querySelector('[data-testid="tweetText"]');
    if (text == null || text.parentNode == null) return [];
    const container1 = text.parentNode.nextElementSibling;
    if (container1 != null) {
      if (container1.querySelectorAll('[data-testid="tweetText"]').length > 0) {
        // it may be retweet
        return [];
      }
      const images1 = Array.from(container1.querySelectorAll(IMAGE_SELECTOR));
      if (images1.length > 0) {
        return images1;
      }
    }
    const container2 = text.parentNode.parentNode.nextElementSibling;
    if (container2 != null) {
      if (container2.querySelectorAll('[data-testid="tweetText"]').length > 0) {
        // it may be retweet
        return [];
      }
      const images2 = Array.from(container2.querySelectorAll(IMAGE_SELECTOR));
      if (images2.length > 0) {
        return images2;
      }
    }
    return [];
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
    const linkElement = tweet.querySelector(LINK_CARD_SELECTOR);
    const linkTitle = linkElement ? linkElement.innerText : "";
    return linkTitle;
  }

  function formatContentWithBlockquote(text) {
    const content = text.trim().split("\n").join("\n> ");
    return content;
  }

  function getAccount(tweet) {
    const accountElement = tweet.querySelector(ACCOUNT_SELECTOR);
    if (accountElement) {
      return accountElement.getAttribute("href").substring(1).split("/")[0];
    }
    const spanElements = tweet.querySelectorAll("span");
    const filteredSpanElements = Array.from(spanElements).filter((span) =>
      span.innerText.startsWith("@")
    );
    if (filteredSpanElements.length > 0) {
      return filteredSpanElements[0].innerText.substring(1);
    }
    return "";
  }

  function getTweetId(tweet) {
    const permalink = tweet.querySelector(TWEET_LINK_SELECTOR);
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
    const contentElement = tweet.querySelector(CONTENT_SELECTOR);
    const content = contentElement
      ? formatContentWithBlockquote(contentElement.innerText)
      : "";

    const tweetId = getTweetId(tweet);

    const imageUrls = extractAndFormatImages(tweet);
    const linkTitle = formatContentWithBlockquote(extractLinkTitle(tweet));
    console.log({ content, linkTitle, imageUrls });

    const quoteTweetElement = tweet.querySelector(QUOTE_SELECTOR);
    let quoteTweet = "";
    if (quoteTweetElement) {
      quoteTweet = "\n> " + formatTweets([quoteTweetElement]);
    }

    return `>${formatAccount(account, tweetId)} ${content}${linkTitle}${
      imageUrls ? "\n> " + imageUrls : ""
    }${quoteTweet}\n`;
  }

  function formatTweets(tweets) {
    return tweets.map(formatTweet).join("\n");
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
      selectedTweets = Array.from(document.querySelectorAll(TWEET_SELECTOR));
    } else {
      // 選択されている場合
      selectedTweets = Array.from(
        selection.getRangeAt(0).cloneContents().querySelectorAll(TWEET_SELECTOR)
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
