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
    cell.colSpan = 7;
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

    var data = {"OkPercent": 60.73790002644803, "KoPercent": 39.26209997355197};
    var dataset = [
        {
            "label" : "FAIL",
            "data" : data.KoPercent,
            "color" : "#FF6347"
        },
        {
            "label" : "PASS",
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.06149166887066913, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.0, 500, 1500, "Homepage"], "isController": false}, {"data": [0.04669703872437358, 500, 1500, "Careers-1"], "isController": false}, {"data": [0.3735763097949886, 500, 1500, "Careers-0"], "isController": false}, {"data": [0.013333333333333334, 500, 1500, "Careers"], "isController": false}, {"data": [0.044794188861985475, 500, 1500, "About us-1"], "isController": false}, {"data": [0.22094430992736078, 500, 1500, "About us-0"], "isController": false}, {"data": [0.0, 500, 1500, "Homepage-1"], "isController": false}, {"data": [0.05075187969924812, 500, 1500, "Homepage-0"], "isController": false}, {"data": [0.018333333333333333, 500, 1500, "About us"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 7562, 2969, 39.26209997355197, 21038.72216344885, 9, 112015, 21029.0, 34398.7, 54808.0, 111125.0, 51.94394834455282, 1601.1094764261916, 7.60253705007556], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["Homepage", 1500, 1234, 82.26666666666667, 31071.87599999998, 2884, 111662, 21075.0, 99099.0, 111122.0, 111613.0, 13.412736734803369, 210.41277906875368, 0.6132135575942915], "isController": false}, {"data": ["Careers-1", 439, 0, 0.0, 11628.93621867882, 227, 23803, 12266.0, 16719.0, 17794.0, 20721.2, 3.597593955386557, 266.75226520628803, 0.6710355912879222], "isController": false}, {"data": ["Careers-0", 439, 0, 0.0, 12275.198177676531, 9, 65478, 12304.0, 24805.0, 44547.0, 57990.600000000035, 3.9335155234980506, 2.957635536602303, 0.7336928369024684], "isController": false}, {"data": ["Careers", 1500, 1061, 70.73333333333333, 29598.366000000013, 257, 112015, 21058.0, 62093.9, 64425.0, 100001.0, 11.477278813708462, 273.09675334084454, 1.2530707698576051], "isController": false}, {"data": ["About us-1", 826, 0, 0.0, 11737.391041162231, 14, 24436, 12764.5, 19150.9, 20398.949999999997, 22165.800000000003, 6.317931145258875, 450.2965175368482, 1.227801072174332], "isController": false}, {"data": ["About us-0", 826, 0, 0.0, 8924.01452784503, 9, 47891, 9096.0, 15867.1, 19860.449999999997, 25534.390000000007, 6.334404404941756, 4.886579483930092, 1.2310024185384858], "isController": false}, {"data": ["Homepage-1", 266, 0, 0.0, 10977.308270676698, 2441, 18644, 11606.5, 15305.0, 16213.749999999998, 17655.90999999999, 3.2580471314487287, 245.53712229312623, 0.41998263803831265], "isController": false}, {"data": ["Homepage-0", 266, 0, 0.0, 17029.477443609023, 169, 61887, 15693.5, 32155.400000000005, 34955.55, 54708.079999999834, 4.190956357334174, 2.6193477233338585, 0.5402404679376084], "isController": false}, {"data": ["About us", 1500, 674, 44.93333333333333, 22052.941999999985, 25, 92364, 21059.5, 31724.600000000013, 34539.0, 45167.0, 10.557952601831454, 431.2161898064727, 2.259704298142504], "isController": false}]}, function(index, item){
        switch(index){
            // Errors pct
            case 3:
                item = item.toFixed(2) + '%';
                break;
            // Mean
            case 4:
            // Mean
            case 7:
            // Median
            case 8:
            // Percentile 1
            case 9:
            // Percentile 2
            case 10:
            // Percentile 3
            case 11:
            // Throughput
            case 12:
            // Kbytes/s
            case 13:
            // Sent Kbytes/s
                item = item.toFixed(2);
                break;
        }
        return item;
    }, [[0, 0]], 0, summaryTableHeader);

    // Create error table
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 699, 23.543280565847088, 9.243586352816715], "isController": false}, {"data": ["Non HTTP response code: java.net.SocketException/Non HTTP response message: Unrecognized Windows Sockets error: 0: recv failed", 65, 2.1892893230043784, 0.8595609627082782], "isController": false}, {"data": ["Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to www.nationalfertilizers.com:80 [www.nationalfertilizers.com/125.18.250.23] failed: Connection timed out: connect", 1785, 60.12125294712024, 23.60486643745041], "isController": false}, {"data": ["Non HTTP response code: java.net.SocketTimeoutException/Non HTTP response message: Read timed out", 420, 14.146177164028293, 5.554086220576567], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 7562, 2969, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to www.nationalfertilizers.com:80 [www.nationalfertilizers.com/125.18.250.23] failed: Connection timed out: connect", 1785, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 699, "Non HTTP response code: java.net.SocketTimeoutException/Non HTTP response message: Read timed out", 420, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Unrecognized Windows Sockets error: 0: recv failed", 65, null, null], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": ["Homepage", 1500, 1234, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to www.nationalfertilizers.com:80 [www.nationalfertilizers.com/125.18.250.23] failed: Connection timed out: connect", 882, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 245, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Unrecognized Windows Sockets error: 0: recv failed", 65, "Non HTTP response code: java.net.SocketTimeoutException/Non HTTP response message: Read timed out", 42, null, null], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["Careers", 1500, 1061, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to www.nationalfertilizers.com:80 [www.nationalfertilizers.com/125.18.250.23] failed: Connection timed out: connect", 641, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 302, "Non HTTP response code: java.net.SocketTimeoutException/Non HTTP response message: Read timed out", 118, null, null, null, null], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["About us", 1500, 674, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to www.nationalfertilizers.com:80 [www.nationalfertilizers.com/125.18.250.23] failed: Connection timed out: connect", 262, "Non HTTP response code: java.net.SocketTimeoutException/Non HTTP response message: Read timed out", 260, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 152, null, null, null, null], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
