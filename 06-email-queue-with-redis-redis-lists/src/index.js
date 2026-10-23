import express from 'express';
import Redis from 'ioredis';

const app= express();
app.use(express.json());

const redis=new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

const QUEUE_KEY='queue:emails';

app.post('/emails',async(req,res)=>{
  const job={
    to:req.body.to,
    subject:req.body.subject || "No subject",
    body:req.body.body || "No content",
    createdAt: new Date().toISOString()
  }
  // we have decided prehand that we 
  // will push from teh left and pop from the right
  await redis.lpush(QUEUE_KEY,JSON.stringify(job));
  res.json({queued:true,job});
});

app.get('/emails/process-one',async(req,res)=>{
const rawJob = await redis.rpop(QUEUE_KEY);
if(!rawJob)
{
    return res.json ({message:'No jobs in the queue'});
}
const job=JSON.parse(rawJob);
// assuming we simulate the sending of the email

res.json({message:'email sent',job}) ;
})

app.listen(3000,()=>{
console.log('server is running on port 3000')
});