// Empty Pages Router stub.
// Next 15.5.x auto-generates a `pages/_error.js` shim that calls useContext
// against legacy AmpStateContext/HeadManagerContext during /404 static
// prerender, which crashes with React 19. Providing this minimal override
// prevents the auto-generated shim from running at build time. App Router
// uses `app/error.tsx` and `app/not-found.tsx` for actual error UI.
export default function Error() {
  return null
}
