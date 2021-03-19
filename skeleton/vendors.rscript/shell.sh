#!/bin/bash

# This proxy shell is passed to r-script package, which then passes it to child_process when spawning.
# TEST: /usr/bin/docker run --rm --network host -v ${PWD}/reports/queries:${PWD}/reports/queries -v ${PWD}/node_modules:${PWD}/node_modules -eDIRNAME="${PWD}/node_modules/r-script" -einput="[{},\"${PWD}/reports/queries/demo_rscript.R\",{}]" rscript -c "Rscript --vanilla ${PWD}/node_modules/r-script/R/launch.R"

exec /usr/bin/docker run --rm --network host -v ${PWD}/reports/queries:${PWD}/reports/queries -v ${PWD}/node_modules:${PWD}/node_modules -eDIRNAME="${PWD}/node_modules/r-script" -einput="$input" rscript $1 "$2"
