const crypto = require('crypto');

// 데이터
const encryptedData = 'U2FsdGVkX197TiE6/X6qLgwof72OnM4ebTk0qMySyImn3PvLZFwpgHQ77Kf7DSQjCvLcSI7MLaVbdjdVUyU1YMn6gIP6pDXW9T553c7t42+ViE+5XBjbtb3KbUn+wWs/OE/t+QzegueC9pWVhrFO5ylAm/8QDSNeLVpjl3y7TfJIHcnz0Rv+K7+yEL63ttlo+O7m/xoNtMMcrARBSTs2oaVvDKv95gJHjDX2vOict5/wXEmtc3c7K5XAtF1x6+Cx6dmCfs1XXkaZpsTh7rrglg==';
const key = 'EZPZ-Token-Encryption-Key-2024-SecureStorage-AES256';

try {
  // Base64 디코딩
  const encrypted = Buffer.from(encryptedData, 'base64');
  
  console.log('암호화된 데이터 길이:', encrypted.length);
  console.log('첫 8바이트:', encrypted.slice(0, 8).toString());
  
  // CryptoJS 형식 파싱 (Salted__ 제거)
  if (encrypted.toString('utf8', 0, 8) === 'Salted__') {
    const salt = encrypted.slice(8, 16);
    const ciphertext = encrypted.slice(16);
    
    console.log('Salt:', salt.toString('hex'));
    console.log('Ciphertext length:', ciphertext.length);
    
    // PBKDF2로 키 유도 (CryptoJS 기본값)
    const keyIv = crypto.pbkdf2Sync(key, salt, 1000, 48, 'md5');
    const derivedKey = keyIv.slice(0, 32);
    const iv = keyIv.slice(32, 48);
    
    console.log('유도된 키:', derivedKey.toString('hex'));
    console.log('IV:', iv.toString('hex'));
    
    // AES-256-CBC 복호화
    const decipher = crypto.createDecipheriv('aes-256-cbc', derivedKey, iv);
    let decrypted = decipher.update(ciphertext);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    
    console.log('복호화 결과:', decrypted.toString('utf8'));
  } else {
    console.log('CryptoJS 형식이 아닙니다.');
    console.log('실제 헤더:', encrypted.slice(0, 8).toString('hex'));
  }
} catch (error) {
  console.error('복호화 실패:', error.message);
  console.error('스택:', error.stack);
} 