// UIのonButtonClickに相当するところをrun()に置き換えた、devtoolで実行しながら開発するためのもの

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
  const avater = queryOwn(tweet, '[data-testid^="UserAvatar-Container-"]')[0]
    ?.attributes["data-testid"];
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
  console.log("account", account);
  const contentElement = queryOwn(tweet, CONTENT_SELECTOR)[0];
  const content = contentElement
    ? formatContentWithBlockquote(contentElement.innerText)
    : "";

  const tweetId = getTweetId(tweet);

  const imageUrls = extractAndFormatImages(tweet);
  const linkTitle = formatContentWithBlockquote(extractLinkTitle(tweet));
  console.log({ content, linkTitle, imageUrls });

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

function getTweets() {
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

  return Array.from(
    selection.getRangeAt(0).cloneContents().querySelectorAll(TWEET_SELECTOR)
  );
}

function run() {
  const selectedTweets = getTweets();
  const formattedText = formatTweets(selectedTweets);
  console.log(formattedText);
}
