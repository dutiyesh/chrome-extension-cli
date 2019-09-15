# Contributing to Chrome Extension CLI

Loving Chrome Extension CLI and want to get involved? Thanks.<br>
We're actively looking for folks interested in helping out. Suggestions and pull requests are highly encouraged!

## Workflow

1. Clone the project:

```sh
git clone https://github.com/dutiyesh/chrome-extension-cli.git
cd chrome-extension-cli
npm install
```

2. When working on the CLI, create a symlink in the global folder by executing this command:

```sh
npm link chrome-extension-cli
```

3. Now you can execute the CLI with command:

```sh
chrome-extension-cli my-extension
```

## Loading an extension into the browser

Once an extension is built with `npm run build` command, load it in the browser with below instructions:

1. Open **chrome://extensions**
2. Check the **Developer mode** checkbox
3. Click on the **Load unpacked extension** button
4. Select the folder **my-extension/build**

---

_Many thanks to [h5bp](https://github.com/h5bp/html5-boilerplate/blob/master/.github/CONTRIBUTING.md) and [sindresorhus](https://github.com/sindresorhus/refined-github/blob/master/contributing.md) for the inspiration with this contributing guide_
