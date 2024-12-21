const express = require('express');
const router = express.Router();
const fs = require('fs').promises;
const path = require('path');

const playersFilePath = path.join(__dirname, 'players.json');
const pubsFilePath = path.join(__dirname, 'pubs.json');


async function readData(filePath) {
  try {
    const data = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
      console.error('Error reading data:', error);
     
      if (error.code === 'ENOENT') {
          return { players: [] };
      }
      throw error;
  }
}

async function writeData(filePath, data) {
    try {
        await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
    } catch (error) {
        console.error('Error writing data:', error);
        throw error;
    }
}


router.get('/', async (req, res) => {
  try {
    const playersData = await readData(playersFilePath);
    const pubsData = await readData(pubsFilePath);
    
    
    const sortedPlayers = [...playersData.players].sort((a, b) => a.score - b.score);

      const currentPub = pubsData.pubs.find(pub => pub.id === pubsData.currentPub)

    res.render('index', { players: sortedPlayers, currentPub });
  } catch (error) {
    res.status(500).send('Error loading data');
  }
});



router.get('/admin', async (req, res) => {
    try {
        const playersData = await readData(playersFilePath);
        const pubsData = await readData(pubsFilePath);
        res.render('admin', { players: playersData.players, pubs: pubsData.pubs, currentPub: pubsData.currentPub });
    } catch (error) {
        res.status(500).send('Error loading data');
    }
});


router.post('/admin/addPlayer', async (req, res) => {
    try {
        const playersData = await readData(playersFilePath);
        const newPlayer = {
            id: playersData.players.length > 0 ? playersData.players.reduce((max, p) => Math.max(max, p.id), 0) + 1 : 1,
            name: req.body.name,
            score: 0
        };
        playersData.players.push(newPlayer);
        await writeData(playersFilePath, playersData);
        res.redirect('/admin');
    } catch (error) {
        res.status(500).send('Error adding player');
    }
});



router.post('/admin/editPlayer/:id', async (req, res) => {
    try {
        const playersData = await readData(playersFilePath);
        const playerId = parseInt(req.params.id);
        const player = playersData.players.find(p => p.id === playerId);
        if (player) {
            player.score = parseInt(req.body.score);
        }
        await writeData(playersFilePath, playersData);
        res.redirect('/admin');
    } catch (error) {
        res.status(500).send('Error updating score');
    }
});



router.post('/admin/setCurrentPub', async (req, res) => {
  try {
        const pubsData = await readData(pubsFilePath);
        pubsData.currentPub = parseInt(req.body.currentPub);
        await writeData(pubsFilePath, pubsData);
      res.redirect('/admin');
  } catch (error) {
      res.status(500).send('Error setting current pub');
  }
});


router.get('/map', async (req, res) => {
    try {
        const pubsData = await readData(pubsFilePath);
        res.render('map', { pubs: pubsData.pubs });
    } catch (error) {
        res.status(500).send('Error loading map data');
    }
});

module.exports = router;