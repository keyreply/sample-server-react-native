# Express Server for KeyReply React Native Webchat Demo App

built with `Express`

## Usage

Make sure you have Node.js and npm installed in your computer and then run these commands:

```console
$ npm install
$ npm start
```

For development purpose, you can run:

```console
$ npm install
$ npm run dev
```
You can also running it using VS Code debugging tool. [View more.](https://code.visualstudio.com/docs/nodejs/nodejs-debugging)

## Environment

Make sure you have set all required your .env paramseters
<br>
(key reference: .env.example)

Access the deployed REST API via SERVER_URL = `http://localhost:<PORT>`

## REST API Routes:

- **Render Webchat Embedded Code in HTML static**
  - URL:
    - **`GET`** *`<SERVER_URL>`*
  - Notes:
    - Please get webchat embedded code from KeyReply dashboard > Web Widget

- **Get default registered sample user names**
  - URL:
    - **`GET`** *`<SERVER_URL>/users/`*
  - Query:
    - `completed`: `true`, optional
  - Expected response (status: `200`):
    ```json
      {
        "users": [
          {
            "username": "krdemo",
            "pushToken": [],
          },
          ...
        ]
      }
    ```
  - Expected response `?completed=true` (status: `200`):
    ```json
      {
        "users": [
          {
            "sub": "usr-demo-1",
            "username": "krdemo",
            "email": "krdemo@test.com",
            "name": "User Demo",
            "role": "admin",
            "deparment": "administration",
            "pushToken": [ ]
          },
          ...
        ]
      }
    ```

- **Get JWT of Specified Default Registered ID of User**
  - URL:
    - **`GET`** *`<SERVER_URL>/auth/`*
  - Query:
    - `id`: `String`, required
  - Expected response (status: `200`):
    ```json
    eyJhbGciO...
    ```
  - Error responses:
    - status: `401`:
      ```json
      {
        "message": "username unidentified"
      }
      ```

- **Login for KeyReply Webchat Demo App**
  - URL:
    - **`POST`** *`<SERVER_URL>/auth/`*
  - Body:
    - `username`: `String`, required
  - Expected response (status: `200`):
    ```json
    eyJhbG...
    ```
  - Error responses:
    - status: `401`:
      ```json
      {
        "message": "username unidentified"
      }
      ```

- **Verify JWT (PUSH TOKEN NOT DEFINED YET)**
  - URL:
    - **`PUT`** *`<SERVER_URL>/auth/`*
  - Body:
    - `token`: `String`, required
  - Expected response (status: `200`):
    ```json
      {
        "message": "verified", 
        "username": "..."
      }
    ```
  - Error responses:
    - status: `400`:
      ```json
        {
          "message": "jwt must be provided"
        }
      ```
      ```json
        {
          "message": "jwt malformed"
        }
      ```
      ```json
        {
          "message": "invalid signature"
        }
      ```
    - status: `403`:
      ```json
        {
          "message": "jwt expired"
        }
      ```

- **Set Push Token to Defined Username**
  - URL:
    - **`POST`** *`<SERVER_URL>/pushtoken/:username`*
  - Params:
    - `username`: `String`, required
  - Body:
    - `token`: `String`, required
  - Expected response (status: `200`):
    ```json
      {
        "message": "Push Token set"
      }
    ```
  - Error responses:
    - status: `401`:
      ```json
        {
          "message": "username or push token unidentified"
        }
      ```
  
- **Remove Push Token from Defined Username / Logout**
  - URL:
    - **`POST`** *`<SERVER_URL>/logout/:username`*
  - Params:
    - `username`: `String`, required
  - Body:
    - `token`: `String`, required
  - Expected response (status: `200`):
    ```json
      {
        "message": "Push Token removed"
      }
    ```
  - Error responses:
    - status: `401`:
      ```json
        {
          "message": "username or push token unidentified"
        }
      ```
    
- **Verify JWT (PUSH TOKEN INCLUDED)**
  - URL:
    - **`PUT`** *`<SERVER_URL>/internal/decode`*
  - Header(s):
    - `Authorization`: `Bearer <token>`, required
  - Expected response (status: `200`):
    ```json
      {
        "verified": {
          ...
        }
      }
    ```
  - Error responses:
    - status: `400`:
      ```json
        {
          "message": "jwt must be provided"
        }
      ```
      ```json
        {
          "message": "jwt malformed"
        }
      ```
      ```json
        {
          "message": "invalid signature"
        }
      ```
    - status: `401`:
      ```json
        {
          "message": "invalid token format"
        }
      ```
    - status: `403`:
      ```json
        {
          "message": "jwt expired"
        }
      ```