FROM rocker/r-base
RUN apt-get update && apt-get install -y libssl-dev libsasl2-dev
RUN Rscript -e 'install.packages(c("assertthat", "utf8", "cli", "crayon", "fansi", "pillar", "pkgconfig", "purrr", "digest", "ellipsis", "generics", "glue", "lifecycle", "magrittr", "R6", "tibble", "tidyselect", "mongolite"))'
RUN Rscript -e 'install.packages(c("rlang", "vctrs"))'
ENTRYPOINT [ "/bin/bash" ]
