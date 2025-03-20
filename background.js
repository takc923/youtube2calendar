function getAuthToken() {
  return new Promise((resolve, reject) => {
    chrome.identity.getAuthToken({interactive: true}, (token) => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
        return;
      }

      if (!token) {
        reject(new Error('Failed to get auth token'));
        return;
      }

      resolve(token);
    });
  });
}

chrome.runtime.onMessage.addListener(
  function (request, sender, sendResponse) {
    switch (request.query) {
      case 'get_calendar_id':
        chrome.storage.sync.get({'calendar_id': ''}, (result) => sendResponse(result.calendar_id));
        break;
      case 'get_video_data':
        (async () => {
          try {
            const token = await getAuthToken();
            let videoId = encodeURIComponent(request.video_id);
            let url = `https://www.googleapis.com/youtube/v3/videos?id=${videoId}&part=snippet,liveStreamingDetails`;

            const response = await fetch(url, {headers: {'Authorization': `Bearer ${token}`}});

            if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            sendResponse({data: data});
          } catch (error) {
            console.error('Error fetching video data:', error);
            sendResponse({error: error.message});
          }
        })();
        break;
      default:
        console.log('unknown request');
        console.log(request);
        break;
    }
    return true;
  }
);
