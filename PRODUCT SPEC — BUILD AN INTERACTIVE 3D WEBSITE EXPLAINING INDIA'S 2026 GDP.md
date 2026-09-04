# PRODUCT SPEC — BUILD AN INTERACTIVE 3D WEBSITE EXPLAINING INDIA'S 2026 GDP

You are the lead product engineer and interaction designer.

Build a complete, production-ready interactive educational website explaining India's Q1 FY 2026–27 GDP debate.

I am defining the product experience, learning journey and required outcomes.

You own the implementation decisions.

The website will ultimately be hosted as a completely static site on **GitHub Pages**.

The defining visual experience is a lightweight, browser-game-style **3D low-poly village built in JavaScript/WebGL**, which changes from 2010 to 2026 as the user learns how GDP estimation and base-year revisions work.

Do NOT build this as a conventional article with decorative 3D graphics.

The 3D village is the user's mental model of the economy.

---

# PRODUCT OBJECTIVE

A normal visitor starts with:

“India says GDP grew 7.8%, but ₹86.05 lakh crore became ₹88.27 lakh crore. That's only around 2.6%. Something looks wrong.”

The visitor should finish understanding:

1. ₹86.05 and ₹88.27 belong to different GDP series.
2. The latest comparable nominal figures are ₹80.00 → ₹88.27 = 10.3%.
3. The latest comparable real figures are ₹75.46 → ₹81.36 = 7.8%.
4. GDP is statistically estimated rather than directly counted transaction-by-transaction.
5. Previous GDP estimates can legitimately change when benchmarks, data and methodology change.
6. A base-year revision updates the measuring framework because the economy itself evolves.
7. This does not mean statistical methodology is beyond scrutiny.
8. The meaningful debate is whether the revised methodology and source data are transparent, consistent and defensible.

Do not tell users what political conclusion to reach.

Teach them enough to evaluate the claim themselves.

---

# EXPERIENCE PRINCIPLE

Build this like:

A lightweight browser strategy game
+
an interactive editorial investigation
+
a data explainer.

Think:

small SimCity-like economic diorama,
not photorealistic gaming.

The site must feel:

curious,
intelligent,
playful,
trustworthy,
fast,
modern.

It must NOT feel:

like a government portal,
like an economics textbook,
like a PowerPoint,
like a corporate dashboard.

---

# THE CENTRAL 3D IDEA

Create ONE persistent fictional village:

# GDP VILLAGE

Build the village using JavaScript/WebGL.

Do not depend on a static village image for the experience.

A reference illustration may be used only as visual inspiration.

The actual browser scene should be a lightweight low-poly interpretation.

The village should look like a miniature tabletop strategy-game world viewed from a slightly elevated three-quarter/isometric perspective.

It initially contains:

🌾 farms

🏪 local shops

🪚 carpenter workshops

🏗️ construction

🚌 transport

🏫 public services

🏦 banking/services

simple houses and roads

trees and utility infrastructure

Later the SAME world develops:

🏭 furniture/manufacturing factory

📦 warehouse/godown

🚚 logistics activity

🛵 delivery/platform services

📱 newer service activity

while some older independent businesses shrink.

The visitor must visually understand that:

THE ECONOMY ITSELF CHANGED.

---

# 3D IMPLEMENTATION DIRECTION

Choose the best lightweight browser 3D implementation.

Good candidates include:

- PlayCanvas Engine / PlayCanvas React
- Three.js
- React Three Fiber
- Babylon.js if there is a strong technical reason

Preference:

PlayCanvas or Three.js / React Three Fiber.

But YOU decide.

Do not choose an engine simply because it has more features.

Choose based on:

- mobile performance
- bundle weight
- GitHub Pages compatibility
- maintainability
- React integration if useful
- easy timeline/state transitions
- support for instancing
- compressed GLB/glTF if models are needed
- ability to lazy-load the 3D experience

Document your decision briefly in README.

---

# LOW-POLY GAME STYLE

Do not attempt photorealism.

Use:

simple geometry,
low-poly buildings,
flat or lightly shaded materials,
simple roofs,
stylized trees,
recognizable vehicles,
tiny stylized people,
limited texture usage,
soft lighting.

The world should resemble:

a clean browser city-builder
or
an architectural economic diorama.

