const express = require("express")
const router = express.Router();
const got = require('got');
const prompt = `Artist: Megadeth\n\nLyrics:\n`;

router.get("/stories", (req, res) => {

(async () => {
  const url = 'https://api.openai.com/v1/engines/davinci/completions';
  const params = {
    "prompt": prompt,
    "max_tokens": 160,
    "temperature": 0.7,
    "frequency_penalty": 0.5
  };
  const headers = {
    'Authorization': `Bearer ${process.env.OPENAI_SECRET_KEY}`,
  };

  try {
    const response = await got.post(url, { json: params, headers: headers }).json();
    output = `${prompt}${response.choices[0].text}`;
    console.log(output);
    res.send(output)
  } catch (err) {
    console.log(err);
  }
})();

});

module.exports = router;