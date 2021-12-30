//var wallwidth = viewwidth / viewsteps / 2;
//var metawallwidth = viewwidth / viewsteps / 2;
//var wallheight = viewheight / viewsteps / 2;
var sumoftruthpast = 0;
var sumoftruthpresent = 0;
var sumoftruthfuture = 0;

var viewsteps = 99; //number of hall panels. How far we can see
var xpos = 0;
var ypos = 0;
var directions = [[0,-1] , [1,0] , [0,1] , [-1,0]]; //n,e,s,w use directions[direction]
var leftstep = [[-1,0] , [0,-1] , [1,0] , [0,1]]; //based on direction
var rightstep = [[1,0] , [0,1] , [-1,0] , [0,-1]]; //based on direction
var direction = 2; //look south by default
var news = ['N','E','S','W'];
var leftview = [3,0,1,2]; //use leftview[direction]
var frontview = [0,1,2,3];
var rearview = [2,3,0,1];
var rightview = [1,2,3,0];
var north = 0;
var east = 1;
var south = 2;
var west = 3;

//create arrays for wall widths and heights
var leftover = new Array();
var leftoverarray = new Array();
var wallwidtharray = new Array();
var wallheightarray = new Array();
var xdelta = new Array();
var baseheightarray = new Array();

function f (input) //function must output from 1 - 0. 1 divided by input
{
var output = 1 / (input);
//if (input == 1) {return .9};//fix first step
return output;
};


function initializeview()
{
var firststep = .8;
lastheight = viewheight / 2; 
//basex on x = Px/Pz with Px = 1

//first render step is the square we are standing in
//first wall shows narrow as it is in our square a = 0 and a = 1, points 1 and .9
a = 0;
xdelta[a] = 1 - firststep;
wallwidtharray[a] = xdelta[a] * (viewwidth / 2);
wallheightarray[a] = wallwidtharray[a] * viewheight / viewwidth;
leftover[a] = firststep; //oddly this works as the sum of the above series = 1
//leftover[a] = f(a + 1); //oddly this works as the sum of the above series = 1
leftoverarray[a] = leftover[a] * (viewwidth / 2); //amount of viewscreen left when we hit a wall
baseheightarray[a] = lastheight - wallheightarray[a];
lastheight = baseheightarray[a];

//second render step  
a = 1;
xdelta[a] = firststep - f(a + 1);
wallwidtharray[a] = xdelta[a] * (viewwidth / 2);
wallheightarray[a] = wallwidtharray[a] * viewheight / viewwidth;
leftover[a] = f(a + 1); //oddly this works as the sum of the above series = 1
leftoverarray[a] = leftover[a] * (viewwidth / 2); //amount of viewscreen left when we hit a wall
baseheightarray[a] = lastheight - wallheightarray[a];
lastheight = baseheightarray[a];

//rest of render steps
for (a = 2 ; a < viewsteps ; a++)
    {
    //difference between x(a) and x(a+1)
    //xdelta[a] = (1 / (a + 1)) - (1 / (a + 2));
    xdelta[a] = f(a) - f(a + 1);
    wallwidtharray[a] = xdelta[a] * (viewwidth / 2);
    wallheightarray[a] = wallwidtharray[a] * viewheight / viewwidth;
    //leftover[a] = (1 / (a + 2)); //oddly this works as the sum of the above series = 1
    leftover[a] = f(a + 1); //oddly this works as the sum of the above series = 1
    leftoverarray[a] = leftover[a] * (viewwidth / 2); //amount of viewscreen left when we hit a wall
    baseheightarray[a] = lastheight - wallheightarray[a];
    lastheight = baseheightarray[a];
    }
}

var oldcell = document.getElementById('cell_0_0'); //need this to redraw little man

