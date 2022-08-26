# simbo/msteams-message-card-action

A simple and lightning-fast GitHub action to send notifications as message cards
to an MS Teams webhook by using the [actionable message card JSON format](https://docs.microsoft.com/en-us/outlook/actionable-messages/message-card-reference).

It does not add any custom design. That's all up to you.

You can add buttons by using simple strings with labels followed by URLs (see
[Options](#options)).  
I decided for this simple format to define buttons because this way you can
easily set buttons using workflow variables which can also be invalid and
omitted on purpose.

## Usage

Add `simbo/msteams-message-card-action@v1` to your workflow.

### Simple Example

```yml
jobs:
  notify:
    runs-on: ubuntu-latest
    steps:
      - name: 📣 Send teams notification
        uses: simbo/msteams-message-card-action@v1
        with:
          webhook: ${{ secrets.TEAMS_WEBHOOK }}
          message: Hello world!
```

…will produce a message card like this:

![simple example output](./example-simple.png)

### Advanced Example

```yml
jobs:
  notify:
    runs-on: ubuntu-latest
    steps:
      - name: 🪣 Set env vars
        run: |
          echo "MY_SPECIAL_BUTTON=Cool https://this-is-so.cool/" >> $GITHUB_ENV

      - name: 📣 Send teams notification
        uses: simbo/msteams-message-card-action@v1
        env:
          MY_AWESOME_BUTTON: Awesome http://this-is-so.awesome/
        with:
          webhook: ${{ secrets.TEAMS_WEBHOOK }}
          title: Hello world!
          message: <p>This is my <strong>awesome message!</strong></p>
          color: ff69b4
          buttons: |
            Click here! https://whatever.com/foo/
            Or here… https://somewhere.com/bar/
            This button will not be shown as it has no target URL
            https://no-label-no-button.com/
            ${{ env.MY_SPECIAL_BUTTON }}
            ${{ env.MY_AWESOME_BUTTON }}
```

…will produce a message card like this:

![advanced example output](./example-advanced.png)

## Options

| Option    | Required | Default | Description                                                                                                                                                                                                              |
| --------- | -------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `webhook` | yes      | `''`    | The MS Teams webhook URL to send the notification to. Obviously required.                                                                                                                                                |
| `title`   | no       | `''`    | The title of your card. Will be omitted by MS Teams if left empty.                                                                                                                                                       |
| `message` | no       | `''`    | The message content. Supports HTML up to a certain level (interpreted by MS Teams). Can also be empty.                                                                                                                   |
| `color`   | no       | `''`    | The border color of the message card. Will fallback to MS Teams' default color if empty.                                                                                                                                 |
| `buttons` | no       | `''`    | A multiline string where every line defines an action button for the message card. Each line should contain a label text followed by a HTTP(S) URL. If the line does not match this format, it will be silently omitted. |

## License and Author

[MIT &copy; Simon Lepel](http://simbo.mit-license.org/)
