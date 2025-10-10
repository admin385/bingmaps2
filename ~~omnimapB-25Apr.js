// Additions for Marker Index  22Apr25

const deg_R = 180/Math.PI;
const U = ["\u2191","\u2197","\u2192","\u2198","\u2193","\u2199","\u2190","\u2196"];  // compass arrows

var Axx,Ayy, Q; //NB: globals, now

function zoomTo(r) { //console.log(r+" "+typeof r)
var c = map.getCenter(), g, z = map.getZoom();
	if (r==0) map.setView({center:new Microsoft.Maps.Location(POSN.lat, POSN.lng), zoom:(z>=18?15:19)});
	else {g = markers[r].geometry; map.setView({center:new Microsoft.Maps.Location(g.y, g.x), zoom:19})}; //console.log(markers[pt].geometry)
}

function addMarkerRow(qxxyy) { //console.log("add "+qxxyy+"; "+Axx+Ayy)
var a, b, c, d, dx,dy, i,j, p, q,q1, t, xx, yy;
    function compassPt(b) {
	// determine 8-pt compass direction
    var c;
    if (isNaN(b)) c = -1;//u = "\u10753";//t = "at Anchor"
    else {
	  if (Math.abs(b)<=+15) c = 0;//u = "\u2191";//t = "Mostly North"
	  else if (b>+15 && b<+75) c = 1;//u = "\u2197";//t = "Broadly North-East"
	  else if (b<-15 && b>-75) c = 7;//u = "\u2196";//t = "Broadly North-West"
	  else if (b>=+75 && b<=+105) c = 2;//u = "\u2192";// t = "Mostly East"
	  else if (b<=-75 && b>=-105) c = 6;//u = "\u2190";//t = "Mostly West"
	  else if (b>+105 && b<+165) c = 3;//u = "\u2198";//t = "Broadly South-East"
	  else if (b<-105 && b>-165) c = 5;//u = "\u2199";//t = "Broadly South-West"
      else  c = 4;//u = "\u2193";//t = "Mostly South"
    }
	  return c;
	}
//t = (qxxyy.length==4 ? "5" : "") + qxxyy;
	q = parseInt(qxxyy.charAt(0)); xx = parseInt(qxxyy.slice(-4,-2)); yy = parseInt(qxxyy.slice(-2));
	dx = xx-Axx; d = Math.abs(dx); i = 0; if (Axx>=50) {if (dx+100<d) i = +1} else {if (100-dx<d) i = -1}; if (i) dx = dx +i*100;
	dy = yy-Ayy; d = Math.abs(dy); j = 0; if (Ayy>=50) {if (dy+100<d) j = +1} else {if (100-dy<d) j = -1}; if (j) dy = dy +j*100;
//console.log(q+" "+i+" "+j+"; "+xx+" "+yy+" "+dx+" "+yy)
	if (isNaN(q)) q = (5 +i -3*j);  // of nearest tile, for @xxyy 
	else { i1 = ((q-1)%3) -1;  j1 = 1 -Math.trunc((q-1)/3); if (i1==i && j1==j) return;
//console.log(qxxyy.charAt(0)+"?"+q+" "+i1+" "+j1+"; "+xx+" "+yy+" "+dx+" "+yy)
	dx += 100*(i1-i); dy += 100*(j1-j); }  // for explicit tile offsets
  a = Math.trunc(Math.atan(dx ? dy/dx : 0)*deg_R); //console.log("a="+a)
  b = dx ? Math.sign(dx)*90-a : dy ? (1-Math.sign(dy))*90 : 0/0; //console.log("b="+b)
  c = compassPt(b); //console.log(b+' '+c)
  d = 10*Math.sqrt(dx**2+dy**2);
  
tbl = document.getElementById("tbl")
r = tbl.rows.length
p = r; while (--p>0) if (d >= parseInt(tbl.rows[p].cells[1].innerHTML)) break;
row = tbl.insertRow(++p) //WAS: (-1) // for end
row.insertCell(0).innerHTML = "<button onclick='zoomTo("+r+")'><b>"+qxxyy+"</b></button>";
row.insertCell(1).innerHTML = d.toFixed(1);
row.insertCell(2).innerHTML = b.toFixed(0);
row.insertCell(3).innerHTML = U[c]; //U[r%8]
}

function clearMarkerRows() {//alert("clear")
tbl = document.getElementById("tbl")
r = tbl.rows.length;
while(--r>0)tbl.deleteRow(r);
}


function clearCode1(th) {if (th.value.slice(-1)==" ") th.value="";}  //add 18Aug: space clears input

function initMapKit() {console.log("mapKit loaded");}  //add 7Jul24 -- just checking....

//WAS: console.log(location.hostname+" "+location.hostname.indexOf("bing")); 
console.log(location.href+" "+location.href.indexOf("bing")); 

const params = new URLSearchParams(window.location.search); // add 28Jan  if (params.has("Bing")) { document.getElementById("addr").setAttribute("hidden", "hidden"); document.getElementById("addr").setAttribute("hidden", "hidden")

  if (params.has("Apple") || location.href.toLowerCase().indexOf("appl")>=0 || params.has("Bing") || location.href.toLowerCase().indexOf("bing")>=0) {
    document.getElementById("addr").setAttribute("hidden", "hidden"); document.getElementById("addrlist").removeAttribute("hidden"); 
  }
 
  if (params.has("Google") || params.has("Apple") || location.href.toLowerCase().indexOf("appl")>=0 || params.has("Bing") || location.href.toLowerCase().indexOf("bing")>=0) {
   document.getElementById("sOmni").setAttribute("hidden", "hidden"); 
   document.getElementById("addr").setAttribute("size", "45");
   document.getElementById("sTrack").setAttribute("hidden", "hidden");
  }
var Mtype = 2; // Marker type: -ve no XY prefix; abs # of suffix digits
    Mtype = -2; document.getElementById("code").setAttribute("placeholder","@xxyy.xx");  //mod 17Aug, add 7Jul24 -- override 2+4 default, same as for BingMaps2
//with (document.getElementById("code")) {setAttribute("onInput", "(e) => {if (e.target.value==' ') value = ''}")}  //add 17Aug: leading space clears input 
  if (params.has("4")) { Mtype = -2; document.getElementById("code").setAttribute("placeholder","@xxyy");}
  if (params.has("6")) { Mtype = -3; document.getElementById("code").setAttribute("placeholder","@xxxyyy");}
  
