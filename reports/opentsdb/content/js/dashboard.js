/*
   Licensed to the Apache Software Foundation (ASF) under one or more
   contributor license agreements.  See the NOTICE file distributed with
   this work for additional information regarding copyright ownership.
   The ASF licenses this file to You under the Apache License, Version 2.0
   (the "License"); you may not use this file except in compliance with
   the License.  You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/
var showControllersOnly = false;
var seriesFilter = "";
var filtersOnlySampleSeries = true;

/*
 * Add header in statistics table to group metrics by category
 * format
 *
 */
function summaryTableHeader(header) {
    var newRow = header.insertRow(-1);
    newRow.className = "tablesorter-no-sort";
    var cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Requests";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 3;
    cell.innerHTML = "Executions";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 6;
    cell.innerHTML = "Response Times (ms)";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Throughput";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 2;
    cell.innerHTML = "Network (KB/sec)";
    newRow.appendChild(cell);
}

/*
 * Populates the table identified by id parameter with the specified data and
 * format
 *
 */
function createTable(table, info, formatter, defaultSorts, seriesIndex, headerCreator) {
    var tableRef = table[0];

    // Create header and populate it with data.titles array
    var header = tableRef.createTHead();

    // Call callback is available
    if(headerCreator) {
        headerCreator(header);
    }

    var newRow = header.insertRow(-1);
    for (var index = 0; index < info.titles.length; index++) {
        var cell = document.createElement('th');
        cell.innerHTML = info.titles[index];
        newRow.appendChild(cell);
    }

    var tBody;

    // Create overall body if defined
    if(info.overall){
        tBody = document.createElement('tbody');
        tBody.className = "tablesorter-no-sort";
        tableRef.appendChild(tBody);
        var newRow = tBody.insertRow(-1);
        var data = info.overall.data;
        for(var index=0;index < data.length; index++){
            var cell = newRow.insertCell(-1);
            cell.innerHTML = formatter ? formatter(index, data[index]): data[index];
        }
    }

    // Create regular body
    tBody = document.createElement('tbody');
    tableRef.appendChild(tBody);

    var regexp;
    if(seriesFilter) {
        regexp = new RegExp(seriesFilter, 'i');
    }
    // Populate body with data.items array
    for(var index=0; index < info.items.length; index++){
        var item = info.items[index];
        if((!regexp || filtersOnlySampleSeries && !info.supportsControllersDiscrimination || regexp.test(item.data[seriesIndex]))
                &&
                (!showControllersOnly || !info.supportsControllersDiscrimination || item.isController)){
            if(item.data.length > 0) {
                var newRow = tBody.insertRow(-1);
                for(var col=0; col < item.data.length; col++){
                    var cell = newRow.insertCell(-1);
                    cell.innerHTML = formatter ? formatter(col, item.data[col]) : item.data[col];
                }
            }
        }
    }

    // Add support of columns sort
    table.tablesorter({sortList : defaultSorts});
}

