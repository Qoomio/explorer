import Modal from '/libs/modal/script.js';
let dataLimits;

export default function systemalert(fileDataLength) {
	
	
	const exceedLimitAlertModal = new Modal({
		modalContainerId: 'exceedLimitAlertModal'
		, modalTitleText: 'Upgrade'
		, modalContentsInnerHTML: `<div class="modal-description">Your coding space exceeds its limit. Please upgrade your plan to get more data.</div>
			<a href="https://www.qoom.io/pricing" target="_blank">Learn more about Starter plan.</a>
			`
		, modalCancelBtnText: 'Maybe Later'
		, modalCancelBtnAction: function() {
			let $exceedLimitAlertModal = document.getElementById('exceedLimitAlertModal');
			$exceedLimitAlertModal.style.display = 'none';
			document.body.removeChild($exceedLimitAlertModal);
		}
		, modalSubmitBtnText: 'Upgrade'
		, modalSubmitBtnAction: function() {
			//todo: go to accountmanager page's myplan section
		}
	});

	if(dataLimits && location.pathname.startsWith('/edit/')) {
		if(dataLimits.exceedsDataUsage || dataLimits.exceedsFilesAmount || (fileDataLength >= dataLimits.fileSizeLimit && dataLimits.fileSizeLimit !== null)) {
			if(!document.getElementById('exceedLimitAlertModal')) exceedLimitAlertModal.show();
			return true;
		}
		return false;
	}

	fetch('/restrict/checklimits', {
		method: 'GET',
		headers: {
			'Content-Type': 'application/json'
		}
	})
	.then(response => response.json())
	.then(data => {
		console.log('Success:', data);
		dataLimits = data;
		if(dataLimits.exceedsDataUsage || dataLimits.exceedsFilesAmount || (fileDataLength >= dataLimits.fileSizeLimit && dataLimits.fileSizeLimit !== null)) {
			exceedLimitAlertModal.show();
		}
	})
	.catch((error) => {
		console.error('Error:', error);
	});
	
	
}