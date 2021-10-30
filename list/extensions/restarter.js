let $restartButton, $restart;

function restart() {
	window.explorer.fetchAndReload(
        `/restart/now`
        , {
        	reloadUrl: location.pathname
        }, (ex, resp) => {
        	
        }
   );
}

function createTool(options) {
	$restart = document.createElement('div')
	$restartButton = document.createElement('button');
	$restartButton.innerHTML = 'Restart';
	
	$restart.appendChild($restartButton);
	window.explorer.$toolboxbDev.appendChild($restart);
	
	$restartButton.addEventListener('click', restart);
}

// window.addEventListener('navigatestart', () => {
// 	if(!$clone) return;
// 	$clone.style.display = 'none';
// });

// window.addEventListener('navigateend', () => {
// 	if(!$clone) return;
// 	const qs = new URLSearchParams(location.search.slice(1))
// 		, memberId = qs.get('member')
// 		, currentMember = memberId ? members.find(m => m._id === memberId) : {}
// 		, isOwner = !memberId || (currentMember.ship === location.host)
// 	;
// 	$clone.style.display = isOwner ? 'none' : 'block'
// });

export default { createTool }