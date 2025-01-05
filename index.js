async function main() {
  if (!process.env.YT_API_KEY) {
    console.error("Please provide a YT_API_KEY");
    process.exit(1);
  }

  const videoId = process.argv[2];

  if (!videoId) {
    console.error("Please provide a video id");
    process.exit(1);
  }

  const playlistUrl = await getPlaylistUrl(videoId);
  console.log(playlistUrl);
}

async function getPlaylistUrl(videoId) {
  const channelId = await getChannelId(videoId);
  const playlistsIds = await getPlaylistsIds(channelId);
  const playlistId = await parallelAsyncFind(playlistsIds, (playlistId) =>
    playlistHasVideo(playlistId, videoId),
  );

  return `https://www.youtube.com/playlist?list=${playlistId}`;
}

async function getPlaylistsIds(channelId) {
  return fetch(
    `https://www.googleapis.com/youtube/v3/playlists?fields=items/id&channelId=${channelId}&key=${process.env.YT_API_KEY}`,
  )
    .then((res) => res.json())
    .then((data) => data.items.map((item) => item.id));
}

async function getChannelId(videoId) {
  return fetch(
    `https://www.googleapis.com/youtube/v3/videos?part=snippet&fields=items/snippet/channelId&id=${videoId}&key=${process.env.YT_API_KEY}`,
  )
    .then((res) => res.json())
    .then((data) => data.items[0].snippet.channelId);
}

async function playlistHasVideo(playlistId, videoId) {
  return fetch(
    `https://www.googleapis.com/youtube/v3/playlistItems?playlistId=${playlistId}&videoId=${videoId}&key=${process.env.YT_API_KEY}`,
  )
    .then((res) => res.json())
    .then((data) => data.items.length > 0);
}

async function parallelAsyncFind(arr, asyncCallback) {
  const results = await Promise.all(arr.map(asyncCallback));
  return arr.find((_, index) => results[index]);
}

main();