Buildings can be built procedurally from primitives where practical.

Examples:

House:
box + roof

Shop:
box + awning

Carpenter workshop:
open shed + workbench + timber

Factory:
modular industrial blocks

Warehouse:
long shed + loading bay + cartons

Field:
plane + repeated crop instances

Trees:
instanced trunk/crown meshes

Construction:
columns + bricks + scaffolding

Vehicles:
simple low-poly meshes or tiny reusable GLB models

People:
simple stylized low-poly figures or billboard sprites.

Do not spend excessive runtime or bundle size on detailed character animation.

---

# DATA-DRIVEN VILLAGE

The village should be driven by economic state rather than hardcoded as unrelated scenes.

Conceptually there should be world states such as:

2010

farms: high
carpenterWorkshops: many
localShops: many
factory: none
warehouse: none
delivery: none

2015

factory: appears
carpenterWorkshops: slightly reduced

2018

warehouse: appears
factory: expands

2022

delivery/logistics: appears
online/service economy increases

2026

factory: large
warehouse: large
delivery: significant
traditionalCarpenters: fewer
farms: still present
services: larger

Implementation details are your decision.

The important product behavior is:

changing the year changes the SAME world.

---

# AMBIENT LIFE

The village should feel alive.

Use subtle lightweight animation such as:

- crops moving slightly
- one bus travelling
- occasional auto-rickshaw
- delivery scooter
- truck approaching warehouse
- minimal people movement
- small factory loading activity

Avoid:

physics engines,
crowd simulation,
heavy particle systems,
complex skeletal animation.

This is an explainer, not a game.

---

# CAMERA

The experience is guided.

Do NOT provide unrestricted first-person or free-flight controls.

Users may have:

limited orbit,
small zoom range,
tap/click selection.

But authored storytelling controls the camera.

Examples:

When discussing agriculture:
camera eases toward fields.

When discussing carpenters:
camera frames carpenter district.

When factory appears:
camera subtly reframes.

When explaining the entire economy:
camera pulls back.

When explaining base-year recalibration:
camera becomes more top-down/analytical.

The user must never get lost.

---

# HTML VS 3D

Critical rule:

3D communicates STRUCTURE.

HTML communicates FACTS.

Use HTML/CSS for:

GDP numbers,
formulas,
labels,
explanations,
buttons,
sources,
timelines,
tables,
FAQs,
warnings,
definitions.

Do NOT render factual text as textures inside WebGL.

Where appropriate, anchor HTML callouts visually to 3D objects.

Example:

HTML label:

“🏭 Manufacturing”

floating next to the 3D factory.

---

# STORY — ACT 1: THE CLAIM

Start immediately with:

# India grew 7.8%.

Then:

## So why are people calculating 2.6%?

Show three clean numerical cards.

REAL GDP GROWTH

7.8%

NOMINAL GDP GROWTH

10.3%

APPARENT COMPARISON

≈ 2.6%

Then show:

Q1 FY 2026–27

₹88.27 lakh crore

Nominal GDP

A small thought bubble appears:

👀

“I see a problem…”

CTA:

SHOW ME

---

# ACT 2 — THE PROBLEM

Reveal:

## “Wasn't last year's GDP ₹86.05 lakh crore?”

Show:

Q1 FY 2025–26

₹86.05 lakh crore

OLD 2011–12 GDP SERIES

versus

Q1 FY 2026–27

₹88.27 lakh crore

NEW 2022–23 GDP SERIES

Let the visitor perform the calculation.

(88.27 − 86.05)
÷ 86.05
× 100

Animate:

2.58%

≈ 2.6%

Allow the visitor to genuinely arrive at this result.

Then:

🤔

“So why does the government say 7.8%?”

---

# ACT 3 — THE BIGGER SUSPICION

Reveal another fact.

The latest comparable Q1 FY 2025–26 GDP is:

# ₹80.00 lakh crore

Now deliberately allow the visitor's suspicion to surface.

## “Wait.”

₹86.05

became

₹80.00?

Then ask:

# “Did the government reduce last year's GDP just to show higher growth?”

Do not dismiss the question.

Do not say:

“No, the government is correct.”

Instead respond:

# “Before answering that, we need to understand what a GDP number actually is.”

CTA:

ENTER GDP VILLAGE

