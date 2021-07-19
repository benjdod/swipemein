# SMI Chat Poop Version 0.1

This is a writeup of the super simple chat protocol. This protocol is built on top of the Websocket protocol. Chat is meant to support an arbitrary number of participants, but for the purpose of this site most chats have two members. In production the protocol should be called `chat.smi.com`.

## Functionality

All messages between client and server are sent using text payload frames. This is for simplicity's sake.

Upon connection, the server sends a text payload frame containing a 6-character base-64 participant ID to the client. The client is to use this ID in all subsequent messages. 

The client sends a message consisting of three (or more) fields in a comma separated format. The first two items are the payload type code (PTC) and the participant ID. The last (maybe) field is the payload, the interpretation of which is dependent on the PTC. 

The format is as follows:

```
<payload type code>,<participant ID>,<message body>
```

### Payload Type Codes

|Code|Value|
|-|-|
|END|0|
|MSG|1|
|GEO|2|

Examples: 

A sample message sent from participant `g58Ha+`:

```
1,g58Ha+,This is a sample message
```

A set of geographical coordinates sent from participant `hp42JE`:

```
2,hp42JE,34.0001920,-60.9302284
```