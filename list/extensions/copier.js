import Modal from '/libs/modal/script.js';

function menuClick(menuItem, data) {
	function copyFile(name) {
		window.explorer.fetchAndReload(`/explore/copy/${data.id}?name=${encodeURIComponent(name)}`
	        , {
	        	method: 'POST', modal: copyModal, reloadUrl: `/explore/list/${name.substring(0, name.lastIndexOf('/'))}`
	        }, (ex, resp) => {
	        	if(ex) alert(ex);
	        	resp.json().then((json) => {
	        		if(json.error) alert(json.error);
	        	}).catch((ex) => alert(ex));
	        }
	   );
	}
	
	function copyFolder(name) {
		window.explorer.fetchAndReload(`/explore/copyfolder?name=${encodeURIComponent(name)}&folderpath=${data.fullpath}`
			, {
				method: 'POST', modal: copyModal, reloadUrl: `/explore/list/${name}`
			}, (ex, resp) => {
				if(ex) alert(ex);
				resp.json().then((json) => {
					if(json.error) alert(json.error);
				}).catch((ex) => alert(ex));
			}
		);
	}
	
	const tempPath = data.isFolder 
			? data.fullpath + '_copy'
			: data.fullpath.split('/').reverse().map((p, i) => {
				if(i) return p;
				const pos = p.lastIndexOf('.');
				if(!pos) return p + '_copy';
				return p.substr(0, pos) + '_copy' + p.slice(pos) 
			}).reverse().join('/')
		, copyModal = new Modal({
			modalContainerId: 'copyModal'
			, modalTitleText: `Duplicate`
			, modalContentsInnerHTML: `
				<div class="modal-description">
					<p>Enter a file name</p>
				</div>
				<div class="form-input">
					<div class="input-items default">
						<input type='text' value='${tempPath}' class="code" autofocus>
					</div>
				</div>
			`
			, modalSubmitBtnText: 'Confirm'
			, modalSubmitBtnAction: function() {
				let $inputContainer = document.querySelector('#copyModal .form-input')
					, $input = document.querySelector('#copyModal .input-items input')
					, name = copyModal.$modaler.querySelector('input').value.trim()
					, parsedName = name.split('/').reverse()[0]
					, $label = document.createElement('label')
				;
				if((/[^a-zA-Z0-9|_|\-|\(|\)|\{|\}|\[|\]|\.]/i).test(parsedName)) {
					$label.innerText = `A file or folder name can only contain alphanumeric characters, dash - , underscore _ , parenthesis ( ) , curly braces { } , and brackets [ ] , and no space.`;
					$label.style.margin = '4px 0px 8px auto';
					$label.style.color = 'var(--color-red)';
					$label.id = 'specialCharacterError';
					if(!document.querySelector('#copyModal #specialCharacterError')) $inputContainer.appendChild($label);
					$input.addEventListener('focus', () => {
						$inputContainer.removeChild($label);
					});
					return;
				}
				if(!name || !name.trim()) return;
				name = name.replace(/\/+/g, '/').trim();
	            fetch(`/explore/checkexistence?${data.isFolder ? 'folder' : 'file'}=${data.fullpath}&name=${encodeURIComponent(name)}&copy=true`).then(async (resp) => {
	            	const json = await resp.json();
	            	
	            	if(json.error) {
            			$label.style.margin = '4px 0px 8px auto';
						$label.style.color = 'var(--color-red)';
						if(json.error  === 'File or Folder already exists') {
							$label.innerText = `This name "${name}" is already taken. Try different name.`;
							$label.id = 'duplicateError';
							if(!document.querySelector('#copyModal #duplicateError')) $inputContainer.appendChild($label);
						} else if(json.error === 'Syntax error on name') {
							$label.innerText = `This name "${name}" has syntax error. Try different name.`;
							$label.id = 'syntaxError';
							if(!document.querySelector('#copyModal #syntaxError')) $inputContainer.appendChild($label);
						}
						
						
						$input.addEventListener('focus', () => {
							$inputContainer.removeChild($label);
						});
	            	}
	            	if(json.success) {
	            		if(data.isFolder) return copyFolder(name);
	            		copyFile(name);
	            	}
	            })
			}
			, modalCancelBtnText: 'Cancel'
			, modalCancelBtnAction: function(){
				copyModal.destroy();
			}
		})
	;
	
	copyModal.show();	
}

function mutateTableRow (data) {
	if(data.isApplet) return;
	if(!data.isOwner) return;
	data.menuIcons.push({
		id: data.id, text: 'Duplicate', className: 'copy', title: 'copy', onclick: menuClick
	});
}

export default { mutateTableRow }