var POSN={lat:33.66848, lng:-117.86359, adj:""} //UTM="11SMT 19940 25733", ZOOM=19;  // WFB Defaults
document.getElementById("addr").value = "4590 MacArthur Blvd, Newport Beach, CA, USA";  //*TEMP

  google.maps.event.addDomListener(window, 'load', initMap);  // TEMP 28May: UI execution begins here

var anchor, map, marker, markers=[], mlabel, mlabel0; // NB: globals
var markerLatitude, markerLongitude;  // Add 30Jul24  Kludge
const gLL = document.getElementById("LL");  // coordinate trackers

//var CLL, Gmap; //del 25Aug
  function hidePlace() {  // 18Oct add: re-hide Google placename Lookup; soft re-init
	document.getElementById("locale").setAttribute("hidden", "hidden");
	document.getElementById("addrlist").removeAttribute("hidden");
  //with(document.getElementById("addr")) {value = ""; removeAttribute("hidden");} 
    document.getElementById("addrlist").selectedIndex = 0;
  }
  function clearPlace() { 
    with(document.getElementById("addr")) {value = ""; setAttribute("hidden", "hidden");} 
	document.getElementById("addrlist").setAttribute("hidden", "hidden");
	document.getElementById("locale").removeAttribute("hidden");
//mapOptions = {center:CLL, zoom:18, minZoom:14, maxZoom:20, clickableIcons:false, //del 25Aug:
//	  tilt: 0, rotateControl: false, // add 26Jan: prevent obliue mode
	  //styles:mapStyles, backgroundColor:'hsla(0, 100%, 100%, 0)',  //NB: essential for multimap
//	};
//Gmap = new google.maps.Map(document.getElementById('Gmap'), mapOptions); //del 25Aug alert(mapG.mapTypeId)
	initPlace(); 
  }
  function initPlace() { //mod: 24Aug24: re-vitalized
// Find Place (Google)
//const marker = new google.maps.Marker({ map: Gmap });  // del 25Aug
    const input = document.getElementById("locale"); input.focus();
  if (input.value) value = "";
    const autocomplete = new google.maps.places.Autocomplete(input, {fields: ["place_id", "geometry", "formatted_address", "name"],});
//console.log("autocomplete established")
	//autocomplete.bindTo("bounds", map);
    //map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);
    autocomplete.addListener("place_changed", () => { //console.log("at autocomplete")
      const place = autocomplete.getPlace();

      if (!place.geometry || !place.geometry.location) {
      return;
      }
/*  //del 25Aug
      if (place.geometry.viewport) {
        Gmap.fitBounds(place.geometry.viewport);
      } else {
        Gmap.setCenter(place.geometry.location);
        Gmap.setZoom(17);
	  }
	  marker.setPlace({ placeId: place.place_id, location: place.geometry.location,});
      marker.setVisible(true);
//*/
	  POSN.lat = place.geometry.location.lat(); POSN.lng = place.geometry.location.lng();
	  initMap1(place.formatted_address);
    });
  }

  function reInitPlace() {//alert("at reInitPlace")
// Choose a place (Bing), from a preset list
    var i = document.getElementById("addrlist").selectedIndex; //console.log(i)
 if (i==1) { clearPlace(); return;}  // 13Sep Add: first option is to shift to Google search
	if (i>0) v = document.getElementById("addrlist").options[i].value; //console.log(v)
    POSN.lat = parseFloat(v.slice(0,v.indexOf(","))); POSN.lng = parseFloat(v.slice(v.indexOf(",")+1));
  //console.log(POSN); if (marker) console.log(markerLatitude+","+markerLongitude)
	if(marker && POSN.lat==0 && POSN.lng==0) { POSN.lat = markerLatitude; POSN.lng = markerLongitude;}  //Add 30Jul24 Special, one-time use
    initMap1(document.getElementById("addrlist").options[i].text);
	with (document.getElementById("addrlist")) {if (i==options.length-1) selectedIndex=0;}  // add 31Jul: permit multiple Most Recent Markers
  }

async function initMap() {//console.log("at initMap")
  document.getElementById("multi").selectedIndex = 4;
  const { Map } = await google.maps.importLibrary("maps");
  initMap1();
}
 var CXX, Cxxyy, Cxx50, Cyy50, uPosn;  // Globals  //add 22Jun
