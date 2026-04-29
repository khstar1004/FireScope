# FireScope Docker

## Client hosting

Build and run the production client:

```bash
docker compose up --build client
```

The app is served at `http://localhost:8080` by default. Override the host port with:

```bash
FIRESCOPE_CLIENT_PORT=49153 docker compose up --build client
```

On this Windows workstation, use the helper script so Docker builds receive `client/.env` and the stable local port stays at `49157`:

```powershell
.\docker\start-client.ps1 -Build
```

After the image has been built once:

```powershell
.\docker\start-client.ps1
```

The image intentionally does not include the heavy local static assets:

- `client/public/3d-bundles`
- `client/public/offline-map`

`docker-compose.yml` mounts those directories read-only into Nginx. For a cloud deployment, put those directories on object storage, a CDN, or a persistent volume and keep the app image small.

## Build-time environment

Vite variables are baked into the client bundle during `docker compose build`. Put non-secret values in a local `.env` beside `docker-compose.yml`, for example:

```env
VITE_MAP_MODE=online
VITE_API_SERVER_URL=https://api.example.com
FIRESCOPE_CLIENT_PORT=8080
```

Do not put private API keys in frontend build args unless they are intended to be public in the browser.

Alternatively, pass the existing client env file explicitly:

```bash
docker compose --env-file client/.env up -d --build client
```

## Gym image

Build and run the demo entrypoint:

```bash
docker compose --profile gym run --rm gym
```

The default Python install uses `GYM_EXTRAS=gym`. To include the focus-fire ranker dependency too:

```bash
GYM_EXTRAS=gym,ranker docker compose --profile gym build gym
```

Artifacts can be written under `/app/gym/artifacts`, backed by the `firescope-gym-artifacts` volume.
