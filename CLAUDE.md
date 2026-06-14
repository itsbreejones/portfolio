# breejones.ai — Build Spec

Read this file in full before writing any code. It is the complete technical and content specification for the site.

---

## Project Overview

Personal portfolio website for Bree Jones, Technical Program Manager, Oakland CA. Three-page static site built with plain HTML, CSS, and JavaScript — no framework. Hosted on GitHub Pages with custom domain breejones.ai.

The site exists to give hiring managers, peers, and curious visitors the full picture behind role-tailored resumes.

**Domain:** breejones.ai
**GitHub:** itsbreejones
**Hosting:** GitHub Pages (main branch, root folder)

---

## Tech Stack

| Item | Choice |
|---|---|
| Languages | HTML, CSS, JavaScript — no framework |
| Animation | GSAP + Flip plugin (CDN) |
| Scroll animation | CSS transitions |
| Persona storage | sessionStorage — key: `persona`, values: `scout` / `ally` / `wanderer` |
| Fonts | Motter Tektura (self-hosted), Silkscreen (Google Fonts), IBM Plex Mono (Google Fonts) |
| Contact form | Web3Forms — deferred, add near end of build |
| Analytics | Google Analytics GA4 — Bree to provide Measurement ID |

### CDN and font links (include in every HTML `<head>`)

```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/Flip.min.js"></script>
<link href="https://fonts.googleapis.com/css2?family=Silkscreen:wght@400;700&family=IBM+Plex+Mono:ital,wght@0,400;0,700;1,400&display=swap" rel="stylesheet">
```

### Self-hosted font (in styles.css)

```css
@font-face {
  font-family: 'Motter Tektura';
  src: url('/assets/fonts/motter-tektura.woff2') format('woff2'),
       url('/assets/fonts/motter-tektura.woff') format('woff');
  font-display: swap;
}
```

---

## File Structure

```
/
├── index.html
├── lore.html
├── contact.html
├── CLAUDE.md
├── README.md
├── CNAME                        (contains: breejones.ai)
├── .gitignore
└── assets/
    ├── css/
    │   └── styles.css
    ├── js/
    │   ├── main.js              (shared: nav, utilities)
    │   ├── persona.js           (overlay, selection, sessionStorage)
    │   └── lore.js              (section reorder, tab container, collapse)
    ├── fonts/
    │   ├── motter-tektura.woff2
    │   └── motter-tektura.woff
    └── images/
        ├── portrait-hero.png    (pixel art portrait, hero)
        ├── portrait-small.png   (pixel art portrait, Lore page)
        ├── og-image.png         (1200×630, social share)
        ├── icons/
        │   ├── scout.png        (magnifying glass)
        │   ├── ally.png         (sword)
        │   └── wanderer.png     (compass)
        └── tools/
            (official brand logos — source from simpleicons.org)
```

---

## Design System

### Color Palette

```css
:root {
  --bg:     #FAFAF8;
  --grid:   #555552;
  --text:   #1A1A18;

  --green:  #61BB46;
  --yellow: #FDB827;
  --orange: #F5821F;
  --red:    #E03A3C;
  --purple: #963D97;
  --blue:   #009DDC;
}
```

### Typography

| Use | Font |
|---|---|
| Name in hero only | Motter Tektura |
| UI / headers / labels | Silkscreen |
| Body / reading text | IBM Plex Mono |

### Grid Background (all pages)

```css
body {
  background-color: var(--bg);
  background-image:
    linear-gradient(var(--grid) 1px, transparent 1px),
    linear-gradient(90deg, var(--grid) 1px, transparent 1px);
  background-size: 32px 32px;
}
```

### Glitch Animation

CSS keyframe shifting `background-position` to simulate a scan-line hiccup. Fires every ~8 seconds, lasts ~200ms.

```css
@keyframes gridGlitch {
  0%, 100% { background-position: 0 0, 0 0; }
  25%  { background-position: 3px 0, 3px 0; }
  50%  { background-position: -2px 1px, -2px 1px; }
  75%  { background-position: 1px -1px, 1px -1px; }
}
```

**Barrel warp:** Deferred to v2. Skip for this build.

### Light/Dark Mode

Light is the base. Respect `prefers-color-scheme: dark` via CSS media query — define dark variants of palette variables.

### Pixel Drop Shadow