var rect, rects=[];  //add 25Jul  //NB: globals
var lastCode, lastUTM;  //31Oct add: support [More], globals

  function initMap1(placeName) { //console.log("at initMap1 " + placeName+"; "+isNaN(parseInt(placeName)))
 uPosn = toUTM(POSN); console.log(uPosn.Eing+"_"+uPosn.Ning) // initial anchor
//CLL = toLL(uPosn, uPosn.Zone); //del 25Aug; add 24Aug: alert(CLL.lng.toFixed(6)+"&"+CLL.lat.toFixed(6))
 CXY = uPosn.Eing.toString().slice(3,4)+uPosn.Ning.toString().slice(4,5); //alert(CXY) // static sub-tile id 
 Cxxyy = "@"+uPosn.Eing.toString().slice(-2)+uPosn.Ning.toString().slice(-2); // mod 30Mar
 Cxx50 = Cxxyy.slice(1,3) -50, Cyy50 = Cxxyy.slice(3,5) -50; //console.log(Cxx50+","+Cyy50)  // add 22 Jun
 var Mxxyy = (Mtype<0?"":CXY)+ "@"+uPosn.Eing.toString().slice(-Math.abs(Mtype))+uPosn.Ning.toString().slice(-Math.abs(Mtype)); // mod 09Sep: made var add 30Jun
var utx = UGRS(POSN); //console.log(utx); 
  document.getElementById("tile").value = utx.slice(0,7)+utx.slice(10,12);
  document.getElementById("1Mloc").value = utx.slice(7,10)+utx.slice(12,15);
var anch = toLL(uPosn, uPosn.Zone);
  document.getElementById("LL").value = anch.lng.toFixed(6)+"_"+anch.lat.toFixed(6);
  const mapOptions = {center:POSN, zoom:(placeName&&isNaN(parseInt(placeName))?16:18), minZoom:14, maxZoom:20, clickableIcons:false, 
	  tilt: 0, rotateControl: false, // add 26Jan: prevent oblique mode
	  //styles:mapStyles, backgroundColor:'hsla(0, 100%, 100%, 0)',  //NB: essential for multimap
	};
	if (params.has("Apple") || location.href.toLowerCase().indexOf("appl")>=0) {  //mod 09Sep //add 7Jul24
markerLatitude = elat; markerLongitude = elng;  //Add 30Jul24
	  document.querySelector('title').textContent = "Applemaps2";
//https://stackoverflow.com/questions/56457065/zoom-and-position-management-in-mapkit-js
  var newCenter = new mapkit.Coordinate(POSN.lat, POSN.lng);
  var span = new mapkit.CoordinateSpan((placeName&&isNaN(parseInt(placeName))?0.01:0.002));  // 0.01 degree = ~0.9 km
  var newRegion = new mapkit.CoordinateRegion(newCenter, span);
//map.setRegionAnimated(region)
	  if (map) map.destroy();
	  map = new mapkit.Map('map', { center:newCenter, region:newRegion, mapType:mapkit.Map.MapTypes.Hybrid, showsMapTypeControl:true, showsCompass:mapkit.FeatureVisibility.Hidden, });
	  ecmC1 = new mapkit.CircleOverlay(newCenter, 50); ecmC1.style = new mapkit.Style({lineWidth:2, strokeColor:"#00f", fillColor:null, fillOpacity:0,});
	  map.addOverlay(ecmC1);
	  ecmC12 = new mapkit.CircleOverlay(newCenter, 100); ecmC12.style = new mapkit.Style({lineWidth:2, strokeColor:"#ccc", fillColor:null, fillOpacity:0,});
	  map.addOverlay(ecmC12);
	  ecmC2 = new mapkit.CircleOverlay(newCenter, 500); ecmC2.style = new mapkit.Style({lineWidth:2, strokeColor:"#f00", fillColor:null, fillOpacity:0,});
	  map.addOverlay(ecmC2);
	  var anchor = new mapkit.MarkerAnnotation(newCenter, {color:"#00f", title:"+", subtitle:"",}); //map.addAnnotation(anchor);  // mod 17Aug, blue anchor
//console.log(document.styleSheets[2].cssRules.length)
//map.addEventListener("map-type-change", function() {document.styleSheets[2].cssRules[0].style.color=(map.mapType.slice(0,2)=="st"?"#000":"#fff")})  //add 07Sep //del 08Sep
	  markers[0] = anchor; map.addAnnotation(anchor);
rects[0] = null;  // add 25Jul
	  map.addEventListener("single-tap", clickMarkerA);
	} else if (params.has("Bing") || location.href.toLowerCase().indexOf("bing")>=0) {//mod 09Sep
markerLatitude = POSN.lat; markerLongitude = POSN.lng;  //Add 06Oct, to match AppleMaps2 30Jul
	  document.querySelector('title').textContent = "Bingmaps2";
    //window.history.replaceState({additionalInformation: 'Updated the URL with JS'}, "Bingmaps2", "http://bingmaps2.com");
	  map = new Microsoft.Maps.Map('#map', {center:new Microsoft.Maps.Location(POSN.lat, POSN.lng), zoom:(placeName&&isNaN(parseInt(placeName))?16:18)});  //mod 30Jun: zoom-in on numbered street addrs
//map.setView({mapTypeId: Microsoft.Maps.MapTypeId.aerial, zoom:18}); // 12Sep mod: per SLee
  map.setView({mapTypeId: Microsoft.Maps.MapTypeId.road, zoom:19}); // 04Nov mod: per SLee
	  Mxxyy = "@"+uPosn.Eing.toString().slice(-3,-1)+uPosn.Ning.toString().slice(-3,-1)  // add 09Sep
Axx = parseInt(Mxxyy.slice(1,3)), Ayy = parseInt(Mxxyy.slice(3,5)) //22Apr Global Anchor coords
      var pin = new Microsoft.Maps.Pushpin(map.getCenter(), {color:'blue', title:Mxxyy, subTitle:'(anchor)', text:'+'}); //mapTypeId: Microsoft.Maps.MapTypeId.aerial,
	  markers[0] = pin; map.entities.push(pin);
	//drawCircle(50, 'blue') //27Sep omit circles, per SLee
	//drawCircle(100, 'silver')
	//drawCircle(500, 'red')
    Microsoft.Maps.Events.addHandler(map, 'click', clickMarkerB);
    lastCode = Mxxyy+"."; lastUTM = uPosn; //31Oct add: support [More]
	  drawRect({lat:markerLatitude, lng:markerLongitude}, 500, 'blue')
  //document.getElementById("more").setAttribute("disabled", "disabled");  //04Nov del
	} else {
  map = new google.maps.Map(document.getElementById("map"), mapOptions);
  map.addListener('mousemove', updateLocators);
  const plussign = {url:'http://addressplus.co/plus-sign2t.png', size:new google.maps.Size(17,15), anchor:new google.maps.Point(8,8)};
  anchor = new google.maps.Marker({position:POSN, title:CXY, icon:plussign, animation:google.maps.Animation.DROP, map });
  new google.maps.Circle({center:POSN, radius:5, clickable:false, fillOpacity:0, strokeColor:"#00f", strokeWeight:0.5, map });
  ecmC1 = new google.maps.Circle({center:POSN, radius:50, strokeColor:"#00f", strokeWeight:4, strokeOpacity:0.33, fillOpacity:0, clickable:false, map }); //add 08Feb
  ecmC12 = new google.maps.Circle({center:POSN, radius:100, strokeColor:"#ccc", strokeWeight:4, strokeOpacity:0.67, fillOpacity:0.01, clickable:true, map }); //add 21Apr
  ecmC2 = new google.maps.Circle({center:POSN, radius:500, strokeColor:"#00f", strokeWeight:9, strokeOpacity:0.16, fillOpacity:0.02, clickable:false, map }); //add 10Feb
  ecmC2b = new google.maps.Circle({center:POSN, radius:500, strokeColor:"#f00", strokeWeight:1, strokeOpacity:0.67, fillOpacity:0, clickable:false, map });
  mlabel0 = new MapLabel({position:{lat:POSN.lat-0.00001, lng:POSN.lng-0.000045}, text:Cxxyy, fontColor:'#0000ff', fontSize:12, maxZoom:20, map});  // add 29Mar  NB: always shown
  ecmC12.addListener('mousemove', updateLocators);
  ecmC12.addListener("click", clickMarkerG); // everywhere within 100m ECM circle of anchor  //re-add 23Jun
	}
    document.getElementById("more").removeAttribute("disabled");  //04Nov add: enable [More] new anchor
    clearCode();
} 

	function drawCircle(siz, clr) { 
	// Draw a circle around the anchor
	  const deg_m = 90/1e7, rad_deg = Math.PI/180, coslat = Math.cos(POSN.lat*rad_deg), pts=[];
	  pts[0] = new Microsoft.Maps.Location(POSN.lat+siz*deg_m, POSN.lng);
	  for (i=1; i<=360; i++) pts[i] = new Microsoft.Maps.Location(POSN.lat+siz*Math.cos(i*rad_deg)*deg_m, POSN.lng+siz*Math.sin(i*rad_deg)*deg_m/coslat);
      var line = new Microsoft.Maps.Polyline(pts, {strokeColor:clr, strokeThickness:3, }); //strokeDashArray:[4, 4]});
      map.entities.push(line);
	}

	function drawRect(posn, siz, clr) { //add 06Oct
	// Draw a rectangle around the anchor
	  var LL, pts=[];
	  var u = toUTM(posn), z = u.Zone;  //04Nov WAS: toUTM({lat:POSN.lat,...
	  var uEing = parseInt(u.Eing.toString()), uNing = parseInt(u.Ning.toString()); //console.log(u.Eing+"_"+u.Ning)
	  u.Eing = uEing -siz; u.Ning = uNing -siz; LL = toLL(u, z); pts[0] = new Microsoft.Maps.Location(LL.lat, LL.lng); 
	  u.Eing = uEing +siz; u.Ning = uNing -siz; LL = toLL(u, z); pts[1] = new Microsoft.Maps.Location(LL.lat, LL.lng); 
	  u.Eing = uEing +siz; u.Ning = uNing +siz; LL = toLL(u, z); pts[2] = new Microsoft.Maps.Location(LL.lat, LL.lng); 
	  u.Eing = uEing -siz; u.Ning = uNing +siz; LL = toLL(u, z); pts[3] = new Microsoft.Maps.Location(LL.lat, LL.lng); 
	  pts[4] = pts[0]; 
      var rect = new Microsoft.Maps.Polyline(pts, {strokeColor:clr, strokeThickness:(clr=="blue"?2:1) }); //strokeDashArray:[4, 4]});
	  if (clr=="red") rects.push(rect);  // 04Nov add: [More] boundaries are removable
      map.entities.push(rect);
	}


  function updateLocators(e) {//alert(e.latLng.lng()+"&"+e.latLng.lat())
  // Update tracking coords and the infowindow locator string, iff visible (performance)
    var elat = e.latLng.lat(), elng = e.latLng.lng();
    document.getElementById("LL").value = elng.toFixed(6)+"_"+elat.toFixed(6);
  //var u = toUTM({lat:elat, lng:elng});
  const u = UGRS({lat:elat, lng:elng}); //console.log(utx); 
    document.getElementById("tile").value = u.slice(0,7)+u.slice(10,12);
    document.getElementById("1Mloc").value = u.slice(7,10)+u.slice(12,15);
  }
	function clickMarkerA(e) { // for Apple
	//for (const [key, value] of Object.entries(e)) console.log(`${key}: ${value}`);
	  var coord = map.convertPointOnPageToCoordinate(e.pointOnPage); //console.log(coord.latitude+","+coord.longitude)
	  clickMarker1(coord.latitude, coord.longitude);
	}
	function clickMarkerB(e) { // for Bing
	//for (var key in e) if (e.hasOwnProperty(key)) console.log(key + " -> " + e[key]);
 	  clickMarker1( e['location'].latitude, e['location'].longitude);
	}
    function clickMarkerG(e) {clickMarker1(e.latLng.lat(), e.latLng.lng());}  // for Google

