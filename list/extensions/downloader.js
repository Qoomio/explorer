import Modal from '/libs/modal/script.js';


function menuClick(menuItem, data) {
	const $a = document.createElement('a');
	$a.href = data.isFolder ? '/migrate/folder/download?folder=' + data.fullpath : '/' + data.fullpath;
	console.log($a.href)
	$a.setAttribute('download', data.name);
	$a.click();
	
	
}

function mutateTableRow (data) {
	data.menuIcons.push({
		id: data.id, text: 'download', className: 'download', title: 'download', onclick: menuClick
	});
}

export default { mutateTableRow }