// 選択範囲のツイートを取得する関数
function getSelectedTweets() {
  const selectedRange = window.getSelection().getRangeAt(0);
  const elements = selectedRange
    .cloneContents()
    .querySelectorAll(".css-901oao");
  const tweets = [];

  for (let el of elements) {
    const parent = el.closest('[data-testid="tweet"]');
    if (parent && !tweets.includes(parent)) {
      tweets.push(parent);
    }
  }
  return tweets;
}

const ACCOUNT_SELECTOR = '[href^="/"]';
const CONTENT_SELECTOR = "[lang]";
const TWEET_LINK_SELECTOR = '[href*="/status/"]';
const IMAGE_SELECTOR = ".css-9pa8cd";
const LINK_CARD_SELECTOR = ".css-4rbku5";
const LINK_TITLE_SELECTOR = ".css-901oao";

// 画像を抜き出し、フォーマットする関数
function extractAndFormatImages(tweet) {
  const imageElements = Array.from(
    tweet.querySelectorAll(IMAGE_SELECTOR)
  ).slice(1);
  const imageUrls = imageElements
    .map((img) => `[${img.getAttribute("src")}#.png]`)
    .join(" ");

  return imageUrls;
}

// リンク先のタイトルを取得する関数
function extractLinkTitle(tweet) {
  const linkElement = tweet.querySelector(LINK_CARD_SELECTOR);
  const linkTitleElement = linkElement
    ? linkElement.querySelector(LINK_TITLE_SELECTOR)
    : null;
  const linkTitle = linkTitleElement ? linkTitleElement.innerText : "";

  return linkTitle;
}

// ツイートから必要な情報を取得し、Scrapbox形式に整形する関数
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

      // tweetIdをアカウント名のリンクから抽出
      const permalink = tweet.querySelector(TWEET_LINK_SELECTOR);
      const tweetId = permalink.href.split("/status/")[1].split("?")[0];

      const tweetUrl = `https://twitter.com/${account}/status/${tweetId}`;

      // 画像とリンクを抜き出し、フォーマット
      const imageUrls = extractAndFormatImages(tweet);
      const linkTitle = extractLinkTitle(tweet);

      return `>[${account} ${tweetUrl}]\n${content}${
        linkTitle ? "\n> " + linkTitle : ""
      }${imageUrls ? "\n" + imageUrls : ""}\n`;
    })
    .join("\n");
}

// クリップボードにテキストをコピーする関数
async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    console.log("Copied to clipboard:", text);
  } catch (err) {
    console.error("Failed to copy:", err);
  }
}

(async () => {
  const selectedTweets = getSelectedTweets();
  if (selectedTweets.length === 0) {
    console.warn("No tweets found in the selected range.");
    return;
  }

  const formattedText = formatTweets(selectedTweets);
  await copyToClipboard(formattedText);
})();
