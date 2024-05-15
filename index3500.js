const fs = require('fs').promises;
const path = require('path');
var cron = require('node-cron');
const process = require('process');
const {authenticate} = require('@google-cloud/local-auth');
const {google} = require('googleapis');
const { constants } = require('fs');


// If modifying these scopes, delete token.json.
const SCOPES = ['https://www.googleapis.com/auth/drive.metadata.readonly', 'https://www.googleapis.com/auth/spreadsheets'];
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const TOKEN_PATH = path.join(process.cwd(), 'token.json');
const CREDENTIALS_PATH = path.join(process.cwd(), 'client_secret_151362979698-dg58pq7ndhos1q5mftenlpms213tp8uo.apps.googleusercontent.com.json');

/**
 * Reads previously authorized credentials from the save file.
 *
 * @return {Promise<OAuth2Client|null>}
 */
async function loadSavedCredentialsIfExist() {
  try {
    const content = await fs.readFile(TOKEN_PATH);
    const credentials = JSON.parse(content);
    return google.auth.fromJSON(credentials);
  } catch (err) {
    return null;
  }
}

/**
 * Serializes credentials to a file comptible with GoogleAUth.fromJSON.
 *
 * @param {OAuth2Client} client
 * @return {Promise<void>}
 */
async function saveCredentials(client) {
  const content = await fs.readFile(CREDENTIALS_PATH);
  const keys = JSON.parse(content);
  const key = keys.installed || keys.web;
  const payload = JSON.stringify({
    type: 'authorized_user',
    client_id: key.client_id,
    client_secret: key.client_secret,
    refresh_token: client.credentials.refresh_token,
  });
  await fs.writeFile(TOKEN_PATH, payload);
}

/**
 * Load or request or authorization to call APIs.
 *
 */
async function authorize() {
  let client = await loadSavedCredentialsIfExist();
  if (client) {
    return client;
  }
  client = await authenticate({
    scopes: SCOPES,
    keyfilePath: CREDENTIALS_PATH,
  });
  if (client.credentials) {
    await saveCredentials(client);
  }
  return client;
}
/**
 * Lists the names and IDs of up to 10 files.
 * @param {OAuth2Client} authClient An authorized OAuth2 client.
 */

const dataFolderKabkot=[ 
    [ '3500', '1nbOhFm5M8XtOSt_qIT3MHLoSV7Z605Pj','Provinsi Jawa Timur' ]
   
  ]


async function getFolders(idFolder,drive){
    const contents = await drive.files.list({
        q: `'${idFolder}' in parents and trashed=false`,
        fields: '*',
      });
         
    const folders=contents.data.files.filter((folder)=>{
        return folder.mimeType=='application/vnd.google-apps.folder';
    });
    const files=contents.data.files.filter((file)=>{
        return file.mimeType!='application/vnd.google-apps.folder';
    });
     
    return {'folders':folders,  'files':files}  ;
}

async function getFileDetail(idFile, drive){

    const filesDetail= await drive.files.get({
            fileId:idFile,
            fields: '*'
    })
    return filesDetail;
}

function getFileInfo(files, kdKab, path, level1, level2, nmKabKota ){
    //console.log(files);
    return [kdKab, 'file', files.name, path,level1, level2, files.webViewLink, files.createdTime.substring(0, 10),
    files.size, files.owners[0].displayName, nmKabKota, '['+kdKab+']'+' '+nmKabKota]
  }
  
  function getFolderInfo(folder, kdKab, path, level1, level2, nmKabKota ){
    //console.log(folder.createdTime.substring(0, 10));
    return [kdKab, 'folder', folder.name, path, level1, level2,folder.webViewLink, folder.createdTime.substring(0, 10),
    '', folder.owners[0].displayName, nmKabKota, '['+kdKab+']'+' '+nmKabKota]
    
  }
  



  
