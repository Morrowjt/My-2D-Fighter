# Bad Company

A playable, original browser fighting game: four fighters, rooftop combat, a CPU opponent, and first-to-two matches. Built with Canvas and vanilla JavaScript. No build step, external assets, package downloads, accounts, or runtime JavaScript dependencies.

## Play locally

Requires **Python 3** to serve the files and **Node.js 22+** to run the tests (validated with Node 24).

```sh
npm start
```

Open `http://localhost:3000` in a modern browser. Select a fighter and opponent, choose VS CPU or Training, then press **LET’S FIGHT**. Use an HTTP server rather than opening `index.html` as a file; the game uses ES modules. The game is static and can also be hosted on any static web server.

| Input | Action |
| --- | --- |
| A / D | Move |
| W | Jump |
| S (hold) | Guard |
| J | Light attack |
| K | Heavy attack |
| L | Metered special |
| I | Free command grab |
| U | Forward dash |
| Escape | Pause / resume |

Touch controls appear on small screens and devices with coarse pointers; movement and guard can be held while attacking with another finger. Landscape gives the best view. Sound is optional and starts muted. The **HITBOXES** button displays blue body boxes and yellow startup/recovery or red active attack boxes for practice.

## Fighters

- **Super Fighting Man — all-rounder:** balanced speed, cape, dependable punches, and a fast **Super Shot** projectile.
- **Grabby Guy — grappler:** more health, slower movement, stronger heavy attacks. **Rent Is Due** is a free close-range command grab that lifts and rotates the victim into a slam. **Orbital Eviction** costs 50 meter: a short step and grab, a launch carrying both fighters high above the rooftop, then a dramatic slam and extended knockdown. Both throws bypass guard; jump to evade them.
- **Witch Bitch — zoner:** lower health, a longer-reaching magical heavy, and **Hex Appeal**, a larger, slower projectile for controlling space.
- **Blitz Bastard — rushdown:** fastest movement and lights. **Blitz Breaker** costs 50 meter and advances rapidly with green afterimages. It is invulnerable during its 19-frame travel/attack portion, with vulnerable startup and 28-frame recovery. A missed dash is punishable.

## Combat

The simulation runs at a fixed 60 Hz, independently of render rate. Attacks have startup, active, and recovery phases and can hit only once. Damage is resolved by overlapping attack and body boxes during active frames, never on button press.

On a successful hit, **light → heavy → special** cancels recovery; blocked and missed attacks do not. Inputs buffer for nine simulation frames, including through hit-stop. Start close enough for the chain to reach. Meter starts at zero, builds on hits and blocks, and caps at 100. Specials cost 50; the free grab has no meter requirement.

Air lights kick downward past the fighter’s feet. Air heavies have a deeper downward hitbox, accelerate into a dive, hit harder, and cause knockdown. Both use different poses and hitboxes from ground attacks, and landing imposes recovery. Jump-ins can lead into grounded offense. Throws cannot catch airborne opponents; normal grabs cannot grab opponents already in hit-stun, while the metered sky slam can finish a confirmed combo.

Normal throws leave the attacker recovering for 26 frames and the defender knocked down for 32, a six-frame advantage. After any knockdown, the defender has 12 frames of throw-only protection: a repeated grab whiffs and can be punished with a wake-up light or escaped with a buffered jump. This protection does not stop strikes; passive guarding still loses to a properly delayed command grab. The metered sky slam retains its longer knockdown.

Guard reduces strike damage to 14% and prevents hit-confirm cancels; it does not stop throws. Hit-stop, sparks, recoil, knockback, knockdowns, combo counters, procedural sound, and modest impact shake communicate hits. Sky-slam impacts deliberately have a stronger shake. The camera pulls back to keep the aerial throw visible.

VS CPU has 99-second rounds and ends at two wins. Tied rounds award neither side a win. **RESTART** resets the entire match. Training has an inactive opponent, unlimited time, full meter, and automatically restores a defeated dummy’s health. **FIGHTERS** returns to selection.

## Validation

```sh
npm run check
npm test
```

The 21 deterministic tests exercise attack timing, one-hit behavior, whiff recovery, all four fighters’ cancel chains, buffering, guard chip damage, free grabs at zero meter, guarded throws, sky-slam heights/impact/damage/knockdown, dash invulnerability and vulnerable recovery, projectile interactions, aerial reach and diving attacks, meter costs, training behavior, movement, timer ties, first-to-two round transitions, and wake-up counterplay against repeated grabs in either player slot and at walls. No dependency installation is necessary.

Browser verification was performed with system Chromium: selection, both throws, sky-slam framing, Blitz travel, aerial attacks, keyboard pause/resume, CPU combat, rematch/round transitions, sound, and touch layouts. Tests and current game state can be inspected in the developer console through `window.badCompanyAPI`; this is a local debugging aid, not a network service.

The optional `tools/browser-smoke.cjs` repeats the browser integration assertions against a running server. It needs a separately installed `playwright-core` module (set `PLAYWRIGHT_MODULE` to its absolute path) and system Chromium (`CHROMIUM_PATH` overrides the binary). It is not a game dependency.

## Source

- `src/engine.js`: deterministic combat, collision, CPU, rounds, and move definitions.
- `src/render.js`: procedural arena, articulated characters, poses, camera, effects.
- `src/game.js`: menus, HUD, controls, fixed-step loop, and Web Audio.
- `tests/combat.test.js`: combat regression tests.

This is a compact single-player-versus-CPU prototype. It does not include online multiplayer, gamepad mapping, authored sprite sheets, or a campaign. All character art and audio are generated locally by code.
