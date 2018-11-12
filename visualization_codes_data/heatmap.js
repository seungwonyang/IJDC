var resSchools = ["CUNY","UCLA","UNC","Rutgers"];

var classesNumber = 10,
    cellSize = 24;
	rowSize = 18;

function heatmap_display(url,refUrl, heatmapId, paletteName) {

	var tooltip = d3.select(heatmapId)
			        .append("div")
			        .style("position", "absolute")
			        .style("visibility", "hidden");

    function zoom() {
    	svg.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
    }
    var zoomListener = d3.behavior.zoom().scaleExtent([0.1, 3]).on("zoom", zoom);

    var viewerWidth = $(heatmapId).width();
    var viewerHeight = $(heatmapId).height();
    var viewerPosTop = 100;
    var viewerPosLeft = 150;

    var     axisMargin = 20,
            margin = 20,
            valueMargin = 4,
            width = $('.histoView').width(),
    		height = $('.histoView').height(),
            barHeight = 10,
            barPadding = 12,
            data, histosvg, scale, xAxis, labelWidth = 0;

    var colors = colorbrewer[paletteName][classesNumber];
    var svg;
    var topicIdRef = {};
    
    d3.csv(refUrl,function(error,data){
    	for(var ij=0; ij < data.length; ij++){
    		topicIdRef[data[ij]["topicId"]] = data[ij]["inferred topic"];
    	}
    	d3.csv(url,function(error,data){
        	var csvData = {};
        	var rows =  d3.set(data.map(function( item ) { return item.term; } )).values();
        	var columns = d3.set(data.map(function( item ) { return item.program_name; } )).values();
        	var values = data.map(function( item ) { return item.tfidf; } );
        	
        	var cellData = [];
        	for(var i=0; i<rows.length; i++){
        		cellData[i] = [];
        	}
        	
        	for(var i=0; i<cellData.length; i++){
        		for(j=0; j<columns.length; j++){
        			cellData[i][j]=0;
        		}
        	}
        	
        	for(var i=0; i<data.length; i++){
        		cellData[rows.indexOf(data[i].term)][columns.indexOf(data[i].program_name)] = data[i].tfidf;
        	}
        	
        	csvData["data"] = cellData;
        	csvData["columns"] = columns;
        	csvData["index"] = rows;
        	
        	var trmsObj = { };
        	for (var i = 0; i < data.length; i++) {
        		trmsObj[data[i].term] = Number(trmsObj[data[i].term] || 0) + Number(data[i].tfidf);
        	}
        	var histoData = [];
        	for(var key in trmsObj){
        		 if (trmsObj.hasOwnProperty(key)) {
        			 var obj = {};
        				obj["label"] = key;
        				obj["value"] = trmsObj[key];
        				histoData.push(obj);
        		}
        	}
        	
        	var max = d3.max(histoData, function(d) { return d.value; });
        	var min = d3.min(histoData, function(d) { return d.value; });
        	
            var arr = csvData.data;
            var row_number = arr.length;
            var col_number = arr[0].length;

            var colorScale = d3.scale.quantize()
                .domain([0.0, 1.0])
                .range(colors);
            
            var radiusScale = d3.scale.linear()
            		.domain([0, d3.max(values)])
            		.range([0, (rowSize * 0.45)]);

            svg = d3.select(heatmapId).append("svg")
                .attr("width", viewerWidth)
                .attr("height", viewerHeight)
                //.call(zoomListener)
                .append("g")
                .attr("transform", "translate(" + viewerPosLeft + "," + viewerPosTop + ")");

            svg.append('defs')
                .append('pattern')
                .attr('id', 'diagonalHatch')
                .attr('patternUnits', 'userSpaceOnUse')
                .attr('width', 4)
                .attr('height', 4)
                .append('path')
                .attr('d', 'M-1,1 l2,-2 M0,4 l4,-4 M3,5 l2,-2')
                .attr('stroke', '#000000')
                .attr('stroke-width', 1);

            var rowSortOrder = false;
            var colSortOrder = false;
            
            var rowGridLine = svg.append("g")
            	.attr("class","rowGridLines")
            	.selectAll(".rowLines")
            	.data(csvData.index)
            	.enter().append("line")
            	.attr("class","rowLine")
            	.attr("row",function(d,i){
            		return i;
            	})
            	.attr("x1",function(d,i){
            		return (cellSize/2);
            	})
            	.attr("x2",function(d,i){
            		return ((csvData.columns.length) * cellSize) - (cellSize/2);
            	})
            	.attr("y1",function(d,i){
            		return (i * rowSize) + (rowSize/2);
            	})
            	.attr("y2",function(d,i){
            		return (i * rowSize)+ (rowSize/2);
            	})
            	.style("stroke","gray")
            	.style("stroke-width","0.5px");
            
            var colGridLine = svg.append("g")
        	.attr("class","colGridLines")
        	.selectAll(".coLines")
        	.data(csvData.columns)
        	.enter().append("line")
        	.attr("class","colLine")
        	.attr("col",function(d,i){
            		return i;
            	})
        	.attr("x1",function(d,i){
        		return (i * cellSize) + (cellSize/2);
        	})
        	.attr("x2",function(d,i){
        		return (i * cellSize) + (cellSize/2);
        	})
        	.attr("y1",function(d,i){
        		return (rowSize/2);
        	})
        	.attr("y2",function(d,i){
        		return ((csvData.index.length) * rowSize)  - (rowSize/2);
        	})
        	.style("stroke",function(d,i){
        		/*if(d.split("_")[0] == "data"){
        			return "red";
        		}
        		else{
        			return "blue";
        		}*/
        		return "gray";
        	})
            .style("stroke-width","0.5px");

            var rowLabels = svg.append("g")
                .attr("class", "rowLabels")
                .selectAll(".rowLabel")
                .data(csvData.index)
                .enter().append("text")
                .text(function(d) {
                	return d;
                })
                .attr("x", 0)
                .attr("y", function(d, i) {
                    return (i * rowSize);
                })
                .style("text-anchor", "end")
                .attr("transform", function(d, i) {
                    return "translate(-3," + rowSize / 1.5 + ")";
                })
                .attr("class", "rowLabel mono")
                .attr("id", function(d, i) {
                    return "rowLabel_" + i;
                })
                .on('mouseover', function(d, i) {
                    d3.select('#rowLabel_' + i)
    	                .style("fill","green")
    	             	.style("font-weight","bold");
                    var yValue = d3.select(this).attr("y");
                    var rowvalue = (yValue/rowSize);
                    var activeCols = [];
                    var dataValue=0;
                    var digitValue=0;
                    d3.selectAll(".cell")
                    	.style("stroke-width",function(d,i){
                    		var cellRow = d3.select(this).attr("cy");
                    		if(cellRow == ((rowvalue * rowSize) + (rowSize/2))){
                    			var highlightColor;
                    				if(Number(d) > 0){
                    					var thisCol = ((Number(d3.select(this).attr("cx")) - (cellSize/2)));
                        				activeCols.push(thisCol);
                        				var colNumber = Number(d3.select(this).attr("col"));
                        				var colLabelText = d3.select("#colLabel_"+colNumber).datum();
                                		if(resSchools.indexOf(colLabelText.split("_")[1]) != -1 && colLabelText.split("_")[2] != "CH(digital)"){
                                			dataValue = Number(dataValue) + Number(d);
                                			highlightColor = "red"
                                		}
                                		else{
                                			digitValue = Number(digitValue) + Number(d);
                                			highlightColor = "blue"
                                		}
                    				}
                    				return "4px";	
                    		}
                    		else{
                    			return "2px";
                    		}
                    	})
                    	/*.style("stroke",function(d,i){
                    		var cellRow = d3.select(this).attr("cy");
                    		if(cellRow == ((rowvalue * rowSize) + (rowSize/2))){
                    			var colNumber = Number(d3.select(this).attr("col"));
                				var colLabelText = d3.select("#colLabel_"+colNumber).datum();
                				var highlightColor;
                        		if(colLabelText.split("_")[0] == "data"){
                        			highlightColor = "red"
                        		}
                        		else{
                        			highlightColor = "blue"
                        		}
                        		return highlightColor;
                    		}
                    		else{
                    			return "gray";
                    		}
                    	})*/
                    	
                    d3.selectAll(".rowLine")
                    	.style("stroke",function(d,i){
                    		if(d3.select(this).attr("y1") == (((yValue/rowSize) * rowSize) + (rowSize/2))){
                    			return "green";
                    		}
                    		else{
                    			return "gray";
                    		}
                    	})
                    	
                    d3.selectAll(".colLabel")
                    	/*.style("fill",function(d,i){
                    		var highlightColor;
                    		if(d.split("_")[0] == "data"){
                    			highlightColor = "red"
                    		}
                    		else{
                    			highlightColor = "blue"
                    		}
                    		if(activeCols.indexOf(Number(d3.select(this).attr("y"))) > -1){
                    			return highlightColor;
                    		}
                    		else{
                    			return "gray";
                    		}
                    	})*/
                    	.style("font-weight",function(d,i){
                    		if(activeCols.indexOf(Number(d3.select(this).attr("y"))) > -1){
                    			return "bold";
                    		}
                    		else{
                    			return "normal";
                    		}
                    	})
                    d3.selectAll(".label")
            			.style("fill",function(labelD){
            				if(labelD.label == d){
            					return "green";
            				}
            				else{
            					return "gray";
            				}
            			})
            			
            			d3.selectAll(".topic")
            			.style("fill",function(labelD){
            				if(labelD.label == d){
            					return "green";
            				}
            				else{
            					return "gray";
            				}
            			})
            			
            			d3.select(".bar_"+d.split(' ').join('_'))
                		.insert("rect",".value")
                		.attr("class","tempRect")
            	        .attr("transform", "translate("+5+", 0)")
            	        .attr("height", barHeight)
            	        .attr("width", function(d){
            	            return scale(dataValue);
            	        })
            	        .style("fill","red")
            	        .style("opacity","0.7");
                    
                    d3.select(".bar_"+d.split(' ').join('_'))
            		.insert("rect",".value")
            		.attr("class","tempRect")
        	        .attr("transform", "translate("+(scale(dataValue) + 5)+", 0)")
        	        .attr("height", barHeight)
        	        .attr("width", function(d){
        	            return scale(digitValue);
        	        })
        	        .style("fill","blue")
        	        .style("opacity","0.7");
                })
                .on('mouseout', function(d, i) {
                    d3.select('#rowLabel_' + i)
                    .style("fill","gray")
                 	.style("font-weight","normal");
                    d3.selectAll(".rowLine")
                	.style("stroke",function(d,i){
                			return "gray";
                	})
                	d3.selectAll(".cell")
                	.style("stroke-width",function(d,i){
                    			return "2px";
                    	})
                    	/*.style("stroke",function(d,i){
                    			return "gray";
                    	})*/
                     d3.selectAll(".colLabel")
                    	/*.style("fill",function(d,i){
                    			return "gray";
                    	})*/
                    	.style("font-weight",function(d,i){
                    			return "normal";
                    	})
                    d3.selectAll(".label")
            			.style("fill",function(labelD){
            					return "gray";
            			})
            			
            		d3.selectAll(".topic")
            			.style("fill",function(labelD){
            					return "gray";
            			})
            		d3.select(".rect_"+d.split(" ").join("_"))
            		.style("fill",function(labelD){
            					return "gray";
            			})
            			
            			d3.selectAll(".tempRect")
            			.remove();
                	
                })
                .on("click", function(d, i) {
                    rowSortOrder = !rowSortOrder;
                    sortByValues("r", i, rowSortOrder);
                    d3.select("#order").property("selectedIndex", 0);
                });

            var colLabels = svg.append("g")
                .attr("class", "colLabels")
                .selectAll(".colLabel")
                .data(csvData.columns)
                .enter().append("text")
                .text(function(d) {
                	return d;
                })
                .attr("x", 0)
                .attr("y", function(d, i) {
                    return (i * cellSize);
                })
                .style("text-anchor", "left")
                .attr("transform", function(d, i) {
                    return "translate(" + cellSize / 2 + ", -3) rotate(-90) rotate(45, 0, " + (i * cellSize) + ")";
                })
                .attr("class", "colLabel mono")
                .attr("id", function(d, i) {
                    return "colLabel_" + i;
                })
                .style("fill",function(d,i){
                	if(resSchools.indexOf(d.split("_")[1]) != -1 && d.split("_")[2] != "CH(digital)"){
        			return "red";
	        		}
	        		else{
	        			return "blue";
	        		}
                })
                .on('mouseover', function(d, i) {
                	var highlightColor;
                    d3.select('#colLabel_' + i)
                    	.each(function(d){
                    		if(resSchools.indexOf(d.split("_")[1]) != -1 && d.split("_")[2] != "CH(digital)"){
                    			highlightColor = "red";
                				return "red";
                			}
                			else{
                				highlightColor = "blue";
                				return "blue";
                			}
                    	})
                    	.style("font-weight","bold");
                    var yValue = d3.select(this).attr("y");
                    var colvalue = (yValue/cellSize);
                    var activeRows = [];
                    var activeValues = [];
                    d3.selectAll(".cell")
                    	.each(function(d,i){
                    		var cellColl = d3.select(this).attr("cx");
                    		if(cellColl == ((colvalue * cellSize) + (cellSize/2))){
                    			if(Number(d) > 0){
                					var thisRow = ((Number(d3.select(this).attr("cy")) - (rowSize/2)));
                					activeRows.push(thisRow);
                					activeValues.push(Number(d));
                				}
                    			return highlightColor;
                    		}
                    		else{
                    			return "gray";
                    		}
                    	})
                    	.style("stroke-width",function(d,i){
                    		var cellColl = d3.select(this).attr("cx");
                    		if(cellColl == ((colvalue * cellSize) + (cellSize/2))){
                    			return "4px";
                    		}
                    		else{
                    			return "2px";
                    		}
                    	})
                    d3.selectAll(".colLine")
                    	.style("stroke",function(d,i){
                    		if(d3.select(this).attr("x1") == (((yValue/cellSize) * cellSize) + (cellSize/2))){
                    			return highlightColor;
                    		}
                    		else{
                    			return "gray";
                    		}
                    	})
                    	
                    var aciveLabel=[];
                    	
                    d3.selectAll(".rowLabel")
                	.style("fill",function(d,i){
                		if(activeRows.indexOf(Number(d3.select(this).attr("y"))) > -1){
                			aciveLabel.push(d);
                			return highlightColor;
                		}
                		else{
                			return "gray";
                		}
                	})
                	.style("font-weight",function(d,i){
                		if(activeRows.indexOf(Number(d3.select(this).attr("y"))) > -1){
                			return "bold";
                		}
                		else{
                			return "normal";
                		}
                	})
                	
                	 d3.selectAll(".label")
            			.style("fill",function(labelD){
            				if(aciveLabel.indexOf(labelD.label) > -1){
            					return highlightColor;
            				}
            				else{
            					return "gray";
            				}
            		})
            		
            		 d3.selectAll(".topic")
            			.style("fill",function(labelD){
            				if(aciveLabel.indexOf(labelD.label) > -1){
            					return highlightColor;
            				}
            				else{
            					return "gray";
            				}
            		})
            		
            		for(var i=0; i<aciveLabel.length; i++){
            			d3.select(".bar_"+aciveLabel[i].split(" ").join("_"))
                		.insert("rect",".value")
                		.attr("class","tempRect")
            	        .attr("transform", "translate("+5+", 0)")
            	        .attr("height", barHeight)
            	        .attr("width", function(d){
            	            return scale(activeValues[i]);
            	        })
            	        .style("fill",highlightColor)
            	        .style("opacity","0.7");
            		}
            		
                		
                })
                .on('mouseout', function(d, i) {
                	 d3.select('#colLabel_' + i)
                 	//.style("fill","gray")
                 	.style("font-weight","normal");
                    d3.selectAll(".cell")
                	/*.style("fill",function(d,i){
                			return "gray";
                	})*/
                	.style("stroke-width",function(d,i){
                			return "2px";
                	})
                	d3.selectAll(".colLine")
                		.style("stroke",function(d,i){
                			return "gray";
                	})
                	 d3.selectAll(".rowLabel")
                	.style("fill",function(d,i){
                			return "gray";
                	})
                	.style("font-weight",function(d,i){
                			return "normal";
                	})
                	 d3.selectAll(".label")
            			.style("fill",function(labelD){
            					return "gray";
            		})
            		d3.selectAll(".topic")
            			.style("fill",function(labelD){
            					return "gray";
            		})
            		
            		d3.selectAll(".tempRect")
            			.remove();
                })
                .on("click", function(d, i) {
                    colSortOrder = !colSortOrder;
                    sortByValues("c", i, colSortOrder);
                    d3.select("#order").property("selectedIndex", 0);
                    d3.select("#histoOrder").property("selectedIndex", 0);
                });

            var row = svg.selectAll(".row")
                .data(csvData.data)
                .enter().append("g")
                .attr("id", function(d) {
                    return d.idx;
                })
                .attr("class", "row");

            var j = 0;
            
            var heatMap = row.selectAll(".cell")
            .data(function(d) {
                j++;
                return d;
            })
            .enter().append("svg:circle")
            .attr("cx", function(d, i) {
                return (i * cellSize) + (cellSize/2);
            })
            .attr("cy", function(d, i, j) {
                return (j * rowSize) + (rowSize/2);
            })
            .attr("r", function(d){
            	return radiusScale(d);
            })
            .attr("class", function(d, i, j) {
                return "cell bordered cr" + j + " cc" + i;
            })
            .attr("row", function(d, i, j) {
                return j;
            })
            .attr("col", function(d, i, j) {
                return i;
            })
            .style("opacity","0.5")
            .style("stroke",function(d,i,j) {
				var colLabelText = d3.select("#colLabel_"+i).datum();
				var highlightColor;
        		if(resSchools.indexOf(colLabelText.split("_")[1]) != -1 && colLabelText.split("_")[2] != "CH(digital)"){
        			highlightColor = "red"
        		}
        		else{
        			highlightColor = "blue"
        		}
        		return highlightColor;
            	//return "gray";
            })
            .style("stroke-width","2px")
            .style("stroke-opacity","1")
            .style("fill", function(d,i,j) {
				var colLabelText = d3.select("#colLabel_"+i).datum();
				var highlightColor;
        		if(resSchools.indexOf(colLabelText.split("_")[1]) != -1 && colLabelText.split("_")[2] != "CH(digital)"){
        			highlightColor = "red"
        		}
        		else{
        			highlightColor = "blue"
        		}
        		return highlightColor;
            	//return "gray";
            })
            .on('mouseover', function(d, i, j) {
            	var highlightColor;
            	 if (d != 0) {
            	d3.select('#colLabel_' + i)
            		.each(function(d,i){
            			if(resSchools.indexOf(d.split("_")[1]) != -1 && d.split("_")[2] != "CH(digital)"){
                			highlightColor = "red";
            				return "red";
            			}
            			else{
            				highlightColor = "blue";
            				return "blue";
            			}
            		})
            		.style("font-weight","bold");
            	d3.select(this)
            	.style("stroke-width",function(d,i){
            		return "4px";
            	})
            	/*.style("stroke",function(d,i){
            		return highlightColor;
            	});*/
                d3.select('#rowLabel_' + j)
                .style("fill",highlightColor)
                .style("font-weight","bold")
                .each(function(rowlabelD){
                	d3.selectAll(".label")
        			.style("fill",function(labelD){
        				if(labelD.label == rowlabelD){
        					return highlightColor;
        				}
        				else{
        					return "gray";
        				}
        			})
        			
        			d3.selectAll(".topic")
        			.style("fill",function(labelD){
        				if(labelD.label == rowlabelD){
        					return highlightColor;
        				}
        				else{
        					return "gray";
        				}
        			})
        			
        			 d3.select(".bar_"+rowlabelD.split(" ").join("_"))
        	    		.insert("rect",".value")
        	    		.attr("class","tempRect")
        		        .attr("transform", "translate("+5+", 0)")
        		        .attr("height", barHeight)
        		        .attr("width", function(){
        		            return scale(d);
        		        })
        		        .style("fill",highlightColor)
        		        .style("opacity","0.7");
                });
                
               
                
               
                    /*tooltip.html('<div class="heatmap_tooltip">' + d + '</div>');
                    tooltip.style("visibility", "visible");*/
                } else{
                	// tooltip.style("visibility", "hidden");
                }
                   
            })
            .on('mouseout', function(d, i, j) {
               d3.select('#colLabel_' + i)
               //.style("fill","gray")
               .style("font-weight","normal");
                d3.select(this).style("stroke-width","2px")
                //.style("stroke","gray");
                d3.select('#rowLabel_' + j).style("fill","gray").style("font-weight","normal");
               // tooltip.style("visibility", "hidden");
                d3.selectAll(".label").style("fill","gray");
                d3.selectAll(".topic").style("fill","gray");
                d3.selectAll(".tempRect").remove();
                
            })
            .on("mousemove", function(d, i) {
               // tooltip.style("top", (d3.event.pageY - 25) + "px").style("left", (d3.event.pageX - 28) + "px");
            })
            .on('click', function() {
            });
            
            var bar = svg.selectAll(".bar")
            .data(histoData)
            .enter()
            .append("g")
            		bar
            		.attr("class", function(d){
            			return "bar bar_"+d.label.split(" ").join("_");
            		})
//    	            .attr("cx",0)
    	            .attr("transform", function(d, i) {
    	                return "translate(" + 400 + "," + (rowSize * i) + ")";
    	            })
    	            .attr("row", function(d, i) {
    	            		return i;
    	            })
    	            .on("mouseover",function(d,i){
    		        	d3.select(this).select(".label")
    		        	.style("fill","green");
    		        	
    		        	d3.select(this).select(".topic")
    		        	.style("fill","green");
    		        	
    		        	/*d3.select(this).select("rect")
    		        	.style("fill","green");*/
    		        	
    		        	var dataValue=0;
                        var digitValue=0;
    		        	
    		        	d3.selectAll(".rowLabel")
    		        		.each(function(rowLabelD){
    		        			if(rowLabelD == d.label){
    		        				d3.select(this).style("fill","green").style("font-weight","bold");
    		        				 var yValue = d3.select(this).attr("y");
    					                var rowvalue = (yValue/rowSize);
    					                var activeCols = [];
    					                d3.selectAll(".cell")
    					                	.each(function(d,i){
    					                		var cellRow = d3.select(this).attr("cy");
    					                		if(cellRow == ((rowvalue * rowSize) + (rowSize/2))){
    					                			var highlightColor;
    			                    				if(Number(d) > 0){
    			                    					var thisCol = ((Number(d3.select(this).attr("cx")) - (cellSize/2)));
    			                        				activeCols.push(thisCol);
    			                        				var colNumber = Number(d3.select(this).attr("col"));
    			                        				var colLabelText = d3.select("#colLabel_"+colNumber).datum();
    			                                		if(resSchools.indexOf(colLabelText.split("_")[1]) != -1 && colLabelText.split("_")[2] != "CH(digital)"){
    			                                			dataValue = Number(dataValue) + Number(d);
    			                                			highlightColor = "red"
    			                                		}
    			                                		else{
    			                                			digitValue = Number(digitValue) + Number(d);
    			                                			highlightColor = "blue"
    			                                		}
    			                    				}
    			                    			//return highlightColor;
    			                    		}
    					                		/*else{
    					                			return "gray";
    					                		}*/
    					                	})
    					                	.style("stroke-width",function(d,i){
    					                		var cellRow = d3.select(this).attr("cy");
    					                		if(cellRow == ((rowvalue * rowSize) + (rowSize/2))){
				                            		return "4px"
    					                		}
    					                		else{
    					                			return "2px";
    					                		}
    					                	})
    					                	/*.style("stroke",function(d,i){
    					                		var cellRow = d3.select(this).attr("cy");
    					                		if(cellRow == ((rowvalue * rowSize) + (rowSize/2))){
    					                			var colNumber = Number(d3.select(this).attr("col"));
				                    				var colLabelText = d3.select("#colLabel_"+colNumber).datum();
				                    				var highlightColor;
				                            		if(colLabelText.split("_")[0] == "data"){
				                            			highlightColor = "red"
				                            		}
				                            		else{
				                            			highlightColor = "blue"
				                            		}
				                            		return highlightColor
    					                		}
    					                		else{
    					                			return "gray";
    					                		}
    					                	})*/
    					                	
    					                d3.selectAll(".rowLine")
    					                	.style("stroke",function(d,i){
    					                		if(d3.select(this).attr("y1") == (((yValue/rowSize) * rowSize) + (rowSize/2))){
    					                			return "green";
    					                		}
    					                		else{
    					                			return "gray";
    					                		}
    					                	})
    					                	
    					                d3.selectAll(".colLabel")
    					                	/*.style("fill",function(d,i){
    					                		if(activeCols.indexOf(Number(d3.select(this).attr("y"))) > -1){
    					                			if(d.split("_")[0] == "data"){
    					                				return "red";
    					                			}
    					                			else{
    					                				return "blue";
    					                			}
    					                			
    					                		}
    					                		else{
    					                			return "gray";
    					                		}
    					                	})*/
    					                	.style("font-weight",function(d,i){
    					                		if(activeCols.indexOf(Number(d3.select(this).attr("y"))) > -1){
    					                			return "bold";
    					                		}
    					                		else{
    					                			return "normal";
    					                		}
    					                	})
    							        }
    							 })
    							 
		    		        	d3.select(this)
		                		.insert("rect",".barRect")
		                		.attr("class","tempRect")
		            	        .attr("transform", "translate("+5+", 0)")
		            	        .attr("height", barHeight)
		            	        .attr("width", function(d){
		            	            return scale(dataValue);
		            	        })
		            	        .style("fill","red")
		            	        .style("opacity","0.7");
    		        	
		                    
			                    d3.select(this)
			            		.insert("rect",".barRect")
			            		.attr("class","tempRect")
			        	        .attr("transform", "translate("+(scale(dataValue) + 5)+", 0)")
			        	        .attr("height", barHeight)
			        	        .attr("width", function(d){
			        	            return scale(digitValue);
			        	        })
			        	        .style("fill","blue")
			        	        .style("opacity","0.7");
			                    
			                    d3.select(this)
			                    	.select(".barRect")
			                    	.style("opacity","0");
			                    
    	            })
    		        .on("mouseout",function(d,i){
    		        	d3.select(this).select(".label")
    		        	.style("fill","gray");
    		        	
    		        	d3.select(this).select(".topic")
    		        	.style("fill","gray");
    		        	
    		        	/*d3.select(this).select("rect")
    		        	.style("fill","gray");*/
    		        	
    		        	d3.selectAll(".rowLine")
    	            	.style("stroke",function(d,i){
    	            			return "gray";
    	            	})
    	            	d3.selectAll(".cell")
    	            	.style("stroke-width",function(d,i){
    	                			return "2px";
    	                	})
    	                	/*.style("stroke",function(d,i){
    	                			return "gray";
    	                	})*/
    	                 d3.selectAll(".colLabel")
    	                	/*.style("fill",function(d,i){
    	                			return "gray";
    	                	})*/
    	                	.style("font-weight",function(d,i){
    	                			return "normal";
    	                	})
    	                	
    	                	d3.selectAll(".rowLabel").style("fill","gray").style("font-weight","normal");
    		        	
    		        	d3.select(this)
                    	.select(".barRect")
                    	.style("opacity","1");
    		        	
    		        	d3.selectAll(".tempRect")
            			.remove();
    		        	
    		        });
            
            bar.append("text")
            .attr("class", "label mono")
            .attr("y", barHeight / 2)
            .attr("dy", ".35em") //vertical align middle
            .attr("text-anchor", "end")
            .text(function(d){
                return d.label;
            }).each(function() {
            	labelWidth = Math.ceil(Math.max(labelWidth, this.getBBox().width));
            });
            
            
            scale = d3.scale.linear()
            .domain([0, max])
            .range([0, 200]);

            bar.append("rect")
    	        .attr("transform", "translate("+5+", 0)")
    	        .attr("class",function(d){
    	        	return "barRect rect_"+d.label.split(" ").join("_");
    	        })
    	        .attr("height", barHeight)
    	        .attr("width", function(d){
    	            return scale(d.value);
    	        });

    		bar.append("text")
    		        .attr("class", "value")
    		        .attr("y", barHeight / 2)
    		        //.attr("dx", -valueMargin + labelWidth) //margin right
    		        .attr("dy", ".35em") //vertical align middle
    		        .attr("text-anchor", "end")
    		        .text(function(d){
    		            return (d.value);
    		        })
    		        .attr("x", function(d){
    		            var width = this.getBBox().width;
    		            return Math.max(width + valueMargin, scale(d.value));
    		        });
    		
    		bar.append("text")
    				.attr("class","topic mono")
    				.attr("y",barHeight / 2)
    				.attr("dy", ".35em")
    				 .attr("text-anchor", "start")
    		        .text(function(d){
    		        	return topicIdRef[d.label]
    		        })
    		        .attr("x", function(d){
    		            var width = this.getBBox().width;
    		            return scale(d.value) + (valueMargin * 2);
    		           // return Math.max(width + valueMargin, scale(d.value));
    		        });
    		
    		
    		d3.select("#histoOrder").on("change", function() {
    		    var newOrder = d3.select("#histoOrder").property("value");
    		    	
    		    	
    		    	if(newOrder == "nameAsc"){
    		    		 d3.selectAll(".bar")
    				    	.sort(function(a, b){
    				    	    if(a.label < b.label) return -1;
    				    	    if(a.label > b.label) return 1;
    				    	    return 0;
    				    	})
    				    	.transition()
    				            .duration(400)
    				            .attr("transform", function(d, i) {
    				                return "translate(" + 400 + "," + (rowSize * i) + ")";
    				            });
    		    	}
    		    	if(newOrder == "nameDesc"){
    		    		 d3.selectAll(".bar")
    				    	.sort(function(a, b){
    				    	    if(a.label < b.label) return 1;
    				    	    if(a.label > b.label) return -1;
    				    	    return 0;
    				    	})
    				    	.transition()
    				            .duration(400)
    				            .attr("transform", function(d, i) {
    				                return "translate(" + 400 + "," + (rowSize * i) + ")";
    				            });
    		    	}
    		    	
    		    	if(newOrder == "valueAsc"){
    		    		d3.selectAll(".bar")
    			    	.sort(function(a, b){
    			    	    return (a.value) - (b.value);
    			    	})
    			    	.transition()
    			            .duration(400)
    			            .attr("transform", function(d, i) {
    			                return "translate(" + 400 + "," + (rowSize * i) + ")";
    			            });
    		    	}
    		    	
    		    	if(newOrder == "valueDesc"){
    		    		d3.selectAll(".bar")
    			    	.sort(function(a, b){
    			    	    return (b.value) - (a.value);
    			    	})
    			    	.transition()
    			            .duration(400)
    			            .attr("transform", function(d, i) {
    			                return "translate(" + 400 + "," + (rowSize * i) + ")";
    			            });
    		    	}
    		    	var sorted=[];
    		    	d3.selectAll(".bar")
    		    		.each(function(d){
    		    			sorted.push(Number(d3.select(this).attr("row")));
    		    			
    		    		});
    		    	
    		    	d3.selectAll(".cell")
    		    	.transition()
    			    .duration(400)
                    .attr("cy", function(d) {
                        var row = parseInt(d3.select(this).attr("row"));
                        return sorted.indexOf(row) * rowSize + (rowSize/2);
                    });
    		    	
    		    	d3.selectAll(".rowLabel")
    		    	.transition()
    			    .duration(400)
                    .attr("y", function(d, i) {
                        return sorted.indexOf(i) * rowSize;
                    })
                    .attr("transform", function(d, i) {
                        return "translate(-3," + rowSize / 1.5 + ")";
                    });
    	        });

            //==================================================
            // Change ordering of cells
            function sortByValues(rORc, i, sortOrder) {
                var t = svg.transition().duration(1000);
                var values = [];
                var sorted;
                d3.selectAll(".c" + rORc + i)
                    .filter(function(d) {
                        if (d != null) values.push(d);
                        else values.push(-999); // to handle NaN
                    });
                if (rORc == "r") { // sort on cols
                    sorted = d3.range(col_number).sort(function(a, b) {
                        if (sortOrder) {
                            return values[b] - values[a];
                        } else {
                            return values[a] - values[b];
                        }
                    });
                    
                    t.selectAll(".cell")
                    .attr("cx", function(d) {
                        var col = parseInt(d3.select(this).attr("col"));
                        return (sorted.indexOf(col) * cellSize) + (cellSize/2);
                    });
                    t.selectAll(".colLabel")
                    .attr("y", function(d, i) {
                        return sorted.indexOf(i) * cellSize;
                    })
                    .attr("transform", function(d, i) {
                        return "translate(" + cellSize / 2 + ", -3) rotate(-90) rotate(45, 0, " + (sorted.indexOf(i) * cellSize) + ")";
                    });
                } else { // sort on rows
                    sorted = d3.range(row_number).sort(function(a, b) {
                        if (sortOrder) {
                            return values[b] - values[a];
                        } else {
                            return values[a] - values[b];
                        }
                    });
                    t.selectAll(".cell")
                        .attr("cy", function(d) {
                            var row = parseInt(d3.select(this).attr("row"));
                            return sorted.indexOf(row) * rowSize + (rowSize/2);
                        });
                    t.selectAll(".rowLabel")
                        .attr("y", function(d, i) {
                            return sorted.indexOf(i) * rowSize;
                        })
                        .attr("transform", function(d, i) {
                            return "translate(-3," + rowSize / 1.5 + ")";
                        });
                    
                    t.selectAll(".bar")
                    .attr("transform", function(d) {
                        var row = parseInt(d3.select(this).attr("row"));
                        return "translate(" + 400 + "," + (rowSize * (sorted.indexOf(row))) + ")";
                    });
                }
            }

            //==================================================
            d3.select("#order").on("change", function() {
    	    var newOrder = d3.select("#order").property("value");	
                changeOrder(newOrder, heatmapId);
            });
        });
    })
    

    
}

