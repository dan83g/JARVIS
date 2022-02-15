export function json2table(json: any, id: string, classes: string): string {
	var cols = Object.keys(json[0]);
	
	var headerRow = '';
	var bodyRows = '';
	
	classes = classes || '';
  
	function capitalizeFirstLetter(string) {
		return string.charAt(0).toUpperCase() + string.slice(1);
	}
  
	cols.map(function(col) {
		headerRow += '<th>' + capitalizeFirstLetter(col) + '</th>';
	});
  
	json.map(function(row) {
		bodyRows += '<tr>';
  
		cols.map(function(colName) {
			if  (!row[colName]){
				row[colName]=''
			}
			bodyRows += '<td>' + row[colName].toString().replace(/(?:\\[rn]|[\r\n]+)+/g,"<br>") + '</td>';
		})
  
		bodyRows += '</tr>';
	});
  
	return '<table id="' +
		  id +
		  '" class="' +
		  classes +
		  '"><thead><tr>' +
		  headerRow +
		  '</tr></thead><tbody>' +
		  bodyRows +
		  '</tbody></table>';
}