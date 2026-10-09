const fs=require('fs');let css=fs.readFileSync('original-ui.css','utf8');css=css.replace(/button-hover\.png/g,'button.png').replace(/filter:brightness\([^)]*\)/g,'filter:none');css+=`\n/* Hover never resizes or filters bitmap artwork. */
body button,body button:hover,body button:focus,body button:active{transform:none!important;scale:none!important;translate:none!important;rotate:none!important;transition:none!important;animation:none!important}
body button:not(:disabled),body button:hover:not(:disabled){filter:none!important}
body button img,body button:hover img,body button:focus img,body button:active img{transform:none!important;scale:none!important;filter:none!important;transition:none!important;animation:none!important}
body button:hover:not(:disabled){outline:1px solid #efd386;outline-offset:1px}
`;fs.writeFileSync('original-ui.css',css);let f=fs.readFileSync('flow.js','utf8').replace('c.edictTotal??=4','c.edictTotal??=Math.min(27,4+c.completed.length*4)');fs.writeFileSync('flow.js',f);
