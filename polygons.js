var doublepi = Math.PI*2;
function polygon(g, n, cx, cy, w, h, startAngle) {
  var angle = doublepi / n; //twice as many sides

  // The horizontal "radius" is one half the width,
  // the vertical "radius" is one half the height
  w = w / 2.0;
  h = h / 2.0;
 //console.log(g);
  g.moveTo(
    cx + Math.floor(w * Math.cos(startAngle)), 
    cy + Math.floor(h * Math.sin(startAngle)));
  for (var i = 1; i < n; i++) {
    g.lineTo(
    //console.log(
      cx + Math.floor(w * Math.cos(startAngle + angle * i)), 
      cy + Math.floor(h * Math.sin(startAngle + angle * i)));
  }
}

function simplepolygon(g, n, cx, cy, r)
{
    polygon(g, n, cx, cy, r*2.0, r*2.0, 0.0);
}