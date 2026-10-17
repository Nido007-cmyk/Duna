// Public HTTPS tunnel via Pinggy (SSH over port 443) using node ssh2; prints URL to data/public_url.txt
const {Client}=require('ssh2'),net=require('net'),fs=require('fs');
const c=new Client();
c.on('ready',()=>{c.forwardIn('0.0.0.0',0,e=>{if(e)throw e;});
  c.shell((e,s)=>{if(e)return;s.on('data',d=>{const t=d.toString();process.stdout.write(t);const m=t.match(/https:\/\/[a-z0-9.-]+\.(pinggy\.link|free\.pinggy\.link|pinggy\.online)/);if(m)fs.writeFileSync(__dirname+'/data/public_url.txt',m[0]+'\n');}).on('close',()=>process.exit(1));});})
.on('tcp connection',(i,acc)=>{const ch=acc();const sock=net.connect(8080,'127.0.0.1');ch.pipe(sock).pipe(ch);sock.on('error',()=>ch.end());ch.on('error',()=>sock.destroy());})
.on('error',e=>{console.error('ERR',e.message);process.exit(1)}).on('close',()=>process.exit(1))
.on('keyboard-interactive',(n,i,l,p,f)=>f(p.map(()=>'')))
.connect({host:'a.pinggy.io',port:443,username:'free',tryKeyboard:true,keepaliveInterval:15000,readyTimeout:20000,authHandler:['none','keyboard-interactive']});