---

# ACT 4 — ENTER THE 3D VILLAGE

This should be a major transition.

The India-number interface fades back.

The low-poly village comes into view.

Camera slowly approaches.

Headline:

# GDP is not a giant cash counter.

Show:

🌾 Farms

🏪 Shops

🪚 Carpenters

🏗️ Construction

🚌 Transport

🏫 Government

The user can tap major economic activities.

---

# WHAT GDP MEASURES

Start extremely simply.

Ask:

## “How much new economic value did this village produce?”

Use a small value-chain example.

For example:

wood/material

→

carpenter

→

furniture

→

shop

Explain why intermediate goods cannot be repeatedly counted.

Then introduce:

VALUE ADDED

Do not introduce advanced national-accounting jargon yet.

---

# GDP IS ESTIMATED

Pull the camera outward.

Show many different village activities simultaneously.

Ask:

# “Can someone visit every farm, shop and worker every quarter?”

Answer:

No.

Now animate DATA SIGNALS coming from different parts of the 3D village.

Examples:

🌾 farm
→ output/yield/price information

🏭 factory
→ accounts/business/admin information

🏫 public services
→ government accounts

🏪 small business
→ sample surveys

👷 workers
→ employment information

🏗️ construction
→ material/activity indicators

🧾
→ administrative/tax information

These should flow visually toward a central HTML panel.

OBSERVED INFORMATION

+

SURVEYS

+

ADMINISTRATIVE DATA

+

INDICATORS

+

STATISTICAL METHODS

↓

GDP ESTIMATE

Large statement:

# ESTIMATED ≠ INVENTED

Explain:

GDP is an estimate built from real information about an economy too large to completely observe at once.

---

# CLICKABLE ECONOMIC SECTORS

Allow the user to select:

🌾 FARM

🏭 FACTORY

🏪 SMALL SHOP

🪚 CARPENTER

🏗️ CONSTRUCTION

🏫 GOVERNMENT

📦 WAREHOUSE

🛵 DELIVERY

When selected:

- visually highlight the object
- move camera slightly
- dim unrelated objects slightly
- open an HTML explanation card

Use broad descriptions such as:

MORE DIRECTLY OBSERVED

SURVEY-HEAVY

INDICATOR-HEAVY

Do not invent numeric confidence values.

---

# HOOK

After explaining estimation:

## “But there is another problem.”

# “What if the economy changes?”

CTA:

GO BACK TO 2010

---

# ACT 5 — TIME TRAVEL TO 2010

Transform the current world into its older state.

It must unmistakably be the SAME village.

Do not switch to a separate static illustration.

Show:

# 2010

The village should contain:

many independent carpenter workshops

farms

small shops

simple local transportation

construction

government services

NO large furniture factory

NO major warehouse

NO delivery-platform ecosystem

NO big logistics operation

Show:

ILLUSTRATIVE GDP

₹20 LAKH

Make clear:

This number is fictional and educational.

---

# EXPLAIN THE REFERENCE PICTURE

Introduce:

## “To measure an economy well, statisticians need a detailed reference picture.”

Use the metaphor:

A detailed economic photograph.

Ask visually:

What activities exist?

How important are they?

How are they measured?

What data are available?

What prices and relationships describe them?

Clarify:

This does NOT mean every person and business is individually surveyed.

---

# SIGNATURE INTERACTION — THE TIME SLIDER

Build:

2010 ━━━━━━━━━━━━━ 2026

The user drags through time.

The 3D world changes dynamically.

## 2010

Many traditional carpenters.

## 2015

🏭 A furniture factory opens.

Make it satisfying:

the building can rise,
assemble,
or fade into existence.

## 2018

📦 A warehouse/godown appears.

Truck/loading activity begins.

## 2022

🛵 Delivery/platform activity appears.

Scooters begin moving through village roads.

## 2024

More service/digital activity.

## 2026

Factory larger.

Warehouse larger.

Delivery/logistics more active.

Some traditional carpenter workshops:

close,
shrink,
or become inactive.

Agriculture still exists.

Traditional businesses still exist.

The point is not:

“Old economy disappeared.”

The point is:

# THE STRUCTURE CHANGED.

---

# VISUAL TRANSFORMATION REQUIREMENT

When the timeline moves:

