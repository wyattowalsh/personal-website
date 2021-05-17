const mediumToMarkdown = require('medium-to-markdown');
 
// Enter url here
mediumToMarkdown.convertFromUrl('https://towardsdatascience.com/regularized-linear-regression-models-dcf5aa662ab9')
.then(function (markdown) {
  console.log(markdown); //=> Markdown content of medium post
});