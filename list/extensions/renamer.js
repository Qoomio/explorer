import Modal from '/libs/modal/script.js';

function menuClick(menuItem, data) {
	function renameFile() {
		let name = renameModal.$modaler.querySelector('input').value; 
		if(!name || !name.trim()) return;
		name = name.replace(/<|>/g, '').replace(/\/+/g, '/').trim();
        window.explorer.fetchAndReload(
            `/explore/move/${data.id}?name=${encodeURIComponent(name)}`
            , {
            	method: 'PATCH', modal: renameModal, reloadUrl: `/explore/list/${name.substring(0, name.lastIndexOf('/'))}`
            }, (ex, resp) => {
            	if(ex) alert(ex);
            	resp.json().then((json) => {
            		if(json.error) alert(json.error);
            	}).catch((ex) => alert(ex));
            }
       );
	}
	function renameFolder() {
		let name = renameModal.$modaler.querySelector('input').value;
		if(!name || !name.trim()) return;
		name = name.replace(/<|>/g, '').replace(/\/+/g, '/').trim();
		window.explorer.fetchAndReload(
			`/explore/movefolder?name=${encodeURIComponent(name)}&folderpath=${encodeURIComponent(data.fullpath)}`
			, {
				method: 'PATCH', modal: renameModal, reloadUrl: `/explore/list/${data.fullpath.substring(0, data.fullpath.lastIndexOf('/'))}`
			}, (ex, resp) => {
				if(ex) alert(ex);
				resp.json().then((json) => {
					if(json.error) alert(json.error);
				}).catch((ex) => alert(ex));
			}
		);
	}
	
	const tempPath = data.isFolder ? data.name : data.fullpath.split('/').reverse().map((p, i) => {
				// if(i) return p;
				// const pos = p.lastIndexOf('.');
				// if(!pos) return p + '_new';
				// return p.substr(0, pos) + '_new' + p.slice(pos) 
				return p;
			}).reverse().join('/')
		, isCollabFolder = data.isFolder && data.collabcode
		, renameModal = new Modal({
			modalContainerId: 'renameModal'
			, modalTitleText: `Rename?`
			, modalContentsInnerHTML: isCollabFolder 
				? `<div class="modal-description"><p>This folder is currently in collaboration mode. Please stop the collaboration before renaming.</p></div>`
				:  `
				<div class="form-input">
					<div class="input-items default"><input type='text' value='${tempPath}' class="code" autofocus></div>
				</div>
			`
			, modalSubmitBtnText: isCollabFolder ? 'Cancel' : 'Rename'
			, modalSubmitBtnAction: function() {
				if(isCollabFolder) return renameModal.destroy();
				let $inputContainer = document.querySelector('#renameModal .form-input')
					, $input = document.querySelector('#renameModal .input-items input')
					, $label = document.createElement('label')
					, name = renameModal.$modaler.querySelector('input').value
					, parsedName = name.split('/').reverse()[0]
				;
				if(!name || !name.trim()) return;
				if((/[^a-zA-Z0-9|_|\-|\(|\)|\{|\}|\[|\]|\.]/i).test(parsedName)) {
					$label.innerText = `A file or folder name can only contain alphanumeric characters, dash - , underscore _ , parenthesis ( ) , curly braces { } , and brackets [ ] , and no space.`;
					$label.style.margin = '4px 0px 8px auto';
					$label.style.color = 'var(--color-red)';
					$label.id = 'errorSpecialCharacter';
					if(!!document.querySelector('#errorSpecialCharacter')) return;
					$inputContainer.appendChild($label);
					$input.addEventListener('focus', () => {
						$inputContainer.removeChild($label);
					});
					return;
				}
				name = name.replace(/<|>/g, '').replace(/\/+/g, '/').trim();
				fetch(`/explore/checkexistence?${data.isFolder ? 'folder' : 'file'}=${encodeURIComponent(data.fullpath)}&name=${encodeURIComponent(name)}`).then(async resp => {
					const json = await resp.json();
					if(json.error) {
						if(json.error  === 'File or Folder already exists') {
							$label.innerText = `This name "${name}" is already taken. Try different name.`;
							$label.id = 'errorExistence';
						} else if(json.error === 'Syntax error on name') {
							$label.innerText = `This name "${name}" has syntax error. Try different name.`;
							$label.id = 'errorSyntax';
						}
						$label.style.margin = '4px 0px 8px auto';
						$label.style.color = 'var(--color-red)';
						if($label.id === 'errorSyntax' && !!document.querySelector('#errorSyntax')) return;
						if($label.id === 'errorExistence' && !!document.querySelector('#errorExistence')) return;
						$inputContainer.appendChild($label);
						$input.addEventListener('focus', () => {
							$inputContainer.removeChild($label);
						});
					}
					if(json.success) {
						if(data.isFolder) return renameFolder();
						renameFile();
					}
				})
			}
			, modalCancelBtnText: isCollabFolder ? '' : 'Cancel'
			, modalCancelBtnAction: function(){
				renameModal.destroy();
			}
		})
	;
	renameModal.show();	

}

function mutateTableRow (data) {
	if(['profile.html', 'home.html', 'planets.json'].includes(data.fullpath)) return;
	if(data.isApplet) return;
	// if(data.isFolder) return;
	if(!data.isOwner) return;
	data.menuIcons.push({
		id: data.id, text: 'rename', className: 'rename', title: 'rename', onclick: menuClick
	});
}

export default { mutateTableRow }