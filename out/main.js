var t=require("vscode");function d(o){return o.replace(/True/g,"true").replace(/False/g,"false").replace(/None/g,"null").replace(/(\w+)\s*:/g,'"$1":').replace(/'/g,'"').replace(/,\s*([}\]])/g,"$1").replace(/\/\/[^\n]*/g,"").replace(/\/\*[\s\S]*?\*\//g,"")}function i(o){t.window.showInformationMessage(o);let s=d(o);return t.window.showInformationMessage(s),new Promise((r,n)=>{fetch("https://jsonformatter.curiousconcept.com/process",{headers:{accept:"application/json, text/javascript, */*; q=0.01","accept-language":"en-US,en;q=0.9,fr;q=0.8,ar;q=0.7","content-type":"application/x-www-form-urlencoded; charset=UTF-8","sec-ch-ua":'"Google Chrome";v="117", "Not;A=Brand";v="8", "Chromium";v="117"',"sec-ch-ua-mobile":"?0","sec-ch-ua-platform":'"Linux"',"sec-fetch-dest":"empty","sec-fetch-mode":"cors","sec-fetch-site":"same-origin","sec-gpc":"1","x-requested-with":"XMLHttpRequest"},referrer:"https://jsonformatter.curiousconcept.com/",referrerPolicy:"strict-origin-when-cross-origin",body:`data=${encodeURIComponent(s)}&jsontemplate=1&jsonspec=4&jsonfix=on&autoprocess=&version=2`,method:"POST",mode:"cors",credentials:"include"}).then(e=>e.json()).then(e=>{if(e.result&&e.result.data){let a=JSON.stringify(JSON.parse(e.result.data.join("")),null,4);t.window.showInformationMessage("JSON formatted successfully"),r(a)}else t.window.showErrorMessage("Failed to format JSON"),n()}).catch(e=>{t.window.showErrorMessage("Failed to format JSON"),n(e)})})}function f(o){let s=t.commands.registerCommand("extension.formatJson",async function(){let r=t.window.activeTextEditor;if(r){let n=r.document,e=r.selection,a=n.getText(e);if(a.length===0){t.window.showInformationMessage("No JSON selected.");return}try{let c=await i(a);r.edit(l=>{l.replace(e,c)})}catch{t.window.showErrorMessage("Failed to format JSON")}}});o.subscriptions.push(s)}function u(){}module.exports={activate:f,deactivate:u,formatJson:i};
