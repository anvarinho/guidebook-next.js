import {test} from 'node:test';
import assert from 'node:assert/strict';
import {collectionQuery,contentCheck} from '../src/app/admin/lib/metrics';

test('field checks distinguish editorial text, imagery, translations and unknown shapes',()=>{
  const place={name:{en:'Lake',ru:'Озеро'},title:{en:'A lake',ru:'Озеро'},description:{en:'Guide',ru:'Описание'},images:['lake.jpg']};
  assert.deepEqual(contentCheck(place,'places'),{text:true,image:true,ready:true});
  assert.equal(contentCheck(place,'places','ru').text,true);assert.equal(contentCheck(place,'places','fr').text,false);
  assert.equal(contentCheck({...place,description:{en:'  '}},'places').ready,false);
  assert.equal(contentCheck({title:'Tour',description:'Guide',images:[]},'tours').ready,false);
  assert.equal(contentCheck({title:'Tour',description:'Guide',images:['a.jpg']},'tours','ru').text,false);
  assert.equal(contentCheck({title:{en:'Story'},paragraphs:[]},'articles').text,false);
  assert.equal(contentCheck({title:{en:'Story'},paragraphs:[{text:{en:'Text'},image:'a.jpg'},null]},'articles').text,false);
});
test('URL query values are allowlisted and pagination cannot inject Mongo operators',()=>{
  const query=collectionQuery({page:'-5',sort:'$where',state:'$ne',lang:'__proto__',q:['bad']},'places');
  assert.deepEqual(query,{q:'',page:1,sort:'newest',state:'all',lang:'en'});
  assert.equal(collectionQuery({state:'active-admin',sort:'name',page:'2'},'users').state,'active-admin');
});
