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
    [ '3501', '1Qi20QZzResOy7QTL3aCFk35xmqxb4KjG','Kabupaten Pacitan' ],
    [ '3502', '1a_j7PhHrNFo53-hpzd2eZqRpHLgmBK2j','Kabupaten Ponorogo'  ],
    [ '3503', '1huIm8LcSgRBMrRx4lcwoH4rICVhjgy4p','Kabupaten Trenggalek'],            
    [ '3504', '1YcBM3dZROZB6PlbD_WLLP3v_0zs0g9EN','Kabupaten Tulungagung'],
    [ '3505', '1Dnqz0NNNmCLtVSjcfZ8ASmVbrljWEliw','Kabupaten Blitar' ],
    [ '3506', '1_iL-wdl37owV6WjB8JAsHswQ9IOPyIAQ','Kabupaten Kediri'],
    [ '3507', '1yFKsGcWH3lpYXLhxvJ18TdaJVGiz0pF6','Kabupaten Malang'],
    [ '3508', '137SYPrp6wZxxp2UjGGuz4Mq5LbMF4mXQ','Kabupaten Lumajang' ],
    [ '3509', '1oEEY6nF_oSQBibPwrLxgBsurWH3fuXcJ','Kabupaten Jember' ],
    [ '3510', '1uXgSgMnND3waAN4fGNl9-fW4m95qEAuZ','Kabupaten Banyuwangi' ],
    [ '3511', '1DqfzubkQxkhP4p5GqnzKVCgnKk-nwjgT','Kabupaten Bondowoso' ],
    [ '3512', '1odHay_UZZjYLUi4zUPD3PbWGhx_qiidQ','Kabupaten Situbondo' ],
    [ '3513', '1t5bHEggNYqQ15MrWfMG3rp0nVPXMsbBr','Kabupaten Probolinggo' ],
    [ '3514', '1PM9XnQkkoAC4HVOovAgf3yFSkn1CXu04','Kabupaten Pasuruan' ], 
    [ '3515', '1G1BsbRlVCtats_x75VOuz0HIZWXviS2J','Kabupaten Sidoarjo' ], //20
    [ '3516', '1KpqBy6ODKUPjE27I_5UUHVZ2DAgDH5m3','Kabupaten Mojokerto' ], //21
    [ '3517', '137DHfBK4nydmwQBL8aQ55Im9yTNoEdvK','Kabupaten Jombang' ], //22
    [ '3518', '18xqm1VELxc7HmwzCfDVtKjQZi-tA1gVz','Kabupaten Nganjuk' ], //23 
    [ '3519', '1GvspaVc3NhW2aW8_2CeAoIG0aw_nYX2c','Kabupaten Madiun' ], //19
    [ '3520', '1IFj0agJo0Egd4gt9giycc5a2qV2So7NN','Kabupaten Magetan' ], //24
    [ '3521', '1C--REbDOmPns8OeB0pExA62ywK5A3c4k','Kabupaten Ngawi' ], //18
    [ '3522', '1MuhW7__pk-5k7c5cgi2KnZkQ3emrpVE3','Kabupaten Bojonegoro' ], //17
    [ '3523', '1UYq0dlz_LrOUgkxwTAsFEjfyt2HGusgx','Kabupaten Tuban' ], //16\
    [ '3524', '1OXdaYoYejYTZX7lk_q3O4e6lnuYvta0K','Kabupaten Lamongan' ], //15
    [ '3525', '1s_f1gB6cE0byQM-NXBo6HqbMQCT2WV_g','Kabupaten Gresik' ], //2
    [ '3526', '1waJoszoHi9PaFQA231zP3Cd0nJXl1gPU','Kabupaten Bangkalan' ],//5
    [ '3527', '1rybn89-xHB7CIS6DFNmsSBpDbMtuK2ww','Kabupaten Sampang' ],//4
    [ '3528', '1a2iEaN75qcefZ3APYsEiJall52a8eJpH','Kabupaten Pamekasan' ],//3
    [ '3529', '1yjnEfIfjEycb3cTZFWwiLbT7sekO9Gzy','Kabupaten Sumenep' ], //1
    [ '3571', '1X94qMEEWuaoflr8GZ_eYe8yTj8JSeZc7','Kota Kediri' ],//13
    [ '3572', '1JNZ1iMnpUKO79Ftg9MlxsDSpa8DsJU4J','Kota Blitar' ],//14
    [ '3573', '1JubWmAtTzwO0Ac7miPIFyIDKSCnC3Kjk','Kota Malang' ],//10
    [ '3574', '1OOZ8expHOVwt-tGa9NcKzp1Jofo7YHBv','Kota Probolinggo' ],//9
    [ '3575', '1ECnCcF3n1z1nJA6HnqfrOAD3PdQf7tqv','Kota Pasuruan' ],//7
    [ '3576', '1movCAp2rje-D16ShJxvDrMef98Z6Yl2g','Kota Mojokerto' ],//12
    [ '3577', '1LBxuYdpD4rq989mCTYNABaJ-EycMepd4','Kota Madiun' ],//11
    [ '3578', '1Ill00VO-QGkaDs09WNPaQ0Jer4LYRp5R','Kota Surabaya' ],//8
    [ '3579', '16Myuw1CPikhSLRJ9SrBBo602ZuyTyYAw','Kota Batu' ] //6
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
        for( let a=0;a<dataFolderKabkot.length; a++){
            const output=[['kode_kabkot',	'jenis',	'nama_file',	'path','level1', 'level2',	'link',	'date_created',	'size',	'owner', 'nama_kabkot', 'kode_nama_kabkot']]
            let numFolder=0;

            await sheets.spreadsheets.values.update({
                spreadsheetId: "1BK_zTK30TFM5mdzHwYISi7vTTTh9Eli1ENZNJg5fn6k",
                range: "recap!E"+(a+2)+":G"+(a+2),
                valueInputOption: 'USER_ENTERED',
                resource:{'values':[[new Date().toISOString().replace(/T/, ' ').replace(/\..+/, ''), '', 'Gagal' ]]}
                });

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
            
            await sheets.spreadsheets.values.update({
                spreadsheetId: "1yTY0IU2jzXxGcXxaPbVx7CddLmUS58RN7PyzuqTNi1M",
                range: dataFolderKabkot[a][0]+"!A1:L"+(output.length+1),
                valueInputOption: 'USER_ENTERED',
                resource:{'values':output}
                });
            await sheets.spreadsheets.values.update({
                spreadsheetId: "1yTY0IU2jzXxGcXxaPbVx7CddLmUS58RN7PyzuqTNi1M",
                range: "recap!F"+(a+2)+":G"+(a+2),
                valueInputOption: 'USER_ENTERED',
                resource:{'values':[[new Date().toISOString().replace(/T/, ' ').replace(/\..+/, ''), 'Sukses']]}
                });
        }

        await sheets.spreadsheets.values.clear({
            spreadsheetId: "1SzX43B86kH9HONszsMDzbfTnObp6TCHccC-X9uut6R4",
            range: "merge!A2:L",
           }).then(async()=>{
                var merge=[];
                for(let p=0;p<dataFolderKabkot.length && p<3;p++){
                    console.log('get data from '+dataFolderKabkot[p][0])
                    const dataSheet=await sheets.spreadsheets.values.get({
                        spreadsheetId: "1yTY0IU2jzXxGcXxaPbVx7CddLmUS58RN7PyzuqTNi1M",
                        range: dataFolderKabkot[p][0]+"!A2:L",
                    })
                    for(let q=0;q<dataSheet.data.values.length;q++){
                        merge.push(dataSheet.data.values[q])
                    }
                }
                
                console.log('pass');
                //console.log(merge);
                await sheets.spreadsheets.values.update({
                    spreadsheetId: "1SzX43B86kH9HONszsMDzbfTnObp6TCHccC-X9uut6R4",
                    range: "merge!A2:L"+merge.length+2,
                    valueInputOption: 'USER_ENTERED',
                    resource:{'values':merge}
                    });
                
           });

        
      
    } catch (err) {
        // TODO(developer) - Handle error
        throw err;
    }
}

  authorize().then(listFiles).catch(console.error)