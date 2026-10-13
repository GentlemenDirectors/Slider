# Image comparison slider

A standalone, dependency-free slider for two or three aligned images. Includes mouse, touch and keyboard controls; a clean iframe page; and a preview studio. No build or installation needed. The included landscape illustrations are original placeholder artwork, not product renders or images from Filmic Plus.

## 1. Add your renders

Put your images in `images/`. Use the same pixel dimensions, camera position and crop for every variation. WebP or JPG is a good choice for opaque renders. Prefer opaque images: transparent pixels otherwise reveal the viewer background. Keep files reasonably small for mobile visitors.

Edit `config.js`. For two images:

```js
window.COMPARISON = {
  aspectRatio: "16 / 9",
  images: [
    { src: "images/before.webp", label: "Before", alt: "Scene before processing" },
    { src: "images/after.webp", label: "After", alt: "Scene after processing" }
  ]
};
```

For three images, add a third entry. Two independent dividers show three vertical regions; the images stay aligned and do not stretch when a divider moves. Dividers stop before crossing each other. For square renders use `aspectRatio: "1 / 1"`; for 3:2 use `"3 / 2"`. Images use contain sizing to preserve the whole frame.

Open `index.html` for a preview. Its upload controls only test local files; they do not save or upload them. `embed.html` is the clean version to embed, without the studio controls. It uses config.js. Studio preview uploads and the two/three selector do not change the clean embed.

## 2. Publish on GitHub Pages

1. Create a GitHub repository, for example `image-compare`. A public repository is the simplest setup; its files and uploaded images will be public.
2. Upload the CONTENTS of this folder to the repository root. `index.html`, `embed.html`, and `config.js` must be at the top level, with `images/` beside them. Include the CSS and all JS files too.
3. Commit the files to `main`.
4. Open repository **Settings → Pages**. Under **Build and deployment**, choose **Deploy from a branch**, then **main** and **/(root)**. Save.
5. Wait for GitHub to show the live address. Open `https://YOUR-USERNAME.github.io/image-compare/embed.html` and test it before embedding.

Use exact filename capitalization; GitHub hosting is case sensitive. GitHub repository URLs and raw file URLs are not the published webpage URL.

Official instructions: https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site

## 3. Add to Superhive

Superhive's documentation currently lists `iframe`, `div`, `style`, `src`, `width`, `height`, `title`, and `frameborder` as accepted HTML. Script tags are not listed, so host the complete slider elsewhere and embed that page. The reference Filmic Plus listing likewise links an external page through an iframe.

In your product description's HTML/code view, paste the following. Replace the username and repository name with your published address:

```html
<div style="position:relative;width:100%;height:0;padding-bottom:56.25%;overflow:hidden;border-radius:16px;">
  <iframe
    src="https://YOUR-USERNAME.github.io/image-compare/embed.html"
    title="Compare image variations"
    width="100%"
    height="100%"
    frameborder="0"
    style="position:absolute;top:0;left:0;width:100%;height:100%;border:0;">
  </iframe>
</div>
```

Keep the wrapper ratio in sync with config.js: 16:9 → `56.25%`, 3:2 → `66.6667%`, 1:1 → `100%`. Formula: image height / image width × 100.

Save and check the actual product preview on desktop and phone. This is for the description/showcase content; support for an interactive iframe in the top thumbnail/media gallery has not been established. The embed has not been tested inside your seller account. If Superhive strips or blocks your specific URL, ask its support about GitHub Pages iframe hosting. A linked preview image to the hosted slider is a fallback.

Official supported HTML: https://support.superhivemarket.com/article/280-customizing-your-content

## Controls and customization

- Drag a divider, or click the image to move the nearest divider.
- Tab to a divider, then use arrow keys. Shift + arrow moves faster. Home/End moves to its allowed edge.
- On phones, drag horizontally to compare; vertical gestures can scroll the parent page.
- Change labels and image paths in `config.js`. Change appearance in `style.css`.
- For multiple comparisons, duplicate `config.js` and `embed.html`, then change the config script reference in the duplicate embed page. Give each iframe its own URL.
- No analytics, remote fonts, external libraries or image uploads are included.

## Files

`index.html` + `studio.js`: preview studio. `embed.html` + `embed.js`: showcase page. `compare.js`: reusable custom element. `config.js`: published images. `style.css`: appearance. `images/`: demo assets and your renders. `.nojekyll`: static GitHub Pages hosting.
