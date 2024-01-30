import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { Telegraf } from 'telegraf';
import TOKEN from './token.mjs';

console.log('\n\x1b[32mStarted!\x1b[37m');

const __dirname = dirname(fileURLToPath(import.meta.url));
const pathToFile = join(__dirname, 'log.txt');
const bot = new Telegraf(TOKEN);
let data = {};

const loadData = () => {
  const stream = fs.createReadStream(pathToFile);
  
  stream.on('data', (chunk) => {
    data = JSON.parse(chunk);
    console.log('\n\x1b[35mRead data from log.txt\x1b[37m');
    console.log('data=', data, '\n');
  });
  
  stream.on('error', () => {
    console.log('\n\x1b[31mData read error! Check log.txt\x1b[37m');
  });
};

console.log('data=', Object.keys(data).length)
if (Object.keys(data).length === 0) loadData();

bot.start((ctx) => {
  const userName = ctx.message.from.first_name;

  /[а-яА-ЯЁё]/.test(userName)
    ? ctx.reply(`Привет, ${userName}! Напиши мне что-нибудь, посмотрим, что с этим можно сделать`)
    : ctx.reply(`Hello, ${userName}! Write me something, let's see what we can do with it`);
});

bot.on('message', (ctx) => {
  const userName = ctx.message.from.first_name;
  const message = ctx.update.message.text;
  const clientID = ctx.message.from.id;

  if (!data[clientID]) {
    data[clientID] = {
      limit: 3,
      respect: false,
    }
  }  

  if (!data[clientID].respect && message.trim() === 'F') {
    data[clientID].respect = true;
    data[clientID].log = new Date();
    
    ctx.reply(`Only don't tell me you haven't been innocent. It insults my intelligence!`);
  } else {
    if (!data[clientID].respect) {
      if (data[clientID].limit > 0) {
        data[clientID].limit--;
        /[а-яА-ЯЁё]/.test(message)
          ? ctx.reply(`Ты пишешь "${message}", но делаешь это без уважения. Попробуй ещё раз!`)
          : ctx.reply(`You write "${message}", but you do it without respect. Try again!`);
      } else {
        /[а-яА-ЯЁё]/.test(message)
          ? ctx.reply(`Ты не предлагаешь @szczuczynszczyna 500$. О, ${userName}, ты даже не жмёшь F, чтобы выразить уважение!`)
          : ctx.reply(`You're not offering @szczuczynszczyna 500$. Oh, ${userName}, you didn't even press F to pay respects!`);
      }
    } else {
      /[а-яА-ЯЁё]/.test(message)
          ? ctx.reply(`Ты написал предложение, от которого я не смог отказаться. Чтобы не чувствовать себя должным, я тоже напишу тебе предложение "${message}"`)
          : ctx.reply(`Never tell anybody outside the family, that you wrote "${message}"`);
    }
  }

  console.log('clientID =', clientID);
  console.log(data[clientID]);
});

bot.launch();

process.once('SIGINT', () => {
  bot.stop('SIGINT');

  const stream = fs.createWriteStream(pathToFile);
  try {
    stream.write(JSON.stringify(data));
    console.log('\n\x1b[32mSaved to log.txt\x1b[37m');  
  } catch {
    console.log('\n\x1b[31mSave error!\x1b[37m');
  }
  stream.end();

  console.log('\n\x1b[32mFinished!');
});
process.once('SIGTERM', () => bot.stop('SIGTERM'));
// https://t.me/str_repeater_bot