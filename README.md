# Monode
Example application using the Monad Execution Events SDK

![App](public/app.gif)
## Resources

- [Live App](https://node.monad.xyz)
- [Blog Post](https://blog.monad.xyz/blog/execution-events-sdk)
- [Documentation](https://docs.monad.xyz/execution-events)

## How to Run

### 1. Run the Backend

Navigate to the backend directory and run the server on the full node:

```bash
cd backend
cargo run --bin backend -- --server-addr 0.0.0.0:<SERVER_PORT>
```

Replace `<SERVER_PORT>` with your desired port number (e.g., 8080).

> **_NOTE:_** By default, the backend runs in **restricted** mode, which requires clients to subscribe to the events specified in `backend/restricted_filters.json`. To disable this behavior, set the `ALLOW_UNRESTRICTED_FILTERS` environment variable to a non-empty value before spawning the backend process.

### 2. Configure the Frontend

Edit the `.env` file in the frontend directory to set the WebSocket URL:

```
NEXT_PUBLIC_EVENTS_WS_URL="ws://<SERVER_ADDR>:<SERVER_PORT>"
```

Replace `<SERVER_ADDR>` with your server address and `<SERVER_PORT>` with the port you used in step 1.

### 3. Run the Frontend

Navigate to the frontend directory and start the development server:

```bash
cd frontend
pnpm dev
```