function clearCode() { with(document.getElementById("code")) { value = ""; setAttribute("style","color:black"); focus();} }

var rmarkers = "";  //add 25Aug: track rectangles (center-markers)	
//function clickMarker(e) {clickMarker1(e.latLng.lat(), e.latLng.lng());}
  function clickMarker1(elat, elng) { //alert("at clickMarker1")
// Create marker per click anywhere on the map
  //var u = toUTM({lat:elat, lng:elng}, uPosn.Zone); //console.log("  "+u.Eing+"&"+u.Ning); 
    var u = toUTM({lat:elat, lng:elng}), z = u.Zone; //Fix 30Jul24
    var d = Math.sqrt((u.Eing-uPosn.Eing)*(u.Eing-uPosn.Eing) + (u.Ning-uPosn.Ning)*(u.Ning-uPosn.Ning)); if (d>9e9) return;  //13 void //add 23Jun: limit 1km circle
const MXY = u.Eing.toString().slice(3,4)+u.Ning.toString().slice(4,5); //console.log(MXY) // static sub-tile id 
const uEing = u.Eing.toString(), uNing = u.Ning.toString(); 
var Mxxyy = (Mtype==2?uEing.slice(-3,-2)+uNing.slice(-3,-2):"")+"@"+uEing.slice(-Math.abs(Mtype))+uNing.slice(-Math.abs(Mtype)); // mod 30Mar; mod 30Jun
var rMxxyy = uEing.slice(-4,-3)+uNing.slice(-4,-3)+Mxxyy;  // add 18Oct: track within 10km sub-tile
    var i, j, ij, xx = parseInt(Mxxyy.slice(1,3)), yy = parseInt(Mxxyy.slice(-2)); //console.log(xx+","+yy)
   if (d>50) {  //add 23Jun: infer Qcase beyond 50m
    i = 0; if (u.Eing<uPosn.Eing-50) i = -1; else if(u.Eing>uPosn.Eing+50) i = +1;
    j = 0; if (u.Ning<uPosn.Ning-50) j = -1; else if(u.Ning>uPosn.Ning+50) j = +1;
   } else {
	if (Cxx50>=0) i = (xx>=(100-Cxx50)?+1:0); else i = (xx>=(100+Cxx50)?-1:0);
	if (Cyy50>=0) j = (yy>=(100-Cyy50)?+1:0); else j = (yy>=(100+Cyy50)?-1:0);
   }
	ij = (5 +i -3*j); //console.log(xx+","+yy+"; "+i+","+j+","+ij)
	if (params.has("Apple") || location.href.toLowerCase().indexOf("appl")>=0) { //mod 09Sep //add 7Jul24
markerLatitude = elat; markerLongitude = elng;  //Add 30Jul24
 var Mxy = u.Eing.toString().slice(-1)+u.Ning.toString().slice(-1); //add 25Aug: save low 2-digits	
    //var LL = toLL(u, uPosn.Zone); elat = LL.lat; elng = LL.lng;  // snap marker accordingly
    //var LL = toLL(u, z); elat = LL.lat; elng = LL.lng;  //NOT 25Aug: snap coord, to center box
//var LLc = toLL({Ning:10*Math.trunc(u.Ning/10)+5, Eing:10*Math.trunc(u.Eing/10)+5}, z); //console.log(LLc); //add 25Jul: center of 10x10 cell 
 var LLc = toLL({Ning:10*Math.trunc(u.Ning/10)-1, Eing:10*Math.trunc(u.Eing/10)+5}, uPosn.Zone); //console.log(LLc); //mod 06Sep: bottom-center of 10x10 cell 
	  ij = ""; Mxxyy = "@"+uEing.slice(-3,-1)+uNing.slice(-3,-1);  //add 15Jul: hundreds * tens digits 
 if (true) ij = uEing.slice(-1)+uNing.slice(-1);	//add 06Sep: display low 2-digits of 6-digit code in glyph 
	//if (marker) map.removeAnnotation(annotation);
	//marker = new mapkit.Annotation(new mapkit.Coordinate(elat, elng), annof); //not 25Aug
 if (false && rmarkers.indexOf(Mxxyy)<0) { rmarkers += Mxxyy;  // sup 08Sep add 25Aug: post only once
	//marker = new mapkit.MarkerAnnotation(new mapkit.Coordinate(LLc.lat, LLc.lng), {callout:calloutDelegate, data:"X", title:Mxxyy, subtitle:'', glyphText:'!'});
	//marker = new mapkit.Annotation(new mapkit.Coordinate(LLc.lat, LLc.lng), annof, {title:Mxxyy, subtitle:''});
	//markers.push(marker); map.addAnnotation(marker, {title:Mxxyy,});
//rect = rectf(u, uPosn.Zone); rects.push(map.addOverlay(rect));  //Add 25Jul 
  rect = rectf(u, z); rects.push(map.addOverlay(rect));  //Fix 30Jul24
	  marker = new mapkit.Annotation(new mapkit.Coordinate(LLc.lat, LLc.lng), factory, {title:"55", callout:xCallout, data:{xxyy:Mxxyy}});  // rep 4Sep
	  markers.push(marker); map.addAnnotation(marker);
 }
	//marker = new mapkit.MarkerAnnotation(new mapkit.Coordinate(elat, elng), {title:'', subtitle:'', glyphText:"."+Mxy});  //08Sep re-del //06Sep: re-ins
	  marker = new mapkit.MarkerAnnotation(new mapkit.Coordinate(elat, elng), {title:Mxxyy, subtitle:'', glyphText:("."+(ij?ij:"55"))}); //08Sep: rep
	  markers.push(marker); map.addAnnotation(marker);
	} else if (params.has("Bing") || location.href.toLowerCase().indexOf("bing")>=0) { //mod 09Sep
markerLatitude = elat; markerLongitude = elng;  //Add 06Oct to match Applemaps2 30Jul24
	//if (marker) map.entities.remove(marker);
 ij = ""; Mxxyy = "@"+uEing.slice(-3,-1)+uNing.slice(-3,-1);  //add 09 Sep like //add 15Jul: hundreds * tens digits 
var Mxy = u.Eing.toString().slice(-1)+u.Ning.toString().slice(-1); //add 09Sep: save low 2-digits	
    //marker = new Microsoft.Maps.Pushpin(new Microsoft.Maps.Location(elat, elng), {title:Mxxyy, subTitle:'', text:ij+""}); //09Sep Del
var fm=false; if (rmarkers.indexOf(rMxxyy)<0) { rmarkers += rMxxyy; fm = true;}  //12Sep Add: only show at-code once per tile; 18Oct mod: track to sub-tile
      marker = new Microsoft.Maps.Pushpin(new Microsoft.Maps.Location(elat, elng), {title:(fm?Mxxyy:""), subTitle:'', text:"."+Mxy}); //12Sep mod //09Sep rep
	  markers.push(marker); map.entities.push(marker);
 addMarkerRow(Mxxyy);  // 22Apr25
  if (fm) { rect = rectb(u, uPosn.Zone); rects.push(rect); map.entities.push(rect);}  //27Sep always, once per cell show 10x10m box
//handler = new  Microsoft.Maps.Events.addHandler(marker, 'rightclick', handleRtClick);  //*NB: not avail~
//but see: https://learn.microsoft.com/en-us/bingmaps/v8-web-control/map-control-concepts/event-examples/right-click-events-for-shapes
  lastCode = Mxxyy+"."+Mxy; lastUTM = toUTM({lat:elat, lng:elng}); //30Oct add: support [More]
  document.getElementById("more").removeAttribute("disabled");
	} else {
  if (marker) { marker.setMap(); mlabel.setMap();}
  var img = "https://maps.google.com/mapfiles/ms/icons/pink.png";
  var txt = u.Eing.toString().slice(-3)+u.Ning.toString().slice(-3);
  marker = new google.maps.Marker({position:{lat:elat, lng:elng}, label:ij+"", title:txt, icon:img, map});
  mlabel = new MapLabel({position:{lat:elat-0.00001, lng:elng-0.000045}, text:Mxxyy, fontColor:'#ff00ff', fontSize:12, maxZoom:20, map});
    }
  }
  
 function annof() { //add 25Aug //see: https://developer.apple.com/documentation/mapkitjs/annotation
  var div = document.createElement("div"); div.className = "circle-annotation"; //<div>&nbsp;</div>"; 
  return div;
 }  

