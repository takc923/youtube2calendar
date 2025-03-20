
function save_options() {
	const calendarId = document.getElementById('calendar_id').value;
	chrome.storage.sync.set({
		calendar_id: calendarId
	}, () => {
		const status = document.getElementById('status');
		status.textContent = '保存しました';
		status.className = 'success';
		setTimeout(() => {
			status.textContent = '';
			status.className = '';
		}, 3000);
	});
}


function restore_options() {
	chrome.storage.sync.get({'calendar_id': ''}, (result) => {
		document.getElementById('calendar_id').value = result.calendar_id;
	});
}

// Initialize the page
document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('save').addEventListener('click', save_options);
