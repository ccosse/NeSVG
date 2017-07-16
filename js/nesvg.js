var NeSVG=function(doneCB){
	var me={}
	me.swatch_pts=null;
	me.widget_prefixes=[];
	me.last_struct=null;
	me.current_pidx=null;
	me.current_lidx=null;
	me.doneCB=null;

	if(doneCB)
		me.doneCB=doneCB;
	else{
		me.doneCB=function(){
			d3.select("#nesvg_main").style('display','none');
//			MAYBE_SOMEBODY.update_styles();
		}
	}

	me.show=function(){
		console.log("nesvg.show")
		window.clearTimeout(window.lastTimeout);
		d3.select("#nesvg_main").style("display","block");
		if(me.widget_prefixes.length<1)me.newSequenceCB();
		me.recenter();
	}
	me.recenter=function(){
		d3.select("#column2")
			.style('position','absolute')
			.style('left',parseInt(window.innerWidth/2-400)+"px");
	}

	var xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function() {
		try{
		if (xhttp.readyState == 4 && (xhttp.status == 200 || xhttp.status == 0)) {
			//http://forums.mozillazine.org/viewtopic.php?f=25&t=1134615
			console.log("success importing base.html");
			document.body.innerHTML+=xhttp.responseText;//base_html
			console.log("nesvg.appended",xhttp.responseText)
		}
		else{
			console.log("don't load this ... would result in multiple appends");
//		else document.body.innerHTML+=base_html;
		}
		}catch(e){console.log(e)}
	};
	//https://stackoverflow.com/questions/7374911/reading-file-with-xmlhttprequest-results-in-error-console-entry
	xhttp.overrideMimeType('text/plain');
	xhttp.open("GET", "/static/NeSVG/js/base.html", true);//test for localhost? ./static won't work on server.
	xhttp.send();

	//////////////////////////////
	cst=new ColorCfg();

//////////////////////////////
	me.cstCB=function(){

		d3.select("#colorcfg_main").style('display','none');

		var palette=cst.getColorsList();
		console.log('me.cstCB',palette);

		//swatch_div
		var N=palette.length;
		var dx=20;
		var NR=parseInt(800/dx);


		me.swatch_pts.selectAll('.swatch').remove();

		var swatch=me.swatch_pts.selectAll(".swatch")
			.data(palette);

		swatch.enter()
			.append("svg:rect")
				.attr("class", function(d){return "new swatch"})
				.attr("id",function(d,i){return me.widget_prefixes[0]+"_"+d})
				.attr("width", dx)
				.attr("height", dx)
				.style("fill",function(d){return d;})
				.attr("x", function(d,i) { return dx*(i-NR*parseInt(i/NR) )})
				.attr("y", function(d,i) { return dx*parseInt(i/NR) });

	}
	me.pick3CB=function(){
		console.log("nesvg.pick3CB")
		cst.show(me.cstCB);
	}
	me.newSequenceCB=function(){
		var xhttp = new XMLHttpRequest();
		xhttp.onreadystatechange = function() {
			if (xhttp.readyState == 4 && (xhttp.status == 200 || xhttp.status == 0)) {
				d3.selectAll("#nesvg_widget_table")
					.append('tr')
					.append('td')
					.append("div")
						.attr('class','commoncfg_new')
						.html(xhttp.responseText);

				if(me.last_struct)
					me.mkD3(me.last_struct,'#nesvg_stage')

			}
	//		else document.body.innerHTML+=widget_html;
		};
		//https://stackoverflow.com/questions/7374911/reading-file-with-xmlhttprequest-results-in-error-console-entry
		xhttp.overrideMimeType('text/plain');
		xhttp.open("GET", "/static/NeSVG/js/widget.html", true);//test for localhost? ./static won't work on server.
		xhttp.send();

		d3.timeout(me.assign_ids,100);//This is a one-time call; replaces _new in class of <pre> html

	}
	me.assign_ids=function(){
		//Trick: select .colorcfg_new, define ids, then remove _new from .className.
	//		w3.includeHTML();//pity this didn't work in Chroome w/d3 ... w3 couldn't find container1

		console.log('nesvg.assign_ids')
		var count=0;
		var common_id_prefix='nesvgctrl_'+parseInt(Math.random()*1E7);
		me.widget_prefixes.push(common_id_prefix);

		d3.selectAll(".nesvgcfg_new")
			.attr('id',function(){var rval=common_id_prefix+"_"+count;console.log(d3.select(this).attr('class'),count);count+=1;return rval;})
			.attr('class',function(){return d3.select(this).attr('class').replace('nesvgcfg_new','nesvgcfg');});

		me.swatch_pts=d3.select(".nesvg_widget_svg").append("g");
		me.cstCB();

		d3.select("#nesvg_path_button")
			.on('mousedown',function(){console.log("click");nesvg.cyclePath(common_id_prefix);});

		d3.select("#nesvg_layer_button")
			.on('mousedown',function(){nesvg.cycleLayer(common_id_prefix);});

		console.log("callbacks set");
/*
		d3.select("#"+common_id_prefix+"_6")
			.on('mousedown',function(){me.cycleRGB(common_id_prefix);});

		me.update(common_id_prefix);//now that we've got a common_id_prefix we can update
*/
	}
	me.cyclePath=function(){
		console.log('nesvg.cyclePath');
		me.current_pidx+=1;
		if(me.current_pidx >= me.last_struct.length)
			me.current_pidx=1;
		me.nesvgInfo();
	}
	me.cycleLayer=function(){
		console.log('nesvg.cycleLayer');
		me.current_lidx+=1;
		if(me.current_lidx >= me.last_struct[me.current_pidx]['color'].length)
			me.current_lidx=0;
		me.nesvgInfo();
	}
	me.loadXML=function(fname,panel_id){
		d3.xml(fname).mimeType("image/svg+xml").get(function(error, xml) {
			if (error) throw error;
			var url=xml.firstChild.baseURI;
			var filename = url.substring(url.lastIndexOf('/')+1);
			var panel=document.getElementById(panel_id);
			panel.appendChild(xml.documentElement);
		});
	}
	me.mkD3=function(struct,panel_id){
		me.last_struct=struct;
		console.log('mkD3',panel_id);
		var svg = d3.select(panel_id)
			.append("svg")
				.attr("id",struct[0]['id'])
				.attr("width", struct[0]['width'])
				.attr("height", struct[0]['height'])
				.call(struct[1]['filters'][0].init)
				.call(struct[1]['filters'][1].init)
				.call(struct[1]['filters'][2].init)
				.call(struct[2]['filters'][0].init)
				.call(struct[2]['filters'][1].init)
				.call(struct[2]['filters'][2].init)
				;
			svg.append("rect")
					.attr("x",0)
					.attr("y",0)
					.attr("width",struct[0]['width'])
					.attr("height",struct[0]['height'])
					.style("fill",struct[0]['fill'])

			if(panel_id=="#nesvg_stage"){
				svg
				.style("position","relative")
				.style("top",parseInt(200-struct[0]['height']/2)+"px")
			}

		//The following double loop (path,layer) becomes the 2 round selection buttons
		//THe upper cycles through paths(pidx), the lower button through layers of the same
		//path but different parameters.
		for(var pidx=1;pidx<struct.length;pidx++){
		for(var lidx=0;lidx<struct[pidx]['color'].length;lidx++){
			svg.append("path")
				.attr("d",struct[pidx]['d'])
				.attr("class","outer")
				.style("stroke",struct[pidx]['color'][lidx]).style("fill",struct[pidx]['fill'][lidx]).style("stroke-width",struct[pidx]['stroke-width'][lidx]+"px")
				.attr("transform",struct[0]['transform'])
				.style("filter", struct[pidx]['filter_strs'][lidx])
				;
		}}
		me.current_pidx=1;
		me.current_lidx=0;
		me.nesvgInfo();
	}

	me.nesvgInfo=function(){
		var html1="";
		html1+="id "+me.last_struct[0]['id']+"<br>";
		html1+="width "+me.last_struct[0]['width']+"<br>";
		html1+="height "+me.last_struct[0]['height']+"<br>";
		html1+="paths "+(me.last_struct.length-1)+"<br>";
		var nlyrs=0;
		for(var idx=1;idx<me.last_struct.length;idx++)
			nlyrs+=me.last_struct[idx]['color'].length;
		html1+="layers "+nlyrs+"<br>";
		html1+="fill "+me.last_struct[0]['fill']+"<br>";
		html1+=me.last_struct[0]['transform'].split(" ")[0]+"<br>";
		html1+=me.last_struct[0]['transform'].split(" ")[1];
		d3.select("#nesvg_info1").html(html1);

		var html2="";
		html2+="pidx "+me.current_pidx+"<br>";
		html2+="approx points "+parseInt(me.last_struct[me.current_pidx]['d'].split(" ").length/2)+"<br>";
		html2+="layers "+me.last_struct[me.current_pidx]['color'].length+"<br>";
		d3.select("#nesvg_info2").html(html2);

		var html3="";
		html3+="lidx "+me.current_lidx+"<br>";
		html3+="color "+me.last_struct[me.current_pidx]['color'][me.current_lidx]+"<br>";
		html3+="fill "+me.last_struct[me.current_pidx]['fill'][me.current_lidx]+"<br>";
		html3+="stroke-width "+me.last_struct[me.current_pidx]['stroke-width'][me.current_lidx]+"<br>";
		html3+="filter str "+me.last_struct[me.current_pidx]['filter_strs'][me.current_lidx]+"<br>";
		html3+="filter rgb "+me.last_struct[me.current_pidx]['filters'][me.current_lidx].rgb+"<br>";
		html3+="filter sigma "+me.last_struct[me.current_pidx]['filters'][me.current_lidx].stdDeviation+"<br>";
		d3.select("#nesvg_info3").html(html3);
	}

	return me;
}
var nesvg;
