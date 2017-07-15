var NeSVG=function(doneCB){
	var me={}
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

	cst=new ColorCfg();

	me.cstCB=function(){
		console.log('me.cstCB')
	}
	me.pick3CB=function(){
		console.log("nesvg.pick3CB")
		cst.show(me.cstCB);
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
		console.log('mkD3',panel_id);
		var svg = d3.select(panel_id)
			.append("svg")
				.attr("id",struct[0]['id'])
				.attr("width", struct[0]['width'])
				.attr("height", struct[0]['height'])
				.call(struct[1]['filter'][0].init)
				.call(struct[1]['filter'][1].init)
				.call(struct[1]['filter'][2].init)
				.call(struct[2]['filter'][0].init)
				.call(struct[2]['filter'][1].init)
				.call(struct[2]['filter'][2].init)
				;

		for(var pidx=1;pidx<struct.length;pidx++){
		for(var lidx=0;lidx<struct[pidx]['color'].length;lidx++){
			svg.append("path")
				.attr("d",struct[pidx]['d'])
				.attr("class","outer")
				.style("stroke",struct[pidx]['color'][lidx]).style("fill",struct[pidx]['fill'][lidx]).style("stroke-width",struct[pidx]['stroke-width'][lidx]+"px")
				.attr("transform",struct[0]['transform'])
				.style("filter", struct[pidx]['filter'])
				;
		}}

	}

	return me;
}
var nesvg;