//#########################################################
function changeOrder(newOrder, heatmapId) {
    var svg = d3.select(heatmapId);
    var t = svg.transition().duration(1000);
    if (newOrder == "sortinit_col") { // initial sort on cols (alphabetically if produced like this)
        t.selectAll(".cell")
            .attr("cx", function(d) {
                var col = parseInt(d3.select(this).attr("col"));
                return (col * cellSize) + (cellSize/2);
            });
        t.selectAll(".colLabel")
            .attr("y", function(d, i) {
                return (i * cellSize);
            })
            .attr("transform", function(d, i) {
                return "translate(" + cellSize / 2 + ", -3) rotate(-90) rotate(45, 0, " + (i * cellSize) + ")";
            });
    } else if (newOrder == "sortinit_row") { // initial sort on rows (alphabetically if produced like this)
        t.selectAll(".cell")
            .attr("cy", function(d) {
                var row = parseInt(d3.select(this).attr("row"));
                return (row * rowSize) + (rowSize/2);
            });
        t.selectAll(".rowLabel")
            .attr("y", function(d, i) {
                return (i * rowSize) ;
            })
            .attr("transform", function(d, i) {
                return "translate(-3," + rowSize / 1.5 + ")";
            });
        
        
        t.selectAll(".bar")
        .attr("transform", function(d) {
            var row = parseInt(d3.select(this).attr("row"));
            return "translate(" + 400 + "," + (rowSize * row) + ")";
        });
        
    } else if (newOrder == "sortinit_col_row") { // initial sort on rows and cols (alphabetically if produced like this)
        t.selectAll(".cell")
            .attr("cx", function(d) {
                var col = parseInt(d3.select(this).attr("col"));
                return (col * cellSize) + (cellSize/2);
            })
            .attr("cy", function(d) {
                var row = parseInt(d3.select(this).attr("row"));
                return (row * rowSize) + (rowSize/2);
            });
        t.selectAll(".colLabel")
            .attr("y", function(d, i) {
                return i * cellSize;
            })
            .attr("transform", function(d, i) {
                return "translate(" + cellSize / 2 + ", -3) rotate(-90) rotate(45, 0, " + (i * cellSize) + ")";
            });
        t.selectAll(".rowLabel")
            .attr("y", function(d, i) {
                return i * rowSize ;
            })
            .attr("transform", function(d, i) {
                return "translate(-3," + rowSize / 1.5 + ")";
            });
        t.selectAll(".bar")
        .attr("transform", function(d) {
            var row = parseInt(d3.select(this).attr("row"));
            return "translate(" + 400 + "," + (rowSize * row) + ")";
        });
    }
}