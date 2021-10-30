function setHome(menuItem, data) {
	//SET THE FILE AS HOME PAGE BY USING FETCH
	fetch(`/registration/sethomepage?file=${data.fullpath}`)
	.then(async resp => {
		try {
			let json = await resp.json();
			if(json.success) {
				window.explorer.fetchAndReload(location.pathname, {
					clearCache: true
				}, (ex) => {
					if(ex) alert(ex);
				});
			} else {
				
			}
		} catch(ex) {
			alert(ex);
		}
	}).catch((ex) => alert(ex));
}

function mutateTableRow (data){
	if(!data.isOwner) return;
	data.isHTML = data.ext === 'html';
	if(data.isHTML) data.menuIcons.push({
		id: data.id
		, text: 'Set as Home Page'
		, className: data.isHome ? 'home-page disabled' : 'set-home-page'
		, title: 'homepage'
		, onclick: data.isHome ? () => {} : setHome
	})
}

export default { mutateTableRow };