let styles = ``;

let $member, $memberDropdown, $style;

function switchMember() {
	const qs = new URLSearchParams(location.search.slice(1))
		, memberId = $memberDropdown.value
		, currentMember = memberId ? members.find(m => m._id === memberId) : false
		, isMe = !currentMember || (currentMember.ship === location.host)
	;
	if(memberId && !isMe) qs.set('member', memberId);
	else qs.delete('member');
	
	const path = `${location.pathname}?${qs.toString()}`;
	window.explorer.navigateToFolder(path);
}

function createItem(creator) {
	const qs = new URLSearchParams(location.search.slice(1))
		, memberId = qs.get('member')
		, currentMember = memberId ? members.find(m => m._id === memberId) : false
	;	
	window.explorer.$create.style.visibility = 
		(currentMember && currentMember.ship !== location.host) ? 'hidden' : 'visible'
}

function createTool(options) {
	
	const qs = new URLSearchParams(location.search.slice(1))
		, memberId = qs.get('member')
		, currentMember = memberId ? members.find(m => m._id === memberId) : false
	;
	
	$member = document.createElement('div');
	$memberDropdown = document.createElement('select');

	$memberDropdown.innerHTML = ''
	$style = document.createElement('style');
	
	window.members.forEach(member => {
		const $option = document.createElement('option');
		$option.innerHTML = member.name;
		$option.value = member._id;
		$memberDropdown.appendChild($option)
	})
	
	$member.appendChild($memberDropdown);
	$style.innerHTML = styles;
	
	window.explorer.$toolboxbDev.appendChild($member);
	document.head.appendChild($style);
	if(memberId) $memberDropdown.value = memberId;
	$memberDropdown.addEventListener('change', switchMember);
	
}

export default { createTool, createItem }