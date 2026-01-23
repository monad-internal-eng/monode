FROM rust:1.91-slim

# Install build dependencies
RUN apt-get update && apt-get install -y \
    git \
    curl \
    gcc \
    g++ \
    cmake \
    pkg-config \
    libssl-dev \
    libclang-dev \
    libzstd-dev \
    libhugetlbfs-dev \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /usr/src/app

# Copy all source files
COPY . .

# Build the binary
RUN cargo build --release --bin backend

# Expose WebSocket port
EXPOSE 8443
EXPOSE 7000

# Set entrypoint with default server address for container
ENTRYPOINT ["cargo", "run", "--release", "--bin", "backend", "--"]
CMD ["--server-addr", "0.0.0.0:8443", "--health-server-addr", "127.0.0.1:7000"]
