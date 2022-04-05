const fetch = require('node-fetch')
const express = require('express');
const path = require('path');
require('dotenv').config()

const PORT = process.env.PORT || 3000;


let app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, '/modules')));

app.listen(PORT, ()=>{
    console.log(`Server running on port ${PORT}`);
})

const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET=process.env.CLIENT_SECRET;
let accessToken = '';
let grant_type = 'client_credentials'
const scopes = 'data:read data:write data:create bucket:create bucket:read';

app.get('/api/forge/oauth', async (req, res)=>{
    try {
        let URL = 'https://developer.api.autodesk.com/authentication/v1/authenticate';
        let options = {
            method: 'POST',
            headers:{
                'content-type': 'application/x-www-form-urlencoded'
            },
            data: JSON.stringify({
                'client_id': CLIENT_ID,
                'client_secret': CLIENT_SECRET,
                'grant_type': grant_type,
                'scopes': scopes
            })
        }
        let res = await fetch(URL, options);
        let json = await res.json();
    
        console.log(json);
        
    } catch (error) {
        console.log(error);
        res.send('Error al autenticar')
    }
})