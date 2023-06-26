# The Portal Auction Marketplace

The Portal Auction Marketplace is an API endpoint used to auction collectibles.


## Endpoints

### `PUT /api/v1/auctions`

Creates a new auction for a collectible, and returns it to the caller.

```bash
$ curl \
    --request PUT http://localhost/api/v1/auctions \
    --header 'Content-Type: application/json' \
    --data '{
      "uid": "<unique-identifier-of-user/peer>",
      "hash": "<hash-of-secret>",
      "baseAsset": "BTCORD",
      "baseNetwork": "bitcoin",
      "baseIdentifier": "<>",
      "quoteAsset": "BTC",
      "quoteNetwork": "lightning"
      "quoteIdentifier": "<>",
    }'
{
  "id":"f418d256-dd2f-4a69-89d7-dcab86e786f4",
  "ts":1665104100583,
  "uid":"<unique-identifier-of-user/peer",
  "hash":"<hash-of-secret>",
  "baseAsset": "BTCORD",
  "baseNetwork": "bitcoin",
  "baseIdentifier": "<>",
  "quoteAsset": "BTC",
  "quoteNetwork": "lightning"
  "quoteIdentifier": "<>"
}
```

### `GET /api/v1/auctions`

Retrieves an existing auction, and returns it to the caller.

```bash
$ curl \
    --request GET http://localhost/api/v1/auctions \
    --header 'Content-Type: application/json' \
    --data '{
      "id": "f418d256-dd2f-4a69-89d7-dcab86e786f4",
      "uid": "<unique-identifier-of-user/peer>"
    }'
{
  "id":"f418d256-dd2f-4a69-89d7-dcab86e786f4",
  "ts":1665104100583,
  "uid":"<unique-identifier-of-user/peer",
  "hash":"<hash-of-secret>",
  "baseAsset": "BTCORD",
  "baseNetwork": "bitcoin",
  "baseIdentifier": "<>",
  "quoteAsset": "BTC",
  "quoteNetwork": "lightning"
  "quoteIdentifier": "<>"
}
```

### `DELETE /api/v1/auctions`

Cancels an auction, and returns it to the caller.

```bash
$ curl \
    --request DELETE http://localhost/api/v1/auctions \
    --header 'Content-Type: application/json' \
    --data '{
      "id": "f418d256-dd2f-4a69-89d7-dcab86e786f4"
    }'
{
  "id":"f418d256-dd2f-4a69-89d7-dcab86e786f4",
  "ts":1665104100583,
  "uid":"<unique-identifier-of-user/peer",
  "hash":"<hash-of-secret>",
  "baseAsset": "BTCORD",
  "baseNetwork": "bitcoin",
  "baseIdentifier": "<>",
  "quoteAsset": "BTC",
  "quoteNetwork": "lightning"
  "quoteIdentifier": "<>"
}
```
