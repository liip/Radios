#!/usr/bin/perl -w
#
# Parses content of http://www.listenlive.eu/switzerland.html for MP3 streams
#
# USAGE
#   ./listenlive-fetch.pl [url|file]
#   will take default url if no argument specified
#
# PARSING INFO
#   Always picks last stream if there are several on a single line (supposedly of highest bitrate).
#
#   See print_stream() to customize output
#
use strict;
package ListenLiveScraper;
use base "HTML::Parser";
use LWP::Simple;
use Encode;

my $filename = $ARGV[0] || 'http://www.listenlive.eu/switzerland.html';

# MP3|Windows Media|aacPlus
my $stream_type = 'MP3';


use constant TD_INDEX_NAME => 1;
use constant TD_INDEX_LOCATION => 2;
use constant TD_INDEX_TYPE => 3;
use constant TD_INDEX_STREAMS => 4;
use constant TD_INDEX_COMMENT => 5;

my $tr_count = 0;
my $td_counter = -1;
my $br_counter;
my $img_counter;
my $line_indicator;

my $stream_name;
my $stream_location;
my $stream_url;
my $stream_comment;


sub print_pre {
  print "    var defaultStations = [\n";
}
sub print_stream {
  if (!$stream_name || !$stream_url) {
    print STDERR "/* Missing info: '$stream_name' '$stream_url' '$stream_location' '$stream_comment' */\n";
  }
  print "        ['$stream_name', '$stream_url', ''],\n";
}
sub print_post {
  print "    ];\n";
}


sub start {
  my ($self, $tag, $attr, $attrseq, $origtext) = @_;

  if ($tag =~ /^tr$/i) {
    ++$tr_count;
    $td_counter = 0;
    $line_indicator = -1;

    $stream_name = '';
    $stream_url = '';
    $stream_location = '';
    $stream_comment = '';
  }
  # skip first row
  if ($tr_count == 1) { return; }

  if ($tag =~ /^td$/i) {
    ++$td_counter;
    $br_counter = 0;
  } elsif ($tag =~ /^br$/i) {
    ++$br_counter;
  } elsif ($tag =~ /^img$/i) {
    if ($td_counter == TD_INDEX_TYPE && $attr->{'alt'} eq $stream_type) {
      $line_indicator = $br_counter;
    }
  } elsif ($tag =~ /^a$/i) {
    if ($td_counter == TD_INDEX_STREAMS && $line_indicator == $br_counter) {
      $stream_url = $attr->{'href'};
      if ($stream_url !~ /^http/i) {
        $stream_url = '';
      }
    }
  } elsif ($tag =~ /^h3$/i) {
    $tr_count = 0;
  }
}

sub text {
  my ($self, $text) = @_;

  if ($td_counter == TD_INDEX_NAME && !$stream_name) {
    $stream_name = $text;
  } elsif ($td_counter == TD_INDEX_LOCATION && !$stream_location) {
    $stream_location = $text;
  } elsif ($td_counter == TD_INDEX_COMMENT && !$stream_comment) {
    $stream_comment = $text;
  }
}

sub end {
  my ($self, $tag, $origtext) = @_;

  if ($tag =~ /^tr$/i) {
    if ($stream_url) {
      print_stream;
    }
    $td_counter = -1;
  }
}


my $p = new ListenLiveScraper;

print_pre;
$p->parse(decode_utf8(get($filename)));
print_post;

$p->eof;

