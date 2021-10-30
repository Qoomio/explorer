function mutateTableRow (data) {
	data.isPDF = data.ext === 'pdf';
	data.hrefPath = data.isPDF ? `/pdfedit/${data.fullpath}` : data.hrefPath;
	data.target =  data.isPDF ?  `_blank` : data.target;
}

export default { mutateTableRow }