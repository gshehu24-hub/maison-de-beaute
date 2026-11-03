# Maison de Beauté

A responsive beauty e-commerce website built with HTML5, CSS3 and vanilla JavaScript (no frameworks).

## How to run
Open `index.html` in a browser. No installation needed.

## Files
- `index.html` – page structure
- `style.css` – design (CSS variables, Flexbox, Grid)
- `script.js` – all functionality, split into numbered sections
- `images/` – add your own images (see names below)

## Images
Add these files to an `images/` folder: `hero.jpg`, `perfume.jpg`, `perfume2.jpg`, `makeup.jpg`, `makeup2.jpg`, `makeup3.jpg`, `skincare.jpg`, `skincare2.jpg`, `haircare.jpg`, `haircare2.jpg`, `bodycare.jpg`, `accessories.jpg`, `accessories2.jpg`.
Until a file exists, a pink placeholder with the product name is shown automatically.

## Where each JavaScript concept is used (script.js)
| Concept | Section |
|---|---|
| Classes, objects, arrays | 1 Data |
| `let`, `const`, `null` | 2 State |
| localStorage, JSON, try/catch/finally | 4 Storage |
| DOM, loops, `map`, `filter`, `sort`, `find` | 5 Rendering |
| Operators, `push`, increment | 6 Cart |
| Wishlist + localStorage | 7 Wishlist |
| Modal, classList | 8 Modal & Panels |
| String methods, validation | 9 Form |
| Cookies, sessionStorage | 10 Cookies & Session |
| `var`, data types, BigInt, nested objects | 11 Concept demos (see browser console) |
| `addEventListener`, `onclick`, `onmouseover`, `onload` | 12 Events |

## Notes
- Cookies may not save when opening the file directly (`file://`) in some browsers. They work when the site is served from a web server (for example the VS Code "Live Server" extension).
- No backend or real payments (midterm scope).
