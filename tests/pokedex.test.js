import {test} from 'node:test';
import assert from 'node:assert/strict';
import {selectPokemon,metric,readSaved,request} from '../assets/js/poke-api.js';
const list=[{id:1,name:'bulbasaur'},{id:25,name:'pikachu'},{id:152,name:'chikorita'}];
test('search supports names, numbers and hash-prefixed numbers',()=>{assert.equal(selectPokemon(list,{query:' PIKA '})[0].id,25);assert.equal(selectPokemon(list,{query:'#25'})[0].id,25);assert.equal(selectPokemon(list,{query:'missing'}).length,0);});
test('generation, type and favorites intersect; sorting does not mutate source',()=>{assert.deepEqual(selectPokemon(list,{generation:'1',typeIds:new Set([25,152]),favorites:new Set([25])}).map(p=>p.id),[25]);assert.equal(selectPokemon(list,{sort:'desc'})[0].id,152);assert.equal(list[0].id,1);assert.equal(selectPokemon(list,{sort:'name'})[1].name,'chikorita');});
test('height and weight convert decimeters/hectograms correctly',()=>{assert.equal(metric(17),'1,7');assert.equal(metric(905),'90,5');});
test('corrupt or restricted storage falls back safely',()=>{assert.deepEqual(readSaved({getItem:()=>'{broken'},'key',[]),[]);assert.equal(readSaved({getItem:()=>{throw Error();}},'key','dark'),'dark');});
test('requests deduplicate and failed requests can retry',async()=>{const original=globalThis.fetch;let calls=0;globalThis.fetch=async()=>{calls++;return {ok:calls>1,status:503,json:async()=>({id:25})};};try{await assert.rejects(request('test-retry'));const [a,b]=await Promise.all([request('test-retry'),request('test-retry')]);assert.equal(calls,2);assert.equal(a,b);}finally{globalThis.fetch=original;}});
