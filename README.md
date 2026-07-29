# Laundry Day Advisor (Alexa Skill)

Alexa skill that tells the user whether today is a good day to wash clothes, and which day this week is the best one, based on the weather forecast (rain chance and wind, which affect drying).

## How "best day" is calculated

The best day is the day this week with **the lowest chance of rain, ties broken by the windiest day** (wind helps clothes dry faster). This is fetched from [Open-Meteo](https://open-meteo.com/) (free, no API key required).

If the weather API call fails for any reason, the skill does **not** guess or fall back to a fixed day — it tells the user: *"Sorry, I couldn't figure out the best laundry day right now. Please try again later."*

If you had a different rule in mind (lowest utility/energy rates, a fixed day, etc.), tell me and I'll swap `laundryAlgorithm.js` — the intent handlers in `index.js` don't need to change.

## Location: asked for on every request, not saved (for now)

The forecast needs a latitude/longitude, and every user of the skill can be in a different place, so this is **not** a fixed environment variable. Instead:

1. **The user includes their city in the request** — e.g. "is today a good day to do laundry in Chicago", or "what's the best laundry day in Chicago".
2. The skill turns that city name into coordinates using Open-Meteo's free geocoding API (no key needed) and uses it for that request only.
3. **Nothing is persisted between requests** — there's currently no database, so the skill doesn't remember a user's city from one question to the next. Every "is today a good day" or "best laundry day" needs the city included in the same sentence.
4. **If no city is given in the request, it says so and stops** — it will never silently assume a location: *"Please tell me your city in the same question, for example, is today a good day to do laundry in Chicago."*

The `SetLocationIntent` ("my city is Chicago") is still recognized, but since there's nowhere to save it yet, it just reminds the user to include their city in each question going forward.

> Two natural follow-ups if you want the city remembered again: re-add a persistence layer (e.g. DynamoDB, keyed by Alexa user ID) so `SetLocationIntent` sticks across requests, or use Alexa's Device Address API for real device geolocation (requires a user-granted permission and still needs geocoding since it only returns a street address). Happy to wire either one in.

## Project structure

```
laundry-day-advisor/
├── ask-resources.json                # ask-cli v2 project manifest (ties skill-package + lambda together)
├── skill-package/
│   ├── skill.json                    # Skill manifest
│   └── interactionModels/
│       └── custom/en-US.json         # Intents, slots, and sample utterances
└── lambda/
    ├── index.js                      # Intent handlers
    ├── laundryAlgorithm.js           # Weather-based best-day logic
    ├── locationService.js            # Geocoding + per-user persistence
    └── package.json
```

This is the standard `ask-cli` v2 layout (the same one `ask new` generates), so `ask deploy` recognizes the project without any extra setup. The profile name inside `ask-resources.json` is `default` — if you run `ask configure` with a different profile name, rename that key to match (or run `ask configure` once without `--profile` to create the `default` one).

## Intents

| Intent | Sample utterances | Behavior |
|---|---|---|
| `SetLocationIntent` | "my city is Chicago", "set my location to Chicago" | Reminds the user that the city isn't saved yet and must be included in each question |
| `CheckTodayIntent` | "is today a good day to do laundry in Chicago" | Geocodes the given city and answers. "Yes! Today is the best day to wash your clothes." / "No. The best day to wash your clothes this week is Wednesday." |
| `BestDayIntent` | "what's the best laundry day in Chicago" | Geocodes the given city and answers. "The best day to wash your clothes this week is Wednesday." |

`CheckTodayIntent` and `BestDayIntent` both have a `CityName` slot — the user must include a city in the request itself (e.g. "...in Chicago") since nothing is saved between requests.

Built-in intents (`AMAZON.HelpIntent`, `AMAZON.CancelIntent`, `AMAZON.StopIntent`, `AMAZON.FallbackIntent`) are also handled.

## No city given

If a user asks `CheckTodayIntent` or `BestDayIntent` without a city in the same request, the skill responds:

> "Please tell me your city in the same question, for example, is today a good day to do laundry in Chicago."

and does not attempt any forecast call.

## Deploying

### Option A — ASK CLI (recommended)

```bash
npm install -g ask-cli
ask configure
cd laundry-day-advisor
ask deploy
```

### Option B — Manual (Alexa Developer Console + AWS Lambda)

1. **Create the skill**
   - Go to the [Alexa Developer Console](https://developer.amazon.com/alexa/console/ask) → Create Skill → name it "Laundry Day Advisor" → Custom model → Provision your own.
   - In the JSON Editor, paste the contents of `interactionModels/custom/en-US.json`.

2. **Create the Lambda function**
   - AWS Lambda console → Create function → Author from scratch.
   - Runtime: **Node.js 18.x** or later (needed for the built-in `fetch`).
   - Add the Alexa Skills Kit trigger, and paste your Skill ID (from the Developer Console) into it.
   - Zip and upload `lambda/` (after running `npm install` inside it).
   - No extra permissions needed beyond the default Lambda execution role — there's no database to talk to.

3. **Connect them**
   - Copy the Lambda function's ARN into the Endpoint section of the Developer Console.

4. **Test**
   - Use the Developer Console's Test tab, or an Echo device: ask "is today a good day to do laundry in Chicago" or "what's the best laundry day in Chicago".

## Local install of Lambda dependencies

```bash
cd lambda
npm install
```