function drawmaze()
{
initializeview();

//oldcell.style.backgroundColor = 'transparent'; //no longer required
//oldcell.style.backgroundColor = 'white';
//document.getElementById('cell_' + xpos + '_' + ypos).style.backgroundColor = 'red'; //no longer required
$('#cell_' + xpos + '_' + ypos).addClass( 'incell' );

document.getElementById('top').innerHTML = "<table CELLPADDING='0' CELLSPACING='0'><TR VALIGN='BOTTOM'>" + printview(0, xpos , ypos , direction , 0) + "</TR></table>";
document.getElementById('bottom').innerHTML = "<table CELLPADDING='0' CELLSPACING='0'><TR VALIGN='TOP'>" + printview(1, xpos , ypos , direction , 0) + "</TR></table>";

var leftmessage = '';
var rightmessage = '';
var frontmessage = '';
var rearmessage = '';

if (maze[xpos][ypos][leftview[direction]] != 'T') { leftmessage = ' There is a passage to your left.'}
if (maze[xpos][ypos][rightview[direction]] != 'T') { rightmessage = ' There is a passage to your right.'}
if (maze[xpos][ypos][rearview[direction]] != 'T') { rearmessage = ' There is a passage behind you.'}
document.getElementById('message').innerHTML = ' You are facing ' + news[direction] + '.' + leftmessage + rightmessage + rearmessage + ' You are at grid reference [' + xpos + ',' + ypos + ']';
};

function printview(topbottom , x , y , direction , viewdistance)
{
var wallwidth = wallwidtharray[viewdistance];
var wallheight = wallheightarray[viewdistance];
var baseheight = baseheightarray[viewdistance];
var endofhallwidth = leftoverarray[viewdistance];

//do next view down the hall
var x = xpos + (viewdistance * directions[direction][0]);  //x
var y = ypos + (viewdistance * directions[direction][1]);  //y

//reached limits of maze
if ((x < 0) || (x > mazewidth)) {return('')}
if ((y < 0) || (y > mazeheight)) {return('')}

var lwall;
var cwall;
var rwall;

var base = "<img src='3dmazebase.gif' STYLE='height:" + baseheight + "pt; width:" + wallwidth + "pt;'</img>";
var topwall = "<img src='3dmazebase.gif' STYLE='border-right: 1pt black solid; border-left: 1pt black solid; height:" + baseheight + "pt; width:" + wallwidth + "pt;'</img>";
var bottomwall = "<img src='3dmazebase.gif' STYLE='border-right: 1pt black solid; border-left: 1pt black solid; height:" + baseheight + "pt; width:" + wallwidth + "pt;'</img>";
var square = "<DIV STYLE='height: " + wallheight + "pt; width: " + wallwidth + "pt; font-size: 0pt;'></DIV>"; //requied for when we are facing up against a wall
var cwall = "<TD><img src='3dmazebase.gif' STYLE='border-right: 1pt black solid; border-left: 1pt black solid; height:" + baseheight + "pt; width:" + 2 * endofhallwidth + "pt;'</img></TD>";
var topleft = "<img src='3dmazetopleft.gif' STYLE='height:" + wallheight + "pt; width:" + wallwidth + "pt;'</img>" + "<br>" + base;
var topright = "<img src='3dmazetopright.gif' STYLE='height:" + wallheight + "pt; width:" + wallwidth + "pt;'</img>" + "<br>" + base;
var bottomleft = base + "<br>" + "<img src='3dmazebottomleft.gif' STYLE='height:" + wallheight + "pt; width:" + wallwidth + "pt;'</img>";
var bottomright = base + "<br>" + "<img src='3dmazebottomright.gif' STYLE='height:" + wallheight + "pt; width:" + wallwidth + "pt;'</img>";
//far wall will fill remaining view space!
//var cwall = "<TD><img src='3dmazebase.gif' STYLE='border-right: 1pt black solid; border-left: 1pt black solid; height:" + (wallheight * (viewsteps - viewdistance)) + "pt; width:" + 2 * wallwidth * (viewsteps - viewdistance) + "pt;'</img></TD>";

//look for a wall to the left
var wallleft = maze[x][y][leftview[direction]];
if (wallleft == 'T') //there is one
        {
        if (topbottom == 0) {var lwall = "<TD>" + topleft + "</TD>"}
        if (topbottom == 1) {var lwall = "<TD>" + bottomleft + "</TD>"}
        }
if (wallleft == 'F') //there isn't one
        {
        if (topbottom == 0) {var lwall = "<TD>" + square + topwall + "</TD>"}
        if (topbottom == 1) {var lwall = "<TD>" + bottomwall + square + "</TD>"}
        }

//if (wallleft == 'S') {var lwall = "<TD width='" + wallwidth + "'></TD>"} //it is the start
if (wallleft == 'S') {var lwall = "<TD STYLE='width: " + wallwidth + "pt;'></TD>"} //it is the start
//if (wallleft == 'E') {var lwall = "<TD width='" + wallwidth + "'></TD>"} //it is the exit
if (wallleft == 'E') {var lwall = "<TD STYLE='width: " + wallwidth + "pt;'></TD>"} //it is the exit

//look for a wall to the right
var wallright = maze[x][y][rightview[direction]];
if (wallright == 'T') //there is one
        {
        if (topbottom == 0) {var rwall = "<TD>" + topright + "</TD>"}
        if (topbottom == 1) {var rwall = "<TD>" + bottomright + "</TD>"}
        }
if (wallright == 'F') //there isn't one
        {
        if (topbottom == 0) {var rwall = "<TD>" + square + topwall + "</TD>"}
        if (topbottom == 1) {var rwall = "<TD>" + bottomwall + square + "</TD>"}
        }

if (wallright == 'S') {var rwall = "<TD STYLE='width: " + wallwidth + "pt;'></TD>"}
if (wallright == 'E') {var rwall = "<TD STYLE='width: " + wallwidth + "pt;'></TD>"}

//check for wall in face here
iswallinfront = maze[x][y][frontview[direction]];
if (iswallinfront == 'T')
        {
        if (topbottom == 0)
                {
        }
        if (topbottom == 1)
                {
        }
        return (lwall + cwall + rwall); //we hit a wall return center wall string and end
        }
if (iswallinfront == 'S') //start door
        {
        var cwall = "<TD><DIV STYLE='width: " + 2 * endofhallwidth + "pt; height: " + baseheight + "pt;'></DIV></TD>";
        return (lwall + cwall + rwall); //we hit a wall return center wall string and end
        }
if (iswallinfront == 'E') //exit door
        {
        var cwall = "<TD><DIV STYLE='width: " + 2 * endofhallwidth + "pt; height: " + baseheight + "pt;'></DIV></TD>";
        return (lwall + cwall + rwall); //we hit a wall return center wall string and end
        }

viewdistance++; //next view down the hall
return (lwall + printview(topbottom , x , y , direction , viewdistance) + rwall); //recursive call to this routine starting from closer walls (left and right) then moving farther (inner walls)
}

