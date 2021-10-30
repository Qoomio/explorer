const styles = `
	main #searchActivatedImg {
		display:none;
	}
	main #searchInput {
		width: 100%;
		height: 44px;
		border: 1px solid;
		border-radius: 4px;
		padding: 4px 16px;
		font-size: 18px;
	}
	main #search {
	    width: 220px;
	    transition: width 0.1s;
	    display: flex;
	    flex-wrap: wrap;
	    margin-left: -8px;
	}
	main #search .ic-cancel {
		display:none;
	}
	main #search .search-result-count{
		display:none;
	}
	
	main.search #searchActivatedImg {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		margin-top: 40px;
	}
	main.search #searchActivatedImg i{
		width: 240px;
	    height: 240px;
	}
	main.search #searchActivatedImg .text-search {
	    margin-top: 28px;
	    text-align: center;
	    line-height: 40px;
	    font-size: 20px;
	    color: var(--text-dark-high);
	}
	main.search #searchActivatedImg .subtext-search {
	    text-align: center;
	    line-height: 24px;
	    font-size: 16px;
	    color: var(--text-dark-medium);
	}
	main.search #search {
		width: 100%;
		transition:width 0.1s;
	}
	main.search #search .input-items {
	    width: calc(100% - 50px);
	}
	main.search #search .ic-cancel {
		display: block;
	    align-self: center;
	    width: 32px;
	    height: 32px;
	    margin: 4px 8px;
	    cursor: pointer;
	}
	main.search #search .ic-cancel:hover {
		background-color: var(--color-gray-10);
		border-radius: 4px;
	}
	main.search #toolboxb, 
	main.search #main {
		display:none;
	}
	main.search #breadcrumb {
		margin-bottom: 10px;
	}
	
	main.search.searchresults #searchActivatedImg {
		display:none;
	}
	main.search.searchresults #main {
		display:block;
	}
	main.search.searchresults #search .search-result-count{
	    padding: 10px 5px;
	    display:block;
	}
	main.search.searchresults .highlighted-term {
    	color: var(--color-primary);
	}
	
	main.search #main > table td.table-file > a {
		display:grid;
		grid-template-areas: "i f" "i d";
		grid-template-columns: 48px auto;
	}
	main.search #main > table td.table-file > a > i,
	main.search #main > table td.table-file > a > img {
		grid-area: i;
		width:32px;
		height:32px;
	}
	main.search #main > table td.table-file > a > .fileNameToShow {
		grid-area: f;
		text-align:left;
		padding-top:0px;
	}
	main.search #main > table td.table-file > a > .fileDirectoryToShow {
		grid-area: d;
		text-align:left;
		font-size: 12px;
		color: var(--text-dark-medium);
	}
	
	main.search #main > table td.table-file > a > .fileNameToShow em {
		color:  var(--color-primary);
		padding:0;
		margin:0;
		font-weight:unset;
		font-style:unset;
	}


`;

const html = `
		<div class="input-items default">
			<input type="text" id="searchInput" placeholder="Search">
		</div>
		<i class="ic-cancel"></i>
		<span class="search-result-count"></span>`
	, searchGraphicHtml = `
		<i></i>
		<p class="text-search"></p>
		<p class="subtext-search"></p>`
;

let $search, $style, $searchInput, $searchGraphic, $cancel, $resultCount, $searchGraphicIcon, $searchGraphicTitle, $searchGraphicText, searchTo;

function focusSearch() {
	window.explorer.$main.classList.add('search');
	$searchGraphicIcon.className = 'img-search'
	$searchGraphicTitle.innerHTML = 'Begin typing in Search'
	$searchGraphicText.innerHTML = 'Search for files and folders';
}

function blurSearch(dontSearch) {
	$searchInput.value = '';
	if(dontSearch !== true) search();
	window.explorer.$main.classList.remove('search');
	window.explorer.$main.classList.remove('searchresults');
	$resultCount.innerHTML = ''; 
}

