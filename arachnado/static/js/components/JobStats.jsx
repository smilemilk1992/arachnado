/* A widget for displaying crawl stats */
var React = require("react");
var Reflux = require("reflux");
var filesize = require("filesize");
var { Table } = require("react-bootstrap");
var { KeyValueTable } = require("./KeyValueTable.jsx");

var JobListStore = require("../stores/JobListStore");

var range = (top) => Array.from(new Array(top), (_,i) => i);

var _response_status_count_keys = [
    200, 201, 202, 203, 204, 205, 206, 207, 226,
    300, 301, 302, 303, 304, 305, 306, 307,
    400, 401, 402, 403, 404, 405, 406, 407, 408, 409, 410, 411, 412, 413, 414, 415, 416, 417, 418,
    422, 423, 424, 425, 426, 428, 429, 431, 434, 449, 451, 456, 499,
    500, 501, 502, 503, 504, 505, 506, 507, 508, 509, 510, 511
].map(status => 'downloader/response_status_count/' + status);

var _request_depth_keys = range(20).map(i => 'request_depth_count/' + i);

var SUM_KEYS = [
    'downloader/request_bytes',
    'downloader/request_count',
    'downloader/request_method_count/GET',
    'downloader/request_method_count/POST',
    'downloader/request_method_count/PUT',
    'downloader/request_method_count/HEAD',
    'downloader/request_method_count/DELETE',
    'downloader/request_method_count/TRACE',
    'downloader/request_method_count/CONNECT',
    'downloader/request_method_count/OPTIONS',
    'downloader/response_bytes',
    'downloader/response_count',
].concat(_response_status_count_keys).concat([
    'downloader/exception_count',
    'downloader/exception_type_count/twisted.internet.error.DNSLookupError',
    'downloader/exception_type_count/twisted.internet.error.ConnectionRefusedError',
    'dupefilter/filtered',
    'item_scraped_count',
    'log_count/DEBUG',
    'log_count/INFO',
    'log_count/WARNING',
    'log_count/ERROR',
    'response_received_count',
    'scheduler/dequeued',
    'scheduler/dequeued/memory',
    'scheduler/enqueued',
    'scheduler/enqueued/memory'
]).concat(_request_depth_keys);


var SHORT_NAMES = {
    'downloader/exception_type_count/twisted.internet.error.DNSLookupError': 'downloader/DNS errors',
    'downloader/exception_type_count/twisted.internet.error.ConnectionRefusedError': 'downloader/Connection Refused',
};


export var AggregateJobStats = React.createClass({
    mixins: [Reflux.connect(JobListStore.store, "jobs")],
    render: function () {
        var stats = this.getAggregateStats();
        var rows = Object.keys(stats).map(key => {
            var value = stats[key];
            if (value == 0){
                return "";
            }
            if (/_bytes$/.test(key)){
                value = filesize(value);
            }
            var shortKey = SHORT_NAMES[key] || key;
            return (
                <tr key={key}>
                    <td>{shortKey}</td>
                    <td>{value}</td>
                </tr>
            );
        }).filter(item => item != "");
        if (rows.length == 0){
            return <p>Nothing to show.</p>
        }
        return <KeyValueTable>{rows}</KeyValueTable>;
    },

    getAggregateStats: function () {
        var stats = {};
        SUM_KEYS.forEach(key => {stats[key] = 0});

        this.state.jobs.forEach(job => {
            SUM_KEYS.forEach(key => {
                stats[key] += job.stats[key] || 0;
            });
        });
        return stats;
    }
});