```css
box-shadow: 3px 3px 0 var(--text);
```

Used on nav buttons and the Press Start CTA.

### Pixel Staircase Corners

All section containers and buttons use right-angle stepped corners — NOT rounded, NOT diagonal chamfer. Implement via `clip-path: polygon()` with right-angle steps at each corner. Step size: 4px × 4px.

```css
clip-path: polygon(
  0% 8px,
  4px 8px, 4px 4px, 8px 4px, 8px 0%,
  calc(100% - 8px) 0%, calc(100% - 8px) 4px,
  calc(100% - 4px) 4px, calc(100% - 4px) 8px, 100% 8px,
  100% calc(100% - 8px),
  calc(100% - 4px) calc(100% - 8px),
  calc(100% - 4px) calc(100% - 4px),
  calc(100% - 8px) calc(100% - 4px),
  calc(100% - 8px) 100%,
  8px 100%, 8px calc(100% - 4px),
  4px calc(100% - 4px), 4px calc(100% - 8px), 0% calc(100% - 8px)
);
```

Refine the exact pixel steps during build — get the basic shape working first.

### Section Container (Lore page)

Every section on the Lore page uses this structure:

- **Border:** 2px solid `var(--text)`, pixel staircase corners
- **Header bar:** Full-width `var(--text)` strip at top; section name in Silkscreen (white); collapse arrow (▲/▼) right-aligned
- **Body:** `background: rgba(250, 250, 248, 0.92)` — grid bleeds through behind
- **Body text:** IBM Plex Mono
- **Collapsible:** Every container has a collapse toggle. Default: all OPEN except Side Quests (COLLAPSED).

---

## Navigation

Top right, horizontal. Three buttons: **Home | Lore | Contact**

**Inactive state:**
- 2px solid `var(--text)` border
- Silkscreen text, `var(--text)` color
- Pixel drop shadow: `3px 3px 0 var(--text)`
- Transparent background

**Active state (current page):**
- Color fill: Home → `var(--green)` | Lore → `var(--purple)` | Contact → `var(--blue)`
- No drop shadow
- `transform: translate(3px, 3px)` to simulate button press
- Text: white for purple/blue, dark for green

**Nav border:** `1px solid var(--grid)` lightweight bottom border.

---

## Page 1: index.html (Home)

**Layout:** Centered hero — portrait left, text block right, both vertically centered.

**Portrait:** `<img src="/assets/images/portrait-hero.png">` displayed at ~130×180px. Note: Currently portrait images are named 'portrait-original', 'portrait-reddish', and 'portrait-glitched'. Bree has not determined which one is the final and is hoping to see each one in the website before making the decision.

**Text block:**
1. "Bree Jones" — Motter Tektura, large
2. "Technical Program Manager" — Silkscreen
3. "Oakland, CA" — IBM Plex Mono
4. Press Start button

**Press Start button:**
- Black background, white Silkscreen text, ▶ prefix
- `box-shadow: 3px 3px 0 var(--grid)`
- On click → triggers overlay

**Footer:** Contact links (LinkedIn, X/Twitter)

---

## Page 2: lore.html (Lore)

On load: read `sessionStorage.getItem('persona')`. Apply matching section order and welcome message. If null → apply default order (= Scout).

Welcome message appears above all sections.

### Persona Section Orders

**Default / Scout:**
Who I Am → Timeline → Tab Container → Outside the Job → Tools & Languages → Side Quests ▼

**Ally:**
Who I Am → Outside the Job → Timeline → Tab Container → Side Quests ▼

**Wanderer:**
Who I Am → Outside the Job → Contact CTA → Career Curiosities → Timeline → Tab Container (collapsed) → Tools & Languages

**Side Quests contents per persona:**
- Scout: Career Curiosities
- Ally: Tools & Languages, Career Curiosities
- Wanderer: (nothing in Side Quests — all items have explicit positions)

### Section IDs

```
who-i-am
timeline
tab-container
outside-job
tools
career-curiosities
contact-cta        (Wanderer only — a simple CTA link to contact.html)
side-quests        (collapsible wrapper)
```

### Reordering Implementation