function keyinput(keyCode)
{
var xmove = 0;
var ymove = 0;

//directions 0=N 1=E 2=S 3=W

if (keyCode == 37) 
    {
    if (state == 'ThreeD') //turn left
        {
        direction = direction - 1;
        if (direction < north) {direction = west}
        } 
    if (state == 'TwoD') //move West
        {
        wallwest = maze[xpos][ypos][west];
        if (wallwest == 'T') {return('')}
        xmove = directions[west][0];
        ymove = directions[west][1];
        }
    }
if (keyCode == 38) 
    {
    if (state == 'ThreeD') //step forward
        {
        wallinfront = maze[xpos][ypos][frontview[direction]];
        if (wallinfront == 'T') {return('')}
        if (wallinfront == 'E') //escaped maze
                {
                win();
                sumoftruthpast = sumoftruthpast % 78;
                sumoftruthpresent = sumoftruthpresent % 78;
                sumoftruthfuture = sumoftruthfuture % 78;
                var totalsum = sumoftruthpast + sumoftruthpresent + sumoftruthfuture;
                var core_path = 'http://www.somewhereincanada.com/cgi/tarot/tarot.cgi?vars=core_vars.cgi&template=three_card&database=emogic&Querent=Querent&Question=Your path adds up to ' + totalsum;
                //readingvalue = sumoftruth % 78;
                        //totalreading = '(' + sumoftruthpast + ',' + sumoftruthpresent + ',' + sumoftruthfuture + ')';
                totalreading = sumoftruthpast + ',' + sumoftruthpresent + ',' + sumoftruthfuture;
                var pathh = core_path + '&records=' + totalreading + '&custom1=Querent' + '&custom10=' + totalreading;
                //window.open(core_path , '_blank' , 'fullscreen=1,scrollbars=1');
                //window.open(core_path , '_blank');
                }
        if (wallinfront == 'S')
            {
            //alert('This is the start of the maze! Turn around.')
            turnaround();
            }
        xmove = directions[frontview[direction]][0];
        ymove = directions[frontview[direction]][1];
        }
    if (state == 'TwoD') //move North
        {
        wallnorth = maze[xpos][ypos][north];
        if (wallnorth == 'T') {return('')}
        xmove = directions[north][0];
        ymove = directions[north][1];
        }
     }
            
if (keyCode == 39) 
    {
    if (state == 'ThreeD') //turn right
        {
       direction = direction + 1;
        if (direction > west) {direction = north}
        } 
    if (state == 'TwoD') //move East
        {
        walleast = maze[xpos][ypos][east];
        if (walleast == 'T') {return('')}
        xmove = directions[east][0];
        ymove = directions[east][1];
        }
    }
    
if (keyCode == 40) 
    {
    if (state == 'ThreeD') //backup
        {
        wallinrear = maze[xpos][ypos][rearview[direction]];
        if (wallinrear == 'T') {return('')}
        xmove = directions[rearview[direction]][0];
        ymove = directions[rearview[direction]][1];
        }
    if (state == 'TwoD') //move south
        {
        wallsouth = maze[xpos][ypos][south];
        if (wallsouth == 'E') {win();} //escaped maze
        if (wallsouth == 'T') {return('')}
        xmove = directions[south][0];
        ymove = directions[south][1];
        }
    } 

if ((xpos + xmove < 0) || (xpos  + xmove > mazewidth - 1)) {return('')}
if ((ypos  + ymove  < 0) || (ypos  + ymove > mazeheight - 1)) {return('')}

//oldcell = document.getElementById('cell_' + xpos + '_' + ypos); //no longer required
$('#cell_' + xpos + '_' + ypos).removeClass( 'incell' );

xpos = xpos + xmove;
ypos = ypos + ymove;

drawmaze();
}

