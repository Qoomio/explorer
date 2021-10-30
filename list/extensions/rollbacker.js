import Modal from '/libs/modal/script.js';


function showRollbackPreview(fileaId, filebId) {
	const $a = document.createElement('a');
	$a.href = `/diff/${fileaId}/${filebId}`;
	$a.setAttribute('target', '_blank');
	$a.click();
}

function rollback(rollbackId) {
	restfull.patch({
		path: '/rollback/' + rollbackId
		, loadDivs: document.querySelectorAll('.rollback-modal')
	}, function(err, data) {
		if(err) return alert(err.error || err);
		closeRollbackModal()
	})
}


async function menuClick(menuItem, data) {
	let $rollbackItems, $container;
    const rollbackModal = new Modal({
		modalContainerId: 'rollbackModal'
		, modalTitleText: `Rollback?`
		, modalContentsInnerHTML: `
			<div class='rollback-modal-container'>
				<form>
					<select class='rollback-items' name='rollback' multiple>
						Loading...
					</select>			
				</form>
			</div>			
		`
		, modalSubmitBtnText: 'Rollback'
		, modalSubmitBtnAction: function() {
			const itemToRollbackTo = $rollbackItems.value;
			if(!itemToRollbackTo) return;
	        window.explorer.fetchAndReload(
	        	`/rollback/${itemToRollbackTo}`
	        , {
	        	method: 'PATCH', modal: rollbackModal, reloadUrl: location.pathname + location.search
	        }, (ex, resp) => {
		    	if(ex) return alert(ex);
	        });
		}
		, modalCancelBtnText: 'Cancel'
		, modalCancelBtnAction: function(){
			rollbackModal.destroy();
		}
		, modalSecondBtnText: 'Preview'
		, modalSecondBtnAction: function(){
			showRollbackPreview(data.id, $rollbackItems.value)
		}
	})
	
	rollbackModal.show();
	$container = document.querySelector('#rollbackModal .rollback-modal-container');
	$rollbackItems = document.querySelector('#rollbackModal .rollback-items');
	try {
		const resp = await fetch('/rollback/history/' + data.id)
			, json = await resp.json()
		;
		let now = new Date()
			, backups = json.backups.map(b => {
	            let d = new Date(b.dateUpdated);
	            return b;
	        })
	    	, options = backups.map(item => `<option value='${item._id}'>${new Date(item.dateUpdated).toLocaleString()}</option>`).join('\n')
	    ;
	    $rollbackItems.innerHTML = options;
        	
	} catch(ex) {
		
		$container.innerHTML = `<pre>${ex}</pre>`
	}
}

function mutateTableRow (data) {
	if(data.isOther || !data.isText || !data.id || !data.isOwner) return;
	data.menuIcons.push({
		id: data.id, text: 'rollback', className: 'rollback', title: 'rollback', onclick: menuClick
	});
}

export default { mutateTableRow }