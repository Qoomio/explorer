function mutateTableRow (data){
	data.hrefPath = data.isImage ? `/imageedit/${data.fullpath}` : data.hrefPath;
	data.target =  data.isImage ? `_blank` : data.target;
}

export default { mutateTableRow }