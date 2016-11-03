# [siloz.io](http://www.siloz.io/)

siloz.io is a private code playground in the browser.

Your source code is saved in the URL and never reaches our servers.

Use HTML, CSS and JavaScript, along with processors like CoffeeScript, Babel/ES2015, Less, Stylus or Markdown.


## Short URLs

siloz.io can generate shorter urls, at a privacy cost.

When a short url is generated, the current url that includes the source code is saved on the server.

Also, to be able to update the source code of the same short url, a unique token is generated and saved on the server and the client.

We run our own open-source url shortener ([prajina](https://github.com/ghinda/prajina)).


## Development

```
npm install
npm run dev
http://localhost:9000/
```

## License

siloz.io is licensed under the GNU Affero General Public License.