var calloutDelegate = {
    // Return a div element and populate it with information from the
    // annotation, including a link to a review site.
    calloutElementForAnnotation: function(annotation) { //console.log("callout")
        var element = document.createElement("div");
        var title = element.appendChild(document.createElement("h1"));
        title.textContent = annotation.text;
        element.className = "callout-annotation";
        return element;
    },
};
  
function showMarkerList(th) { //17Aug: in development, comma-separated list
var k=0, v = th.value.split(","); while(++k<=v.length) showMarker1(v[k-1].trim());  //add 17Aug: allow a list
}
function showMarker(th) { //console.log("at showMarker '"+th.value+"' "+th.value.toString().length)
  var u = {}, v = th.value;
  if (th.value.slice(-1)=='.') v = v.slice(0,4);  // 08Sep add: hidden option for 10x10m box
 if (v.length==6) {v = v.slice(0,4)+"."+v.slice(-2); th.value = v;}  // add 17Aug: treat all 6-digits as XXYY.xy
  if (v.charAt(0)=="@") v = v.slice(1);  //add 30Jun, trim leading @, if any
  if (v.indexOf("@")==2) v = v.charAt(0)+v.slice(3, 3+(v.length-3)/2)+v.charAt(1)+v.slice(3+(v.length-3)/2); // if infix @, convert prefix XY to infix
  if (v.charAt(-1)=="#") v = v.slice(0, v.length-1); if (v.indexOf("#")>0) v = v.replace("#", "5")+"5"; //console.log(v) //add 30Jun: 10m abbrev
  u.Eing = uPosn.Eing; u.Ning = uPosn.Ning;
  switch(v.length) {
    case 2: v = v.charAt(0)+5+v.charAt(1)+5; //NB: fall-thru  //add 30Jun: 2-digit super-shortform
  //case 4: var ij = 5; u.Eing -= (u.Eing%100 -parseInt(v.slice(0,2))); u.Ning -= (u.Ning%100 -parseInt(v.slice(-2))); break;
    case 4: var i, j, xx = parseInt(v.slice(0,2)), yy = parseInt(v.slice(-2));
	if (true || params.has("Apple") || location.href.toLowerCase().indexOf("appl")>=0) { //mod 09Sep: all cases //add 7Jul24
	  u.Eing -= (u.Eing%1000 -(10*xx +5)); u.Ning -= (u.Ning%1000 -(10*yy +5)); break;  //add 15Jul --treat as 6-digits: xx5yy5
	}  
			if (Cxx50>=0) i = (xx>=(100-Cxx50)?+1:0); else i = (xx>=(100+Cxx50)?-1:0);
			if (Cyy50>=0) j = (yy>=(100-Cyy50)?+1:0); else j = (yy>=(100+Cyy50)?-1:0);
			v = (5 +i -3*j) +v; //console.log(v) // NB: add Qcase digit and *fall-thru*
	case 5: var ij = parseInt(v.charAt(0)), i = ((ij%3?ij%3:3) -2), j = (ij<4?+1:ij<7?0:-1); //console.log (ij+" "+i+" "+j)
	u.Eing -= (u.Eing%100 -parseInt(v.slice(-4,-2)) -100*i); u.Ning -= (u.Ning%100 -parseInt(v.slice(-2))-100*j); break;
  case 7: v = v.slice(0,2)+v.slice(-2,-1)+v.slice(2,4)+v.slice(-1); //console.log(v) //add 12Aug: allow 1m suffix; NB: Falls-thru
	case 6: var ij=0; u.Eing -= (u.Eing%1000 -parseInt(v.slice(0,3))); u.Ning -= (u.Ning%1000 -parseInt(v.slice(-3))); break; //console.log(LL)
	default: document.getElementById("code").setAttribute("style","color:red"); alert("Bad code; re-enter"); return;
  } //console.log(v.length +"; "+u.Eing+" "+u.Ning)
//*  
 var delE=0, delN=0; //console.log(uPosn.Eing+"_"+uPosn.Ning) //add 24Aug24: ECM logic for 1x1 km tile
 if (uPosn.Eing%1000<500) {if (u.Eing%1000>=(uPosn.Eing+500)%1000) delE = -1000;} else {if (u.Eing%1000<(uPosn.Eing-500)%1000) delE = +1000;}
 if (uPosn.Ning%1000<500) {if (u.Ning%1000>=(uPosn.Ning+500)%1000) delN = -1000;} else {if (u.Ning%1000<(uPosn.Ning-500)%1000) delN = +1000;}
 u.Eing += delE; u.Ning += delN;
//*/
  var LL = toLL(u, uPosn.Zone); //console.log(LL)
//var LLc = toLL({Ning:10*Math.trunc(u.Ning/10)+5, Eing:10*Math.trunc(u.Eing/10)+5}, uPosn.Zone); //console.log(LLc); //add 25Jul: center of 10x10 cell 
 var LLc = toLL({Ning:10*Math.trunc(u.Ning/10)-1, Eing:10*Math.trunc(u.Eing/10)+5}, uPosn.Zone); //console.log(LLc); //mod 06Sep: bottom-center of 10x10 cell 
const uEing = u.Eing.toString(), uNing = u.Ning.toString(); 
var Mxxyy = (Mtype==2?uEing.slice(-3,-2)+uNing.slice(-3,-2):"")+"@"+uEing.slice(-Math.abs(Mtype))+uNing.slice(-Math.abs(Mtype)); // mod 30Mar; mod 30Jun
var rMxxyy = uEing.slice(-4,-3)+uNing.slice(-4,-3)+Mxxyy;  // add 18Oct: track within 10km super-tile
//console.log(rMxxyy)
	elat = LL.lat; elng = LL.lng;
if (v.length==6) { var d = 0.5*(9/1e6); elng += d*Math.cos(elat*Math.PI/180); elat += d;}  //mod 17Aug: (roughly) center 6-digits in 1x1m //NB: *1*m
	if (params.has("Apple") || location.href.toLowerCase().indexOf("appl")>=0) { //mod 09Sep //add 7Jul24
	//if (marker) map.removeAnnotation(annotation);  // NB: annotation is Global, by default
	  ij = ""; Mxxyy = "@"+uEing.slice(-3,-1)+uNing.slice(-3,-1)  //add 15Jul: hundreds * tens digits
if (v.length==6) ij = uEing.slice(-1)+uNing.slice(-1);	//add 31Jul: display low 2-digits of 6-digit code in glyph 
    if (true || v.length==6) {  //mod 08 Sep add 4Sep: markers only for 6-digits
    //marker = new mapkit.MarkerAnnotation(new mapkit.Coordinate(elat, elng), {title:'', subtitle:'', glyphText:(ij?"."+ij:"!")}); //del 08Sep
	  marker = new mapkit.MarkerAnnotation(new mapkit.Coordinate(elat, elng), {title:Mxxyy, subtitle:'', glyphText:("."+(ij?ij:"55"))}); //rep 08Sep
      markers.push(marker); map.addAnnotation(marker);
    }   
 if (th.value.slice(-1)==".") { rect = rectf(u, uPosn.Zone); rects.push(map.addOverlay(rect));} //08Sep add: hidden option for 10x10m box
 if (false && rmarkers.indexOf(Mxxyy)<0) { rmarkers += Mxxyy; //sup 08Sep //add 25Aug: post 4-digit code only once, at center
	  rect = rectf(u, uPosn.Zone); rects.push(map.addOverlay(rect));  //Mov 29 Jul Add 25Jul
	//marker = new mapkit.MarkerAnnotation(new mapkit.Coordinate(LLc.lat, LLc.lng), {color:rgb(255,0,0), title:Mxxyy, subtitle:'', glyphImage:{1:'plus-sign2t.png'}});
	  marker = new mapkit.Annotation(new mapkit.Coordinate(LLc.lat, LLc.lng), factory, {title:"55", callout:xCallout, data:{xxyy:Mxxyy}});  // rep 4Sep
	  markers.push(marker); map.addAnnotation(marker);
 }
markerLatitude = elat; markerLongitude = elng;  //Add 30Jul24
	} else if (params.has("Bing") || location.href.toLowerCase().indexOf("bing")>=0) {  //mod 09Sep
	  ij = ""; Mxxyy = "@"+uEing.slice(-3,-1)+uNing.slice(-3,-1)  //add 09Sep like 15Jul: hundreds * tens digits
if (v.length==6) ij = uEing.slice(-1)+uNing.slice(-1);	//add 09Sep like 31Jul: display low 2-digits of 6-digit code in glyph 
var rMxxyy = uEing.slice(-4,-3)+uNing.slice(-4,-3)+Mxxyy;  // add 04Nov: omitted before track within 10km super-tile
//console.log(rMxxyy)
//if (th.value.slice(-1)==".") { rect = rectb(u, uPosn.Zone); rects.push(rect); map.entities.push(rect);} //27Sep del //09Sep like 08Sep add: hidden option for 10x10m box
 	//if (marker) map.entities.remove(marker);
var fm=false; if (rmarkers.indexOf(rMxxyy)<0) { rmarkers += rMxxyy; fm = true;}  //12Sep Add: only show at-code once per tile; 18Oct mod: track to sub-tile
//console.log(fm + rmarkers)
    //marker = new Microsoft.Maps.Pushpin(new Microsoft.Maps.Location(elat, elng), {title:(fm?Mxxyy:""), subTitle:'', text:("."+(ij?ij:"55"))});  //12Sep //mod 09Sep like 08Sep
	 if (ij)
      marker = new Microsoft.Maps.Pushpin(new Microsoft.Maps.Location(elat, elng), {title:(fm?Mxxyy:""), subTitle:'', text:(ij?"."+ij:"")});  //27Sep mod: only show explicit 1M suffix
	 else 
      marker = new Microsoft.Maps.Pushpin(new Microsoft.Maps.Location(elat, elng), {title:(fm?Mxxyy:""), subTitle:'', icon:'https://upload.wikimedia.org/wikipedia/commons/c/ca/1x1.png'});  //28Sep mod: no marker at 4-digit center
	  markers.push(marker); map.entities.push(marker);
 addMarkerRow(Mxxyy);  // 22Apr25
  if (fm) { rect = rectb(u, uPosn.Zone); rects.push(rect); map.entities.push(rect);} //27Sep always, once per cell show 10x10m box
//handler = new  Microsoft.Maps.Events.addHandler(marker, 'rightclick', handleRtClick);  //*NB: not avail~
//but see: https://learn.microsoft.com/en-us/bingmaps/v8-web-control/map-control-concepts/event-examples/right-click-events-for-shapes
  lastCode = Mxxyy+"."+ij; lastUTM = toUTM({lat:elat, lng:elng}); //30Oct add: support [More]
  document.getElementById("more").removeAttribute("disabled");
  } else {
  if (marker) { marker.setMap(); mlabel.setMap();}
  var img = "https://maps.google.com/mapfiles/ms/icons/pink.png";
  var txt = u.Eing.toString().slice(-3,-2)+u.Ning.toString().slice(-3,-2);
//const Mxxyy = "@"+u.Eing.toString().slice(-2)+u.Ning.toString().slice(-2); // mod 30Mar
  marker = new google.maps.Marker({position:LL, label:(ij?ij.toString():""), title:txt, icon:img, map});
  mlabel = new MapLabel({position:LL, text:Mxxyy, fontColor:'#ff00ff', fontSize:12, maxZoom:20, map});
    }
 markerLatitude = elat; markerLongitude = elng;  //Add 06Oct to match Applemaps2 30Jul24
  clearCode();  //add 24Aug: per SLee	
}

