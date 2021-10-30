import Modal from '/libs/modal/script.js'

function createApplet() {
	const appletModal = new Modal({
		modalContainerId: 'appletModal'
		, modalTitleText: `Create New Applet`
		, modalContentsInnerHTML: `
			<p>Enter an applet name to create</p>
			<p><input type='text' placeholder='applet name'></p>
		`
		, modalSubmitBtnText: 'Create'
		, modalSubmitBtnAction: function() {
			const $input = document.querySelector('#appletModal input')
				, $alertLabel = document.querySelector('#createNewFileModal label')
				, appletName = $input.value ;
			if(!appletName) return;
			
		    if (
		        !/^[0-9A-Za-z_-]+$/.test(!appletName)
		    ){	
		    	$alertLabel.innerText = 'Please enter a valid applet name';
		    	$alertLabel.style.margin = '0 0 0 auto';
		    	$alertLabel.style.color = 'var(--color-red)';
		    	return;
		    }
		    window.explorer.fetchAndReload(`/applet/${appletName}/create`, {
		    	modal: appletModal
		    	, method: 'POST'
		    }, (err) => {
		    	if(err) return alert(err);
		    
		    	const $a = document.querySelector(`a[title='${appletName}']`);
		    	setTimeout(function() {
		    		if($a) $a.click();
		    	}, 2000);
		    	
		    });
		}
		, modalCancelBtnText: 'Cancel'
		, modalCancelBtnAction: function(){
			appletModal.destroy();
		}
	})
	
	appletModal.show();
}

function createItem (creator) {
	if(location.pathname.replace(/\/$/, '') !== '/explore/list') return;
	
	creator.appletbuilder = [
		{ text: 'Create New Applet', icon: 'ic-add', onclick: createApplet }
	]

}

export default { createItem }