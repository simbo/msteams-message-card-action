const core = require('@actions/core');
const fetch = require('node-fetch');

try {
  const inputOptions = { trimWhitespace: true };
  const webhook = core.getInput('webhook', { ...inputOptions, required: true });
  const title = core.getInput('title', inputOptions);
  const message = core.getInput('message', inputOptions);
  const color = core.getInput('color', inputOptions);
  const buttons = core
    .getInput('buttons', inputOptions)
    .split('\n')
    .reduce((btns, line) => {
      line = line.trim();
      let i;
      if (!!line.length && !!(i = line.search(/https?:\/\/.+/))) {
        const name = line.substring(0, i).trim();
        const uri = line.substring(i).trim();
        if (!!label.length && !!url.length) {
          btns.push({ name, uri });
        }
      }
      return btns;
    }, []);

  const payload = {
    '@context': 'https://schema.org/extensions',
    '@type': 'MessageCard',
    themeColor: color,
    title: title,
    text: message,
    potentialAction: buttons.map(({ name, uri }) => ({ '@type': 'OpenUri', name, targets: [{ os: 'default', uri }] }))
  };

  core.debug(`Payload to send:\n${JSON.stringify(payload, null, 2)}`);

  fetch(webhook, {
    method: 'post',
    body: JSON.stringify(payload),
    headers: { 'Content-Type': 'application/json' }
  }).catch(err => core.setFailed(error.message));
} catch (error) {
  core.setFailed(error.message);
}
