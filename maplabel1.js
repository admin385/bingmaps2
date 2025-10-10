/**
 * @license
 *
 * Copyright 2011 Google Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @fileoverview Map Label.
 *
 * @author Luke Mahe (lukem@google.com),
 *         Chris Broadfoot (cbro@google.com)
 */

/**
 * Creates a new Map Label
 * @constructor
 * @extends google.maps.OverlayView
 * @param {Object.<string, *>=} opt_options Optional properties to set.
 */
function MapLabel(opt_options) {
  this.set('fontFamily', 'sans-serif');
  this.set('fontSize', 12);
  this.set('fontColor', '#000000');
  this.set('strokeWeight', 3);
  this.set('strokeColor', '#ffffff');
  this.set('align', 'center');

  this.set('zIndex', 1e3);

  this.setValues(opt_options);
}
MapLabel.prototype = new google.maps.OverlayView;

window['MapLabel'] = MapLabel;


/** @inheritDoc */
MapLabel.prototype.changed = function(prop) {
  switch (prop) {
    case 'fontFamily':
    case 'fontSize':
    case 'fontColor':
    case 'strokeWeight':
    case 'strokeColor':
    case 'align':
    case 'text':
      return this.drawCanvas_();
    case 'maxZoom':
    case 'minZoom':
    case 'position':
      return this.draw();
  }
};

/**
 * Draws the label to the canvas 2d context.
 * @private
 */
MapLabel.prototype.drawCanvas_ = function() {
  var canvas = this.canvas_;
  if (!canvas) return;

  var style = canvas.style;
  style.zIndex = /** @type number */(this.get('zIndex'));

  var ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.strokeStyle = this.get('strokeColor');
  ctx.fillStyle = this.get('fontColor');
  ctx.font = this.get('fontSize') + 'px ' + this.get('fontFamily');

  var strokeWeight = Number(this.get('strokeWeight'));

  var text = this.get('text');
  if (text) {
    if (strokeWeight) {
      ctx.lineWidth = strokeWeight;
//    ctx.strokeText(text, strokeWeight, strokeWeight);
    }

//  ctx.fillText(text, strokeWeight, strokeWeight);
//  parse <b>, <i>, and <u> hypertext tags 
  var ht = "", tx = "";
  var f = true, h = 0, i = -1, p = 0;
  while (i < text.length) {
    i += 1;
    if (text.substr(i,1) == "<") {
      f = false;
      p = 1; if (text.substr(i+1,1) == "/") {i++; p = -1;}
      switch (text.substr(i+1,1)) {
        case "b": h = h +p*1; break;
        case "i": h = h +p*2; break;
        case "u": h = h +p*4; break;
      } 
      continue;
    }
    if (text.substr(i,1) == ">") {
      f = true;
      continue;
    }
    if (f) {ht += String.fromCharCode(48+h); tx += text.substr(i,1);} 
  }
//alert (tx + " " + ht);
  var s, t, w, x = strokeWeight, y = strokeWeight;
  for (i = 0; i < tx.length; i++) {
    t = tx.substr(i,1);  // single char
    h = ht.charCodeAt(i) -48;
    f = ctx.font;  // save base font
    w = Number(f.substr(0,2)) + strokeWeight/2.; // underline displacement
    if (h % 2) {h--; ctx.font += " bold"; } //else ctx.font = (Number(f.substr(0,2))-1) + f.substr(2) 
    if (h == 2 || h == 6 ) ctx.font += " italic";
//alert (t + " " + h + " " + ctx.font + " " + x+"&"+y +"; "+w);
    ctx.strokeText(t, x, y)
    ctx.fillText(t, x, y); // post next char
    ctx.font = f;  // restore
    if (h >= 4 && t != " ") { // draw underline
      ctx.beginPath();
      ctx.moveTo(x, y+w);
      ctx.lineTo(x+ctx.measureText(t).width, y+w);
      s = ctx.strokeStyle; w = ctx.lineWidth; // alert(t+" "+s+w);
      ctx.strokeStyle = ctx.fillStyle; ctx.lineWidth = 0.75;
      ctx.stroke();
      ctx.strokeStyle = s; ctx.lineWidth = strokeWeight;
    }  
    x += ctx.measureText(t).width;
//
//  if (h >= 4 && t != " ") ctx.stroke(); // draw underline
  }
//
//  var textMeasure = ctx.measureText(text);
//  var textWidth = textMeasure.width + strokeWeight;
    var textWidth = x;
    style.marginLeft = this.getMarginLeft_(textWidth) + 'px';
    // Bring actual text top in line with desired latitude.
    // Cheaper than calculating height of text.
    style.marginTop = '-0.4em';
  }
};

/**
 * @inheritDoc
 */
MapLabel.prototype.onAdd = function() {
  var canvas = this.canvas_ = document.createElement('canvas');
  var style = canvas.style;
  style.position = 'absolute';

  var ctx = canvas.getContext('2d');
  ctx.lineJoin = 'round';
  ctx.textBaseline = 'top';

  this.drawCanvas_();

  var panes = this.getPanes();
  if (panes) {
    panes.mapPane.appendChild(canvas);
  }
};
MapLabel.prototype['onAdd'] = MapLabel.prototype.onAdd;

/**
 * Gets the appropriate margin-left for the canvas.
 * @private
 * @param {number} textWidth  the width of the text, in pixels.
 * @return {number} the margin-left, in pixels.
 */
MapLabel.prototype.getMarginLeft_ = function(textWidth) {
  switch (this.get('align')) {
    case 'left':
      return 0;
    case 'right':
      return -textWidth;
  }
  return textWidth / -2;
};

/**
 * @inheritDoc
 */
MapLabel.prototype.draw = function() {
  var projection = this.getProjection();

  if (!projection) {
    // The map projection is not ready yet so do nothing
    return;
  }

  if (!this.canvas_) {
    // onAdd has not been called yet.
    return;
  }

  var latLng = /** @type {google.maps.LatLng} */ (this.get('position'));
  if (!latLng) {
    return;
  }
  var pos = projection.fromLatLngToDivPixel(latLng);

  var style = this.canvas_.style;

  style['top'] = pos.y + 'px';
  style['left'] = pos.x + 'px';

  style['visibility'] = this.getVisible_();
};
MapLabel.prototype['draw'] = MapLabel.prototype.draw;

/**
 * Get the visibility of the label.
 * @private
 * @return {string} blank string if visible, 'hidden' if invisible.
 */
MapLabel.prototype.getVisible_ = function() {
  var minZoom = /** @type number */(this.get('minZoom'));
  var maxZoom = /** @type number */(this.get('maxZoom'));

  if (minZoom === undefined && maxZoom === undefined) {
    return '';
  }

  var map = this.getMap();
  if (!map) {
    return '';
  }

  var mapZoom = map.getZoom();
  if (mapZoom < minZoom || mapZoom > maxZoom) {
    return 'hidden';
  }
  return '';
};

/**
 * @inheritDoc
 */
MapLabel.prototype.onRemove = function() {
  var canvas = this.canvas_;
  if (canvas && canvas.parentNode) {
    canvas.parentNode.removeChild(canvas);
  }
};
MapLabel.prototype['onRemove'] = MapLabel.prototype.onRemove;