import { getInput, setFailed, InputOptions, info, startGroup, endGroup } from '@actions/core';
import { parse as parseYaml } from 'yaml';
import fetch from 'node-fetch';

interface Button {
  name: string;
  uri: string;
}

function readableJson(json: any): string {
  return JSON.stringify(json, null, 2);
}

async function action(): Promise<void> {
  const inputOptions: InputOptions = { trimWhitespace: true };
  const webhook = getInput('webhook', { ...inputOptions, required: true });
  const title = getInput('title', inputOptions);
  const message = getInput('message', inputOptions);
  const color = getInput('color', inputOptions);

  const buttons: Button[] = getInput('buttons', inputOptions)
    .split('\n')
    .reduce((btns, line) => {
      line = line.trim();
      let i: number;
      if (!!line.length && !!(i = line.search(/https?:\/\/.+/))) {
        const name = line.substring(0, i).trim();
        const uri = line.substring(i).trim();
        if (!!name.length && !!uri.length) {
          btns.push({ name, uri });
        }
      }
      return btns;
    }, [] as Button[]);

  const sections = parseYaml(getInput('sections', inputOptions));

  const payload = {
    '@context': 'https://schema.org/extensions',
    '@type': 'MessageCard',
    themeColor: color,
    title: title,
    text: message,
    potentialAction: buttons.map(({ name, uri }) => ({ '@type': 'OpenUri', name, targets: [{ os: 'default', uri }] })),
    sections: Array.isArray(sections) ? sections : []
  };

  startGroup('Payload to send');
  info(readableJson(payload));
  endGroup();

  const response = await fetch(webhook, {
    method: 'post',
    body: JSON.stringify(payload),
    headers: { 'Content-Type': 'application/json' }
  });
  if (response.ok) {
    info('\n✅ Success!');
  } else {
    const json = await response.json();
    setFailed(`Sending failed:\nResponse Status ${response.status} ${response.statusText}\n${readableJson(json)}`);
  }
}

action().catch(error => setFailed(error));
