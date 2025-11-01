
function zerofill(num) {
	return ('0' + num).slice(-2);
}

function date2str(date) {

	var str = '';
	str += date.getFullYear();
	str += zerofill(date.getMonth() + 1);
	str += zerofill(date.getDate());
	str += 'T';
	str += zerofill(date.getHours());
	str += zerofill(date.getMinutes());
	str += zerofill(date.getSeconds());

	return str;
}

function calender(title, details, place, start_date, end_date, calender_id = '') {
    var url = 'http://www.google.com/calendar/event?action=TEMPLATE';
    url += '&text=' + encodeURIComponent(title);
    url += '&details=' + encodeURIComponent(details);
    url += '&location=' + encodeURIComponent(place);
    url += '&dates=' + date2str(start_date) + '/' + date2str(end_date);
    url += '&sprop=' + 'Libra694';
    if (calender_id != ''){
        url += '&src=' + encodeURIComponent(calender_id);
    }
    return url
}

function extractVideoId(href) {
	if (!href) return null;
	try {
		var url = new URL(href, location.origin);
		if (url.pathname.indexOf('/live/') === 0) {
			var liveId = url.pathname.split('/').pop();
			return liveId ? liveId.split('?')[0] : null;
		}
		if (url.pathname === '/watch') {
			return url.searchParams.get('v');
		}
	} catch (error) {
		console.error('Failed to parse video URL', href, error);
	}
	if (href.indexOf('/live/') === 0) {
		return href.split('/').pop().split('?')[0];
	}
	var match = href.match(/watch\?v=([^&]+)/);
	if (match) {
		return match[1];
	}
	return null;
}

document.body.addEventListener('click', function (event) {

	if (event.target.className == 'style-scope ytd-toggle-button-renderer style-compact-gray') {

		if ($(event.target.offsetParent).attr('aria-pressed') == 'false') return;

		var videoHref = $(event.target).closest('#dismissible').find('#thumbnail').attr('href');
		var video_id = extractVideoId(videoHref);
	}
	else if (event.target.className == 'ytp-offline-slate-button-text' || event.target.className == 'ytp-offline-slate-button ytp-button') {

		if ($(event.target).text().indexOf('設定') >= 0) return;

		var video_id = extractVideoId(location.href);
	}
	else return;

	if (!video_id) {
		console.error('Failed to extract video id');
		return;
	}

	chrome.runtime.sendMessage(
		{query: 'get_video_data', video_id : video_id},
		(response)=> {
			if (response.error) {
				console.error('Failed to get video data', response.error);
				return;
			}

			var items = response.data && response.data.items;
			if (!items || !items.length || !items[0].snippet) {
				console.error('Video data does not contain snippet', response);
				return;
			}

			var title = items[0].snippet.title;
			var channel = items[0].snippet.channelTitle;
			var date = items[0].liveStreamingDetails && items[0].liveStreamingDetails.scheduledStartTime;
			if (!date) {
				console.error('Scheduled start time is missing', response);
				return;
			}

			var video_url = 'https://www.youtube.com/watch?v=' + video_id;
			var start_date = new Date(date);
			var end_date = new Date(date);
			end_date.setHours(end_date.getHours() + 1);
		
			chrome.runtime.sendMessage(
				{query: 'get_calendar_id'},
				(response) => {
					var calender_url = calender(title, video_url, channel, start_date, end_date, calender_id = response);
					window.open(calender_url);
				}
			);
		}
	);

}, false)
