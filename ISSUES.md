## Chat server security

each websocket should be put into a session according to its participant id. So for example, participant i5Te0fa+ would have their websocket placed into chat.sessions[x][sessionID][i5Te0fa+]. So when a message comes through, the chat server can verify that no one on the client side spoofed their identity by changing their participant id manually. 

all data given to the client should either be unmodifiable (e.g. web token), or watched for changes (e.g. checking participantId).


chat server needs to hand out a token for each new participant

client:
    connects to /ws/chat with chat token cookie in header
server:
    parses token 
    gets session ID, participant ID
    adds participant to session
    opens websocket
    -> participant ID to client

## API behavior

Change simple endpoints to use URL queries. JSON is not necessary.

## Messaging storage

Potential message schema:

|type |	constraints |	name|
|-|-|-|
|VARCHAR(32) |	NOT NULL	| message id|
|VARCHAR(16)	| NOT NULL|	participant id|
|VARCHAR(16)	| NOT NULL	| session id|
|VARCHAR(256)	| NOT NULL|	message content |
|TIMESTAMP	|DEFAULT now()|	timestamp| 