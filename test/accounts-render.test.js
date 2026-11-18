import test from 'node:test'
import assert from 'node:assert/strict'
import {readFile} from 'node:fs/promises'
import vm from 'node:vm'
import React from 'react'
import renderer,{act} from 'react-test-renderer'
import { PLUGIN_VERSION } from '../lib/shared/version.js'

// The accounts page used to hide a row's details behind a "更多操作" menu, and only
// the collapsed line was ever exercised -- so an ordering mistake inside the opened
// branch shipped as a black page. The menu is gone, but the lesson stands: this test
// renders the real page and drives the row controls the user actually clicks.
test('every account row renders its own details and actions',async t=>{
 let api,page,props;const dictionaries={},registrations=[]
 const snapshot={status:'ready',writable:true,revision:1,value:{cliPath:'',configDir:'cn-profile',model:'',effort:'',timeoutMs:180000}}
 const listeners=new Set()
 const form={getSnapshot:()=>snapshot,subscribe:f=>{listeners.add(f);return()=>listeners.delete(f)},async mutate(ops,revision){snapshot.revision=revision+1}}
 const identity={present:true,nickname:'刘文杰',uid:'b2090505-ad4e-4390-9c8a-0e77a28bc86f',domain:'www.codebuddy.cn',expiresAt:1797403852804,encrypted:false,code:''}
 const status={
  status:'ready',pluginVersion:PLUGIN_VERSION,timeoutMs:180000,activeCalls:0,cliRuntime:'native',
  cliCheck:{state:'available',version:'9.8.7'},setup:{state:'idle'},
  usage:{calls:2,inputTokens:10,outputTokens:1},
  catalog:{state:'ready',fetchedAt:1,models:[]},
  rotation:'quota',
  accounts:{
   supported:true,selectedId:'a1',storageError:'',
   minCliVersion:'2.174.0',verifiedCliVersions:['2.174.0','2.177.0'],
   defaultLogin:identity,
   accounts:[
    {id:'a1',label:'工作',credentialsPresent:true,identity,identityCode:'',usage:{calls:1,inputTokens:4,outputTokens:2},lastUsedAt:1797400000000,loginCommand:'codebuddy login --work'},
    {id:'a2',label:'备用',credentialsPresent:true,identity,identityCode:'',usage:{calls:1,inputTokens:4,outputTokens:2},lastUsedAt:1797400000000,loginCommand:'codebuddy login --spare'},
    {id:'a3',label:'未登录',credentialsPresent:false,identity:{present:false},identityCode:'CLI_CREDENTIAL_MISSING',usage:{calls:0,inputTokens:0,outputTokens:0},loginCommand:'codebuddy login --fresh'}
   ]
  },
  logs:{entries:1,failures:0,samples:0,captureArmed:false}
 }
 const sandbox=vm.createContext({React,TextEncoder,TextDecoder,AbortController,setInterval:()=>1,clearInterval(){},clearTimeout(){},setTimeout:()=>1,navigator:{clipboard:{writeText:async()=>{}}},Blob,
  URL:{createObjectURL:()=> 'blob:fixture',revokeObjectURL(){}},document:{body:{appendChild(){}},getElementById:()=>null,querySelector:()=>null,createElement(){return{click(){},remove(){}}}},
  window:{__ModuleLoader__:{load(m){api=m.factory(()=>React)}}},
  fetch:async()=>({ok:true,json:async()=>structuredClone(status)})
 })
 vm.runInContext(await readFile(new URL('../lib/client.js',import.meta.url),'utf8'),sandbox)
 const ctx={effect:fn=>fn(),locale:{register:(ns,v)=>{dictionaries[ns]=v;return()=>{}},bind:ns=>key=>dictionaries[ns].zh[key]},configForms:{get:()=>form,whileServed:(ns,fn)=>fn()},layout:{selectPanel(){},panelInfo:{getSnapshot:()=>({activePanelId:null})}},slots:{inject:(name,fn)=>fn(),register(options,component){registrations.push(options);if(options.name==='main'){page=component;props=options.inject()}return()=>{}}}}
 api.apply(ctx)
 let tree;await act(async()=>{tree=renderer.create(React.createElement(page,props))});t.after(()=>act(()=>tree.unmount()))

 const buttons=()=>tree.root.findAllByType('button')
 // Both region pages mount; only one is visible, so row assertions read that one.
 const panel=()=>tree.root.findAll(node=>node.props&&node.props['data-settings-group']==='accounts'&&!node.props.hidden)[0]
 const rowButtons=()=>panel().findAllByType('button')
 const rowText=()=>JSON.stringify(panel().findAll(()=>true).flatMap(node=>node.children||[]).filter(child=>typeof child==='string'))
 const labelOf=node=>node.children.filter(child=>typeof child==='string').join('')
 const click=async node=>{await act(async()=>node.props.onClick())}

 const accountsTab=buttons().find(node=>labelOf(node)==='账号管理')
 assert.ok(accountsTab,'the accounts tab must be reachable')
 await click(accountsTab)

 // A signed-in account states who it is and what it used, with no sign-in command.
 const text=rowText()
 assert.ok(text.includes('已登录：'),'a signed-in row shows the identity the CLI recorded')
 assert.ok(text.includes('本进程记录'),'a signed-in row shows its own usage')
 assert.ok(!rowButtons().some(node=>labelOf(node)==='更多操作'),'the row menu is gone')
 assert.equal(rowButtons().filter(node=>labelOf(node)==='刷新额度').length,3,'every row refreshes its own credits')
 assert.equal(rowButtons().filter(node=>labelOf(node)==='授权读取额度').length,1,'the current card asks for authorisation while nothing is read yet')
 assert.equal(rowButtons().filter(node=>labelOf(node)==='移出列表').length,2,'only the two added accounts can remove themselves')
 assert.equal(rowButtons().filter(node=>labelOf(node)==='使用此账号').length,3,'the default sign-in row and both accounts can be selected')
 assert.ok(!text.includes('codebuddy login --spare'),'a signed-in row does not render its command')

 // The unsigned account is the one that gets the repair path.
 const prepare=rowButtons().find(node=>labelOf(node)==='生成官方登录命令')
 assert.ok(prepare,'an unsigned row offers the sign-in command')
 await click(prepare)
 assert.ok(rowText().includes('codebuddy login --fresh'),'the generated command appears once asked for')

 // Removal stays a two-step action, now on the row itself.
 await click(rowButtons().find(node=>labelOf(node)==='移出列表'))
 assert.ok(rowButtons().some(node=>labelOf(node)==='确认移出（保留本地登录数据）'),'removal asks once')
 await click(rowButtons().find(node=>labelOf(node)==='取消移出'))
 assert.ok(!rowButtons().some(node=>labelOf(node)==='确认移出（保留本地登录数据）'),'and can be backed out of')
 assert.ok(!JSON.stringify(tree.toJSON()).includes('NaN'),'no figure may render as NaN')
})
