# Retiolum graphs
Tinc provides detailed informations about hosts in the mesh network. We are
using this information to build graphs. 

## Requirements

- tinc-pre (tinc and tincd binaries)
- python2 or python3
- all the python dependencies in /krebs/retiolum/scripts/adv_graphgen/DEPS
    via `pip install -r DEPS`


## Types of Graphs
Currently two types of graphs are generated:

  1. Anonymous Graphs
    - only fancy lines between dots
    - this should be made available to the world via graph.krebsco.de
  2. Detailed Graphs
    - with all the stuff we know
    - contain name, ip address, uptime, different coloring for supernodes and
      hosts which die when supernodes die.
    - these graphs should only be availabe by hosts in the retiolum darknet
    - currently these are published by pigststarter/ but the hostname graph/
      shall be used for this in the future

In addition a Graph DB will be created which contains all the cool infos from
the detailed graph plus the geolocation.
This database is used by map.html which positions all the hosts on a world map.

The graph generation host should be a super node with tinc-pre as tinc seems to
be blocking when building graphs with `GraphDumpFile`.

# Code
Source Code is in /krebs/retiolum/scripts/adv_graphgen/

## all_the_graphs.sh
This script is used for booting all the graph generation magic.
This scripy may be run as a cronjob every 5 to 10 minutes by a user which has
the right to use the tincctl and can write to the WWW directory.

    0/5 * * * * /krebs/retiolum/scripts/adv_graphgen/all_the_graphs.sh

The script also writes geo_coordinates for the nodes with the help of
tinc_stats/Geo.py.
it contains most of the hardcoded paths which may be changed (like
INTERNAL_FOLDER and EXTERNAL_FOLDER, see anonytize&sanitize) as well as a path
to the geolitecity ip database

## tinc_stats/Log2JSON.py

This script creates a giant json file from the current tinc informations and
writes it to stdout. It only contains the information retrieved by the tinc
daemon. 

## tinc_stats/Graph.py

This script takes the json file created by Log2JSON as input. It can be either
run as `$0 complete` to create a detailed graph or  `$0 anonymous` to create
minimal graphs.

When run as anonymous no additional information will be added to the graph.
When run in complete mode, the script will determine the availability (see
tinc_stats/Availability) which nodes are supernodes (tinc_stats/Supernodes).

it writes a graphviz graph to stdout. This can be used to create graphs with
dot by graphviz.

## tinc_stats/Geo.py

Geo.py takes the json file generated by Log2JSON as input and populates this
graph with geo-coordinates with the help of GeoIP. This database can be used by
map.html if put in the same directory.

## tinc_stats/Supernodes

This script provides functionality find out if a node is a supernode or not. 
This will be done by checking if the tinc port of the host in the json file is reachable or not. if called directly it will return the name of the host, a space, and an array of tuples of ip-addresses which were reachable in the run.
This script is used by Graph.py via import.

## tinc_stats/Availability

This modules provides functionality to generate availability information for
each node configured in /etc/tinc/retiolum/hosts. This is done by tracking each
request in a file called /krebs/db/availability (currently hardcoded in
Graph.py). The Script will not append a new line of hosts by itself, Graph.py
does this. 

## anonytize & sanitize
These two scripts handle the building of the graphs as well as the conversion
from graphviz to svg and png. They work pretty much the same in principle, one
is calling Graph.py complete and the other anonymous.

Both scripts are called with $1 being the path where to write the graphs into.
e.g.:
./anonytize.sh /var/www/graph.krebsco.de
./sanitze.sh /var/www/graph.retiolum

