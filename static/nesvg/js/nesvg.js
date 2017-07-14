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
	xhttp.open("GET", "/static/NeSVG/static/nesvg/js/base.html", true);//test for localhost? ./static won't work on server.
	xhttp.send();

	cst=new ColorCfg();

	me.cstCB=function(){
		console.log('me.cstCB')
	}
	me.pick3CB=function(){
		console.log("nesvg.pick3CB")
		cst.show(me.cstCB);
	}


	return me;
}
var nesvg;
