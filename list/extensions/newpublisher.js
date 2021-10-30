import Modal from '/libs/modal/script.js';

function publish(menuItem, data) {
	function showCantPublishModal(message) {
		const cannotPublishModal = new Modal({
			modalContainerId: 'cannotPublishModal'
			, modalTitleText: `Cannot Publish`
			, modalContentsInnerHTML: `
				<div class='modal-description'>
					<p>${message}</p>
				</div>
			`
			, modalSubmitBtnText : 'OK'
			, modalSubmitBtnAction: () => {
				cannotPublishModal.destroy();
			}
		});
		cannotPublishModal.show();
	}

	function goToThePage(folder, fullPath) {
		fetch(`/publish/details?folder=${encodeURIComponent(fullPath)}`).then(async resp => {
			try {
				let json = await resp.json();
				
				if(!Object.keys(json).length) {
					//this means the folder is not published
					location.href = `/publish/newproject?folderPath=${encodeURIComponent(folder)}&fullPath=${encodeURIComponent(fullPath)}&isPublished=false`;
				} else {
					//this means the folder is already published
					location.href = `/publish/newproject?folderPath=${encodeURIComponent(folder)}&fullPath=${encodeURIComponent(fullPath)}&isPublished=true`;
				}
				
			} catch(ex) {
				alert(ex);
			}
		}).catch((ex) => alert(ex));
	}
	
	fetch(`/explore/isprojectfolder?folder=${data.fullpath}`).then(async(resp) => {
		const json = await resp.json();
		if (data.isProject) {
			goToThePage(data.name, data.fullpath);
		} else {
			if(json.isProjectFolder && json.projectName !== data.fullpath) return showCantPublishModal('Cannot publish a folder inside of the project folder.');
			showCantPublishModal('Only a project folder is allowed to publish.');
		}
	})
	
}

async function addMessageToDeleteModal(e) {
	try {
		if(!e || !e.detail || !e.detail.data || !e.detail.data.isFolder) return;
		
		const folder = e.detail.data.fullpath
			, checkPublishStateUrl = `/publish/details?folder=${folder.replace(/^\/|\/$/g, '')}`
			, resp = await fetch(checkPublishStateUrl)
			, json = await resp.json()
		;
		if(!json.link) return;
		
		if(!document.querySelector('#deleteModal .modal-description .error')) {
			const $div = document.querySelector('#deleteModal .modal-description')
			, $p = document.createElement('p')
			;
			$p.className = 'error'
			$p.innerHTML = '<b>WARNING</b>: This will also delete your published project';
			$div.appendChild($p);
		}

	} catch(ex) {
		return false;
	}
}

function mutateTableRow (data) {
	// //todo: temporarily unavailable on explorer
	// return;
	// if(['profile.html', 'home.html', 'planets.json'].includes(data.fullpath)) return;
	// if(!data.isOwner) return;
	// data.menuIcons.push({
	// 	id: data.id
	// 	, text: 'Publish'
	// 	, className: 'new-publisher'
	// 	, title: 'Publish'
	// 	, onclick: publish
	// });
}

window.addEventListener('deleteModalOpened', addMessageToDeleteModal)

export default { mutateTableRow, publish }