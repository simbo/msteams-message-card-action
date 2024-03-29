import { endGroup, getInput, info, InputOptions, startGroup } from '@actions/core';
import { createMessageCardPayload, OptionsButton, PayloadOptions, sendMessageCard } from 'msteams-message-cards';
import { parse as parseYaml } from 'yaml';

export async function action() {
  const inputOptions: InputOptions = { trimWhitespace: true };
  const webhookURL = getInput('webhook', { ...inputOptions, required: true });
  const title = getInput('title', inputOptions);
  const message = getInput('message', inputOptions);
  const color = getInput('color', inputOptions);

  const buttons: OptionsButton[] = getInput('buttons', inputOptions)
    .split('\n')
    .reduce((btns, line) => {
      line = line.trim();
      const index = line.search(/https?:\/\/.+/);
      if (line.length > 0 && index > 0) {
        const label = line.slice(0, index).trim();
        const url = line.slice(index).trim();
        if (label.length > 0 && url.length > 0) {
          btns.push({ label, url });
        }
      }
      return btns;
    }, [] as OptionsButton[]);

  const sections = parseYaml(getInput('sections', inputOptions));

  const payloadOptions: PayloadOptions = {
    buttons,
    sections: Array.isArray(sections) ? sections : []
  };

  if (typeof title === 'string' && title.length > 0) {
    payloadOptions.title = title;
  }

  if (typeof color === 'string' && color.length > 0) {
    payloadOptions.color = color;
  }

  if (typeof message === 'string' && message.length > 0) {
    payloadOptions.text = message;
  }

  const payload = createMessageCardPayload(payloadOptions);

  startGroup('Payload to send');
  info(JSON.stringify(payload, undefined, 2));
  endGroup();

  await sendMessageCard({ webhookURL, payload });
  info('\n✅ Success!');
}
