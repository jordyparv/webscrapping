const axios = require('axios');
const cheerio = require('cheerio');
const path = require('path');
const express = require('express');
const fs = require('fs');

const app = express();
app.use(express.static('public'));
async function getTop() {
  const { data } = await axios.get('https://www.imdb.com/chart/top/');
  const $ = cheerio.load(data);
  const bestMovies = [];

  $('tr').each((_idx, el) => {
    const name = $(el).children('td.titleColumn').children('a').text();
    const link = $(el).children('td.posterColumn').children('a');
    const posterUrl = link.children('img').attr('src');
    const movie = { name, link: link.attr('href'), posterUrl };

    if (movie.name && movie.posterUrl) bestMovies.push(movie);
  });
  console.log(bestMovies.length / 5);
  const div = (content) =>
    `<div class='border border-white/10 rounded hover:bg-white p-1 grid place-items-center group'>${content}</div>`;
  let movies = '';
  const movie = (src, txt) =>
    `<img src="${src}"  class='rounded'/><p class='text-xs text-white text-center group-hover:text-black text-semibold'>${txt}</p>`;

  // console.log(bestMovies.slice(1, 5));
  bestMovies.forEach(
    (item) => (movies += div(movie(item.posterUrl, item.name)))
  );
  // console.log(movies);
  const htmlbody = (data) =>
    `<html>
        <head>
          <script src="https://cdn.tailwindcss.com"></script>
          <title></title>
        </head>
        <body class='grid grid-cols-12 h-fit gap-2 bg-[url(bg.jpg)] backdrop-blur-2xl p-1'>
        ${data}
        </body>
      <html>`;
  try {
    fs.writeFileSync('./public/index.html', htmlbody(movies));
  } catch (error) {
    console.log(error.message);
  }
}
getTop();
app.use('/static', express.static(path.join(__dirname, 'public')));
app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(5000, () => console.log('server listening on port 5000'));
