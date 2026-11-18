import test from 'node:test'
import assert from 'node:assert/strict'
import {readFile} from 'node:fs/promises'
import vm from 'node:vm'
import React from 'react'
import renderer,{act} from 'react-test-renderer'
import { PLUGIN_VERSION } from '../lib/shared/version.js'

// The accounts page renders two states per row: the collapsed line and the menu
// opened behind "更多操作". Only the collapsed one used to be exercised, so an
// ordering mistake inside the open branch shipped as a black page. This test opens
// every menu it finds, which is the state the user actually clicked.
test('opening the account menu renders the row details instead of throwing',async t=>{
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
    {id:'a2',label:'备用',credentialsPresent:true,identity,identityCode:'',usage:{calls:1,inputTokens:4,outputTokens:2},lastUsedAt:1797400000000,loginCommand:'codebuddy login --spare'}
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
 const labelOf=node=>node.children.filter(child=>typeof child==='string').join('')
 const click=async node=>{await act(async()=>node.props.onClick())}

 const accountsTab=buttons().find(node=>labelOf(node)==='账号管理')
 assert.ok(accountsTab,'the accounts tab must be reachable')
 await click(accountsTab)

 const menu=buttons().find(node=>labelOf(node)==='更多操作')
 assert.ok(menu,'a non-current account keeps its actions behind one menu button')
 assert.ok(!buttons().some(node=>labelOf(node)==='移出列表'),'the menu starts collapsed')

 await click(menu)
 const text=JSON.stringify(tree.toJSON())
 assert.ok(text.includes('已登录：'),'the open branch shows the identity the CLI recorded')
 assert.ok(buttons().some(node=>labelOf(node)==='移出列表'),'the open branch reveals the removal action')
 assert.ok(buttons().some(node=>labelOf(node)==='生成官方登录命令'),'the open branch reveals the sign-in command')
 assert.ok(!text.includes('NaN'),'no figure may render as NaN')
})
