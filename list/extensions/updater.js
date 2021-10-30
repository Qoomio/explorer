import Modal from '/libs/modal/script.js';

const updaterHTML = `
	<button id='updater_pull'>Update</button>
	
	<div id='updater_modal' class='modal' style='display:none;'>
		<div id='updater_log' style='max-height:40vh; overflow:auto;'>
			<pre></pre>
		</div>
		<button id='updater_modal_close'>
			Close
		</button>
	</div>`
	
let $update, $updateButton, flow = 'update_latest_version'
;

function update() {
	const updateModal = new Modal({
		modalContainerId: 'updateModal'
		, modalTitleText: `Update`
		, modalContentsInnerHTML: `
			<div id='updater_log' style='max-height:40vh; overflow:auto;'>
				<pre></pre>
			</div>
		`
		, modalSubmitBtnText: 'Update'
		, modalSubmitBtnAction: async function() {
			let $pre = document.querySelector('#updateModal pre')
				, $log = document.querySelector('#updateModal #updater_log')
				, log = []
				, socket
			;
			
			function addToLog(item) {
				log.push(typeof(item) === 'object' ? JSON.stringify(item, null, '\t') : item + '');
				$pre.innerHTML = log.map(l => l.replace(/"/g, '')).join('\n\n');
				$log.scrollTo(0,$log.scrollHeight);
			}
			
			function handleWorkIntiation(workDetails) {
				socket = io(`/work/${workDetails.socketId}`);
				socket.on('workupdate', function(data) {
					if(data.error) return addToLog(data.error);
					if(data.data && data.data.stepName) return addToLog(`${data.message}: ${data.data.stepName}`);
					addToLog(data.message);
				});
			}
			
			$pre.innerHTML = '';
			addToLog('Starting');
			
			const resp = await fetch('/update/pull'
					, {
						method: 'POST'
						, headers: {'Content-Type': 'application/json'}
						, body: JSON.stringify({flowname: flow, version: 'latest'})
					})
				, json = await resp.json()
			;
			handleWorkIntiation(json);
			
		}
		, modalCancelBtnText: 'Cancel'
		, modalCancelBtnAction: function(){
			updateModal.destroy();
		}
	});
	updateModal.show();
}

function createTool(options) {
	
	$update = document.createElement('div');
	
	$updateButton = document.createElement('button');
	$updateButton.innerHTML = 'Update';
	
	$update.appendChild($updateButton);
	window.explorer.$toolboxbDev.appendChild($update);
	
	$updateButton.addEventListener('click', update);
}

window.addEventListener('navigatestart', () => {
	if(!$update) return;
	$update.style.display = 'none';
});

window.addEventListener('navigateend', () => {
	if(!$update) return;
	const qs = new URLSearchParams(location.search.slice(1))
		, memberId = qs.get('member')
		, currentMember = memberId ? members.find(m => m._id === memberId) : {}
		, isOwner = !memberId || (currentMember.ship === location.host)
	;
	$update.style.display = !isOwner ? 'none' : 'block'
});

export default { createTool }