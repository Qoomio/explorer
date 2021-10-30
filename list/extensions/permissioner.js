import Modal from '/libs/modal/script.js';


function menuClick(menuItem, data) {
	const permissionsModal = new Modal({
			modalContainerId: 'permissionsModal'
			, modalTitleText: `Change Privacy`
			, modalContentsInnerHTML: `
				<div class="modal-description">
					<p>Who can see this file/folder?</p>
				</div>
				<form>
					<div style="margin-bottom: 0.5rem;">
						<input type='radio' name='permissions' value='public'>
						<label>
							<b>Public</b>
							<div style='padding-left:24px;'>Anyone with the file link can view this file or files in this folder.</div>
						</label>
					</div>
					<div style="margin-bottom: 0.5rem;">
						<input type='radio' name='permissions' value='private'>
						<label>
							<b>Private</b>
							<div style='padding-left:24px;'>Only you can view or edit this file or files in this folder.</div>
						</label>
					</div>
				</form>
			`
			, modalCancelBtnText: 'Cancel'
			, modalCancelBtnAction: function(){
				permissionsModal.destroy();
			}
		})
	;
	if(data.isOwner) {
		permissionsModal.modalSubmitBtnText = 'Save'
		permissionsModal.modalSubmitBtnAction = function() { 
			const permission = form.elements.permissions.value
				, isPrivate = permission === 'private'
				, url = data.isFolder 
					? `/explore/permissions/${isPrivate}?folder=${encodeURIComponent(data.fullpath)}` 
					: `/explore/${data.id}/permissions/${isPrivate}`
			;
			window.explorer.fetchAndReload(
	            url
	            , {
	            	method: 'PATCH', modal: permissionsModal, reloadUrl: location.href
	            }, (ex, resp) => {
	            	if(ex) alert(ex);
	            	resp.json().then((json) => {
	            		if(json.error) alert(json.error);
	            	}).catch((ex) => alert(ex));
	            }
	       );
		}
	}
	permissionsModal.show();
	
	const form = document.querySelector('#permissionsModal form');
	form.elements.permissions.value = data.isPrivate ? 'private' : 'public';
	if(!data.isOwner) {
		const ins = document.querySelectorAll('#permissionsModal form input');
		ins.forEach(i => i.setAttribute('disabled', 'disabled'))
	}
}

function mutateTableRow (data) {
	if(data.isPrivate) data.icons.push('<i class="ic-lock gray-400" style="height: 16px; margin-left: 4px; vertical-align: middle; margin-top: -2px;"></i>')
	if(!data.isOwner) return;
	data.menuIcons.push({
		id: data.id, text: 'Change Privacy', className: 'permissions', title: 'permissions', onclick: menuClick
	});
}

export default { mutateTableRow }