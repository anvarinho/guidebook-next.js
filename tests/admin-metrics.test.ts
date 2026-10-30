import {test} from 'node:test';
import assert from 'node:assert/strict';
import {DAY,RESPONSE_CLASSES,changePercent,collectionQuery,contentCheck,dayKey,paddedDays,periodRange,responseRows} from '../src/app/admin/lib/metrics';

test('UTC periods validate leap days and use inclusive calendar dates with exclusive next-day bounds',()=>{
  const now=new Date('2024-03-02T00:30:00+06:00');
  const period=periodRange({from:'2024-02-29',to:'2024-02-29'},now);
  assert.equal(period.from.toISOString(),'2024-02-29T00:00:00.000Z');
  assert.equal(period.end.toISOString(),'2024-03-01T00:00:00.000Z');
  assert.equal(period.previousStart.toISOString(),'2024-02-28T00:00:00.000Z');
  assert.equal(period.days,1);assert.equal(period.complete,true);
  assert.equal(periodRange({from:'2024-03-01',to:'2024-03-01'},now).complete,false);
});
test('invalid dates, inverted/oversized/future ranges fall back honestly to seven completed UTC days',()=>{
  const now=new Date('2026-10-30T10:00:00Z');
  for(const query of [{from:'2026-02-30',to:'2026-03-01'},{from:'2026-10-30',to:'2026-10-29'},{from:'2026-01-01',to:'2026-10-29'},{from:'2026-10-31',to:'2026-10-31'},{from:['2026-10-01'],to:'2026-10-01'}]) {
    const range=periodRange(query,now);assert.equal(range.invalid,true);assert.equal(range.fromKey,'2026-10-23');assert.equal(range.toKey,'2026-10-29');
  }
});
test('comparisons never invent a percentage with a zero or invalid baseline',()=>{
  assert.equal(changePercent(100,0),null);assert.equal(changePercent(0,0),null);
  assert.equal(changePercent(0,10),-100);assert.equal(changePercent(110,100),10);assert.equal(changePercent(Infinity,10),null);
});
test('counter windows count responses, including all error classes, while legacy records count once',()=>{
  const record={schemaVersion:2,responseClasses:RESPONSE_CLASSES,routes:[{route:'/api/places',responses:[1,10,2,3,4,5,6,7]}]};
  assert.deepEqual(responseRows(record),[{route:'/api/places',responses:38,errors:25}]);
  assert.deepEqual(responseRows({route:'/api/articles',statusCode:503}),[{route:'/api/articles',responses:1,errors:1}]);
  assert.deepEqual(responseRows({...record,schemaVersion:99,statusCode:200}),[]);
  assert.deepEqual(responseRows({...record,responseClasses:['wrong']}),[]);
  for(const counts of [[1,-1,0,0,0,0,0,0],[1,1.5,0,0,0,0,0,0],[1],['1',0,0,0,0,0,0,0]]) assert.deepEqual(responseRows({...record,routes:[{route:'/api/places',responses:counts}]}),[]);
  assert.equal(responseRows({route:'/private?email=secret@example.test',statusCode:200})[0].route,'Other API routes');
});
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
  assert.equal(collectionQuery({sort:'views'},'reports').sort,'newest');
});
test('daily chart values pad gaps explicitly and do not shift dates across timezones',()=>{
  const range=periodRange({from:'2024-02-28',to:'2024-03-01'},new Date('2024-03-05T00:00:00Z'));
  const days=paddedDays(range,[{day:'2024-02-29',responses:20,errors:2}]);
  assert.equal(days.length,3);assert.deepEqual(days.map(d=>d.responses),[0,20,0]);assert.equal(dayKey(new Date(range.from.getTime()+DAY)),'2024-02-29');
});
