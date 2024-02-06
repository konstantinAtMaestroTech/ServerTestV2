const express = require('express');
const { PORT } = require('./config.js');
const path = require('path');

let app = express();
app.use(express.static('wwwroot'));
app.use('/api/auth', require('./routes/auth.js'));
app.use('/api/models', require('./routes/models.js'));
app.get('/labelsServer/:imageID', (req, res) => {
    const {imageID} = req.params;
    res.sendFile(__dirname + '/temp/labelsServer/' + String(imageID));
    }
);
app.get('/temp/gantt/csv_sheet.csv', (req, res) => {
    res.sendFile(__dirname + '/temp/gantt/csv_sheet.csv');
    }
);
app.listen(PORT, function () { console.log(`Server listening on port ${PORT}...`); });