do not rebuild the entire canvas.

Transition objects.

Examples:

shop opacity changes,
factory scales upward,
warehouse appears,
scooters spawn,
activity levels change,
some workshops become closed buildings.

Make the transformation feel continuous.

---

# ACT 6 — THERE WAS A MISTAKE

At 2026:

focus camera on old carpenter district.

Ask:

# “What if our statistical picture still thinks this sector is as large as before?”

Use ghost buildings.

Example:

Old estimate assumes activity corresponding to:

₹22 lakh

Updated information suggests:

₹17 lakh

Show:

₹22L
→
₹17L

Label:

ILLUSTRATIVE EXAMPLE

Very important message:

# “The village did not lose ₹5 lakh today.”

# “Our previous estimate of that past activity was too high.”

Then highlight delivery/logistics.

Old estimate:

₹5 lakh

Updated estimate:

₹6.1 lakh

Message:

Some activities may be revised DOWN.

Others may be revised UP.

The total GDP revision is the net effect.

---

# HOOK

## “So how do you fix a measuring system built around an older economy?”

CTA:

RECALIBRATE

---

# ACT 7 — THE BASE-YEAR EXPERIENCE

Use the SAME 3D village.

Do not simply show an infographic.

Overlay a subtle analytical measurement framework over the village.

Could resemble:

measurement grid,
economic nodes,
sector markers,
calibration lines,
camera focus frame.

Show:

OLD REFERENCE

2011–12

The older reference visually corresponds less well to the evolved economy.

Then let the visitor press:

# UPDATE THE FRAMEWORK

Animate recalibration.

Examples:

measurement nodes reposition,
new economic activities become included in the visual framework,
relative sector emphasis changes,
new data connections appear,
old assumptions disappear.

Then:

NEW REFERENCE

2022–23

---

# CRITICAL BASE-YEAR EXPLANATION

Say:

# “A base-year revision is not simply changing the year printed on a ruler.”

It can involve updating:

- benchmark data
- surveys
- administrative information
- industry structure
- classifications
- coverage
- price/volume measurement
- estimation methodology

The calibration animation is a metaphor.

The explanatory copy must preserve the real statistical meaning.

---

# SHOW WHAT CHANGED IN INDIA'S NEW SERIES

Use the village itself to communicate major improvements.

## SMALL BUSINESSES

Highlight:

🏪 🪚

Message:

“Fresher recurring information about unincorporated businesses and workers.”

Optional technical expansion:

ASUSE + PLFS.

---

## ADMINISTRATIVE DATA

Show additional:

🧾

data connections appearing.

---

## MULTI-ACTIVITY COMPANY

Use Furniture Ltd visually.

It owns:

🏭 factory

📦 warehouse

🏪 retail activity

First show them visually grouped under:

MANUFACTURING

Then separate:

🏭 Manufacturing

📦 Warehousing/logistics

🏪 Trade

Explain:

Improved activity-level information can represent different economic activities of the same business more accurately.

---

## PRICE / QUANTITY METHODS

Focus on factory.

Furniture leaves factory.

Wood/material enters factory.

Explain:

Output prices and input prices can change differently.

Provide optional expandable advanced explanation of:

DOUBLE DEFLATION.

Do not force normal users to understand it.

---

# DO NOT MAKE THESE CLAIMS

Never say:

“Amazon was not counted before.”

Never say:

“The informal economy was not counted.”

Never say:

“Changing base year automatically lowers GDP.”

Never imply:

one single methodological change explains the full revision.

Never imply:

GDP estimation means statisticians can choose arbitrary numbers.

---

# ACT 8 — RETURN TO THE ACTUAL INDIA DATA

The village remains subtly visible in the background.

Bring back:

Q1 FY 2025–26

Keep the quarter FIXED.

Animate the estimate changing through publication history.

29 AUGUST 2025

OLD SERIES

₹86.05 lakh crore

↓

FEBRUARY 2026

NEW 2022–23 SERIES

₹80.32 lakh crore

↓

5 JUNE 2026

₹80.44 lakh crore

↓

LATEST COMPARABLE ESTIMATE

₹80.00 lakh crore

Large statement:

# SAME QUARTER.

# DIFFERENT / UPDATED ESTIMATE.

Explain:

The economy did not travel backwards.

