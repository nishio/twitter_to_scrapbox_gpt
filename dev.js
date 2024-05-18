// UIのonButtonClickに相当するところをrun()に置き換えた、devtoolで実行しながら開発するためのもの

const TWEET_SELECTOR = '[data-testid="tweet"]';
const ACCOUNT_SELECTOR = '[href^="/"]';
const CONTENT_SELECTOR = "[lang]";
const TWEET_LINK_SELECTOR = '[href*="/status/"]';
const IMAGE_SELECTOR = ".css-9pa8cd";
const LINK_CARD_SELECTOR = '[data-testid="card.layoutSmall.detail"]';
const QUOTE_SELECTOR = 'div[role="link"]';

function extractAndFormatImages(tweet) {
  const imageElements = Array.from(
    tweet.querySelectorAll(IMAGE_SELECTOR)
  ).slice(1);
  const imageUrls = imageElements
    .map((img) => img.getAttribute("src"))
    .filter((src) => !src.startsWith("https://pbs.twimg.com/profile_images"))
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
    return accountElement.getAttribute("href").substring(1);
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
  console.log(permalink);
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
  console.log(tweet);
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

function run() {
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
  console.log(formattedText);
}
