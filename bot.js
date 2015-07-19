var Slack = require('slack-client');
var token = 'xoxb-7893486887-cu3zofP0I5Ns5a33nCg9Tohx';
var slack = new Slack(token, true, true);

var makeMention = function(userId) {
  return '<@' + userId + '>';
};

var isDirect = function(userId, messageText) {
  var userTag = makeMention(userId);
  return messageText &&
    messageText.length >= userTag.length &&
    messageText.substr(0, userTag.length) === userTag;
};

var getOnlineHumansForChannel = function(channel) {
  if (!channel) return [];

  return (channel.members || [])
    .map(function(id) { return slack.users[id]; })
    .filter(function(u) { return !!u && !u.is_bot && u.presence === 'active'; });
};

slack.on('open', function () {
  var channels = Object.keys(slack.channels)
    .map(function (k) { return slack.channels[k]; })
    .filter(function (c) { return c.is_member; })
    .map(function (c) { return c.name; });

  var groups = Object.keys(slack.groups)
    .map(function (k) { return slack.groups[k]; })
    .filter(function (g) { return g.is_open && !g.is_archived; })
    .map(function (g) { return g.name; });

  console.log('Welcome to Slack. You are ' + slack.self.name + ' of ' + slack.team.name);

  if (channels.length > 0) {
    console.log('You are in: ' + channels.join(', '));
  }

  else {
    console.log('You are not in any channels.');
  }

  if (groups.length > 0) {
    console.log('As well as: ' + groups.join(', '));
  }
});

slack.on('message', function(message) {
  var channel = slack.getChannelGroupOrDMByID(message.channel);
  var user = slack.getUserByID(message.user);
  var generator = "http://www.eddins.net/steve/chess/ChessImager/ChessImager.php?fen=";

  if (message.type === 'message' && isDirect(slack.self.id, message.text)) {
    var trimmedMessage = message.text.substr(makeMention(slack.self.id).length + 2).trim();
    // + 2 is required to account for the colon and space before the FEN

    var msg = generator += trimmedMessage;

    channel.send(msg);
  }
});

slack.login();