function rectf(u, z) { //add 25Jul  10m box around UTM coord 
var LL={}, rectPts = new Array(5);
//var u={}; u.lat = u_.lat; u.lng = u_.lng;  //Del 30Jul add 28Jul: protect orig u_
var uEing = parseInt(u.Eing.toString()), uNing = parseInt(u.Ning.toString()); ///console.log(u.Eing+"_"+u.Ning)
 uEing -= (uEing%10 -5); uNing -= (uNing%10 -5); //console.log(uEing+"_"+uNing) // Add 30Jul  always snap to middle of 10x10m su-sub-tiles
 u.Eing = uEing -5; u.Ning = uNing -5; LL = toLL(u, z); rectPts[0] = new mapkit.Coordinate(LL.lat, LL.lng); //console.log(u.Eing+"_"+u.Ning+"; "+LL.lat+","+LL.lng)
 u.Eing = uEing +5; u.Ning = uNing -5; LL = toLL(u, z); rectPts[1] = new mapkit.Coordinate(LL.lat, LL.lng); //console.log(u.Eing+"_"+u.Ning+"; "+LL.lat+","+LL.lng)
 u.Eing = uEing +5; u.Ning = uNing +5; LL = toLL(u, z); rectPts[2] = new mapkit.Coordinate(LL.lat, LL.lng); //console.log(u.Eing+"_"+u.Ning+"; "+LL.lat+","+LL.lng)
 u.Eing = uEing -5; u.Ning = uNing +5; LL = toLL(u, z); rectPts[3] = new mapkit.Coordinate(LL.lat, LL.lng); //console.log(u.Eing+"_"+u.Ning+"; "+LL.lat+","+LL.lng)
 rectPts[4] = rectPts[0]; 
 return new mapkit.PolylineOverlay(rectPts, {style: new mapkit.Style({lineWidth:2, strokeColor:"#FF0"})});
}
function rectb(u, z) { //add 09Sep like rectf, for bing
var LL={}, rectPts = new Array(5);
//var u={}; u.lat = u_.lat; u.lng = u_.lng;  //Del 30Jul add 28Jul: protect orig u_
var uEing = parseInt(u.Eing.toString()), uNing = parseInt(u.Ning.toString()); ///console.log(u.Eing+"_"+u.Ning)
 uEing -= (uEing%10 -5); uNing -= (uNing%10 -5); //console.log(uEing+"_"+uNing) // Add 30Jul  always snap to middle of 10x10m su-sub-tiles
 u.Eing = uEing -5; u.Ning = uNing -5; LL = toLL(u, z); rectPts[0] = new Microsoft.Maps.Location(LL.lat, LL.lng); 
 u.Eing = uEing +5; u.Ning = uNing -5; LL = toLL(u, z); rectPts[1] = new Microsoft.Maps.Location(LL.lat, LL.lng); 
 u.Eing = uEing +5; u.Ning = uNing +5; LL = toLL(u, z); rectPts[2] = new Microsoft.Maps.Location(LL.lat, LL.lng); 
 u.Eing = uEing -5; u.Ning = uNing +5; LL = toLL(u, z); rectPts[3] = new Microsoft.Maps.Location(LL.lat, LL.lng); 
 rectPts[4] = rectPts[0]; 
 return new Microsoft.Maps.Polyline(rectPts, {strokeThickness:3, strokeColor:"#FF0"});
}
//for (i=1; i<=360; i++) pts[i] = new Microsoft.Maps.Location(POSN.lat+siz*Math.cos(i*rad_deg)*deg_m, POSN.lng+siz*Math.sin(i*rad_deg)*deg_m/coslat); //refc
//var line = new Microsoft.Maps.Polyline(pts, {strokeColor:clr, strokeThickness:3, }); //strokeDashArray:[4, 4]});

