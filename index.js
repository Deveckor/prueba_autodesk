const Axios = require('axios')
const colors = require('colors');
const { response } = require('express');
const express = require('express');
const req = require('express/lib/request');
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
const querystring = require('querystring')
const scopes = 'data:read data:write data:create bucket:create bucket:read';

app.get('/api/forge/oauth', async (req, res)=>{
    try {

        let URL = 'https://developer.api.autodesk.com/authentication/v1/authenticate';
        
        let result = await Axios({
            method: 'POST',
            url: URL,
            headers:{
                'content-type': 'application/x-www-form-urlencoded'
            },
            data: querystring.stringify({
                client_id: CLIENT_ID,
                client_secret: CLIENT_SECRET,
                grant_type: 'client_credentials',
                scopes: scopes
            })
        })
       
    
        accessToken = result.data.accessToken;
        console.log(result);
        res.redirect('/api/forge/bucket/create')
        
    } catch (error) {
        console.log(error);
        res.send('Error al autenticar')
    }
})

app.get('/api/forge/oauth/public', async (req, res)=>{
    try {
        let result = await Axios({
             method: 'POST',
             url: 'https://developer.api.autodesk.com/authentication/v1/authenticate',
             headers:{
                 'content-type': 'application/x-www-form-urlencoded',
             },
             data: querystring.stringify({
                 client_id: CLIENT_ID,
                 client_secret: CLIENT_SECRET,
                 grant_type: 'client_credentials',
                 spope: 'viewables:read'
             })
     
         })
         res.json({accessToken: result.data.access_token, 
             expires_in: response.data.expires_in})
        
    } catch (error) {
        res.status(500).json(error)
    }
})
app.post('/api/bucket', (req, res)=>{

   try {
       const bucket = req.body;

       res.json({
           success: true,
           message: 'create a bucket',
           data:{
               bucket
           }
       })
       console.log(bucket);
   } catch (error) {
       res.status(400)
       res.json({
           success: false,
           message: 'Failed to create a Bucket',
           error: error.message
       })
   }
})
const bucketkey = '';
const policykey = 'transient';

app.get('/api/forge/datamanagement/bucket/create')