FROM mcr.microsoft.com/devcontainers/base:ubuntu
RUN apt-get update && \
    apt-get upgrade -y && \
    apt-get install -y --no-install-recommends  jq && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*