// parse every window.X = <literal> in the argo data files
const fs=require('fs'),{parseAt}=require('./lit');
module.exports=function(){
  const out={};
  for(const f of fs.readdirSync(__dirname+'/../raw/argo')){
    const s=fs.readFileSync(__dirname+'/../raw/argo/'+f,'utf8');
    for(const m of s.matchAll(/window\.([\w$]+)\s*=\s*/g)){
      try{ out[m[1]]=parseAt(s,m.index+m[0].length).value; }catch(e){ out[m[1]]='ERR '+e.message }
    }
  }
  return out;
};
if(require.main===module){
  const d=module.exports();
  for(const [k,v] of Object.entries(d)){
    const keys=v&&typeof v==='object'?Object.keys(v):[];
    console.log(`\n## ${k} ${Array.isArray(v)?'arr':'obj'} n=${keys.length}`);
    const first=Array.isArray(v)?v[0]:v&&v[keys[0]];
    console.log(Array.isArray(v)?'':'keys: '+keys.slice(0,12).join(' | '));
    console.log(JSON.stringify(first)?.slice(0,450));
  }
}
