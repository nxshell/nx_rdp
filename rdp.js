const os = require('os');
const path = require('path');
const EventEmitter = require('events');
const { spawn } = require('child_process');


let _rdp_exe = 'wfreerdp.exe';
if (os.type() == 'Linux') {
    _rdp_exe = 'lfreerdp';
} else if (os.type() == 'Darwin') {
    _rdp_exe = 'mfreerdp';
}

const rdp_exe = path.join(__dirname, _rdp_exe);

class Rdp extends EventEmitter {
    constructor(host, user, pwd) {
        super();
        this.host = host;
        this.user = user;
        this.pwd = pwd;
        this.proc = null;
    }

    connect() {
        this.proc = spawn(
            rdp_exe, 
            ['/v:' + this.host, '/u:' + this.user, '/p:' + this.pwd, '/dynamic-resolution',  '/floatbar:sticky:on,default:visible,show:always'],
            {
                shell: true,
            }
        );
        
        this.proc.stdout.on('data', (data) => {
            console.log(`stdout: ${data}`);
        });
        
        this.proc.stderr.on('data', (data) => {
            console.error(`stderr: ${data}`);
        });
        
        this.proc.on('close', (code) => {
            if (code != 0) {
                this.emit('error', `connect error code ${code}`);
            } else {
                this.emit("close");
            }
        });
    }
}

function test() {
    const rdp = new Rdp('10.0.0.1', 'test', 'test');
    rdp.on('error', (msg) => {
        console.log("rdp error ", msg);
    })
    rdp.on("close", () => {
        console.log("rdp close");
    })
    rdp.connect();
}


module.exports = Rdp;