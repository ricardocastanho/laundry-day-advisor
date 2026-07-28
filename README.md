# Laundry Day Advisor (Alexa Skill)

Alexa skill that tells the user whether today is a good day to wash clothes, and which day this week is the best one, based on the weather forecast (rain chance and wind, which affect drying).

## How "best day" is calculated

The best day is the day this week with **the lowest chance of rain, ties broken by the windiest day** (wind helps clothes dry faster). This is fetched from [Open-Meteo](https://open-meteo.com/) (free, no API key required).

If the weather API call fails for any reason, the skill does **not** guess or fall back to a fixed day — it tells the user: *"Sorry, I couldn't figure out the best laundry day right now. Please try again later."*

If you had a different rule in mind (lowest utility/energy rates, a fixed day, etc.), tell me and I'll swap `laundryAlgorithm.js` — the intent handlers in `index.js` don't need to change.

## Location: per-user, not a shared environment variable

The forecast needs a latitude/longitude, and every user of the skill can be in a different place, so this is **not** a fixed environment variable anymore. Instead:

1. **The user tells the skill their city** — "my city is Chicago", or by adding a city while asking, e.g. "is today a good day to do laundry in Chicago".
2. The skill turns that city name into coordinates using Open-Meteo's free geocoding API (no key needed).
3. The resolved location is **saved per user** (keyed by the Alexa user ID) in a DynamoDB table, using the standard ASK SDK persistence adapter — so the user only needs to say their city once, and every later "is today a good day" or "best laundry day" reuses it automatically.
4. **If the skill has no saved location for that user and none was given in the request, it says so and stops** — it will never silently assume a location: *"I don't know your location yet. Please tell me your city, for example say, my city is Chicago, so I can check the weather forecast."*

This means the skill scales to any number of users without anyone touching Lambda configuration — each user's city lives in their own DynamoDB item.

> Alexa's Device Address API is a possible future upgrade (real device geolocation instead of an asked-for city), but it requires the user to grant a permission and only returns a street address, which still needs geocoding. Asking for the city by voice was the simpler, friction-free option; happy to swap in device address if you'd rather use that.

## Project structure

```
laundry-day-advisor/
├── skill.json                        # ASK CLI skill manifest
├── interactionModels/
│   └── custom/en-US.json             # Intents, slots, and sample utterances
└── lambda/
    ├── index.js                      # Intent handlers
    ├── laundryAlgorithm.js           # Weather-based best-day logic
    ├── locationService.js            # Geocoding + per-user persistence
    └── package.json
```

## Intents

| Intent | Sample utterances | Behavior |
|---|---|---|
| `SetLocationIntent` | "my city is Chicago", "set my location to Chicago" | Geocodes the city and saves it for that user |
| `CheckTodayIntent` | "is today the best day to wash clothes", "should I wash my clothes today" | Uses saved (or just-given) location. "Yes! Today is the best day to wash your clothes." / "No. The best day to wash your clothes this week is Wednesday." |
| `BestDayIntent` | "what's the best day to wash clothes", "best laundry day" | Uses saved (or just-given) location. "The best day to wash your clothes this week is Wednesday." |

`CheckTodayIntent` and `BestDayIntent` both accept an optional `CityName` slot — if the user mentions a city in the same request ("...in Chicago"), it's geocoded and saved on the spot, so they don't need to call `SetLocationIntent` first.

Built-in intents (`AMAZON.HelpIntent`, `AMAZON.CancelIntent`, `AMAZON.StopIntent`, `AMAZON.FallbackIntent`) are also handled.

## No location saved yet

If a user asks `CheckTodayIntent` or `BestDayIntent` before ever giving a city, the skill responds:

> "I don't know your location yet. Please tell me your city, for example say, my city is Chicago, so I can check the weather forecast."

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

2. **Create the DynamoDB table** (or let the skill create it)
   - Table name: `LaundryDayAdvisorLocations` (or set `DYNAMODB_TABLE_NAME` to your own name).
   - Partition key: `id` (String) — this is what `ask-sdk-dynamodb-persistence-adapter` expects.
   - Alternatively, set the Lambda environment variable `DYNAMODB_CREATE_TABLE=true` once, on first deploy, so the adapter creates the table itself (requires `dynamodb:CreateTable` permission below), then you can remove that variable.

3. **Create the Lambda function**
   - AWS Lambda console → Create function → Author from scratch.
   - Runtime: **Node.js 18.x** or later (needed for the built-in `fetch`).
   - Add the Alexa Skills Kit trigger, and paste your Skill ID (from the Developer Console) into it.
   - Zip and upload `lambda/` (after running `npm install` inside it).
   - Attach an execution role with DynamoDB access: `dynamodb:GetItem`, `dynamodb:PutItem`, `dynamodb:UpdateItem` on the table above (and `dynamodb:CreateTable`/`DescribeTable` if using auto-create).
   - Optional environment variables: `DYNAMODB_TABLE_NAME`, `DYNAMODB_CREATE_TABLE`.

4. **Connect them**
   - Copy the Lambda function's ARN into the Endpoint section of the Developer Console.

5. **Test**
   - Use the Developer Console's Test tab, or an Echo device: say "my city is Chicago", then ask "is today a good day to wash clothes" or "what's the best laundry day".

## Local install of Lambda dependencies

```bash
cd lambda
npm install
```