//start dialogs and turn off
$(function() {
    $( ".dialogs" ).dialog({
        autoOpen: false,
      modal: true,
      buttons: {
        Ok: function() {
          $( this ).dialog( "close" );
        }
      }
    });
  });

function turnaround()
 {
 $( '#dialog-turnaround' ).dialog( "open" );
 };

function win()
 {
 $( '#dialog-win' ).dialog( "open" );
  };


function howtoplay ()
 {
 $( '#dialog-message' ).dialog( "open" );
 };

var Cookie   = new Object();
Cookie.day   = 86400000;
Cookie.week  = Cookie.day * 7;
Cookie.month = Cookie.day * 31;
Cookie.year  = Cookie.day * 365;

function getCookie(name) {
  var cookies = document.cookie;
  var start = cookies.indexOf(name + '=');
  if (start == -1) return null;
  var len = start + name.length + 1;
  var end = cookies.indexOf(';',len);
  if (end == -1) end = cookies.length;
  return unescape(cookies.substring(len,end));
}

function setCookie(name, value, expires, path, domain, secure) {
  value = escape(value);
  expires = (expires) ? ';expires=' + expires.toGMTString() :'';
  path    = (path)    ? ';path='    + path                  :'';
  domain  = (domain)  ? ';domain='  + domain                :'';
  secure  = (secure)  ? ';secure'                           :'';

  document.cookie =
    name + '=' + value + expires + path + domain + secure;
}

function deleteCookie(name, path, domain) {
  var expires = ';expires=Thu, 01-Jan-70 00:00:01 GMT';
  (path)    ? ';path='    + path                  : '';
  (domain)  ? ';domain='  + domain                : '';

  if (getCookie(name))
    document.cookie = name + '=' + expires + path + domain;
}

