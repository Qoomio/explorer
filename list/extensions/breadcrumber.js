const styles = `
	#breadcrumb {
		min-width:16px;
		min-height:16px;
		padding-left: 8px;
		visibility:visible;
	}
	#breadcrumb.disappear {
		visibility:hidden;
	}
	#breadcrumb ul {
	    list-style: none;
	    margin-top:8px;
	}
	#breadcrumb li {
	    display: inline;
	    font-size: 20px;
	    font-weight: 300;
	    padding-right: 4px;
	    padding-left: 4px;
	}
	#breadcrumb li a:hover {
	    cursor: pointer;
	    text-decoration: underline;
	}
	#breadcrumb li:first-child {
	    padding-left: 0;
	}
	#breadcrumb li:last-child a {
	    color: var(--text-dark-high);
	}
	#breadcrumb li:last-child a:hover {
	    text-decoration: none;
	}
	#breadcrumb a {
		color: var(--text-dark-high);
	}
`

let $breadcrumb, $style;
	
function hideBreadcrumb() {
	$breadcrumb.className = 'disappear';
}

function showBreadcrumb() {
	let explorePath = '/explore/list'
		, qs = new URLSearchParams(location.search.slice(1))
		, memberId = qs.get('member')
		, currentMember = members.find(m => m._id === memberId)
		, origin =  currentMember ? currentMember.ship : location.host
		, pathparts = [origin].concat(decodeURIComponent(location.pathname.replace(explorePath, '')).split('/')).filter(c => c)
	;
	qs.delete('search');
	
	let $lis = pathparts.map((part, i) => {
			if(i) explorePath += part + '/';
			else explorePath = explorePath + '/';
			return `<li><a href="${explorePath}?${qs.toString()}">${i ? part : window.punycode.toUnicode(part)}</a></li>`;
		})
	;
	
	$breadcrumb.innerHTML = `<ul>${$lis.join(' &#47; ')}</ul>`;
	$breadcrumb.className = '';
	
	const $folderLinks = $breadcrumb.querySelectorAll('li > a[href]');
	$folderLinks.forEach(f => {
		f.addEventListener('click', (e) => {
			e.preventDefault();
			window.explorer.navigateToFolder(f.href);
		})
	})	
}

function createTool (options) {
	$breadcrumb = document.createElement('div');
	$style = document.createElement('style');
	
	$breadcrumb.id = 'breadcrumb';
	$style.innerHTML = styles;
	
	document.head.appendChild($style);
	window.explorer.$toolboxa.appendChild($breadcrumb);
	window.addEventListener('navigatestart', hideBreadcrumb);
	window.addEventListener('navigateend', showBreadcrumb);
}

export default { createTool }