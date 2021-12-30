#!/usr/bin/perl

###############################################################################
# Maze.pl - Generates a maze and prints out some HTML
# Copyright 2006 Dave Laplander.
###############################################################################

use strict;
$| = 1;

print "Content-type: text/html\n\n";

my $dimx = 10;
my $dimy = 10;
my $viewwidth = 300;
my $viewheight = 200;

my %in = &parse_form();

if ($in{dimx}) {$dimx = $in{dimx}}
if ($in{dimy}) {$dimy = $in{dimy}}
if ($in{viewwidth}) {$viewwidth = $in{viewwidth}}
if ($in{viewheight}) {$viewheight = $in{viewheight}}

#load page template
open (PAGETEMPLATESOURCE, "<template.html") || die("no file at spread path at templates/index.html");
my $pagetemplate = join("" , <PAGETEMPLATESOURCE>);
close PAGETEMPLATESOURCE;

# Initialize the maze
my @maze = @{ &InitMaze($dimx, $dimy) };

# Carve out the maze
CarveMaze( int($dimx/2),int($dimy/2),int($dimx/2),int($dimy/2));

# Open up the entrance and exit
#$maze[0][0]->{twall} = "S";
$maze[$dimx-1][$dimy-1]->{bwall} = "E";

#replace global variables in $pagetemplate
my $mazestring = &PrintMaze();
$pagetemplate =~ s/\<\%mazestring\%\>/$mazestring/g; #replace any <%mazestring%> tokens in pagetemplate

my $mazevar = PrintVar();
$pagetemplate =~ s/\<\%mazevar\%\>/$mazevar/g; #replace any <%mazevar%> tokens in pagetemplate

$pagetemplate =~ s/\%dimx\%/$dimx/g; #replace any <%viewwidth%> tokens in pagetemplate
$pagetemplate =~ s/\%dimy\%/$dimy/g; #replace any <%viewwidth%> tokens in pagetemplate
$pagetemplate =~ s/\%viewwidth\%/$viewwidth/g; #replace any <%viewwidth%> tokens in pagetemplate
$pagetemplate =~ s/\%viewheight\%/$viewheight/g; #replace any <%viewwidth%> tokens in pagetemplate

print $pagetemplate;

sub KnockDownWall()
  {
    ## Knocks down the wall between two cells
    my($x1,$y1,$x2,$y2) = @_; # Coordinates of the two cells we're working on

    if ($x2 > $x1 ) # cell2 is to the right of cell1
      {
        $maze[$x1][$y1]->{rwall} = "F";
        $maze[$x2][$y2]->{lwall} = "F";
      }
    elsif ( $x2 < $x1 ) # cell2 is to the left of cell1
      {
        $maze[$x1][$y1]->{lwall} = "F";
        $maze[$x2][$y2]->{rwall} = "F";
      }
    elsif ( $y2 < $y1 ) # cell2 is above cell1
      {
        $maze[$x1][$y1]->{twall} = "F";
        $maze[$x2][$y2]->{bwall} = "F";
      }
    elsif ( $y2 > $y1 ) # cell2 is below cell1
      {
        $maze[$x1][$y1]->{bwall} = "F";
        $maze[$x2][$y2]->{twall} = "F";
      }
  }

sub AlreadyVisited()
  {
    ## Returns 1 if a cell has already been visited
    my ($x,$y) = @_;

    if ( $maze[$x][$y]->{visited} =~ /T/ )
      { return 1; }
    else
      { return 0; }
  }

sub CarveMaze()
  {
    ## Carves out a Perfect maze
    my ($x1, $y1, $x2, $y2) = @_;  # The cell coordinates we're working on

    # If we've been here before then bail
    return if &AlreadyVisited($x1,$y1) == 1;

    # Knock out the wall between us and the previous cell
    &KnockDownWall($x1, $y1, $x2, $y2);

    $maze[$x1][$y1]->{visited} = "T"; # Tag current cell as visited.

    # Recurse down into all available neighbor cells
    my @cells = &ShuffleArray(&FindValidCells($x1, $y1));

    foreach my $c (@cells)
      {
        my @cell = @{$c};
        if ( &AlreadyVisited($cell[0], $cell[1]) == 0 )
          { &CarveMaze($cell[0], $cell[1], $x1, $y1); }
      }
  }

sub FindValidCells()
  {
    # Returns an array of coordinates (column, row) near $x, $y that we have not visited.

    my ($x, $y) = @_;

    my @valid_cells;

    # Above
    if ( ($y-1) >= 0 && $maze[$x][$y-1]->{visited} =~ /F/ )
      { push @valid_cells, [$x, $y-1]; }

    # Below
    if ( ($y+1) < $dimy && $maze[$x][$y+1]->{visited} =~ /F/ )
      { push @valid_cells, [$x, $y+1]; }

    # Right
    if ( ($x+1) < $dimx && $maze[$x+1][$y]->{visited} =~ /F/ )
      { push @valid_cells, [$x+1, $y]; }

    # Left
    if ( ($x-1) >= 0 && $maze[$x-1][$y]->{visited} =~ /F/ )
      { push @valid_cells, [$x-1, $y]; }

    return @valid_cells;
  }

sub InitMaze($dimx, $dimy)
  {
    ## Builds a $dimx by $dimy maze and returns a reference to it.

    my @maze;

    # Fill the maze with walls
    for (my $r=0; $r < $dimy; $r++)
      {
        for (my $c=0; $c < $dimx; $c++)
          {
            my %cell = {};
            $cell{x} = $c;
            $cell{y} = $r;
            $cell{rwall} = "T";
            $cell{lwall} = "T";
            $cell{bwall} = "T";
            $cell{twall} = "T";
            $cell{visited} = "F";

            $maze[$c][$r] = \%cell;
          }
      }
    return \@maze;
  }

