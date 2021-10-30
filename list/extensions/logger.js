let $logButton, $log;

function createTool(options) {
	$log = document.createElement('div')
	$logButton = document.createElement('a');
	$logButton.innerHTML = '<button>Show Logs</button>';
	$logButton.setAttribute('target', '_blank');
	
	$log.appendChild($logButton);
	window.explorer.$toolboxb.appendChild($log);
	
	$logButton.href = '/log/server'
}

export default { createTool }