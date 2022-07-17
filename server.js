const WebSocketServer = new require('ws');
const express = new require('express');

const PORT = process.env.PORT || 9000;
const INDEX = '/index.html';

const server = express()
  .use((req, res) => res.sendFile(INDEX, { root: __dirname }))
  .listen(PORT, () => console.log(`Listening on ${PORT}`));


const clients = [];

const webSocketServer = new WebSocketServer.Server({ server });
webSocketServer.on('connection', function(ws) {

  const id = Math.random();
  ws.id = id;
  clients.push(ws);

  ws.on('message', function(message) {
    const request = `${message}`.split(',');
    const [event, messageBody] = request;

    console.log(request);

    switch (event) {
      case 'openConnection':
        openConnection(clients);
        break;

      case 'login':
        loginClient(clients, messageBody, ws.id);
        break;

      case 'choosedCard':
        choosedCard(clients, messageBody, ws.id);
        break;
        
      case 'startVote':
        startVote(clients);
        break;

      case 'finishVote':
        finishVote(clients);
        break;
    }
  });

  ws.on('close', function() {
    clients.splice(
      clients.findIndex(client => client.id === id),
      1,
    )

    openConnection(clients); //to do: make right method 
  });
});

console.log('Server started at 8000 port');

const  openConnection = (clients) => {
  const prepareClients  = clients.map((client) => ( 
    {
      name: client.name || 'anonym', 
      id: client.id, 
      points: client.points,
      ready: client.ready,
    }
  ))
  prepareClients.splice(0, 0, 'openFromServer');
  sendForAllClients(clients, JSON.stringify(prepareClients));
}

const sendForAllClients = (clients, message) => {
  clients.map(client => {
    client.send(message)
  })
}

const loginClient = (clients, message, id) => {
  const client = clients.find(client => client.id == id);
  client.name = message;
  const prepareClients  = clients.map((client) => ( 
    { 
      name: client.name || 'anonym', 
      id: client.id, 
      points: client.points,
      ready: client.ready,
    }
  ))
  prepareClients.splice(0, 0, 'loginFromServer');
  sendForAllClients(clients, JSON.stringify(prepareClients));
}

const choosedCard = (clients, message, id) => {
  const client = clients.find(client => client.id == id);
  client.points = message;
  client.ready = true;
  const prepareClients  = clients.map((client) => ( 
    { 
      name: client.name || 'anonym', 
      id: client.id, 
      points: client.points, 
      ready: client.ready,
    }
  ));
  prepareClients.splice(0, 0, 'choosedCardFromServer');
  sendForAllClients(clients, JSON.stringify(prepareClients));
}

const startVote = (clients) => {
  clients.map(client => {
    client.points = 0;
  })
  const prepareClients  = clients.map((client) => ( 
    { 
      name: client.name || 'anonym', 
      id: client.id, 
      points: client.points,
      ready: client.ready,
    }
  ));
  prepareClients.splice(0, 0, 'startVoteFromServer');
  sendForAllClients(clients, JSON.stringify(prepareClients));
}

const finishVote = (clients) => {
  clients.map(client => {
    client.ready = false;
  })
  const prepareClients  = clients.map((client) => ( 
    { 
      name: client.name || 'anonym', 
      id: client.id, 
      points: client.points,
      ready: client.ready,
    }
  ));
  prepareClients.splice(0, 0, 'finishVoteFromServer');
  sendForAllClients(clients, JSON.stringify(prepareClients));
}
