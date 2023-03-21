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
      const author = tweet.querySelector(".css-901oao").innerText;
      const content = tweet
        .querySelector("[lang]")
        .innerText.replace(/\n/g, " ");
      const timestamp = tweet.querySelector("time").getAttribute("datetime");
      return `[${timestamp}] ${author}: ${content}`;
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
