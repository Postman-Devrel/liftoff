# UTM Campaign Tracking

LiftOff captures UTM parameters when a registered user first visits a module or learning path via a tracked link. This lets you measure how many people started content because of a specific campaign — a Discord onboarding post, a newsletter, a social share — versus discovering it organically.

## How It Works

```
User clicks shared link           LiftOff records attribution
─────────────────────────  →      ──────────────────────────
/learning-paths/intro-to-postman  user_id
?utm_source=discord               content: intro-to-postman (learning_path)
&utm_medium=community             utm_source: discord
&utm_campaign=onboarding          utm_medium: community
                                  utm_campaign: onboarding
                                  first_seen_at: <timestamp>
```

**First-visit only.** Attribution is recorded once per user per content item. If the same user later visits the same page without UTM params — or with different ones — the original attribution is preserved. This means the data reflects where someone *started* a module, not their most recent visit. If a user clicks your Discord onboarding link on Monday, then returns and earns the badge on Thursday via the plain URL, the badge completion is still attributed to the Discord campaign.

**Registered users only.** Attribution requires a Discord sign-in. Anonymous visitors are not tracked.

## Building a Tracked Link

Take any module or learning path URL and append UTM parameters as query string values:

```
https://liftoff.postman.com/learning-paths/intro-to-postman
  ?utm_source=discord
  &utm_medium=community
  &utm_campaign=onboarding-q3
```

| Parameter | Purpose | Example values |
|---|---|---|
| `utm_source` | Where the link lives | `discord`, `email`, `twitter`, `linkedin` |
| `utm_medium` | Type of channel | `community`, `newsletter`, `social`, `direct` |
| `utm_campaign` | The specific campaign or initiative | `onboarding`, `postman-101-launch`, `devrel-q3` |
| `utm_term` | Optional keyword or tag | `api-basics`, `beginner` |
| `utm_content` | Optional variant label | `button`, `top-banner`, `pin` |

Only `utm_source` is required. The rest are optional but recommended for meaningful segmentation.

## Example: Discord Onboarding

You want to share the Postman 101 learning path in your Discord #onboarding channel and measure how many new members complete it from that specific prompt.

**Link to share:**
```
https://liftoff.postman.com/learning-paths/intro-to-postman?utm_source=discord&utm_medium=community&utm_campaign=onboarding
```

Pin this link in the channel. Every registered user who clicks it will have their first visit to that learning path attributed to `discord / community / onboarding`.

If you later run an email campaign for the same path, use a different link:
```
https://liftoff.postman.com/learning-paths/intro-to-postman?utm_source=email&utm_medium=newsletter&utm_campaign=monthly-digest
```

The two campaigns will appear as separate rows in the admin dashboard, making it easy to compare reach.

## Example: Module-Level Tracking

You can also track individual modules, not just learning paths:

```
https://liftoff.postman.com/modules/api-basics?utm_source=discord&utm_medium=community&utm_campaign=onboarding
```

Use module links when you want to drive users to a specific module directly, rather than through a learning path.

## Reading the Admin Dashboard

In **Mission Control** (`/admin`), open the **Analytics** tab. The **UTM Attribution** section appears above the leaderboard.

### Source pills

At the top you'll see a pill for each unique `utm_source` with a total count of attributed first-visits. This gives you an instant top-line view of which channels are driving engagement.

### Campaigns tab

A table grouped by `source / medium / campaign / content`, showing:

| Column | What it tells you |
|---|---|
| Source | Where the link was shared (`discord`, `email`, etc.) |
| Medium | Channel type |
| Campaign | Campaign name |
| Content | Module or learning path name, with a `module` or `path` badge |
| Users | Number of users whose first visit came from this combination |
| First Seen | Date the first attribution for this row was recorded |

Sort order is by user count descending, so your highest-performing campaigns appear first.

### Recent tab

A chronological feed of the 50 most recent attributions, showing source / medium / campaign, the content item, and the date. Useful for spot-checking that tracking is working after you post a new link.

## Tips

**Test before you post.** Sign in with a test Discord account that has never visited the content, then click your tracked link. Check the Recent tab in Mission Control — you should see a new entry within a few seconds.

**One campaign, one link.** If you share the same campaign link in multiple places (e.g., pinned in Discord AND posted in a thread), they'll all roll up to the same campaign row. If you want to distinguish placement, use `utm_content`:

```
# Pinned message
?utm_source=discord&utm_medium=community&utm_campaign=onboarding&utm_content=pinned

# Thread post
?utm_source=discord&utm_medium=community&utm_campaign=onboarding&utm_content=thread
```

**Attribution is immutable.** Once a user's first visit is recorded, it cannot be overwritten. If you need to re-test, use a fresh account or reset attribution manually in the database.

**Organic visitors have no UTM.** Users who find content through the homepage or search have no attribution row. The dashboard total users count will always exceed the total attributed count — the gap is your organic baseline.
