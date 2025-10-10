// Basic UTM Projection - Public Domain
/**
 * Standard Universal Transverse Mercator (UTM) projection.
 *
 * Projects geographic Longitude & Latitude to UTM Easting & Northing; and reciprocally Easting & Northing to Longitude & Latitude.
 *
 * @link URL https://en.wikipedia.org/wiki/Universal_Transverse_Mercator_coordinate_system
 *
 * toUTM(LLPnt), the "forward projection"
 * ----------
 * @param {object} LLPnt an object that represents a longitude & latitude point (decimal degrees), which may be:
 *    1) Google LatLng(lat(), lng()) point; or 
 *    2) a Google literal point {lat: const, lng: const}, case and order specific; 
 *    3) a naive {Lon: var, Lat: var}, in which the coordinates can be calculated, case and order is immaterial
 *
 * @return {object} ENPnt an object that represents the UTM point (whole metres) corresponding to LLPnt, which is always:
 *   {Eing:xxx, Ning:yyy, Zone:zz}, where Eing is 6-digit Easting, centered on 500000; Ning is upto 7-digit Northing, from SP or EQ; 
 *    and Zone is UTM zone, absolute value in 1:60, signed -ve for S. hemisphere
 *
 * toLL(ENPnt, [Zone]), the "reverse projection"
 * ----------
 * @param {object} ENpnt, an object that represents a UTM point (whole metres), viz.
 *   {Eing:xxx, Ning:yyy, [Zone:zz]), where the Zone element is optional; if present, absolute value in 1:60, signed -ve for S. hemisphere
 * @param (int} Zone, UTM zone specification, optional; if present overrides any ,Zone: element in ENPnt
 *
 * return {object} LLPnt, an object that represents the Longitude & Latitude (decimal degrees) corresponding to ENPnt, which may be:
 *   1) a Google LatLng(lat(), lng())object, if the optional Zone parameter is present; 
 *   2) a naive {Lon: xxx, Lat: yyy} object, if the Zone parameter is omitted (but present in the LLPnt parameter)
 *
 * toUGRS(LLPnt), NATO grid-square plus 1km tile identifier
 * ----------
 * @param {object} LLPnt an object that represents a longitude & latitude point (decimal degrees), which may be:
 *    1) Google LatLng(lat(), lng()) point; or 
 *    2) a Google literal point {lat: const, lng: const}, case and order specific; 
 *    3) a naive {Lon: var, Lat: var}, in which the coordinates can be calculated, case and order is immaterial
 *
 * @return {string} Universal Geographic Reference System prefix = NATO Grid Square plus 10-digit UTM coord (whole metres) corresponding to LLPnt
 *      'zzgggeeeeennnn', where { zz is zone, ggg is 100km grid-square (AL "new" system), eeeee is 5-digit Easting, nnnnn is 5-digit Northing }
 *
*/
// Global constants
  const	
	Re = 6378.137,
	f1 = 1/298.257223563,
	N0 = 0,
	E0 = 500,
	k0 = 0.9996,
	n1 = f1/(2 - f1), n2 = n1*n1, n3 = n1*n2,
	Rn = Re/(1 + n1)*(1 + n2/4*(1 + n2/16)),
	alfa1 = 0.5*n1 - 2/3*n2 + 5/16*n3, alfa2 = 13/48*n2 - 3/5*n3, alfa3 = 61/240*n3,
	beta1 = 0.5*n1 - 2/3*n2 + 37/96*n3, beta2 = 1/48*n2 + 1/15*n3, beta3 = 17/480*n3,
	gama1 = 2*n1 - 2/3*n2 - 2*n3, gama2 = 7/3*n2 - 8/5*n3, gama3 = 56/15*n3,
	R_D = Math.PI/180;

function toUTM (LLPnt) {//alert(typeof LLPnt + " "+Object.keys(LLPnt)[0]+Object.keys(LLPnt)[1]); //includes "lng" iff Google LatLng
// Project Lon & Lat to UTM Easting & Northing
// LLPnt may be a Google.maps LatLng object or literal {lat: y, lng: x}; or a naive coordinate {Lon: x, Lat: y} <-- NB: case and order of elements
 
  var Result = {Eing:NaN, Ning:NaN, Zone:0};
	if (Re === undefined) setConst(); //alert(Re+" "+n1)
	if (Object.keys(LLPnt)[1]=="lng") {
	 try { Lat = LLPnt.lat(); Lon = LLPnt.lng(); } catch { Lat = LLPnt.lat; Lon = LLPnt.lng;}  // Google LatLng or literal, order strict
	} else {
     const i=(Object.keys(LLPnt)[0].indexOf("o")>0?0:1); Lon = Object.values(LLPnt)[i]; Lat = Object.values(LLPnt)[1-i];  // else both case, order immaterial
	}
  var shem = (Lat<0?1:0); zone = Math.trunc(Lon/6) + 30, GSize10 = 10e6;  // defined 10,000 km EQ to NP
  if((Lat>38.80&&Lat<39.05)&&(Lon>-120&&Lon<-119.875)) zone = 10; //TEST: special case for SLT basin area
//alert(Lon+"&"+Lat+"; "+(shem?"-":"+")+zone);
	var lda = Lon*R_D, phi = Lat*R_D; 
	var sinphi = Math.sin(phi); 
	var sindlda = Math.sin(lda - (6*zone-183)*R_D), cosdlda = Math.sqrt(1 - sindlda*sindlda); //alert(sindlda+" "+cosdlda)
	var sqrt2n1 = 2*Math.sqrt(n1)/(1 + n1); //alert(sqrt2n1)
	var t2 = Math.sinh(Math.atanh(sinphi)-sqrt2n1*Math.atanh(sqrt2n1*sinphi));
	var xsi1 = Math.atan(t2/cosdlda); eta1 = Math.atanh(sindlda/Math.sqrt(1 + t2*t2));
	var E = E0 + k0*Rn*(eta1 
		   + alfa1*Math.cos(2*xsi1)*Math.sinh(2*eta1)
		   + alfa2*Math.cos(4*xsi1)*Math.sinh(4*eta1)
		   + alfa3*Math.cos(6*xsi1)*Math.sinh(6*eta1) );
	var N = N0 + k0*Rn*(xsi1 
		   + alfa1*Math.sin(2*xsi1)*Math.cosh(2*eta1)
		   + alfa2*Math.sin(4*xsi1)*Math.cosh(4*eta1)
		   + alfa3*Math.sin(6*xsi1)*Math.cosh(6*eta1) );
	Result.Eing = Math.round(E*1e3)%GSize10; Result.Ning = Math.round(N*1e3)%GSize10; // m units, ?truncated to Box
	Result.Zone = zone
    if (shem) { Result.Ning += GSize10; Result.Zone = -Result.Zone }
	return Result;
}

