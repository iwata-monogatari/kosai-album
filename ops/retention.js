export default {async scheduled(event,env){
 const db=env.DB,now=Math.floor(Date.now()/1000);
 const {results}=await db.prepare("SELECT id,original_key FROM submissions WHERE deadline<=? AND state IN ('declined','rejected','saving','purging') LIMIT 100").bind(now).all();
 for(const r of results){const claimed=await db.prepare("UPDATE submissions SET state='purging' WHERE id=? AND deadline<=? AND state IN ('declined','rejected','saving','purging') RETURNING id").bind(r.id,now).first();if(!claimed)continue;
 if(r.original_key)await env.ORIGINALS.delete(r.original_key);
 const es=await db.prepare('SELECT id,metadata FROM editions WHERE sid=?').bind(r.id).all();
 for(const e of es.results)await env.EDITIONS.delete(JSON.parse(e.metadata).sizes.map(w=>e.id+'/'+w));
 await db.batch([db.prepare('DELETE FROM private_contacts WHERE sid=?').bind(r.id),db.prepare('DELETE FROM editions WHERE sid=?').bind(r.id),db.prepare("UPDATE submissions SET state='purged',original_key=NULL,fingerprint='',request_key=id,deadline=NULL,rights='unknown' WHERE id=?").bind(r.id),db.prepare("INSERT INTO audit_events(sid,event,actor,at) VALUES(?,'purged','retention',?)").bind(r.id,now)])}
 await db.prepare("INSERT OR REPLACE INTO maintenance VALUES('retention',?)").bind(now).run()
}};
