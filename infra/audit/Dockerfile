FROM mcr.microsoft.com/playwright:v1.41.0-jammy

# Switch to root to install global packages
USER root

# Install agent-browser globally
RUN npm install -g agent-browser

# Install dependencies required by agent-browser
# (It likely uses the installed Playwright browsers, but running install helps setup config)
RUN agent-browser install

# Set working directory
WORKDIR /app

# Run as pwuser (default non-root user in Playwright image) for security/sandbox
# However, agent-browser might need root if it tries to install more things at runtime.
# We'll try root first for simplicity in this audit context.
USER root

# Entrypoint - default to help or interactive
ENTRYPOINT ["agent-browser"]
CMD ["--help"]