function toLL (ENPnt, Zone) { // Zone param is optional, if present returns Google {lat:, lng:} literal; |Zone| in [1,60], -ve for S. hemisphere
// De-Project UTM Easting & Northing to Lon & Lat
// ENPnt is a naive coordinate {Eing: x, Ning: y, Zone: zn} <-- NB: order of elements; Zone: element is ignored, m/b omitted, if Zone param is present 
  var Result = {}; // either {Lon:-, Lat:-} iff Zone: is present in ENPnt; else {lat:-, lng:-}, a Google.maps LatLng literal, when Zone param is present
	var Em = ENPnt.Eing, Ea = 0, Nm = ENPnt.Ning, Na = 0; // m units input, presume no anchor
	if (typeof Zone == 'number') zone = Zone; else zone = ENPnt.Zone;
	var shem = (zone<0?1:0); zone = Math.abs(zone); 
//alert(Em+"&"+Nm+"; "+(shem?"-":"+")+zone);	
	var E = Em*1e-3, E0 = 500, N = Nm*1e-3, N0 = 0;  // km units from here on
	var xsi = (N - N0 + shem*10000)/(k0*Rn), eta = (E - E0)/(k0*Rn);
	var xsi1 = xsi 
			  - beta1*Math.sin(2*xsi)*Math.cosh(2*eta) 
			  - beta2*Math.sin(4*xsi)*Math.cosh(4*eta) 
			  - beta3*Math.sin(6*xsi)*Math.cosh(6*eta); 
	var eta1 = eta 
			  - beta1*Math.cos(2*xsi)*Math.sinh(2*eta) 
			  - beta2*Math.cos(4*xsi)*Math.sinh(4*eta) 
			  - beta3*Math.cos(6*xsi)*Math.sinh(6*eta);
	var lda0 = (6*zone - 183)*R_D;
	var lda = lda0 + Math.atan(Math.sinh(eta1)/Math.cos(xsi1));
	var chi = Math.asin(Math.sin(xsi1)/Math.cosh(eta1));
	var phi = chi + gama1*Math.sin(2*chi) + gama2*Math.sin(4*chi) + gama3*Math.sin(6*chi);
//var Lon = Math.round(1e5*lda/R_D)*1e-5, Lat = Math.round(1e5*phi/R_D)*1e-5;
  var Lon = lda/R_D, Lat = phi/R_D; //console.log(Lat+" "+Lon)  //mod 25Jul24
	if (shem) Lat = -Lat;
	if (typeof Zone == 'number') { Result.lat = Lat; Result.lng = Lon;} else { Result.Lon = Lon; Result.Lat = Lat;}
	return Result;
}

function UGRS(LL) { // Computes Universal Geographic Reference String = NATO Grid Square plus 10-digit UTM coord
  const ALFABET = "ABCDEFGHJKLMNPQRSTUVWXYZ";
  var Result;
	var lat = LL.lat, lng = LL.lng;
	var u = toUTM({lat:lat, lng:lng}); //alert(u.Eing+"_"+u.Ning+" "+u.Zone) 
	var e = Math.trunc(u.Eing/1e5), n = Math.trunc((u.zone<0 ? 1e7-u.Ning : u.Ning)/1e5), z = Math.abs(u.Zone); //alert(e+"_"+n+" "+z)
	var b = ALFABET.charAt(12+Math.trunc(lat/8)+(lat<0?-1:0)); //alert (b)
	var c = ALFABET.charAt(8*((z-1)%3)+e-1); //alert(c)
	var r = ALFABET.charAt(6*((z-1)%2)+n%20); //alert(r)
	Result = ((100+z).toString().slice(1)+b+c+r+u.Eing.toString().slice(-5)+u.Ning.toString().slice(-5));
	return Result; 
}
