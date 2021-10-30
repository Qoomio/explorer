import Modal from '/libs/modal/script.js';


const styles = `
	#mergeModal .modal {
		min-width:32rem;
		width:unset
	}
	
	#mergeModal iframe {
		width:80vw;
		height:80vh;
	}
`

function menuClick(menuItem, data) {
	
    const qs = new URLSearchParams(location.search)
    	, memberId = qs.get('member')
    	, member = memberId && members.find(m => m._id === memberId)
    	, sourceDb = member && member.db
    	, qss = sourceDb ? `?sourceDb=${sourceDb}` : ''
    	, mergeModal = new Modal({
			modalContainerId: 'mergeModal'
			, modalTitleText: `Merge?`
			, modalContentsInnerHTML: `
				<iframe src='/merge/from/${data.source || data.id}/to/${data.destination || data.ownerId}${qss}'></iframe>
			`
			, modalCancelBtnText: 'Cancel'
			, modalCancelBtnAction: function(){
				mergeModal.destroy();
		}
	})
	
	mergeModal.show();
}

function mutateTableRow (data) {
	if(data.isFolder) return;
	if(data.isOwner) return;
	
	data.menuIcons.push({
		id: data.id, text: 'merge', className: 'merge', title: 'merge', onclick: menuClick
	});
}

function createTool() {
	const $style = document.createElement('style');
	$style.innerHTML = styles;
	
	document.head.appendChild($style);
}

window.addEventListener("ClonerOpenMerger", (e) => {
	const { destination, source } = e.detail
		, data = { destination, source }
	;
	menuClick(null, data);
});

export default { mutateTableRow, createTool }