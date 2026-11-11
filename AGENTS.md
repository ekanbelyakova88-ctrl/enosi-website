# ENOSI website

- Communicate with the owner in plain Russian. The live website is https://ekanbelyakova88-ctrl.github.io/enosi-website/. Offer that working link after deployment; do not rely on downloadable previews.
- ENOSI is an artisan natural-stone jewelry brand. Preserve freedom of choice, individual taste and the idea of connection. No magical, energy or healing promises. Mineral meanings are explicitly editorial associations of ENOSI.
- The hero headline is centered on desktop and mobile. Do not add decorative stars or flowers after headings.
- Use the transparent logo in `src/assets/logo-enosi-transparent.png`. Never restore the old opaque beige/brown logo rectangle. Every displayed jewelry photograph, including gallery thumbnails, must carry this transparent logo through `BrandedPhoto`.
- All 21 published bracelet angles must be generated and styled. Use only `src/assets/gallery`; never publish unprocessed originals. Local input archives and raw images are under ignored `.design-input` and are not website assets. Preserve them locally.
- Preserve the visible bead count, sequence, shapes and finishes when generating jewelry images. Amazonite is matte. Materials confirmed by the owner are in `src/data/products.js`; do not infer or invent stone types, prices, availability, pearl origin or metal composition.
- Each bracelet has a "Камни и смысл" card. Keep its names and explanations as readable HTML, with the brand logo and illustrated minerals. Content is in `src/data/stones.js`.
- Author contact: https://t.me/BeliakovaKaterina. Product links may prefill the bracelet name. Never send a message on behalf of the owner or visitor during tests.
- Test with `npm test` and build with `npm run build`. GitHub Pages publishes only when the `Publish ENOSI demo` workflow is manually dispatched. For an authorized live update, push the tested changes, dispatch the workflow, wait for success and verify the current public build and its assets before sharing the link.
- Follow the managed environment's proxy and CA trust configuration; never disable TLS checks. Competitor research may require the owner to apply pending domain additions in environment settings. Preserve existing network rules and distinguish a saved draft from applied runtime access.
