#!/usr/bin/perl
use strict; use warnings;
local $/;
sub slurp { open my $f, '<', $_[0] or die "open $_[0]: $!"; my $c = <$f>; close $f; return $c; }

my $page = slurp('page.html');
my $css  = slurp('styles.css');
my $i18n = slurp('i18n.js');
my $app  = slurp('app.js');

$page =~ s/<!--STYLES-->/<style>\n$css\n<\/style>/ or die "STYLES placeholder missing";
$page =~ s/<!--SCRIPTS-->/<script>\n$i18n\n<\/script>\n<script>\n$app\n<\/script>/ or die "SCRIPTS placeholder missing";

open my $o, '>', 'index.html' or die "write index.html: $!";
print $o $page; close $o;
print "index.html rebuilt: " . length($page) . " bytes\n";