Our measurement of that historical quarter changed.

---

# ACT 9 — REVISIT 2.6%

Return to the original calculator.

Show:

OLD SERIES

₹86.05

versus

NEW SERIES

₹88.27

=

2.58%

Mark:

⚠ DIFFERENT SERIES

Now animate:

₹86.05

switching to

₹80.00

Then calculate:

NEW SERIES

₹80.00
→
₹88.27

=

10.34%

Display:

# 10.3%

NOMINAL GDP GROWTH

This should be the main “aha” moment.

---

# ACT 10 — WHY 7.8%?

Bring back:

🤔

“Okay, 10.3%.”

“Then why does everyone say 7.8%?”

Answer:

# PRICES.

For this section, prefer HTML/CSS over 3D if clearer.

Show:

NOMINAL GDP

₹80.00
→
₹88.27

10.3%

Then explain:

part of money-value change comes from changing prices.

Then:

REAL GDP

₹75.46
→
₹81.36

7.8%

Explain:

Real GDP estimates changes in production using a constant-price framework.

Do NOT state:

real growth = nominal growth − inflation.

---

# OPTIONAL FACTORY DEEP DIVE

Offer:

“For the curious”

Return to 3D factory.

Highlight:

OUTPUT

and

INPUTS

separately.

Explain why:

output prices
and
input prices

can behave differently.

Then introduce:

DOUBLE DEFLATION.

This must remain optional.

---

# ACT 11 — DOES REBASING SOLVE GDP FOREVER?

Return to 2026 village.

Slowly introduce faint silhouettes suggesting future economic change.

Ask:

# “Is the new system perfect forever?”

Answer:

No.

Show the cycle:

ECONOMY CHANGES

→

REFERENCE PICTURE AGES

→

BETTER DATA BECOMES AVAILABLE

→

STATISTICAL FRAMEWORK IS REVIEWED

→

PAST ESTIMATES MAY CHANGE

→

ECONOMY CHANGES AGAIN

Message:

Better measurement does not eliminate the need for future revisions.

---

# INDIA'S BASE-YEAR HISTORY

This should primarily be HTML/CSS.

No need to force 3D into this section.

Show:

Initial
— → 1948–49
First official estimates published in 1956

1
1948–49 → 1960–61
1967

2
1960–61 → 1970–71
1978

3
1970–71 → 1980–81
1988

4
1980–81 → 1993–94
1999

5
1993–94 → 1999–2000
2006

6
1999–2000 → 2004–05
2010

7
2004–05 → 2011–12
30 January 2015

8
2011–12 → 2022–23
27 February 2026

Use detailed source notes rather than pretending all historical publication conventions are equally precise.

---

# FINAL ANSWER

Bring back three cards.

## ≈2.6%

₹86.05
→
₹88.27

Mathematics:
fine.

Comparison:
not valid for official growth.

Why:

OLD SERIES
vs
NEW SERIES.

---

## 10.3%

₹80.00
→
₹88.27

Same latest series.

NOMINAL GDP GROWTH.

---

## 7.8%

₹75.46
→
₹81.36

Same constant-price framework.

REAL GDP GROWTH.

---

# FINAL PRODUCT MESSAGE

Conclude:

“2.6% is not an alternative measurement of India's 7.8% real GDP growth because it compares GDP levels from two different statistical series.”

Then say:

“The important questions are instead:

Why did individual estimates change?

Does the new series improve measurement?

Are the source data transparent?

Are the assumptions and methodology defensible?

How large are future revisions likely to be?”

Do not make a partisan conclusion.

---

# ACTUAL INDIA DATA

Treat these as official-data content, separate from fictional village data.

Q1 FY 2026–27 nominal GDP:

₹88.27 lakh crore

Comparable Q1 FY 2025–26 nominal GDP:

₹80.00 lakh crore

Nominal growth:

10.3%

Q1 FY 2026–27 real GDP:

₹81.36 lakh crore

Comparable Q1 FY 2025–26 real GDP:

₹75.46 lakh crore

Real GDP growth:

7.8%

Earlier Q1 FY 2025–26 nominal estimate:

₹86.05 lakh crore

Revision path:

₹86.05
→
₹80.32
→
₹80.44
→
₹80.00

---

# DATA SEPARATION