function search() {
	if(searchTo) clearTimeout(searchTo);
	searchTo = setTimeout(function() {
		const qs = new URLSearchParams(location.search.slice(1));
		$searchInput.value = $searchInput.value.replace(/[^a-zA-Z0-9_\-\.\/]/g, '')
		if($searchInput.value) qs.set('search', $searchInput.value);
		else qs.delete('search');
		
		const path = `${location.pathname}?${qs.toString()}`;
		window.explorer.navigateToFolder(path)
	}, 750);
}

function isSearchMode() {
	return window.explorer.$main.classList.contains('search');
}

function showSearchResults() {
	const qs = new URLSearchParams(location.search.slice(1))
		, searchQuery = qs.get('search')
	;
	if(!isSearchMode()) return;

	
	const resultCount = searchQuery ?  window.explorer.$tbody.querySelectorAll('tr').length : 0;
	if(resultCount) $resultCount.innerHTML = `${resultCount} result${resultCount === 1 ? '' : 's'}`;
	
	if(searchQuery && resultCount) window.explorer.$main.classList.add('searchresults');
	else window.explorer.$main.classList.remove('searchresults');
	
	if(searchQuery && !resultCount) {
		$searchGraphicIcon.className = 'img-no-result'
		$searchGraphicTitle.innerHTML = 'No Results Found'
		$searchGraphicText.innerHTML = 'Try a different term';
	} else if(!searchQuery) {
		focusSearch();
	}
	
	const $tableFolders = window.explorer.$tbody.querySelectorAll('td.table-file a[ext=folder]');
	$tableFolders.forEach($tableFolder => {
		$tableFolder.addEventListener('click', e => {
			blurSearch(true)
		});		
	})

}

function createTool (options) {
	const qs = new URLSearchParams(location.search.slice(1))
		, searchQuery = qs.get('search')
	;
	
	$search = document.createElement('div');
	$style = document.createElement('style');
	$searchGraphic = document.createElement('section')
	
	$search.id = 'search';
	$search.innerHTML = html;
	$style.innerHTML = styles;
	
	$searchGraphic.id = 'searchActivatedImg';
	$searchGraphic.innerHTML = searchGraphicHtml;
	
	document.head.appendChild($style);
	window.explorer.$toolboxa.appendChild($search);
	window.explorer.$main.appendChild($searchGraphic);
	
	$searchInput = $search.querySelector('#searchInput');
	$cancel = $search.querySelector('.ic-cancel');
	$resultCount = $search.querySelector('.search-result-count');
	
	$searchGraphicIcon = $searchGraphic.querySelector('i');
	$searchGraphicTitle = $searchGraphic.querySelector('.text-search');
	$searchGraphicText = $searchGraphic.querySelector('.subtext-search');
	
	$searchInput.addEventListener('focus', focusSearch);
	$cancel.addEventListener('click', blurSearch);
	$searchInput.addEventListener('keyup', search);
	window.addEventListener('navigateend', showSearchResults);
	window.addEventListener('keyup', (e) => {
		if(['f', 'F'].includes(e.key) && (e.ctrlKey || e.metaKey)) $searchInput.focus()
	})
	
	if(searchQuery) {
		focusSearch();
		$searchInput.value = searchQuery;
	}
}

function mutateTableRow(item) {
	if(!isSearchMode()) return;
	const qs = new URLSearchParams(location.search.slice(1))
		, searchQuery = qs.get('search')
	;
	if(!searchQuery) return;
	item.displayName = item.name.replace(new RegExp(searchQuery, 'g'), `<em>${searchQuery}</em>` );
	item.directoryInfo = item.fullpath.substr(0, item.fullpath.lastIndexOf('/')) || '/';
	
	if(item.search) {
		qs.delete('search');
		item.search = '?' + qs.toString();
	}
	return item;
}

export default { createTool, mutateTableRow }