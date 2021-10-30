import Modal from '/libs/modal/script.js';
import { needsUpgrade } from '/libs/notifier/upgrade.js';

const styles=`
	main #newProject {
		position:relative;
	}
	
	main #newProject .ic-folder-project {
		width: 28px;
		height: 28px;
		margin-right: 4px;
		margin-top: -1px;
	}
	
	#projectselector {
		display:none;
		position:absolute;
		top:10px;
		right:20px;
		background:white;
		border-radius:2px;
		box-shadow: 3px 3px 4px 1px #ccc;
		z-index:10;
		padding: 10px;
		width: 240px;
	}
	
	#projectselector li {
		padding:5px;
	}
	
	#projectselector li:hover {
		background-color:var(--color-blue-50);
		cursor:pointer;
	}
`;

const html = `
	<div id='newProject'>
		<button class='qoom-main-btn qoom-button-outline qoom-button-small'>
			<i class='ic-folder-project primary-100'></i>
			<span>New Project</span>
		</button>
		<div id='projectselector'>
			<ul>
				<li type='frontend' title='Web'>HTML, CSS, JS</li>
				<li type='discordjs' title='Discord.js'>Discord bot - NodeJS</li>
				<li type='discordpy' title='Discord.py'>Discord bot - Python</li>
			</ul>
		</div>
	</div>
`;

let $newprojectbulder;

function createProject(options) {
	const { title, type } = options
		, projectModal = new Modal({
			modalContainerId: 'projectModal'
			, modalTitleText: `Create a New ${title} Project`
			, modalContentsInnerHTML: `
				<div class='form-input'>
					<div class='input-items default'>
						<input type='text' placeholder='Name your project'>
					</div>
					<label></label>
				</div>
			`
			, modalSubmitBtnText: 'Create'
			, modalSubmitBtnAction: () => {
				const $input = document.querySelector('#projectModal input')
					, $alertLabel = document.querySelector('#projectModal label')
					, projectName = $input.value.trim()
					, filePath = window.getFolderPath()
					, folderPath = [filePath, $input.value.trim()].join('/').trim()
				;
				if(!projectName) return;
				if(!/^[0-9A-Za-z%_-]+$/.test(projectName)) {
					$alertLabel.innerText = 'A project folder name can only contain alphanumeric characters, dash - , underscore _ , parenthesis ( ) , curly braces { } , and brackets [ ] , and no space.';
					$alertLabel.style.margin = '8px 0 0 auto';
		    		$alertLabel.style.color = 'var(--color-red)';
		    		$input.addEventListener('click', () => {
		    			$alertLabel.innerText = '';
		    		});
		    		return;
				}
				//check the projectname already exists or not
				fetch(`/explore/checkexistence?folder=${encodeURIComponent(folderPath)}&name=${encodeURIComponent(projectName)}`).then(async resp => {
					const json = await resp.json();
					if(json.error === 'File or Folder already exists') {
						$alertLabel.innerText = 'This name already exists.';
				    	$alertLabel.style.margin = '8px 0 0 auto';
				    	$alertLabel.style.color = 'var(--color-red)';
				    	$input.addEventListener('click', () => {
				    		$alertLabel.innerText = '';
				    	});
				    	return;
					}
					window.explorer.fetchAndReload(`/applet/${encodeURIComponent(projectName)}/createproject`, {
						modal: projectModal
						, method: 'POST'
						, headers: {
					      'Accept': 'application/json',
					      'Content-Type': 'application/json'
					    }
						, body: JSON.stringify({
							folderPath, type
						})
						, clearCache: true
					}, (err) => {
						if(err) return alert(err);
						setTimeout(() => {
							const $a = document.querySelector(`a[title="${filePath ? filePath +
							'/' + projectName : projectName }"]`);
							if($a) $a.click();
							window.open(`${location.origin}/edit${filePath ? '/' + filePath : ''}/${encodeURIComponent(projectName)}/index.html`, '_blank');
						}, 250);
					});
				})
			}
			, modalCancelBtnText: 'Cancel'
			, modalCancelBtnAction: () => {
				projectModal.destroy();
			}
		})
	;
	
	projectModal.show();
}

function createTool(options) {
	
	$newprojectbulder = document.createElement('div');
	let $style = document.createElement('style')
	;
	$newprojectbulder.innerHTML = html;
	$style.innerHTML = styles;
	
	let $projectSelector = document.querySelector('#projectselector')
	document.head.appendChild($style);
	document.getElementById('create').insertAdjacentHTML('afterend', html);
	document.querySelector('#newProject button').addEventListener('click', (e) => {
		if(needsUpgrade(window.limits, ['exceedsFileCount', 'exceedsDataUsage'])) return;
		if(window.configs && !window.configs.backend) {
			createProject({ title: 'Web', type: 'frontend' });
			return;
		}
		if(!$projectSelector) {
			$projectSelector =  document.querySelector('#projectselector');
			$projectSelector.querySelectorAll('li').forEach($li => {
				$li.addEventListener('click', (e) => {
					const title = $li.getAttribute('title')
						, type = $li.getAttribute('type')
					;
					createProject({ title, type });
				})
			})
		}
		
		$projectSelector.style.display = 'block';
		e.stopPropagation()
		
	});
	document.getElementById('newProject').style.display = 'none';
	document.body.addEventListener('click', (e) => {
		if(!$projectSelector) return;
		$projectSelector.style.display = null;
	})
	
}

window.addEventListener('navigatestart', async () => {
	if(!$newprojectbulder) return;
	document.querySelector('#newProject').style.display = 'none';
});

window.addEventListener('navigateend', async () => {
	if(!$newprojectbulder) return;
	const qs = new URLSearchParams(location.search.slice(1))
		, memberId = qs.get('member')
		, currentMember = memberId ? members.find(m => m._id === memberId) : {}
		, isOwner = !memberId || (currentMember.ship === location.host)
		, hide = window.isProjectFolder
	document.querySelector('#newProject').style.display = isOwner && !hide ? 'block' : 'none';
})

export default { createTool };