function clearMarkers() { //console.log("atClearMarkers");
 rmarkers = "";  //add 25Aug
  if(params.has("Apple") || location.href.toLowerCase().indexOf("appl")>=0) {
    map.removeAnnotations(markers.slice(1)); markers.length = 1; //add 25Jul24 
map.removeOverlays(rects.slice(1)); rects.length = 1; // rep 25Jul24
  } else if(params.has("Bing") || location.href.toLowerCase().indexOf("bing")>=0) {
    var L = markers.length; while (--L>0) map.entities.remove(markers[L]); //NB: map.entities.clear(); for All
	var L = rects.length; while (--L>=0) map.entities.remove(rects[L]);  //add 09Sep
clearMarkerRows();  // 22Apr25
	document.getElementById("more").setAttribute("disabled", "disabled")
  } else {
  //TBW
  }
}

//function handleRtClick() { alert("clicked")}  // 30Oct add: Rtclick on marker: NOT Avialable in Bing
  function showMore() { //alert("at showMore "+lastCode) // 31Oct add: show 8 matched queens-case locations
    var f; if (markers.length==1) {f = true; map.entities.remove(markers[0]);}  //04Nov Add: allow More at anchor to show
	const Mxxyy = lastCode, uEing = lastUTM.Eing, uNing = lastUTM.Ning, z = lastUTM.Zone;
	var LL = {}, u = {}; 
	for (var j=+1; j>=-1; j--)
	 for (var i=-1; i<=+1; i++) 
//var q = (5 +i -3*j);console.log(f+" "+i+" "+j+" "+q) //NONO: Breaks loop!
	  if (f||(i||j)) { //04Nov include center if anchor //  skip center location, already marked
	   u.Eing = uEing +1000*i; u.Ning = uNing +1000*j;
	   LL = toLL(u, z); 
		if (Mxxyy.length>6)
      marker = new Microsoft.Maps.Pushpin(new Microsoft.Maps.Location(LL.lat, LL.lng), {title:Mxxyy.slice(0,5), subTitle:'', text:Mxxyy.slice(-2)});  //27Sep mod: only show explicit 1M suffix
		else 
      marker = new Microsoft.Maps.Pushpin(new Microsoft.Maps.Location(LL.lat, LL.lng), {title:Mxxyy.slice(0,5), subTitle:'', icon:'https://upload.wikimedia.org/wikipedia/commons/c/ca/1x1.png'});  //28Sep mod: no marker at 4-digit center
		markers.push(marker); map.entities.push(marker);
  if (true) { var rect = rectb(u, z); rects.push(rect); map.entities.push(rect);} //always, show 10x10m box
 addMarkerRow((i-3*j+5)+Mxxyy.slice(1,5));  // 22Apr25
	  }
	drawRect({lat:markerLatitude, lng:markerLongitude}, 995, 'red') //04 Add: box around the 9 markers
  document.getElementById("more").setAttribute("disabled", "disabled");  //04Nov add: prevent dupe [mores]
  }

var factory = function(coordinate, options) {
    var div = document.createElement("div");
    div.textContent = options.data.xxyy;
    div.className = "circle-annotation1";
    return div;
};
var CALLOUT_OFFSET1 = new DOMPoint(-0, +25);
var xCallout = {
  calloutElementForAnnotation: function(annotation) {
    return calloutForLandmark1Annotation(annotation);
  },
  calloutAnchorOffsetForAnnotation: function(annotation, element) {
    return CALLOUT_OFFSET1;
  },
}
function calloutForLandmark1Annotation(annotation) {  
// TBA
  var div = document.createElement("div");
  div.className = "callout1";
  var title = div.appendChild(document.createElement("h5"));
  title.textContent = "50"; //annotation.landmark.title;
  return div;
}
