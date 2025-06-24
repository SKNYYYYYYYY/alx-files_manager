import { createClient } from 'redis';

let status = false;
const client = createClient()
client.on('connect', () => {
  console.log('1',status)
  status = true
   console.log('2',status)
  })
client.on('error', (err) => {status = false; console.log('bad', err)})
client.connect()
console.log('3', status)