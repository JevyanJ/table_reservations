FROM node:24

WORKDIR /workspace

COPY --chown=root .devcontainer/.bashrc /root/.bashrc
RUN echo 'shopt -s expand_aliases' >> /root/.bashrc
RUN echo 'source /usr/share/bash-completion/completions/git' >> /root/.bashrc
RUN echo 'export PATH=$PATH:/workspace' >> /root/.bashrc
