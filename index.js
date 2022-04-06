const Axios = require('axios')
const colors = require('colors');
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

let bucket = ''
const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET=process.env.CLIENT_SECRET;
let access_token = '';
const querystring = require('querystring')
const scopes = 'data:read data:write data:create bucket:create bucket:read viewables:read';

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
                scope: scopes
            })
        })
       
    
        access_token = result.data.access_token;
        console.log(access_token);
        
        
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
                 scope: 'viewables:read'
             })
     
         })
         res.json({access_token: result.data.access_token, 
             expires_in: response.data.expires_in})
        
    } catch (error) {
        res.status(500).json(error)
    }
})
app.post('/api/bucket', (req, res)=>{

     bucket= req.body
     bucket = bucket.bucket
     console.log(bucket);
   try {
       
      return res.status(200).redirect('/api/forge/datamanagement/bucket/create')
   } catch (error) {
       res.status(400)
       res.json({
           success: false,
           message: 'Failed to create a Bucket',
           error: error.message
       })
       console.log('error /api/bucket'.rainbow);
   }
})
const bucketKey = 'archivo_1';
console.log(bucketKey.rainbow);
const policyKey = 'transient';

app.get('/api/forge/datamanagement/bucket/create', async (req, res)=>{
    try {
        console.log('bucket =',bucketKey.rainbow);
        
        let result = await Axios({
            method: 'POST',
            url: 'https://developer.api.autodesk.com/oss/v2/buckets',
            headers: {
                'content-type': 'application/json',
                Authorization: `Bearer ${access_token}`
                
            },
            data: JSON.stringify({
                'bucketKey': bucketKey,
                'policyKey': policyKey
            })
            
        })
        console.log(res);
        res.redirect('/api/forge/datamanagement/bucket/detail')
        
    } catch (error) {

        if (error.response && error.response.status == 409) {
            console.log('Bucket already exist, skip creation.');
            console.log('si funciona'.rainbow);
            
            return res.status(200).redirect('/api/forge/datamanagement/bucket/detail')
        }
        console.log(error);
        res.send('Failed to create a new bucket');
    }
})

app.get('/api/forge/datamanagement/bucket/detail', async (req, res)=>{
    try {
        console.log('paso al detail'.rainbow);
        let result = await Axios({
            method: 'GET',
            url: `https://developer.api.autodesk.com/oss/v2/buckets/${encodeURIComponent(bucketKey)}/details`,
            headers: {
                Authorization: `Bearer ${access_token}` 
            }
            
        })


    } catch (error) {
        res.send('Failed to verify the new bucket');
    }
});



const multer = require('multer');
const { log } = require('console');
let upload = multer({dest: 'upload/'})

app.post('/api/forge/datamanagement/bucket/upload', upload.single('fileToUpload'),  (req, res) => {
    const fs = require('fs');
    fs.readFile(req.file.path, async (err, filecontent) => {
        try {
            let result = await Axios({
                method: 'PUT',
                url: `https://developer.api.autodesk.com/oss/v2/buckets/${encodeURIComponent(bucketKey)}/objects/${encodeURIComponent(req.file.originalname)}`,
                headers:{
                    Authorization: `Bearer ${access_token}`,
                    'Content-Disposition': req.file.originalname,
                    'Content-Length': filecontent.length
                },
                data: filecontent
            })
            let data = await result.data.objectId;
            let buff = await Buffer.from(data)
            let urn = await buff.toString('base64')
            console.log(urn);
            res.redirect(`/api/forge/modelderivative/${urn}`)
        } catch (error) {
            console.log(error);
            res.send('Failed to create a new object in the bucket');
        }
    })
})

app.get('/api/forge/modelderivative/:urn', async (req, res)=>{
    let urn = req.params.urn;
    let format_type = 'sfv';
    let format_views = ['2d', '3d'];
    try {
        
        let result = await Axios({
            method: 'POST',
            url: 'https://developer.api.autodesk.com/modelderivative/v2/designdata/job',
            headers:{
                'content-type': 'application/json',
                 Authorization: `Bearer ${access_token}`
            },
            data: JSON.stringify({
                'input': {
                    'urn': urn
                },
                'output': {
                    'formats': [
                        {
                            'type': format_type,
                            'views': format_views
                        }
                    ]
                }
            })
        })
        res.redirect(`/viewer.html?urn=${urn}`);
    } catch (error) {
        res.send('Error at Model Derivative job.');
    }

})