import { injectClonerUiWindow } from "/libs/cloner/clonerui/clonerui-inject.js";

let styles = ``;

let $clone, $cloneButton, $style;

function findMemberDb(_id) {
	if(!window.members || !window.members.length) return 'registerDb';
	const member = window.members.find(m => m._id === _id);
	if(!member || !member.db) return 'registerDb'
	return member.db;
}

function clone() {
	const qs = new URLSearchParams(location.search.slice(1))
		, member = qs.get('member') || 'self'
		, version = qs.get('version') || 'latest'
		, applet = location.pathname.split('/')[3] || 'all'
		, folder = ('/' + window.getFolderPath()).replace(/\/$/, '')
		, db = findMemberDb(member)
	;

    window.dispatchEvent(
        new CustomEvent("startClone", {
            detail: { folder, member, version, db },
        })
    );
}

function createTool(options) {
	
	$clone = document.createElement('div');
	$style = document.createElement('style');
	
	$cloneButton = document.createElement('button');
	$cloneButton.innerHTML = 'Clone';
	$style.innerHTML = styles;
	
	$clone.appendChild($cloneButton);
	window.explorer.$toolboxbDev.appendChild($clone);
	document.head.appendChild($style);
	
	$cloneButton.addEventListener('click', clone);
}

window.addEventListener("startClone", (e) => {
	const { folder, member, version, db } = e.detail;
	injectClonerUiWindow(document.body, folder, member, version, db);
});

window.addEventListener('navigatestart', () => {
	if(!$clone) return;
	$clone.style.display = 'none';
});

window.addEventListener('navigateend', () => {
	if(!$clone) return;
	const qs = new URLSearchParams(location.search.slice(1))
		, memberId = qs.get('member')
		, currentMember = memberId ? members.find(m => m._id === memberId) : {}
		, isOwner = !memberId || (currentMember.ship === location.host)
	;
	$clone.style.display = isOwner ? 'none' : 'block'
});

export default { createTool }