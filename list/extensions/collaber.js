import Modal from '/libs/modal/script.js';
import { needsUpgrade } from '/libs/notifier/upgrade.js';

function menuClick(menuItem, data) {
	if(!data.isProject) {
		return showCantCollabModal();
	}

	if(data.isShared) {
		showStopModal();
	} else {
		showAcknowledgementModal();
	}
	
	function showCantCollabModal() {
		const cannotCollabModal = new Modal({
			modalContainerId: 'cannotCollabModal'
			, modalTitleText: `Cannot Collaborate`
			, modalContentsInnerHTML: `
				<div class='modal-description'>
					<p>Collaboration is only allowed inside of a project.</p>
				</div>
			`
			, modalSubmitBtnText : 'OK'
			, modalSubmitBtnAction: () => {
				cannotCollabModal.destroy();
			}
		});
		cannotCollabModal.show();
	}

	function showStopModal() {
		const code = data.collabcode
			, link = `https://${window.qoomStationDomain}/collab/join/${code}`
			, modal = new Modal({
				modalContainerId: 'stopCollabModal',
				modalTitleText: 'Collaboration',
				modalContentsInnerHTML: `<form class="modal-description">
					<div class="form-input">
						<p>Invitation Link</p>
						<div class="input-items"><input type='text' name='invitelink' disabled value='${link}'></div>
					</div>
				</form>`,
				modalSubmitBtnText: 'Copy Link',
				modalSubmitBtnAction: function () {
					const $invitelink = document.querySelector('#stopCollabModal input[name=invitelink]');
					navigator.clipboard.writeText($invitelink.value.trim())
					modal.destroy();
				},
				modalSecondBtnText: 'Stop',
				modalSecondBtnAction: function() {
					stopCollab(code);
					// modal.destroy();
				},
				modalCancelBtnText: 'Cancel',
				modalCancelBtnAction: function() {
					modal.destroy();
				}
			})
		;
	
		modal.show();
		return modal;	
	}
	
	async function showStartModal() {
		const resp = await fetch(`/collab/createinvite`, {
			method: 'POST'
			, headers: {'Content-Type': 'application/json'}
			, body: JSON.stringify({
				folder: data.fullpath
			})
		})
			, json = await resp.json() 
			, { code, link } = json;

			let modal = new Modal({
				modalContainerId: 'startCollabModal',
				modalTitleText:  'Start Collaboration?',
				modalContentsInnerHTML: 
					`<form class="modal-description">
						<div class="form-input">
							<p>Invitation Link</p>
							<div class="input-items"><input type='text' name='invitelink' disabled value='${link}'></div>
						</div>
					</form>
					<p class='collab-msg'>⚠️ <span>Please turn off an ad blocker if it is on.</span> Qoom Collab uses WebSocket technology, which is usually blocked by ad blockers.
					</p>`,
				modalSubmitBtnText: 'Copy Link and Start',
				modalSubmitBtnAction: function (e) {
					join({ code }, (err) => {
						if(err) return alert(err);
						const $invitelink = document.querySelector('#startCollabModal input[name=invitelink]');
						navigator.clipboard.writeText($invitelink.value.trim());
						modal.destroy();	
						location.reload();
					});
				},
				modalCancelBtnText: 'Cancel',
				modalCancelBtnAction: function() {
					modal.destroy();
				}
			})
		;
		modal.show();
		return modal;
	}
	
	function showAcknowledgementModal() {
		const modal = new Modal({
			modalContainerId: 'AcknowledgementModal',
			modalTitleText: 'Join Collab Beta Testing',
			modalContentsInnerHTML: `
				<div class="modal-description">
					<p>Qoom Collaboration feature is a <span class="text-red">BETA</span> version and still in testing. <u>It can be unstable and have a few problems. It may not function properly.</u></p>
					<p>To use Collaboration feature, you need to agree with joining the beta testing. After starting a collaboration session, you will see a green <span style="background-color: var(--color-green); color: var(--text-white-high); border-radius: 4px; padding: 0 4px;">Collab Help Line</span> button. Through that channel, we will provide you with our best support.</p>
					<p>Do you want to join the beta testing?</p>
				</div>
			`,
			modalSubmitBtnText: 'Join Beta Testing',
			modalSubmitBtnAction: showStartModal,
			modalCancelBtnText: 'No',
			modalCancelBtnAction: function() {
				modal.destroy();
			}
		});
		modal.show();
		return modal;
}
	
	async function join(options, cb) {
		let buttons = document.querySelectorAll('#startCollabModal button');
		buttons.forEach(b => {
			b.style.width = `${b.offsetWidth}px`;
			if(b.id === 'submitBtn') b.innerHTML = `<i class="ic-spinner white" style="height: 30px;"></i>`;
			b.disabled = true;
		});
		try {
			const { code } = options
				, resp = await fetch(`/collab/start/${code}`, {
					method: 'POST'
					, headers: {'Content-Type': 'application/json' }
				})
				, json = await resp.json()
				, { error } = json
			;
			if(['exceedsFileCount', 'exceedsDataUsage'].includes(error)) {
				return needsUpgrade(json.resp, ['exceedsFileCount', 'exceedsDataUsage']);
			}
			if(error) {
				buttons.forEach(b => {
					if(b.id === 'submitBtn') b.innerText = `Copy Link and Start`;
					b.disabled = false;
				})
				return cb(error);  
			}
			cb();
		} catch(ex) {
			cb(ex);
		}
	}
	
	async function stopCollab(code) {
		let buttons = document.querySelectorAll('#stopCollabModal button');
		buttons.forEach(b => {
			b.style.width = `${b.offsetWidth}px`;
			if(b.getAttribute('type') === 'Second') b.innerHTML = `<i class="ic-spinner white" style="height: 30px;"></i>`;
			b.disabled = true;
		});
		
		try {
			const resp = await fetch(`/collab/stop/${code}`, {
						method: 'POST'
						, headers: { 'Content-Type': 'application/json' }
						, body: JSON.stringify({})
					})
				, json = await resp.json();
			;
			if(json.error) {
				buttons.forEach(b => {
					if(b.getAttribute('type') === 'Second') b.innerText = `Stop`;
					b.disabled = false;
				})
				throw json.error;
			}
			location.reload();
			
		} catch(ex) {
			console.error(ex);
			//showMessage('There was an error', 'error', 'message')
		}
	}
}

function mutateTableRow(data) {
	if(!data.isOwner) return;
	if(data.isApplet) return;
	if(data.isShared && data.isProject && data.collabcode) data.icons.push('<i class="ic-collab gray-400" style="height: 16px; margin-left: 4px; vertical-align: middle; margin-top: -2px;"></i>');
	if(!data.isFolder) return;
	data.menuIcons.push({
		id: data.id, text: 'collab', className: 'collab', title: 'collab', onclick: menuClick
	});
}

export default { mutateTableRow };