Maintain clear conceptual separation:

actualIndiaData

illustrativeVillageData

Anything invented for GDP Village must display:

ILLUSTRATIVE EXAMPLE

Never visually present a fictional village value as Indian statistical data.

---

# PERFORMANCE IS A PRODUCT REQUIREMENT

This will be a public website.

Treat the 3D world like a well-optimized browser game.

The initial page must render BEFORE the 3D engine finishes loading.

Lazy-load WebGL.

Prefer one persistent renderer/canvas.

Do not repeatedly destroy/recreate contexts between story sections.

Reuse geometry/materials.

Use instancing for:

trees,
crops,
houses,
boxes,
repeated objects.

If external models are used:

use lightweight GLB/glTF,
Meshopt/Draco where appropriate,
small textures.

Avoid heavy post-processing.

Avoid high-resolution texture dependency.

Avoid real-time physics unless indispensable.

Avoid expensive dynamic shadows where a cheaper visual approach works.

Reduce object density/animation on weaker mobile devices.

Limit device pixel ratio where appropriate.

Pause or reduce rendering when the scene is offscreen.

If nothing is moving, consider on-demand/invalidation rendering if supported by the selected architecture.

Target smooth everyday-phone performance, not only desktop GPUs.

---

# MOBILE UX

Mobile is a first-class experience.

Do not simply scale down desktop.

For 3D story sections:

3D world:
roughly upper half

Narrative:
bottom sheet / lower content region

Controls must be thumb-friendly.

Avoid many tiny labels over the world.

Selecting a sector should open a clean bottom sheet.

Reduce:

NPC count,
vehicle movement,
decorative objects,
shadow complexity

on lower-quality profiles.

---

# ACCESSIBILITY

All educational content must remain understandable without WebGL.

If:

WebGL is unavailable,
3D fails,
device is extremely constrained,
or reduced-motion preferences call for simpler presentation,

provide a lightweight DOM/CSS fallback representing the same village states.

Keyboard users must be able to:

change year,
select sectors,
advance story,
operate calculators,
open explanations.

3D objects must have equivalent accessible text descriptions.

---

# NAVIGATION

Use a lightweight persistent progress navigator.

Suggested states:

1. 7.8%?
2. The Problem
3. GDP Is Estimated
4. GDP Village
5. 2010 → 2026
6. The Mistake
7. New Base Year
8. 2025 Revised
9. Nominal vs Real
10. Final Answer

The main first-time experience should feel sequential.

Users may revisit completed sections.

---

# GITHUB PAGES HOSTING — HARD REQUIREMENT

The completed website will be hosted on GitHub Pages.

Therefore:

## The entire production application must be static.

Do NOT require:

- Node server at runtime
- database
- API server
- server-side rendering that requires a server
- filesystem writes
- serverless functions
- runtime secrets

Everything required for the educational experience must work from the generated static build.

---

# GITHUB PAGES URL COMPATIBILITY

The site may be deployed either as:

https://USERNAME.github.io/REPOSITORY/

or eventually under a custom domain.

Design build configuration so the deployment base path can be changed easily.

If using Vite, correctly handle the Pages base path.

Do NOT scatter absolute `/assets/...` assumptions throughout the application if they break repository-subpath hosting.

Use build-aware asset paths.

---

# ROUTING ON GITHUB PAGES

GitHub Pages does not provide normal application-server routing fallbacks.

Therefore ensure direct links and page refreshes do not produce GitHub Pages 404 errors.

You choose the cleanest static-compatible approach.

Possible approaches include:

- hash-based narrative routing
- anchor/hash navigation
- actual generated static HTML pages
- another GitHub-Pages-safe strategy

The user experience matters more than router ideology.

Required:

A user must be able to share a link to:

The Problem
GDP Village
Base Year
Nominal vs Real
Sources

and have it open correctly on GitHub Pages.

---

# SOURCE PAGE

Provide an accessible Sources experience.

It may be:

/#sources

or another GitHub-Pages-safe static route.

Include primary official sources for:

Q1 FY 2026–27 GDP release

2026 GDP-series revision

clarification of Q1 FY 2025–26 revisions

historical National Accounts/base-year documentation.

Every official number must be traceable.

---

# GITHUB ACTIONS DEPLOYMENT

