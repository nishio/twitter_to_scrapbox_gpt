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

// ツイートから必要な情報を取得し、Scrapbox形式に整形する関数
function formatTweets(tweets) {
  return tweets
    .map((tweet) => {
      const account = tweet
        .querySelector('[href^="/"]')
        .getAttribute("href")
        .substring(1);
      const content = tweet
        .querySelector("[lang]")
        .innerText.split("\n")
        .map((line) => `> ${line}`)
        .join("\n");

      // tweetIdをアカウント名のリンクから抽出
      const permalink = tweet.querySelector('[href*="/status/"]');
      const tweetId = permalink.href.split("/status/")[1].split("?")[0];

      const tweetUrl = `https://twitter.com/${account}/status/${tweetId}`;

      // 画像URLを取得
      const imageUrls = Array.from(tweet.querySelectorAll(".css-9pa8cd"))
        .map((img) => img.getAttribute("src"))
        .join(" ");

      return `>[${account} ${tweetUrl}]\n${content}${
        imageUrls ? "\n" + imageUrls : ""
      }\n`;
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
