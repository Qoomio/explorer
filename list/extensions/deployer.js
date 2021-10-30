import Modal from '/libs/modal/script.js';

const flow = 'deploy_latest_version'; 

let styles = ``;

let $deployer, $deployerDropdown, $deployerButton, $style, socket, log = [], input = {}, $log, $pre, deploying = false;


function addToLog(item) {
	if(!$pre || !$log) return;
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

async function findFilesToUpdate($output, image) {
	const resp = await fetch(`/deploy/files/${image}`)
		, json = await resp.json()
	;
	$output.innerHTML = json.join('\n')
	
}

async function pushImage() {
	const chunchae = $deployerDropdown.value
		, deployModal = new Modal({
			modalContainerId: 'deployModal'
			, modalTitleText: `Deploy to ${chunchae}?`
			, modalContentsInnerHTML: `
			    <div id='deployer_files'>
					<a href='/log/server' target='_blank' style='display:none;'></a>
					<textarea style='height:40vh; width: 100%;margin:0;resize: none;display:block;padding:0.25em;line-height:1.25em;'>Loading New File List...</textarea
				</div>`
			, modalSubmitBtnText: 'Deploy'
			, ignoreEnter: true
			, modalSubmitBtnAction: async function() {
				try {
					const $textarea = document.querySelector('#deployer_files textarea')
						, files = ($textarea.value || '').replace(/,/g, '\n').split('\n').map(d => d.trim()).filter(d => d)
						, resp = await fetch('/deploy/image', {
								method: 'POST'
								, headers: {'Content-Type': 'application/json'}
								, body: JSON.stringify({imageName: chunchae, files })
							})
						, json = await resp.json()
					;
					document.querySelector('#deployer_files a').click();
				} catch(ex) {
					console.log(ex);
				}
				deployModal.destroy();
				
			}
			, modalCancelBtnText: 'Cancel'
			, modalCancelBtnAction: function(){
				deployModal.destroy();
			}
		})
	;
	deployModal.show();	
	findFilesToUpdate(document.querySelector('#deployer_files textarea'), chunchae)
}

async function pushRepo() {
	
	let $newfiles, $changedfiles, $deletedfiles, $message, prdata;
	const prModal = new Modal({
			modalContainerId: 'prModal'
			, modalTitleText: `Would you like to create a PR?`
			, modalContentsInnerHTML: `
				<div>New Files</div>
				<textarea class='newfiles'>Loading...</textarea>
				<div>Changed Files</div>
				<textarea class='changedfiles'>Loading...</textarea>
				<div>Deleted Files</div>
				<textarea class='deletedfiles'>Loading...</textarea>
			    <textarea class='prmessage' placeholder="Please enter a commit message" style="width: 100%;resize: none;border-radius: 3px;border: solid 1px lightgray;height: 200px;padding: 0.5em;font-size: 16px;"></textarea>
			    `
			, modalSubmitBtnText: 'Create'
			, modalSubmitBtnAction: async function() {
				
				const payload = { 
					message: $message.value.trim()
					, new: $newfiles.value.trim().split('\n').map(d => d.trim()).filter(d => d)
					, changed: $changedfiles.value.trim().split('\n').map(d => d.trim()).filter(d => d)
					, deleted: $deletedfiles.value.trim().split('\n').map(d => d.trim()).filter(d => d)
				}
				
				if(!payload.message) 
					return alert('Please provide a commit message');
				
				if(!payload.new.length && !payload.changed.length && !payload.deleted.length)
					return alert('There are no changes to commit');
				
				payload.new = prdata.new.filter(r => payload.new.includes(r.name));
				payload.changed = prdata.changed.filter(r => payload.changed.includes(r.name));
				payload.deleted = prdata.deleted.filter(r => payload.deleted.includes(r.name));
				
				
				const resp = await fetch('/deploy/pr/create', {
					method: 'POST'
					, headers: { 'Content-Type': 'application/json' }
					, body: JSON.stringify(payload)
				})
				prModal.destroy();
			}
			, modalCancelBtnText: 'Cancel'
			, modalCancelBtnAction: function(){
				prModal.destroy();
			}
		})
	;
	prModal.show();	
	
	$newfiles = document.querySelector('#prModal .newfiles')
	$changedfiles = document.querySelector('#prModal .changedfiles')
	$deletedfiles = document.querySelector('#prModal .deletedfiles')
	$message = document.querySelector('#prModal .prmessage')
	
	const resp = await fetch('/deploy/repodiff')
		, json = await resp.json()
	;
	if(!json.diffs) return console.log(json);
	
	[ $newfiles, $changedfiles, $deletedfiles].forEach($el => $el.setAttribute('placeholder', 'No Files'));
	
	$newfiles.value = json.diffs.new.map(f => f.name).join('\n');
	$changedfiles.value = json.diffs.changed.map(f => f.name).join('\n');
	$deletedfiles.value = json.diffs.deleted.map(f => f.name).join('\n');
	prdata= json.diffs;
	
}

async function push() {
	const source =  $deployerDropdown.getAttribute('source')
		, isFirstItem = $deployerDropdown.value.startsWith('--')
	;
	log = [];
	input = {};
	switch (source) {
		case 'chunchae':
			if(isFirstItem) return alert('Please select an image')
			return pushImage();
		case 'repo':
			if(isFirstItem) return alert('Please select a repo')
			return pushRepo();
		default:
			if(isFirstItem) return alert('Please select a dyno')
			const planet = $deployerDropdown.value
				, deployModal = new Modal({
					modalContainerId: 'deployModal'
					, modalTitleText: `Deploy to ${planet}?`
					, modalContentsInnerHTML: `
					    <div id='deployer_log' style='max-height:40vh; overflow:auto;'>
							<pre></pre>
						</div>`
					, modalSubmitBtnText: 'Deploy'
					, modalSubmitBtnAction: async function() {
						if(deploying) return;
						try {
							log = [];
							input = {};
							$log = document.querySelector('#deployer_log');
							$pre = $log.querySelector('pre');
							addToLog('Starting');
							deploying = true;
							const resp = await fetch('/deploy/push', {
										method: 'POST'
										, headers: {'Content-Type': 'application/json'}
										, body: JSON.stringify({flowname: flow, dynoname: planet})
									})
								, json = await resp.json()
							;
							handleWorkIntiation(json);
						} catch(ex) {
							addToLog(ex);
						}
						
					}
					, modalCancelBtnText: 'Cancel'
					, modalCancelBtnAction: function(){
						log = [];
						input = {};
						deployModal.destroy();
					}
				})
			;
			deployModal.show();	
			return;
	}
	


}

async function getPlanets() {
	const resp = await fetch('/deploy/planets')
		, planets = await resp.json()
	;
	planets.forEach(planet => {
		const $option = document.createElement('option');
		$option.innerHTML = planet;
		$option.value = planet;
		$deployerDropdown.appendChild($option);
	})
}

async function getChunchaes() { 
	try {
		const resp = await fetch('/deploy/chunchaes')
			, chunchaes = await resp.json()
		;
		if(chunchaes.pushtorepo) {
			const $option = document.createElement('option');
			$option.innerHTML = `Push to ${chunchaes.name}`;
			$option.value = chunchaes.name;
			$deployerDropdown.appendChild($option);
			$deployerDropdown.setAttribute('source', 'repo');
			return;
		}
		if(!chunchaes.length) return getPlanets();
		chunchaes.forEach(chunchae => {
			const $option = document.createElement('option');
			$option.innerHTML = chunchae.name;
			$option.value = chunchae.image;
			$deployerDropdown.appendChild($option);
		})
		$deployerDropdown.setAttribute('source', 'chunchae');
	} catch(ex) {
		getPlanets();
	}
}

function createTool(options) {
	
	$deployer = document.createElement('div');
	$deployerDropdown = document.createElement('select');
	$deployerButton = document.createElement('button');
	
	$deployerDropdown.innerHTML = '<option>-- Choose Destination --</option>'
	$deployerButton.innerHTML = 'Push';
	$style = document.createElement('style');
	
	$deployer.appendChild($deployerDropdown);
	$deployer.appendChild($deployerButton);
	$style.innerHTML = styles;
	
	window.explorer.$toolboxbDev.appendChild($deployer);
	document.head.appendChild($style);
	$deployerButton.addEventListener('click', push)
	getChunchaes()
}

window.addEventListener('navigatestart', () => {
	if(!$deployer) return;
	$deployer.style.display = 'none';
});

window.addEventListener('navigateend', () => {
	if(!$deployer) return;
	const qs = new URLSearchParams(location.search.slice(1))
		, memberId = qs.get('member')
		, currentMember = memberId ? members.find(m => m._id === memberId) : {}
		, isOwner = !memberId || (currentMember.ship === location.host)
	;
	$deployer.style.display = isOwner ? 'block' : 'none'
})

export default { createTool }