Include a ready-to-use GitHub Actions Pages deployment workflow.

Expected developer experience:

git push origin main

↓

GitHub Actions runs

↓

dependencies installed

↓

production build created

↓

static artifact uploaded

↓

GitHub Pages deployed

No manual copying of build files to a `gh-pages` branch should be required unless there is a compelling reason.

The README must explain:

1. npm install
2. local development
3. production build
4. local production preview
5. GitHub repository setup
6. GitHub Pages settings
7. setting repository/base path if required
8. enabling GitHub Actions as Pages source
9. deployment after pushing to main
10. optional custom-domain configuration

---

# REPOSITORY QUALITY

The repository should be clean enough for continued development.

Include:

README.md

.gitignore

package-lock.json or equivalent lockfile

source code

public/static assets if needed

GitHub Actions workflow

no committed build cache

no unnecessary large binaries

If generated 3D assets are included, organize them clearly, for example:

public/
  models/
  textures/

Keep source/content/data separate from rendering implementation.

---

# OPTIONAL CUSTOM DOMAIN

Do not assume a custom domain exists.

But architecture should allow one later without rewriting asset URLs or navigation.

Document what needs to change when moving from:

USERNAME.github.io/REPOSITORY/

to:

example.com

---

# SEO / SHARING

Since this is a public explainer, include:

page title

meta description

Open Graph metadata

Twitter/X card metadata

favicon

good semantic headings

meaningful page description

The initial HTML shell should contain enough meaningful content that sharing/search engines do not see only an empty WebGL canvas.

---

# 3D ASSET STRATEGY

Do not assume the project requires professionally modelled assets.

First attempt to build the village using procedural/simple low-poly geometry.

Use tiny external models only where they materially improve recognition.

Good candidates for reusable tiny models:

scooter

bus

auto-rickshaw

truck

simple human

chair/table

Everything else can potentially be assembled from geometry primitives.

The project should remain editable by code.

---

# REFERENCE IMAGE

If a village reference image is supplied, use it only for:

spatial inspiration

mood

economic activities

Indian village visual language

Do NOT attempt pixel-perfect reproduction.

Do NOT turn the reference into a giant background texture.

The finished 3D village should be an original low-poly JavaScript interpretation.

---

# TECHNICAL IMPLEMENTATION FREEDOM

You decide:

3D library

UI framework

animation architecture

state management

component architecture

asset format

camera implementation

timeline implementation

deployment details

responsive breakpoints

Do not ask me routine engineering questions.

Make sound technical decisions consistent with:

performance,
GitHub Pages,
maintainability,
mobile usability,
and the educational goal.

---

# ARITHMETIC VALIDATION

Test:

(88.27 - 86.05) / 86.05 * 100
≈ 2.58

(88.27 - 80.00) / 80.00 * 100
≈ 10.34

(81.36 - 75.46) / 75.46 * 100
≈ 7.82

Display rounded:

2.6%

10.3%

7.8%

---

# ACCEPTANCE TEST

A first-time visitor with no economics background should be able to answer these questions after completing the experience:

1. What is GDP trying to measure?
2. Why isn't India's GDP obtained by counting every transaction?
3. Why is GDP called an estimate?
4. Why can an old GDP estimate change?
5. What problem does a base-year revision try to solve?
6. Why can some sectors be revised down while others rise?
7. Why is ₹86.05 → ₹88.27 not the correct current growth comparison?
8. Where does 10.3% come from?
9. Where does 7.8% come from?
10. Does revising GDP automatically prove either manipulation or perfect accuracy?

If the visitor cannot answer those, improve the experience before considering the product complete.

---

# FINAL DELIVERY

Deliver a functioning repository ready to push to GitHub.

It must contain:

- complete responsive website
- functioning low-poly JavaScript GDP Village
- interactive 2010–2026 village transformation
- clickable economic sectors
- GDP-estimation visualization
- base-year recalibration experience
- actual 2025 revision sequence
- interactive GDP calculations
- nominal vs real explanation
- India base-year history
- FAQ
- Sources
- mobile optimization
- accessibility fallback
- production build
- GitHub Pages deployment workflow
- README deployment instructions

The most important product rule:

# Do not use 3D because it looks impressive.

Use 3D whenever seeing the economy physically change makes the statistical concept easier to understand.