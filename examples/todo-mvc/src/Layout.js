'use strict';
var React = require('react');

// Handle the HTML rendering on the server
var Html = React.createClass({
render: function() {
  return (
      <html>
        <head>
          <title>{ this.props.title }</title>
          <link rel="icon" type="image/png" href="/images/favicon.png" />
          <link rel="stylesheet" type="text/css" href="/css/style.css" />
        </head>
        <body dangerouslySetInnerHTML={{__html: this.props.markup}}></body>
        <script src="/js/main.js"></script>
      </html>
  );
}
});

module.exports = Html;