$(document).ready(function() {

    // Customize table sorter default options
    $.extend( $.tablesorter.defaults, {
        theme: 'blue',
        cssInfoBlock: "tablesorter-no-sort",
        widthFixed: true,
        widgets: ['zebra']
    });

    var data = {"OkPercent": 96.95340501792114, "KoPercent": 3.046594982078853};
    var dataset = [
        {
            "label" : "KO",
            "data" : data.KoPercent,
            "color" : "#FF6347"
        },
        {
            "label" : "OK",
            "data" : data.OkPercent,
            "color" : "#9ACD32"
        }];
    $.plot($("#flot-requests-summary"), dataset, {
        series : {
            pie : {
                show : true,
                radius : 1,
                label : {
                    show : true,
                    radius : 3 / 4,
                    formatter : function(label, series) {
                        return '<div style="font-size:8pt;text-align:center;padding:2px;color:white;">'
                            + label
                            + '<br/>'
                            + Math.round10(series.percent, -2)
                            + '%</div>';
                    },
                    background : {
                        opacity : 0.5,
                        color : '#000'
                    }
                }
            }
        },
        legend : {
            show : true
        }
    });

    // Creates APDEX table
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.8794361148972689, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.0, 500, 1500, "read 1k"], "isController": false}, {"data": [0.96742, 500, 1500, "write 25k"], "isController": false}, {"data": [0.5555555555555556, 500, 1500, "cleanup"], "isController": false}, {"data": [0.0, 500, 1500, "read 100"], "isController": false}, {"data": [0.0, 500, 1500, "read 2500"], "isController": false}, {"data": [0.959, 500, 1500, "write 1k"], "isController": false}, {"data": [0.9687, 500, 1500, "write 10k"], "isController": false}]}, function(index, item){
        switch(index){
            case 0:
                item = item.toFixed(3);
                break;
            case 1:
            case 2:
                item = formatDuration(item);
                break;
        }
        return item;
    }, [[0, 0]], 3);

    // Create statistics table
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 39618, 1207, 3.046594982078853, 3256.397294159217, 1, 185304, 11614.800000000003, 32340.95, 54057.74000000004, 105.61054346058597, 1874.9734469174934, 1101.94275055447], "isController": false}, "titles": ["Label", "#Samples", "KO", "Error %", "Average", "Min", "Max", "90th pct", "95th pct", "99th pct", "Transactions\/s", "Received", "Sent"], "items": [{"data": ["read 1k", 1000, 545, 54.5, 41495.14599999998, 5978, 86316, 77350.09999999999, 81458.9, 84862.81, 11.549344574695386, 576.0134211504592, 2.0236278837269737], "isController": false}, {"data": ["write 25k", 25000, 18, 0.072, 162.04696000000007, 1, 961, 137.0, 510.9500000000007, 529.0, 598.071816463721, 116.47668230126072, 6850.42908382126], "isController": false}, {"data": ["cleanup", 18, 0, 0.0, 1209.0, 384, 2832, 2822.1, 2832.0, 2832.0, 0.8268259072117593, 107.65284975022968, 0.2221825476573266], "isController": false}, {"data": ["read 100", 100, 0, 0.0, 11830.839999999998, 4249, 18376, 18203.9, 18277.75, 18375.829999999998, 5.186721991701245, 53.078349893023855, 1.9967866636410787], "isController": false}, {"data": ["read 2500", 2500, 644, 25.76, 32192.3832, 5591, 185304, 53110.4, 62182.1, 126908.93999999983, 13.454821400700727, 3461.261766451547, 3.846538974244781], "isController": false}, {"data": ["write 1k", 1000, 0, 0.0, 170.35099999999983, 123, 616, 458.0999999999923, 516.0, 594.9300000000001, 388.9537145079736, 75.24583090237262, 4458.358022778101], "isController": false}, {"data": ["write 10k", 10000, 0, 0.0, 160.94729999999993, 122, 554, 137.0, 510.0, 530.0, 578.4024524263983, 111.88472439123142, 6629.915008730261], "isController": false}]}, function(index, item){
        switch(index){
            // Errors pct
            case 3:
                item = item.toFixed(2) + '%';
                break;
            // Mean
            case 4:
            // Mean
            case 7:
            // Percentile 1
            case 8:
            // Percentile 2
            case 9:
            // Percentile 3
            case 10:
            // Throughput
            case 11:
            // Kbytes/s
            case 12:
            // Sent Kbytes/s
                item = item.toFixed(2);
                break;
        }
        return item;
    }, [[0, 0]], 0, summaryTableHeader);

    // Create error table
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["Non HTTP response code: java.net.SocketException\/Non HTTP response message: Operation timed out", 769, 63.71168185584093, 1.9410369024180927], "isController": false}, {"data": ["Non HTTP response code: org.apache.http.NoHttpResponseException\/Non HTTP response message: 35.171.169.92:80 failed to respond", 18, 1.4913007456503728, 0.04543389368468878], "isController": false}, {"data": ["Non HTTP response code: org.apache.http.conn.HttpHostConnectException\/Non HTTP response message: Connect to 35.171.169.92:80 [\\\/35.171.169.92] failed: Operation timed out", 420, 34.7970173985087, 1.0601241859760715], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 39618, 1207, "Non HTTP response code: java.net.SocketException\/Non HTTP response message: Operation timed out", 769, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException\/Non HTTP response message: Connect to 35.171.169.92:80 [\\\/35.171.169.92] failed: Operation timed out", 420, "Non HTTP response code: org.apache.http.NoHttpResponseException\/Non HTTP response message: 35.171.169.92:80 failed to respond", 18, null, null, null, null], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": ["read 1k", 1000, 545, "Non HTTP response code: java.net.SocketException\/Non HTTP response message: Operation timed out", 471, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException\/Non HTTP response message: Connect to 35.171.169.92:80 [\\\/35.171.169.92] failed: Operation timed out", 74, null, null, null, null, null, null], "isController": false}, {"data": ["write 25k", 25000, 18, "Non HTTP response code: org.apache.http.NoHttpResponseException\/Non HTTP response message: 35.171.169.92:80 failed to respond", 18, null, null, null, null, null, null, null, null], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["read 2500", 2500, 644, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException\/Non HTTP response message: Connect to 35.171.169.92:80 [\\\/35.171.169.92] failed: Operation timed out", 346, "Non HTTP response code: java.net.SocketException\/Non HTTP response message: Operation timed out", 298, null, null, null, null, null, null], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
