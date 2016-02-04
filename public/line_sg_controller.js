define(function (require) {

  var d3 = require('d3');
  var c3 = require('./bower_components/c3');
  var moment = require('./bower_components/moment/moment');
  var module = require('ui/modules').get('kibana/line_sg', ['kibana']);

  module.controller('KbnLineVisController', function ($scope, $element, $window, Private) {

    var tabifyAggResponse = Private(require('ui/agg_response/tabify/tabify'));

    $scope.$root.editorLine = {}; 
    $scope.$root.editorLine.axisy = ["y","y2"];
    $scope.$root.editorLine.group = ["none","grouped"];
    $scope.$root.editorLine.typeOptions = ["line","bar","spline","step","area","area-step","area-spline"];
    $scope.$root.editorLine.typeformat = ["Time","Percent","Second","Octet","Euro"];
    $scope.$root.editorLine.gridpos = ["start","middle","end"];
    $scope.$root.editorLine.gridcolor = {"black":"gridblack","grey":"gridgrey","blue":"gridblue","green":"gridgreen","red":"gridred","yellow":"gridyellow"};

    var fty = [];
    fty[0] = { format: function (d) { return moment((d-3600)*1000).format("HH:mm"); }};
    fty[1] = { format: function (d) { var formatValue = d3.format(".3s"); return formatValue(d) + "%"; }};
    fty[2] = { format: function (d) { var formatValue = d3.format(".3s"); return formatValue(d) + "s"; }};
    fty[3] = { format: function (d) { var formatValue = d3.format(".3s"); return formatValue(d) + "o"; }};
    fty[4] = { format: function (d) { var formatValue = d3.format(",.0f"); return formatValue(d) + "€"; }};

    var metrics = $scope.metrics = [];
    var label = [];
    var group = [];
    var idchart = "";
    var hold ="";
    var wold= "";
    moment.locale('fr');

    $scope.chart = null;
    $scope.showGraph = function() {
	console.log("----chart generator----");
        idchart = $element.children().find(".chartc3");
        var config = {};
        config.bindto = idchart[0];
        config.data = {};
        config.data.x = 'data0'; 
        config.data.columns = metrics;
	config.data.names = $scope.vis.params.configLine.names;
        config.data.types = $scope.vis.params.configLine.type;
	config.data.groups = ( $scope.vis.params.configLinegrouped != "none" ) ? [group] : "";
        config.data.colors = $scope.vis.params.configLine.colors;
        config.data.axes = $scope.vis.params.configLine.axisy;
        config.axis = {};
        config.axis.x = {type: 'timeseries', tick: {format: ( typeof $scope.vis.params.configLine.formatx != "undefined" ) ? $scope.vis.params.configLine.formatx : "%d-%m-%Y" }};
        config.axis.y = {tick: ( typeof $scope.vis.params.configLine.formaty != "undefined" ) ? fty[$scope.vis.params.configLine.formaty] : "{}" };
        config.axis.y.min = ( typeof $scope.vis.params.configLine.rangeminy != "undefined" ) ? $scope.vis.params.configLine.rangeminy : "";
        config.axis.y.max = ( typeof $scope.vis.params.configLine.rangemaxy != "undefined" ) ? $scope.vis.params.configLine.rangemaxy : "";
        config.axis.y2 = {show: $scope.vis.params.configLine.enableY2, tick: ( typeof $scope.vis.params.configLine.formaty2 != "undefined" ) ? fty[$scope.vis.params.configLine.formaty2] : "{}" };
        config.axis.y2.min = ( typeof $scope.vis.params.configLine.rangeminy2 != "undefined" ) ? $scope.vis.params.configLine.rangeminy2 : "";
        config.axis.y2.max = ( typeof $scope.vis.params.configLine.rangemaxy2 != "undefined" ) ? $scope.vis.params.configLine.rangemaxy2 : "";
	config.grid = {};
	config.grid.y = ( typeof $scope.vis.params.configLine.gridyval != "undefined" ) ? {lines: [{value: $scope.vis.params.configLine.gridyval, text: $scope.vis.params.configLine.gridytxt, position: $scope.vis.params.configLine.gridypos, class: $scope.vis.params.configLine.gridycolor}]} : {};
       $scope.chart = c3.generate(config);
//       var h = $(idchart[0]).closest('div.visualize-chart').height();
//       var w = $(idchart[0]).closest('div.visualize-chart').width();
//       $scope.chart.resize({height: h - 50, width: w - 50});
    }

    $scope.processTableGroups = function (tableGroups) {
      var label = [];
      tableGroups.tables.forEach(function (table) {
        table.columns.forEach(function (column, i) {
                var tmp = [];
		var data = table.rows;
		if (i < 1){
			tmp.push('data0');
		} else {
			tmp.push(column.title);
			label[(i - 1)] = column.title;
			group.push(column.title);
		}
		for (var key in data) {
          		tmp.push(data[key][i]);
		};
		metrics.push(tmp);
	});
      });
      $scope.$root.editorLine.label = label;
    };

    $scope.$watch('esResponse', function (resp) {
      if (resp) {
        metrics.length = 0;
        $scope.processTableGroups(tabifyAggResponse($scope.vis, resp));
        $scope.showGraph();
      }
    });

    $scope.$watch(
         function () {
	   var elem = $(idchart[0]).closest('div.visualize-chart');
           var h = elem.height();
           var w = elem.width();
	   if (idchart.length > 0 && h > 0 && w > 0) {
		   if (hold != h || wold != w) {
	            	 $scope.chart.resize({height: h - 50, width: w - 50});
	           	 hold = elem.height();
	          	 wold = elem.width();
		   }
           }      
         }, 
         true
    );

  })
});