async function listFiles(authClient) {
const drive = google.drive({version: 'v3', auth: authClient});
const sheets = google.sheets({version: 'v4', auth:authClient});
console.log('masuk');
  const files = [];
 
  try {
        //dataFolderKabkot.map
    for( let a=0; a<dataFolderKabkot.length; a++){
        const output=[['kode_kabkot',	'jenis',	'nama_file',	'path','level1', 'level2',	'link',	'date_created',	'size',	'owner', 'nama_kabkot', 'kode_nama_kabkot']]
        let numFolder=0;

        // await sheets.spreadsheets.values.update({
        //     spreadsheetId: "1BK_zTK30TFM5mdzHwYISi7vTTTh9Eli1ENZNJg5fn6k",
        //     range: "recap!E"+(a+2)+":G"+(a+2),
        //     valueInputOption: 'USER_ENTERED',
        //     resource:{'values':[[new Date().toISOString().replace(/T/, ' ').replace(/\..+/, ''), '', 'Gagal' ]]}
        //     });

        console.log('crawl data '+dataFolderKabkot[a][0]+' - '+dataFolderKabkot[a][2]+' . . . ')
        const nmKabKota=dataFolderKabkot[a][2];
        const kdKab=dataFolderKabkot[a][0];
        
        const folderRoot = await getFolders(dataFolderKabkot[a][1], drive);
        //console.log(folderRoot);
        
        for (let item of folderRoot.folders) {
            console.log(item.name);
            await getFolders(item.id,drive).then( async (response)=>{
                for(let item2 of response.folders){
                    await getFolders(item2.id,drive).then(async(response)=>{
                        console.log(item2.name);
                        output.push(  getFolderInfo(item2, kdKab, item.name, item.name, item2.name, nmKabKota ));
                        for(let files2 of response.files){
                            output.push( getFileInfo(files2, kdKab, item.name+' >> '+item2.name, item.name, item2.name, nmKabKota ));
                        }
                        for(let item3 of response.folders){
                            await getFolders(item3.id,drive).then(async (response)=>{
                                //console.log(item3.name);
                                output.push( getFolderInfo(item3, kdKab, item.name+' >> '+item2.name, item.name, item2.name, nmKabKota ));
                                for(let files3 of response.files){
                                    output.push( getFileInfo(files3, kdKab, item.name+' >> '+item2.name+' >> '+item3.name, item.name, item2.name, nmKabKota ));
                                }
                                for(let item4 of response.folders){
                                    await getFolders(item4.id,drive).then(async (response)=>{
                                        //console.log(item4.name);
                                        output.push( getFolderInfo(item4, kdKab,  item.name+' >> '+item2.name+' >> '+item3.name, item.name, item2.name, nmKabKota ));
                                        for(let files4 of response.files){
                                            output.push( getFileInfo(files4, kdKab,  item.name+' >> '+item2.name+' >> '+item3.name+' >> '+item4.name, item.name, item2.name, nmKabKota ));
                                        }
                                        for(let item5 of response.folders){
                                            await getFolders(item5.id,drive).then(async (response)=>{
                                                //console.log(item5.name);
                                                output.push( getFolderInfo(item5, kdKab, item.name+' >> '+item2.name+' >> '+item3.name+' >> '+item4.name, item.name, item2.name, nmKabKota ));
                                                for(let files5 of response.files){
                                                    output.push( getFileInfo(files5, kdKab, item.name+' >> '+item2.name+' >> '+item3.name+' >> '+item4.name+' >> '+item5.name, item.name, item2.name, nmKabKota ));
                                                }
                                                for(let item6 of response.folders){
                                                    await getFolders(item6.id,drive).then(async (response)=>{
                                                        //console.log(item6.name);
                                                        output.push( getFolderInfo(item6, kdKab, item.name+' >> '+item2.name+' >> '+item3.name+' >> '+item4.name+' >> '+item5.name, item.name, item2.name, nmKabKota ));
                                                        for(let files6 of response.files){
                                                            output.push( getFileInfo(files6, kdKab, item.name+' >> '+item2.name+' >> '+item3.name+' >> '+item4.name+' >> '+item5.name+' >> '+item6.name, item.name, item2.name, nmKabKota ));
                                                        }
                                                        for(let item7 of response.folders){
                                                            await getFolders(item7.id,drive).then(async (response)=>{
                                                                //console.log(item7.name);
                                                                output.push( getFolderInfo(item7, kdKab, item.name+' >> '+item2.name+' >> '+item3.name+' >> '+item4.name+' >> '+item5.name+' >> '+item6.name, item.name, item2.name, nmKabKota ));
                                                                for(let files7 of response.files){
                                                                    output.push( getFileInfo(files7, kdKab, item.name+' >> '+item2.name+' >> '+item3.name+' >> '+item4.name+' >> '+item5.name+' >> '+item6.name+' >> '+item7.name, item.name, item2.name, nmKabKota ));
                                                                }
                                                            })
                                                      }
                                                  })
                                              }
                                          })
                                      }
                                  })
                              }
                          })
                      }
                    })
                }
                
            })   
        }
        //console.log(output.length);
        
      
        const result = await sheets.spreadsheets.values.update({
            spreadsheetId: "1qX_VliqWsVl03PA7f5_MhBVspKaigYcL3ZWLOxT1Zqc",
            range: dataFolderKabkot[a][0]+"!A1:L"+(output.length+1),
            valueInputOption: 'USER_ENTERED',
            resource:{'values':output}
            });
        // await sheets.spreadsheets.values.update({
        //     spreadsheetId: "1BK_zTK30TFM5mdzHwYISi7vTTTh9Eli1ENZNJg5fn6k",
        //     range: "recap!F"+(a+2)+":G"+(a+2),
        //     valueInputOption: 'USER_ENTERED',
        //     resource:{'values':[[new Date().toISOString().replace(/T/, ' ').replace(/\..+/, ''), 'Sukses']]}
        //     });
    }

    // await sheets.spreadsheets.values.clear({
    //   spreadsheetId: "113KE3jCLZC5mMujnoW5Dm0P0L1Wf0h6krGwblXBZuDw",
    //   range: "merge!A2:L",
    //  }).then(async()=>{
    //       var merge=[];
    //       console.log('start merge')
    //       for(let p=0;p<dataFolderKabkot.length;p++){
    //           console.log('get data from '+dataFolderKabkot[p][0])
    //           const dataSheet=await sheets.spreadsheets.values.get({
    //               spreadsheetId: "1BK_zTK30TFM5mdzHwYISi7vTTTh9Eli1ENZNJg5fn6k",
    //               range: dataFolderKabkot[p][0]+"!A2:L",
    //           })
    //           for(let q=0;q<dataSheet.data.values.length;q++){
    //               merge.push(dataSheet.data.values[q])
    //           }
    //       }
          
    //       await sheets.spreadsheets.values.update({
    //           spreadsheetId: "113KE3jCLZC5mMujnoW5Dm0P0L1Wf0h6krGwblXBZuDw",
    //           range: "merge!A2:L"+merge.length+2,
    //           valueInputOption: 'USER_ENTERED',
    //           resource:{'values':merge}
    //           });
    //       await sheets.spreadsheets.values.update({
    //         spreadsheetId: "113KE3jCLZC5mMujnoW5Dm0P0L1Wf0h6krGwblXBZuDw",
    //         range: "metadata!B2:B2",
    //         valueInputOption: 'USER_ENTERED',
    //         resource:{'values':[[new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '')]]}
    //         });
    //       console.log('finish merge');
    //  });
      
  } catch (err) {
    // TODO(developer) - Handle error
    throw err;
  }
}

 authorize().then(listFiles).catch(console.error)
