var NeSVG=function(doneCB){
	me={}
	me.doneCB=null;

	if(doneCB)
		me.doneCB=doneCB;
	else{
		me.doneCB=function(){
			d3.select("#nesvg_main").style('display','none');
			colormyworld.update_styles();
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
		//http://forums.mozillazine.org/viewtopic.php?f=25&t=1134615
		if (xhttp.readyState == 4 && (xhttp.status == 200 || xhttp.status == 0)) {
			document.body.innerHTML+=xhttp.responseText;//base_html
		}
//		else document.body.innerHTML+=base_html;
	};
	//https://stackoverflow.com/questions/7374911/reading-file-with-xmlhttprequest-results-in-error-console-entry
	xhttp.overrideMimeType('text/plain');
	xhttp.open("GET", "./static/nesvg/js/base.html", true);//test for localhost? ./static won't work on server.
	xhttp.send();

	return me;
}
var nesvg;
