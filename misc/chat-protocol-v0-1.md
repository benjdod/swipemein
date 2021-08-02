# SMI Chat Protocol Version 0.1

This is a writeup of the super simple chat protocol. This protocol is built on top of the Websocket protocol. Chat is meant to support an arbitrary number of participants, but for the purpose of this site most chats have two members. In production the websocket subprotocol should be called `chat.smi.com`.


## Functionality

All messages between client and server are sent using text payload frames. This is for simplicity's sake.

The first message in this protocol is sent by the client. If a client is new and needs to obtain an ID to participate in a chat session, it sends the string `hello` to the server, which will respond with a 6-character ID as a string. If a client already has an ID, it can send it to the server, which will respond back with the same ID as a string. 

After initialization, the client sends a message consisting of three (or more) fields in a comma separated format. The first two items are the [payload type code (PTC)](#payload-type-codes) and the participant ID. The last (maybe) field is the payload, the interpretation of which is dependent on the PTC. 

The format is as follows:

```
<payload type code>,<participant ID>,<time>,<payload>
```

<a name="payload-type-codes">

### Payload Type Codes

|Code|Value|Description|
|-|-|-|
|CTRL|0|Control command ([see below](#control-commands))|
|TXT|1|Send a textual message|
|GEO|2|Send geographical coordinates|

Examples: 

A sample textual message sent from participant `g58Ha+`:

```
1,g58Ha+,This is a sample message
```

A set of geographical coordinates sent from participant `hp42JE`:

```
2,hp42JE,34.0001920,-60.9302284
```

<a name="control-commands">

### Control Commands 


|Command|Description|
|-|-|
|END|Ends the current session|
|CANCEL|Cancels the pending request|

#### Examples:

 - `0,jk6a/T,END` : participant `jk6a/T` ends the session.