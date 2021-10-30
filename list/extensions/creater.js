import Modal from '/libs/modal/script.js';
import { needsUpgrade } from '/libs/notifier/upgrade.js';

function createNewFile() {
	const createNewFileModal = new Modal({
		modalContainerId: 'createNewFileModal'
		, modalTitleText: `Create New File`
		, modalContentsInnerHTML: `
			<div class="modal-description">
				<p>Enter a file name to create.</p>
			</div>
			<div class="form-input"> 
				<p class="code">${[location.protocol + '//' + window.punycode.toUnicode(location.hostname),window.getFolderPath(), ''].join('/').replace(/\/\/$/, '/')}</p>
				<div class="input-items default">
					<input type='text' placeholder='File name' class="code">
				</div>
				<label></label>
			<div>
		`
		, modalSubmitBtnText: 'Create'
		, modalSubmitBtnAction: function() {
			const $input = document.querySelector('#createNewFileModal input')
				, ext = $input.value.trim().split(".").reverse()[0].toLowerCase()	
				, filePath = window.getFolderPath()
				, fileName = [filePath, $input.value.trim()]
					.join('/').trim()
					.split('.').reverse().map((p,i) => i ? p : p.toLowerCase())
					.reverse().join('.').replace(/\/+/g, '/').replace(/^\//, '').trim()
				;
			let $alertLabel = document.querySelector('#createNewFileModal label')
				, parsedName = $input.value.split('/').reverse()[0]
			;
			if((/[^a-zA-Z0-9|_|\-|\(|\)|\{|\}|\[|\]|\.]/i).test(parsedName)) {
				$alertLabel.innerText = 'A file or folder name can only contain alphanumeric characters, dash - , underscore _ , parenthesis ( ) , curly braces { } , and brackets [ ] , and no space.';
		    	$alertLabel.style.margin = '4px 0 8px auto';
		    	$alertLabel.style.color = 'var(--color-red)';
				return;
			};
			if(!$input.value.trim()) return;
		    function createOne() {
		    	 fetch(`/explore/checkexistence?file=${encodeURIComponent(fileName)}&name=${encodeURIComponent(fileName)}`)
		    	 .then(async(resp) => {
		    	 	const json = await resp.json();
		    	 	if(json.error) {
		    	 		if(json.error  === 'File or Folder already exists') {
							$alertLabel.innerText = `This name "${$input.value}" is already taken. Try different name.`;
						} else if(json.error === 'Syntax error on name') {
							$alertLabel.innerText = `This name "${$input.value}" has syntax error. Try different name.`;
						}
						$alertLabel.style.margin = '4px 0px 8px auto';
						$alertLabel.style.color = 'var(--color-red)';
						return;
		    	 	}
		    	 	if(json.success) {
		    	 		window.explorer.fetchAndReload(`/save?file=${encodeURIComponent(fileName)}&check=true`, {
					    	modal: createNewFileModal
					    	, method: 'POST'
					    	, clearCache: true
					    }, (err, resp, json) => {
					    	if(json && json.restrictionError) return;
					    	if(err) return alert(err);
					    	const $a = document.querySelector(`a[title='${fileName}']`);
					    	if($a) $a.click();
					    });
		    	 	}
		    	 })
		    }
		    
		    if(ext === 'html') {
		    	fetch(`/restrict/checklimits`).then(async (resp) => {
		    		const json = await resp.json();
		    		json.currentFileCount += 1;
		    		if(!!json.fileCountLimit && json.currentFileCount > json.fileCountLimit) json.exceedsFileCount = true;
		    		if(needsUpgrade(json, ['exceedsFileCount', 'exceedsDataUsage'])) return;
		    		createOne();
		    	});
		    } else if (
		        !ext ||
		        !contentTypes[ext] ||
		        /\.api$|\.app$|\.schemas$/.test(fileName.toLowerCase())
		    ){	
		    	$alertLabel.innerText = 'Please enter a valid file extension';
		    	$alertLabel.style.margin = '4px 0 8px auto';
		    	$alertLabel.style.color = 'var(--color-red)';
		    	return;
		    } else {
		    	createOne();
		    }
		}
		, modalCancelBtnText: 'Cancel'
		, modalCancelBtnAction: function(){
			createNewFileModal.destroy();
		}
	})
	
	createNewFileModal.show();
}

function createNewFolder() {
	const createNewFolderModal = new Modal({
		modalContainerId: 'createNewFolderModal'
		, modalTitleText: `Create New Folder`
		, modalContentsInnerHTML: `
			<div class="modal-description">
				<p>Enter a folder name to create.</p>
			</div>
			<div class="form-input">
				<p class="code">${[location.protocol + '//' + window.punycode.toUnicode(location.hostname),window.getFolderPath(), ''].join('/').replace(/\/\/$/, '/')}</p>
				<div class="input-items default">
					<input type='text' placeholder='folder name' class="code">
				</div>
				<label></label>
			<div>
		`
		, modalSubmitBtnText: 'Create'
		, modalSubmitBtnAction: function() {
			const $input = document.querySelector('#createNewFolderModal input')
				, ext = $input.value.trim().split(".").reverse()[0].toLowerCase()
				, filePath = window.getFolderPath()
				, folderPath = [filePath, $input.value.trim()].join('/').trim()
			;
			let parsedName = $input.value.split('/').reverse()[0]
				, $alertLabel = document.querySelector('#createNewFolderModal label')
			;
			if((/[^a-zA-Z0-9|_|\-|\(|\)|\{|\}|\[|\]|\.]/i).test(parsedName)) {
				$alertLabel.innerText = 'A file or folder name can only contain alphanumeric characters, dash - , underscore _ , parenthesis ( ) , curly braces { } , and brackets [ ] , and no space.';
		    	$alertLabel.style.margin = '4px 0 8px auto';
		    	$alertLabel.style.color = 'var(--color-red)';
				return;
			}
			if(!$input.value.trim()) return;
			fetch(`/explore/checkexistence?folder=${encodeURIComponent(folderPath)}&name=${encodeURIComponent($input.value)}`).then(async resp => {
				const json = await resp.json();
				if(json.error) {
					if(json.error  === 'File or Folder already exists') {
						$alertLabel.innerText = `This name "${$input.value}" is already taken. Try different name.`;
					} else if(json.error === 'Syntax error on name') {
						$alertLabel.innerText = `This name "${$input.value}" has syntax error. Try different name.`;
					}
					$alertLabel.style.margin = '4px 0px 8px auto';
					$alertLabel.style.color = 'var(--color-red)';
					return;
				}
				if(json.success) {
					window.explorer.fetchAndReload(`/save?file=${encodeURIComponent(folderPath + '/').replace(/\/+/g, '/').trim()}&check=true`, {
				    	modal: createNewFolderModal
				    	, method: 'POST'
				    	, headers: {
					      'Accept': 'application/json',
					      'Content-Type': 'application/json'
					    },
					    body: JSON.stringify({
			                file: folderPath  + '/',
			                domain: location.host,
			                allowBlank: true,
			                data: "",
			                title: undefined,
			                updateFile: true,
			                backup: true,
			            })
				    }, (err, resp, json) => {
				    	if(json && json.restrictionError) return;
				    	if(err) return alert(err);
				    	const $a = document.querySelector(`a[title='${folderPath}']`);
				    	if($a) $a.click();
				    });	
				}
			})
		}
		, modalCancelBtnText: 'Cancel'
		, modalCancelBtnAction: function(){
			createNewFolderModal.destroy();
		}
	})
	
	createNewFolderModal.show();
}


function createItem (creator) {
	creator.creater = [
		{ text: 'File', icon: 'ic-new-file', onclick: createNewFile  }
		, { text: 'Folder', icon: 'ic-new-folder', onclick: createNewFolder  }
	]

}

export default { createItem }