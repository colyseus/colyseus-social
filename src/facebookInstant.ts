import  * as CryptoJS from "crypto-js"

export async function validateSignature(signatureVal:string){
    try {
        var firstpart = signatureVal.split('.')[0];
        var replaced = firstpart.replace(/-/g, '+').replace(/_/g, '/');
        var signature:string = CryptoJS.enc.Base64.parse(replaced).toString();
        const dataHash =
        CryptoJS.HmacSHA256(signatureVal.split('.')[1], process.env.APP_SECRET)
          .toString();
        var isValid = signature === dataHash;
        if (!isValid) {
          console.log('Invalid signature');
          console.log('Expected', dataHash);
          console.log('Actual', signature);
        }
  
        return isValid;
      } catch (e) {
        return false;
      }
}

export async function getEncodeDataBySignature(signature:string){
    try {
        const json =
          CryptoJS.enc.Base64.parse(signature.split('.')[1])
          .toString(CryptoJS.enc.Utf8);
        const encodedData = JSON.parse(json);
        /*
              Here's an example of encodedData can look like
              {
                  algorithm: 'HMAC-SHA256',
                  issued_at: 1520009634,
                  player_id: '123456789',
                  request_payload: 'backend_save'
              }
              */
        return encodedData;
      } catch (e) {
        return null;
      }
  
}