sub ImageTag()
  {
    # Returns an <img src="..." /> for a given maze cell

    my ($x,$y) = @_;
    my %cell = %{$maze[$x][$y]};

    my $img = "";
    if ($cell{twall} =~ /T/ )
      {
      $img = $img . "t";
      }

    if ($cell{bwall} =~ /T/ )
      {
      $img = $img . "b";
      }

    if ($cell{lwall} =~ /T/ )
      {
      $img = $img . "l";
      }

    if ($cell{rwall} =~ /T/ )
      {
      $img = $img . "r";
      }

    if ( $img =~ // )
      { return "<img src=\"maze_images/none.gif\" />"; }
    else
      {
        return "<img src=\"maze_images/" . $img . ".gif\" width=\"8\" height=\"8\" />";
      }
  }

  sub StyleTag() #scriptman
  {
    # Returns an <img src="..." /> for a given maze cell

    my ($x,$y) = @_;
    my %cell = %{$maze[$x][$y]};
    my $style = 'font-size: 1pt; width: 8pt; height: 8pt;'; #scriptman

    my $img = "";
    if ($cell{twall} =~ /T/ )
      {
      $style = $style . "border-top: 1pt black solid;";
      }

    if ($cell{bwall} =~ /T/ )
      {
      $style = $style . "border-bottom: 1pt black solid;";
      }

    if ($cell{lwall} =~ /T/ )
      {
      $style = $style . "border-left: 1pt black solid;";
      }

    if ($cell{rwall} =~ /T/ )
      {
      $style = $style . "border-right: 1pt black solid;";
      }
      return $style;
  }

sub PrintMaze()
{
# Prints the maze
my $outstring = '';

$outstring = "<table border='0' cellspacing='0' cellpadding='0' ID='maze'>";
for (my $r=0; $r < $dimy; $r++)
      {
        $outstring = $outstring . "<tr>";
        for (my $c=0; $c < $dimx; $c++)
          {
          my $style = &StyleTag($c, $r); #scriptman
          #$outstring = $outstring . "<td style='$style'>";
          if ( ($r == $dimy - 1) and ($c == $dimx - 1) )
               {#exit cell
               $outstring = $outstring . "<td style='$style' ID='cell\_$c\_$r' class='mazecell exit'>";
               }
          else
              {#not an exit cell
              $outstring = $outstring . "<td style='$style' ID='cell\_$c\_$r' class='mazecell'>";
              }
          # print &ImageTag($c, $r);
          $outstring = $outstring . "&nbsp;"; #scriptman
          $outstring = $outstring . "</td>";
          }
        $outstring = $outstring . "</tr>\n";
      }
$outstring = $outstring . "</table>";
return $outstring;
}

sub PrintVar()
{
# Prints the js variable array
my $javascriptarray = '';

#for (my $r=0; $r < $dimy; $r++) #y
for (my $c=0; $c < $dimx; $c++) #x
      {
        $javascriptarray = $javascriptarray . "[";
        #for (my $c=0; $c < $dimx; $c++) #x
        for (my $r=0; $r < $dimy; $r++) #y
          {
          $javascriptarray = $javascriptarray . "['${$maze[$c][$r]}{twall}','${$maze[$c][$r]}{rwall}','${$maze[$c][$r]}{bwall}','${$maze[$c][$r]}{lwall}'],";
          }
        $javascriptarray = $javascriptarray . "],\n";
      }

$javascriptarray = qq|
<script>
var maze = [$javascriptarray];
var mazewidth = $dimx;
var mazeheight = $dimy;
</script>
|;

return $javascriptarray;
}

sub ShuffleArray()
  {
    ## Randomly shuffles an array and returns it.

    my @a = @_;

    # Bail if no input
    return () if $#a == -1;

    my @b;

    while (@a)
      {
        my $len = $#a + 1;
        my $ran = int(rand($len));

        push @b, splice(@a, $ran, 1);
      }
    return @b;
  }

sub parse_form {
# --------------------------------------------------------
# Parses the form input and returns a hash with all the name
# value pairs. Removes SSI and any field with "---" as a value
# (as this denotes an empty SELECT field.

        my (@pairs, %in);
        my ($buffer, $pair, $name, $value);

        if ($ENV{'REQUEST_METHOD'} eq 'GET') {
                @pairs = split(/&/, $ENV{'QUERY_STRING'});
        }
        elsif ($ENV{'REQUEST_METHOD'} eq 'POST') {
                read(STDIN, $buffer, $ENV{'CONTENT_LENGTH'});
                 @pairs = split(/&/, $buffer);
        }
        else {
                &cgierr ("This script must be called from the Web\nusing either GET or POST requests\n\n");
        }
        PAIR: foreach $pair (@pairs) {
                ($name, $value) = split(/=/, $pair);

                $name =~ tr/+/ /;
                $name =~ s/%([a-fA-F0-9][a-fA-F0-9])/pack("C", hex($1))/eg;

                $value =~ tr/+/ /;
                $value =~ s/%([a-fA-F0-9][a-fA-F0-9])/pack("C", hex($1))/eg;

                $value =~ s/<!--(.|\n)*-->//g;                          # Remove SSI.
                if ($value eq "---") { next PAIR; }                  # This is used as a default choice for select lists and is ignored.
                (exists $in{$name}) ?
                        ($in{$name} .= "~~$value") :              # If we have multiple select, then we tack on
                        ($in{$name}  = $value);                                  # using the ~~ as a seperator.
        }
        return %in;
}