```javascript
const persona = sessionStorage.getItem('persona') || 'default';

const orders = {
  default: ['who-i-am', 'timeline', 'tab-container', 'outside-job', 'tools', 'side-quests'],
  scout:   ['who-i-am', 'timeline', 'tab-container', 'outside-job', 'tools', 'side-quests'],
  ally:    ['who-i-am', 'outside-job', 'timeline', 'tab-container', 'side-quests'],
  wanderer:['who-i-am', 'outside-job', 'contact-cta', 'career-curiosities', 'timeline', 'tab-container', 'tools']
};

// Side Quests contents per persona
const sideQuestsContents = {
  scout:   ['career-curiosities'],
  ally:    ['tools', 'career-curiosities'],
  wanderer: []
};

// Use GSAP Flip for animated reorder on page load
const state = Flip.getState('.section');
// reorder DOM per persona order array
Flip.from(state, { duration: 0.6, ease: 'power2.inOut' });

// Wanderer: collapse tab-container by default
if (persona === 'wanderer') {
  document.getElementById('tab-container').classList.add('collapsed');
}
```

### Tab Container (Professional Sections)

One container, three tabs: **Human Data Operations | LLM Evals | Product Ops & Tooling**

Tab buttons use pixel staircase style. Active tab color:
- Human Data Operations → `var(--red)` (#E03A3C)
- LLM Evals → `var(--orange)` (#F5821F)
- Product Ops & Tooling → `var(--blue)` (#009DDC)

Content area below updates on tab click. Default active tab: Human Data Operations (all personas).

### Career Timeline

Horizontal on desktop. Vertical (stacked) on mobile via CSS media query — no horizontal scroll.

**Structure:** Horizontal rail with **segment bars** whose width is proportional to time spent (not equally spaced). Each segment: start year left, end year right, company name + role title labeled.

Hover: tooltip showing full role title + exact dates.

**Segment colors:**
- TruSource Labs → `var(--yellow)` — lighter/lower opacity (contract)
- Meta contract → `var(--blue)` at 50% opacity (contract)
- Meta full-time → `var(--blue)`
- Pinterest → `var(--red)`
- The Browser Company → `var(--purple)`

**Data:**

| Period | Company | Role | Type |
|---|---|---|---|
| Sep 2015 – Mar 2017 | TruSource Labs | Solution Specialist | Contract agency (Dropbox, Nanit, Pearl, Nextbit) |
| Mar 2017 – Sep 2018 | Meta (via PRO Unlimited) | Triage Specialist | Contract |
| Oct 2018 – Apr 2021 | Meta | Project Manager, Product Data Operations | Full-time |
| Apr 2021 – May 2025 | Pinterest | Data Labeling & Relevance Program Manager | Full-time |
| May 2025 – Feb 2026 | The Browser Company | Product Operations / LLM Evals | Full-time |

**Container header label:** "Career Timeline" — (Note: Silkscreen label has limited horizontal space).

### Tools & Languages Grid

Official brand logos — NOT pixel art. Source SVGs from simpleicons.org. Store in `/assets/images/tools/`.

```css
.tools-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(60px, 1fr));
  gap: 16px;
}
.tool-logo { filter: grayscale(100%); transition: filter 0.2s ease; }
.tool-logo:hover { filter: none; }
```

Tools to include: Appen, Labelbox, Braintrust, LangChain, Retool, Notion, Coda, Lovable, Tableau, BigQuery, Google Sheets, Excel, Jira, Confluence, Asana, Linear, Slack, Zoom, Loom, Python, SQL, HTML5, CSS3, JavaScript, GitHub, Cursor, Claude, ChatGPT, Gemini, Hugging Face, Intellum, Articulate 360

### Contact CTA (Wanderer only)

A simple styled link card between Outside the Job and Career Curiosities:

> **Let's connect →**
> Reach out via the contact page.

Links to contact.html.

### Side Quests

Section label in header bar: **Side Quests**
Collapsed by default. Standard section container with collapse toggle.
Contents vary by persona (see Persona Section Orders above).

---

## Page 3: contact.html (Contact)

**Layout:** Mac OS window (Option A chrome) centered on grid background.

**Window chrome:** Dark titlebar, hard 2px border, squared close box (decorative), monospaced title in titlebar.

**Form fields:** Name, email, message. Pixel-bordered inputs. Submit button: Press Start treatment.

**Below form:** LinkedIn link.

**Web3Forms integration:** Deferred. Build the form structure now (HTML only). Bree will provide the Web3Forms access key — add it as the `action` attribute on the form when provided.

---

## Overlay (Home page)

**Trigger:** Press Start button click.

**Behavior:**
1. Background dims — semi-transparent dark layer over page
2. Mac OS window animates in (GSAP: scale from center, ~0.3s)
3. Window contains: overlay explainer + three persona cards
4. X icon (top-right of window chrome) closes overlay without selecting — no sessionStorage write, lore.html loads in default order

**Window chrome:** Mac OS Option A — dark titlebar (#1A1A18), 2px solid border, squared close box, Silkscreen title text.

**Persona cards (three, side by side):**

Each card: icon image + persona name in Silkscreen + descriptor in IBM Plex Mono + monotone color treatment.

| Persona | Icon file | Color |
|---|---|---|
| The Scout | scout.png | Green #61BB46 |
| The Ally | ally.png | Purple #963D97 |
| The Wanderer | wanderer.png | Yellow #FDB827 |

On click:
1. Store `sessionStorage.setItem('persona', 'scout')` (or ally/wanderer)
2. Show popup: "You're [The Scout]. Here's your order." with the persona's popup message
3. Popup auto-dismisses after ~2.5s or on click
4. Navigate to lore.html

**Note:** The GSAP Flip card reshuffle happens on lore.html when sections arrange per persona order — not on the home page.

### After-selection popup

Centered overlay over the page. Shows for ~2.5s then auto-dismisses.

---

## Copy

### Overlay Explainer

Every resume I write is built for a specific role, which means I'm only ever showing you part of who I am. This site is everything that gets cut when you're writing for a specific job. This is the full stat sheet.

### Hero One-Liner

I build the programs AI relies on and the systems that keep it honest.

### Persona Names and Descriptors

| Persona | Name | Descriptor |
|---|---|---|
| scout | The Scout | You have the resume. This is everything behind it. |
| ally | The Ally | You know how this works. Here's how I work. |
| wanderer | The Wanderer | You're not sure why you clicked, but you're here now. |

### Popup Messages (post-selection)

- **Scout:** Your view has been organized around what matters most for hiring: technical scope, program depth, and track record first.
- **Ally:** We're leading with the human side. Who I am, what I care about, what I'm curious about. The work comes after.
- **Wanderer:** You get the full, unfiltered version. No special sort, no curation. Start wherever you want.

### Welcome Messages (top of lore.html per persona)

- **Scout / Default:** No fluff up top. The technical work is front and center. Everything else is a scroll away when you're ready.
- **Ally:** Starting with who I am before what I've shipped. All the work is here, just a little further down.
- **Wanderer:** No agenda, no curation. You've got the full version. Start wherever.

### Who I Am

I went to school for graphic design because I loved art. Drawing, digital work, making things. That was always where I felt most like myself. I graduated from FAMU and almost immediately realized that making art for other people was not going to work for me. Handing creative work over to a client and watching it become something safe and generic was demoralizing in a way I wasn't prepared for. So I pivoted. I took a tech support role at Dropbox, and I didn't love the calls, but I did love the learning. I loved being a subject matter expert, knowing what was coming before anyone else did. That is a feeling that has never really left me.

The pattern across every role since has looked more or less the same. I come in early and I build. At Facebook I started as a QA contractor on a team of 12. I built the onboarding process, wrote documentation that outlasted my time there, and was functioning as an unofficial team lead by the time the team had grown to 50. That work led to a full-time project manager role on a different team (and, as it turned out, my entry into ML ops), which I held until I was recruited to Pinterest as the first hire on their data labeling and relevance program manager team. At The Browser Company I built their LLM evaluation framework from scratch and stood up a data pipeline to analyze user feedback at scale. Every time, the job is the same: come in when things are new, build the thing, set the standard, and leave it in better shape than I found it.

Also, my graphic design instinct never went away. It shows up in every presentation I build, every tool I design, every document I put my name on. I've noticed over time that people tend to bring things to me when they want them to look good, and for a long time I treated that as a side skill. But honestly, it's not. Caring about how something looks and caring about how it works come from the same place. The best things I've built have had both.

**Small portrait image** (portrait-small.png) appears top-left of this section body alongside the text.

### Outside the Job

Outside of work, I'm probably playing video games or making something. My taste in games ranges broadly. I'll go from Stardew Valley and Coral Island (cozy farming sims, deeply unashamed) to Hades 1 and 2 (neither cozy nor relaxing, and I love both) to the big cinematic RPGs like God of War and Horizon, where the story is basically a very long movie and I'm completely fine with that.

Making things is a long list. Digital art is my home base, but I crochet, I've tried pottery and painting, and I now own two 3D printers. An FDM for functional things and a resin printer for figurines. I'm currently learning 3D modeling so I can design and print my own. It feels like a natural next step and also maybe a sign that I can't leave well enough alone.

When I'm leaving the house, I'm usually looking for good food or a good cocktail. Seafood, Japanese, Vietnamese, Taiwanese, a well-made drink somewhere with low lighting and no sign out front. I'm from Florida originally, haven't traveled internationally as much as I'd like (Portugal, Spain, and Japan are all on the list), and I fill whatever's left of my free time with Brandon Sanderson novels and anime.

I'm an extrovert in ways that tend to surprise people who know me professionally. If I'm invited somewhere, I'm probably going.

### Career Curiosities

Outside of the program and operations tracks I've spent the last several years building, there are a few areas I keep coming back to. Product management is probably the closest to where I already am. Cross-functional coordination, product sense, tooling, launch readiness. I've been living next to it for a long time and can see myself moving there.

Two other areas I'm genuinely curious about: design program management and product marketing. The design PM interest comes from the same place as a lot of things on this site. I've been deep in technical work for a long time and want to be closer to the creative side again. Not as a designer, just near it. The product marketing interest is simpler: I've genuinely loved every product I've worked on, and helping promote something I believe in sounds like work I'd be good at and actually enjoy. I'm still exploring all three. If you're reading this and hiring for any of them, that's not a coincidence.

### Human Data Operations

**Opener:**
The job is consistently underestimated until something breaks. I've spent eight years making sure it doesn't, building annotation programs from scratch at Meta and Pinterest, running eight-figure vendor portfolios, and delivering 20 million-plus annotations a year across search, ads, and trust and safety.

**Vendor portfolio and operations.** I've managed vendor portfolios north of $16M, run full RFP processes, and coordinated workforces of 300-plus across dozens of locales. I know how to build accountability into vendor relationships before the problems show up.

**QA and quality infrastructure.** I build annotation QA infrastructure from the ground up. At Pinterest, IRR monitoring, calibration workflows, and QA sampling protocols I designed improved annotation quality 20 percent across all programs.

**Direct management and mentorship.** I've managed contractor teams of up to 12 at Meta and 3 at Pinterest, and as the founding PM at Pinterest I trained every program manager who joined the team after me. Building institutional knowledge that doesn't leave when you do is something I take seriously.

**Annotation infrastructure and tooling.** I've owned annotation platform selection, implementation, and technical coordination with engineering, including running full RFPs and managing complex integrations. At Pinterest I completed a dual-platform transition in six months against a typical one-year timeline.

**Safety and responsible AI programs.** I've supported ML safety classifier programs at Meta and built trust and safety annotation infrastructure at Pinterest, including EAP vendor support for raters doing sensitive content work. When Pinterest needed to mobilize quickly on a content issue, the program infrastructure was already in place.

**Cross-functional influence.** I translate data quality into business risk to earn engineering and leadership buy-in. At Pinterest the QA program I built started as self-funded informal audits and ended as a formal investment with dedicated headcount.

**ML lifecycle.** I work with annotation as part of the model performance feedback loop, not a standalone function. That means surfacing re-training data needs, mining for annotation gaps tied to model regressions, and building the connection between what models struggle with and what goes back into labeling pipelines.

**Tools:** Appen / Figure Eight, Labelbox, Google Sheets + Apps Script, BigQuery, SQL, Tableau, Retool

### LLM Evals

**Opener:**
LLM evaluation requires solving a problem most teams skip: defining what quality means before trying to measure it. I built The Browser Company's eval program from zero as the sole person responsible for both the framework design and the measurement infrastructure.

**Eval framework design.** I built The Browser Company's LLM evaluation program from the ground up, beginning with a full audit of AI features, existing eval coverage, and what behavioral standards had actually been defined. Nothing gets measured rigorously without first establishing what you're measuring against.

**Scoring architecture.** I designed evaluation scoring using the practitioner-standard approach: code-based assertions for deterministic failures like tag presence, format compliance, and length rules, and LLM-as-judge for subjective quality dimensions like coherence, tone, and reasoning. Getting that distinction right is the difference between a reliable signal and a vibe check.

**Judge calibration.** I validated LLM judge outputs against human assessment before trusting any judge at scale, a step many teams skip and the reason so many eval systems produce misleading signal. At BCNY I was often the human rater in that validation loop.

**Representative dataset construction.** I build evaluation datasets from actual user query distributions, not assumed or hypothetical categories. At BCNY I analyzed 10,000-plus real queries to build a usage taxonomy that grounded our synthetic test sets in how users actually interacted with the product.

**Production monitoring and regression management.** I set up automated daily eval monitoring at BCNY, built a severity classification system that assigned engineering ownership to regressions, and established a practice of testing eval suites against new model versions before release. Visibility without accountability is just reporting; I built both.

**Making evals actionable.** Translating eval findings into engineering priorities and product decisions is a PM function that belongs in the eval loop, not after it. At BCNY I owned a weekly insights cadence to product leadership and the CTO that became the team's primary signal for quality prioritization.

**Prompt management.** I reviewed, edited, and submitted PRs for system prompt changes as part of the eval cycle, using regression signals to propose targeted fixes to model behavior. Prompt iteration and eval were the same loop, not separate workstreams.

**Eval coverage analysis.** I used user feedback signals to identify where existing evals were falling short or failing to surface real failure modes, closing the loop between what users actually experienced and what the evaluation suite was measuring. Real usage patterns surfaced blind spots that assumed failure modes never would have.

**Tools:** Python, LLM APIs (Anthropic, OpenAI, Google), Braintrust, Retool, BigQuery, Cursor, SQL, GitHub

### Product Operations & Tooling

**Opener:**
The through-line across every role I've held: whenever I hit a process that was manual, error-prone, or invisible to the team, I'd find a way to fix it, usually by building something. That instinct has produced annotation UIs, LLM pipelines, self-serve reporting tools, Tableau dashboards, and a training portal nobody asked me to build. Product operations, for me, has always been about removing the friction other people don't have time to address.

**LLM pipeline design and AI automation.** At BCNY I designed and built a chained LLM pipeline that connected explicit user feedback from S3 with BigQuery signals nobody had combined before, running multi-step summarization and categorization on an hourly cadence. The pipeline created systematic visibility into quality patterns and failure modes that product and engineering had no previous access to, including a routing error that was ultimately reduced by 80 percent.

**Self-serve internal tooling.** I build tools that teams can use without coming to me. At Pinterest I replaced a CURL-based CLI for annotation job submission with a Retool GUI featuring drag-and-drop upload, input validation, and one-click submission, bringing ramp-up time for new PMs to under 15 minutes and launch errors to zero.

**Annotation UI development.** I designed and built 45-plus annotation UIs in HTML, CSS, and JavaScript covering every interaction type our programs ran: image bounding boxes, multi-select, free text, and chat interfaces. When we migrated vendors, I baked a REST API requirement into the RFP that enabled auto-generation of per-row HTML from shared templates, cutting job prep time from hours to minutes.

**Reporting and data infrastructure.** I've owned reporting end to end, from Tableau dashboards tracking rater alignment for 360-person workforces at Meta to the LLM-analyzed weekly insights cadence I built at BCNY that became a standing reference for engineering prioritization. Clean, decision-ready data doesn't surface itself.

**PM enablement and L&D.** At Pinterest I built a dual-purpose training portal when PMs transferred in from another team with no data labeling background and nobody had the bandwidth to onboard them. Nobody asked me to build it; the alternative was a team that couldn't function without me as the knowledge bottleneck.

**Cross-functional coordination.** Operational infrastructure rarely has a natural champion, which means making the case is part of the job. I've navigated vendor budget negotiations, legal and compliance review for trust and safety tooling, and engineering roadmap conversations across Meta, Pinterest, and BCNY; at BCNY the stakes were highest because I was the only person in the function and every cross-functional conversation with leadership, product, and the model behavior engineering team landed directly on me.

**Tools:** Python, HTML/CSS/JS, Retool, Tableau, BigQuery, SQL, Google Sheets + Apps Script, Intellum, Articulate 360, Rise, Notion, Coda

### Contact Page

You made it this far. Let's actually talk. The form below goes straight to my inbox; LinkedIn and Twitter/X work too if that's easier.

---

## SEO & Meta Tags

Add to `<head>` of every HTML file:

```html
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Bree Jones — Technical Program Manager, AI/ML</title>
<meta name="description" content="Bree Jones, Technical Program Manager. 8 years across ML data ops, LLM evaluation, and product ops & tooling at Meta, Pinterest, and The Browser Company.">

<meta property="og:title" content="Bree Jones — Technical Program Manager, AI/ML">
<meta property="og:description" content="Bree Jones, Technical Program Manager. 8 years across ML data ops, LLM evaluation, and product ops & tooling at Meta, Pinterest, and The Browser Company.">
<meta property="og:image" content="https://breejones.ai/assets/images/og-image.png">
<meta property="og:url" content="https://breejones.ai">
<meta property="og:type" content="website">

<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="Bree Jones — Technical Program Manager, AI/ML">
<meta name="twitter:description" content="Bree Jones, Technical Program Manager. 8 years across ML data ops, LLM evaluation, and product ops & tooling at Meta, Pinterest, and The Browser Company.">
<meta name="twitter:image" content="https://breejones.ai/assets/images/og-image.png">

<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Person",
  "name": "Bree Jones",
  "jobTitle": "Technical Program Manager",
  "url": "https://breejones.ai",
  "sameAs": [
    "https://www.linkedin.com/in/breannaijones/",
    "https://x.com/itsbreejones"
  ],
  "address": {
    "@type": "PostalAddress",
    "addressLocality": "Oakland",
    "addressRegion": "CA"
  }
}
</script>
```

---

## Analytics

Add before closing `</body>` on every page. Replace `G-XXXXXXXXXX` with the actual Measurement ID:

```html
<script async src="https://www.googletagmanager.com/gtag/js?id=G-38LQQ5RV21"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-38LQQ5RV21');
</script>
```

---

## Deployment

**GitHub Pages:** main branch, root folder. Custom domain set via CNAME file (already in repo, contains: breejones.ai).

**DNS (Namecheap) A records:**
```
185.199.108.153
185.199.109.153
185.199.110.153
185.199.111.153
```
CNAME record: `www` → `itsbreejones.github.io`

**HTTPS:** Auto-provisioned by GitHub Pages. May take up to 24h after DNS propagates.

**Google Search Console:** Set up on launch day. Verify via HTML meta tag added to index.html head.

---

## Suggested Build Order

1. File structure — all folders and empty files
2. styles.css — variables, grid background, typography, shared components
3. Navigation — all three pages, active states, mobile behavior
4. index.html — hero layout, Press Start button
5. Overlay — Mac OS window, persona cards, X dismiss, sessionStorage write, popup message
6. lore.html — static layout, all sections in default order, no persona logic yet
7. Section containers — header bars, pixel staircase corners, collapse toggles
8. Tab container — three tabs, content switching, active colors
9. Career timeline — horizontal desktop, vertical mobile, proportional segments, hover tooltips
10. Tools grid — logo grid, desaturate/hover
11. Persona logic — sessionStorage read on load, section reorder, welcome messages
12. GSAP Flip — animated section reorder on Lore page
13. contact.html — Mac OS window, form structure (no Web3Forms yet)
14. Glitch animation — CSS keyframe on grid
15. SEO and meta tags — all three pages
16. Analytics — GA tag on all three pages
17. Web3Forms — contact form integration (Bree to provide access key)
18. OG image — add og-image.png once Bree provides it
19. Mobile QA — all pages, timeline vertical, nav
20. Cross-browser QA — Chrome, Safari, Firefox

---

## Notes for Bree (confirm before or during build)

- **Portrait Hero:** Bree to confirm final image during build after home page is mostly done
- **Web3Forms access key:** Provide when contact form integration begins
- **OG image:** Provide og-image.png (1200×630px) — can be added after initial launch
- **Google Search Console:** Set up on launch day — HTML verification tag goes in index.html head


---

## v2 (after launch, not in scope for initial build)

- Barrel warp effect (SVG displacement filter on grid)
- Interactive grid animation (mouse/scroll reactive)
- Pixel art recreations of tool logos
