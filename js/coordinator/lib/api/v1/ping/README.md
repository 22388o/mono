# Health checks

The health check endpoints allow to check if the service is running correctly.

- Limit Orders (`/api/v1/orderbook/limit`)

## Endpoints

### `GET /api/v1/ping`

Responds to an incoming ping request.

```bash
$ curl --request GET http://localhost/api/v1/ping
{
  "@type":"Pong",
  "now":1665104100583
}
```
