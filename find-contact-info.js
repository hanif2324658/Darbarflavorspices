const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');

const footerStart = html.indexOf('<footer');
const footerEnd = html.indexOf('</footer>');

if (footerStart !== -1 && footerEnd !== -1) {
  console.log(html.substring(footerStart, footerEnd + 9));
} else {
  console.log('No footer found in index.html');
}
